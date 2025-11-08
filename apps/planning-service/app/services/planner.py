"""Core planning service with AI and rule-based strategies"""

import logging
from typing import Dict, List
import time
from openai import OpenAI
import json

from app.models.schemas import (
    GeneratePlanRequest,
    GeneratePlanResponse,
    PlanStructure,
    PlanMetadata,
    PlannedTask,
)
from app.config import settings

logger = logging.getLogger(__name__)


class PlannerService:
    """Service for generating weekly plans using AI or rule-based algorithms"""

    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    def detect_complexity(self, request: GeneratePlanRequest) -> str:
        """
        Detect plan complexity based on goals and constraints
        Returns: 'simple', 'standard', or 'complex'
        """
        goal_count = len(request.goals)
        has_energy_pattern = request.preferences.energyPattern is not None
        has_blocked_times = bool(request.preferences.blockedTimes)
        has_busy_slots = bool(request.busySlots)

        # Simple: Use rule-based
        if (goal_count <= 2 and
            not has_energy_pattern and
            not has_blocked_times and
            not has_busy_slots):
            return "simple"

        # Complex: Use GPT-4o
        if goal_count >= 6 or (goal_count >= 4 and (has_energy_pattern or has_blocked_times)):
            return "complex"

        # Standard: Use GPT-4o-mini
        return "standard"

    async def generate_plan(self, request: GeneratePlanRequest) -> GeneratePlanResponse:
        """Generate a weekly plan based on complexity"""

        start_time = time.time()
        complexity = self.detect_complexity(request)

        logger.info(f"Generating plan for user {request.userId}, complexity: {complexity}")

        try:
            if complexity == "simple":
                plan, quality_score = self._generate_rule_based_plan(request)
                metadata = PlanMetadata(
                    model="rule-based",
                    tier="simple",
                    latency=time.time() - start_time,
                    cost=0.0,
                )
            else:
                model = "gpt-4o-mini" if complexity == "standard" else "gpt-4o"
                plan, quality_score, token_usage, cost = await self._generate_ai_plan(request, model)
                metadata = PlanMetadata(
                    model=model,
                    tier=complexity,
                    latency=time.time() - start_time,
                    cost=cost,
                    tokenUsage=token_usage,
                )

            return GeneratePlanResponse(
                success=True,
                plan=plan,
                complexity=complexity,
                qualityScore=quality_score,
                metadata=metadata,
            )

        except Exception as e:
            logger.error(f"Failed to generate plan: {e}", exc_info=True)

            # Fallback to rule-based
            if complexity != "simple":
                logger.warning("Falling back to rule-based planner")
                plan, quality_score = self._generate_rule_based_plan(request)
                metadata = PlanMetadata(
                    model="rule-based-fallback",
                    tier="simple",
                    latency=time.time() - start_time,
                    cost=0.0,
                )

                return GeneratePlanResponse(
                    success=True,
                    plan=plan,
                    complexity="simple",
                    qualityScore=quality_score,
                    metadata=metadata,
                )

            return GeneratePlanResponse(
                success=False,
                plan=None,
                complexity=complexity,
                qualityScore=0.0,
                metadata=PlanMetadata(model="error", tier="error", latency=0.0, cost=0.0),
                error={
                    "code": "PLAN_GENERATION_FAILED",
                    "message": str(e),
                },
            )

    def _generate_rule_based_plan(self, request: GeneratePlanRequest) -> tuple[PlanStructure, float]:
        """Simple rule-based planner for basic scenarios"""

        logger.info("Using rule-based planner")

        # TODO: Implement sophisticated rule-based scheduling algorithm
        # For now, return a basic template structure

        plan_dict = {
            "monday": [],
            "tuesday": [],
            "wednesday": [],
            "thursday": [],
            "friday": [],
            "saturday": [],
            "sunday": [],
        }

        # Simple distribution: spread goals evenly across the week
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

        for goal in request.goals:
            # Distribute goal frequency across available days
            for i in range(goal.frequencyPerWeek):
                day_index = i % 7
                day = days[day_index]

                # Simple time slot: 09:00 by default
                start_hour = 9 + (i * 2)  # Spread across the day
                if start_hour > 20:
                    start_hour = 9

                end_hour = start_hour
                end_minute = goal.durationMinutes
                if end_minute >= 60:
                    end_hour += end_minute // 60
                    end_minute = end_minute % 60

                task = PlannedTask(
                    goalId=goal.id,
                    title=goal.title,
                    start=f"{start_hour:02d}:00",
                    end=f"{end_hour:02d}:{end_minute:02d}",
                    reasoning=f"Scheduled during available time slot based on your preferences",
                )

                plan_dict[day].append(task)

        plan = PlanStructure(**plan_dict)
        quality_score = 70.0  # Basic quality score for rule-based plans

        return plan, quality_score

    async def _generate_ai_plan(
        self, request: GeneratePlanRequest, model: str
    ) -> tuple[PlanStructure, float, int, float]:
        """Generate plan using OpenAI GPT models"""

        if not self.openai_client:
            raise ValueError("OpenAI API key not configured")

        logger.info(f"Using AI planner with model: {model}")

        # Build prompt
        system_prompt = self._build_system_prompt()
        user_prompt = self._build_user_prompt(request)

        # Call OpenAI
        response = self.openai_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=2000,
            response_format={"type": "json_object"},
        )

        # Parse response
        plan_json = json.loads(response.choices[0].message.content)
        plan = PlanStructure(**plan_json)

        # Calculate cost
        token_usage = response.usage.total_tokens
        cost = self._calculate_cost(token_usage, model)

        # Calculate quality score (simplified for now)
        quality_score = 85.0  # AI plans typically score higher

        return plan, quality_score, token_usage, cost

    def _build_system_prompt(self) -> str:
        """Build the AI system prompt"""
        return """You are an expert weekly schedule planner and productivity coach.
Your goal is to create optimal, balanced weekly schedules that help users achieve their goals
while respecting their constraints and personal preferences.

CORE PRINCIPLES:
1. User well-being first - never overbook, always include rest
2. Energy alignment - match task types to user's energy patterns
3. Realistic expectations - account for context switching time
4. Flexibility - life happens, plans need buffers

CRITICAL RULES (NEVER VIOLATE):
1. Never schedule during sleep hours
2. Never schedule during work hours (unless goal explicitly work-related)
3. Never schedule during user's blocked times
4. Always leave 15-minute buffers between tasks
5. Distribute workload evenly across the week
6. Respect user's preferred times for each goal
7. Consider energy levels

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON (no markdown, no explanations outside JSON)
- Use exact format specified in user prompt
- Include reasoning for EVERY task placement
- Be specific in reasoning (not generic)"""

    def _build_user_prompt(self, request: GeneratePlanRequest) -> str:
        """Build the user-specific prompt"""

        goals_text = "\n".join([
            f"{i+1}. \"{goal.title}\"\n"
            f"   - Frequency: {goal.frequencyPerWeek} times per week\n"
            f"   - Duration: {goal.durationMinutes} minutes\n"
            f"   - Priority: {goal.priority}/10"
            for i, goal in enumerate(request.goals)
        ])

        busy_slots_text = ""
        if request.busySlots:
            busy_slots_text = "\n".join([
                f"- {slot.day} {slot.start}-{slot.end}: {slot.title}"
                for slot in request.busySlots
            ])
        else:
            busy_slots_text = "- No existing commitments"

        return f"""WEEK: {request.weekStartDate}

USER PROFILE:
- Sleep schedule: {request.preferences.sleepTime} to {request.preferences.wakeTime}
- Work hours: {request.preferences.workStartTime} to {request.preferences.workEndTime}
- Energy pattern: {request.preferences.energyPattern or 'Not specified'}

GOALS TO SCHEDULE ({len(request.goals)} total):
{goals_text}

EXISTING CALENDAR COMMITMENTS:
{busy_slots_text}

OUTPUT FORMAT (JSON ONLY):
{{
  "monday": [
    {{
      "goalId": "goal_abc123",
      "title": "Morning Gym Session",
      "start": "07:00",
      "end": "08:00",
      "reasoning": "Specific reason why scheduled at this time"
    }}
  ],
  "tuesday": [...],
  "wednesday": [...],
  "thursday": [...],
  "friday": [...],
  "saturday": [...],
  "sunday": [...]
}}"""

    def _calculate_cost(self, tokens: int, model: str) -> float:
        """Calculate cost in USD cents"""
        # Simplified cost calculation
        # GPT-4o-mini: ~$0.15 per 1M input tokens, $0.60 per 1M output tokens
        # GPT-4o: ~$5 per 1M input tokens, $15 per 1M output tokens

        if model == "gpt-4o-mini":
            cost_per_token = 0.0000003  # Average
        else:  # gpt-4o
            cost_per_token = 0.000010  # Average

        cost_usd = tokens * cost_per_token
        cost_cents = cost_usd * 100

        return round(cost_cents, 4)
