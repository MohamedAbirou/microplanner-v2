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
  EMPLOYED_FULLTIME = 'EMPLOYED_FULLTIME',
  EMPLOYED_PARTTIME = 'EMPLOYED_PARTTIME',
  STUDENT = 'STUDENT',
  FREELANCER = 'FREELANCER',
  BETWEEN_OPPORTUNITIES = 'BETWEEN_OPPORTUNITIES',
  RETIRED = 'RETIRED',
  PARENT_CAREGIVER = 'PARENT_CAREGIVER',
  OTHER = 'OTHER',
}

export enum FocusArea {
  CAREER = 'CAREER',
  LEARNING = 'LEARNING',
  HEALTH = 'HEALTH',
  CREATIVE = 'CREATIVE',
  BUSINESS = 'BUSINESS',
  JOB_SEARCH = 'JOB_SEARCH',
  FAMILY = 'FAMILY',
  HOME = 'HOME',
  WRITING = 'WRITING',
  HOBBIES = 'HOBBIES',
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
