"""Plans API endpoints"""

from fastapi import APIRouter, HTTPException
import logging

from app.models.schemas import GeneratePlanRequest, GeneratePlanResponse
from app.services.planner import PlannerService

logger = logging.getLogger(__name__)
router = APIRouter()
planner_service = PlannerService()


@router.post("/generate", response_model=GeneratePlanResponse)
async def generate_plan(request: GeneratePlanRequest):
    """
    Generate a weekly plan using AI or rule-based algorithms

    The complexity is automatically detected based on:
    - Number of goals
    - User preferences (energy patterns, blocked times)
    - Existing calendar commitments

    Returns a structured weekly plan with tasks distributed across 7 days.
    """
    try:
        logger.info(f"Received plan generation request for user: {request.userId}")
        response = await planner_service.generate_plan(request)
        return response

    except Exception as e:
        logger.error(f"Error generating plan: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": {
                    "code": "PLAN_GENERATION_ERROR",
                    "message": str(e),
                },
            },
        )
