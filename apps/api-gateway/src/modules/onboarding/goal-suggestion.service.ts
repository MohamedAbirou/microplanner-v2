import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { UserContext, FocusArea, GoalSuggestion } from './dto/onboarding.dto';

/**
 * Goal Suggestion Service
 *
 * Uses Claude AI to generate intelligent, context-aware goal suggestions
 * based on user's life situation and focus areas.
 */
@Injectable()
export class GoalSuggestionService {
  private readonly logger = new Logger(GoalSuggestionService.name);
  private readonly anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Generate smart goal suggestions using AI
   */
  async generateGoalSuggestions(context: UserContext, focusAreas: FocusArea[]): Promise<GoalSuggestion[]> {
    this.logger.debug(`Generating goal suggestions for context: ${context}, focus areas: ${focusAreas.join(', ')}`);

    // Build context-aware prompt
    const prompt = this.buildPrompt(context, focusAreas);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const suggestions = this.parseAIResponse(content.text, context, focusAreas);
        this.logger.debug(`Generated ${suggestions.length} goal suggestions`);
        return suggestions;
      }

      throw new Error('Unexpected response format from AI');
    } catch (error) {
      this.logger.error(`Failed to generate AI goal suggestions: ${error.message}`);
      // Fallback to template-based suggestions
      return this.getFallbackSuggestions(context, focusAreas);
    }
  }

  /**
   * Build context-aware prompt for AI
   */
  private buildPrompt(context: UserContext, focusAreas: FocusArea[]): string {
    const contextDescriptions = {
      [UserContext.EMPLOYED_FULLTIME]: 'a full-time employee',
      [UserContext.EMPLOYED_PARTTIME]: 'a part-time employee',
      [UserContext.STUDENT]: 'a student',
      [UserContext.FREELANCER]: 'a freelancer/entrepreneur',
      [UserContext.BETWEEN_OPPORTUNITIES]: 'someone actively job searching or in between opportunities',
      [UserContext.RETIRED]: 'someone who is retired or semi-retired',
      [UserContext.PARENT_CAREGIVER]: 'a full-time parent or caregiver',
      [UserContext.OTHER]: 'someone with a unique life situation',
    };

    const focusDescriptions = focusAreas.map(area => {
      const descriptions = {
        [FocusArea.CAREER]: 'career and professional growth',
        [FocusArea.LEARNING]: 'learning and education',
        [FocusArea.HEALTH]: 'health and fitness',
        [FocusArea.CREATIVE]: 'creative projects',
        [FocusArea.BUSINESS]: 'side business or freelance work',
        [FocusArea.JOB_SEARCH]: 'job search and networking',
        [FocusArea.FAMILY]: 'family and relationships',
        [FocusArea.HOME]: 'home and lifestyle',
        [FocusArea.WRITING]: 'writing and content creation',
        [FocusArea.HOBBIES]: 'hobbies and personal interests',
      };
      return descriptions[area];
    }).join(', ');

    return `You are a productivity coach helping ${contextDescriptions[context]} set meaningful goals.

They want to focus on: ${focusDescriptions}.

Generate 3 specific, actionable goal suggestions that:
1. Are achievable within 1-4 weeks
2. Are relevant to their life situation (${contextDescriptions[context]})
3. Align with their focus areas (${focusDescriptions})
4. Are inspiring but realistic
5. DON'T assume any specific career field or industry
6. Use universal language that applies to anyone

Format your response EXACTLY as JSON array:
[
  {
    "title": "Short, actionable goal title (max 60 chars)",
    "description": "Brief explanation of why this matters and how to achieve it (max 150 chars)"
  },
  ...
]

IMPORTANT: Return ONLY the JSON array, no other text.`;
  }

  /**
   * Parse AI response into goal suggestions
   */
  private parseAIResponse(response: string, context: UserContext, focusAreas: FocusArea[]): GoalSuggestion[] {
    try {
      // Extract JSON from response (in case AI added extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return parsed.map((item: any, index: number) => ({
        title: item.title,
        description: item.description,
        focusArea: focusAreas[index % focusAreas.length], // Distribute across focus areas
        context,
      }));
    } catch (error) {
      this.logger.error(`Failed to parse AI response: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fallback goal suggestions (template-based)
   */
  private getFallbackSuggestions(context: UserContext, focusAreas: FocusArea[]): GoalSuggestion[] {
    const suggestions: GoalSuggestion[] = [];

    // Template-based suggestions for each focus area
    const templates = {
      [FocusArea.CAREER]: [
        { title: 'Develop a valuable new skill', description: 'Learn something that advances your career or opens new opportunities' },
        { title: 'Build your professional network', description: 'Connect with 5 people in your field this month' },
      ],
      [FocusArea.LEARNING]: [
        { title: 'Complete an online course', description: 'Finish one course in a topic that interests you' },
        { title: 'Read one book this month', description: 'Choose a book that expands your knowledge or perspective' },
      ],
      [FocusArea.HEALTH]: [
        { title: 'Exercise 3 times per week', description: 'Build a consistent workout routine that fits your schedule' },
        { title: 'Improve your sleep quality', description: 'Establish a consistent bedtime routine for better rest' },
      ],
      [FocusArea.CREATIVE]: [
        { title: 'Start a creative project', description: 'Begin working on something you\'ve been wanting to create' },
        { title: 'Practice your craft daily', description: 'Dedicate 30 minutes each day to your creative passion' },
      ],
      [FocusArea.BUSINESS]: [
        { title: 'Launch your first offering', description: 'Create and market your first product or service' },
        { title: 'Grow your client base', description: 'Reach out to potential clients and build relationships' },
      ],
      [FocusArea.JOB_SEARCH]: [
        { title: 'Apply to 10 quality positions', description: 'Research and apply to roles that align with your goals' },
        { title: 'Expand your professional network', description: 'Connect with people who can help your job search' },
      ],
      [FocusArea.FAMILY]: [
        { title: 'Quality time with loved ones', description: 'Schedule regular dedicated time with family or friends' },
        { title: 'Strengthen a relationship', description: 'Focus on improving one important relationship' },
      ],
      [FocusArea.HOME]: [
        { title: 'Organize one room completely', description: 'Declutter and organize a space that needs attention' },
        { title: 'Start a home improvement project', description: 'Complete one project that improves your living space' },
      ],
      [FocusArea.WRITING]: [
        { title: 'Write consistently', description: 'Commit to writing for 30 minutes every day' },
        { title: 'Complete your first draft', description: 'Finish the first draft of your writing project' },
      ],
      [FocusArea.HOBBIES]: [
        { title: 'Master a new hobby skill', description: 'Learn one new technique or skill in your hobby' },
        { title: 'Join a community', description: 'Find and engage with others who share your interest' },
      ],
    };

    // Get suggestions for each focus area (up to 3)
    focusAreas.slice(0, 3).forEach(area => {
      const areaTemplates = templates[area] || [];
      if (areaTemplates.length > 0) {
        const template = areaTemplates[0];
        suggestions.push({
          ...template,
          focusArea: area,
          context,
        });
      }
    });

    // If we don't have 3 yet, add more from other areas
    if (suggestions.length < 3) {
      const remaining = 3 - suggestions.length;
      const allTemplates = Object.entries(templates)
        .filter(([area]) => !focusAreas.includes(area as FocusArea))
        .flatMap(([area, temps]) => temps.map(t => ({ ...t, focusArea: area as FocusArea, context })));

      suggestions.push(...allTemplates.slice(0, remaining));
    }

    return suggestions.slice(0, 3);
  }
}
