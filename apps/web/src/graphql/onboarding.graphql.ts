import { gql } from '@apollo/client';

/**
 * GraphQL Operations for Onboarding
 */

// Calculate Sleep Recommendation
export const CALCULATE_SLEEP_RECOMMENDATION = gql`
  query CalculateSleepRecommendation($input: CalculateSleepInput!) {
    calculateSleepRecommendation(input: $input) {
      wakeTime
      optimalSleepTime
      totalSleepHours
      cycles
      energyPattern
      productivityWindow {
        start
        end
        peak
      }
      windDownTime
      explanation
      benefits
      tips
    }
  }
`;

// Get AI Goal Suggestions
export const GET_GOAL_SUGGESTIONS = gql`
  query GetGoalSuggestions($input: GetGoalSuggestionsInput!) {
    getGoalSuggestions(input: $input) {
      title
      description
      focusArea
      context
    }
  }
`;

// Update Onboarding Progress (Auto-save)
export const UPDATE_ONBOARDING_PROGRESS = gql`
  mutation UpdateOnboardingProgress($input: UpdateOnboardingProgressInput!) {
    updateOnboardingProgress(input: $input)
  }
`;

// Complete Onboarding
export const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
    completeOnboarding(input: $input) {
      success
      message
    }
  }
`;

/**
 * TypeScript Types
 */

export enum UserContext {
  EMPLOYED_FULLTIME = 'employed_fulltime',
  EMPLOYED_PARTTIME = 'employed_parttime',
  STUDENT = 'student',
  FREELANCER = 'freelancer',
  BETWEEN_OPPORTUNITIES = 'between_opportunities',
  RETIRED = 'retired',
  PARENT_CAREGIVER = 'parent_caregiver',
  OTHER = 'other',
}

export enum FocusArea {
  CAREER = 'career',
  LEARNING = 'learning',
  HEALTH = 'health',
  CREATIVE = 'creative',
  BUSINESS = 'business',
  JOB_SEARCH = 'job_search',
  FAMILY = 'family',
  HOME = 'home',
  WRITING = 'writing',
  HOBBIES = 'hobbies',
}

export enum EnergyPattern {
  MORNING_PERSON = 'MORNING_PERSON',
  BALANCED = 'BALANCED',
  NIGHT_OWL = 'NIGHT_OWL',
}

export interface SleepRecommendation {
  wakeTime: string;
  optimalSleepTime: string;
  totalSleepHours: number;
  cycles: number;
  energyPattern: EnergyPattern;
  productivityWindow: {
    start: string;
    end: string;
    peak: string;
  };
  windDownTime: string;
  explanation: string;
  benefits: string[];
  tips: string[];
}

export interface GoalSuggestion {
  title: string;
  description: string;
  focusArea: FocusArea;
  context: UserContext;
}
