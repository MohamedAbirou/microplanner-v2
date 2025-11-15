import axios, { AxiosInstance } from 'axios';

const GRAPHQL_URL = process.env.NEST_GRAPHQL_URL || 'http://localhost:3001/graphql';

/**
 * Onboarding API - Calls NestJS GraphQL endpoint
 * This is a GraphQL client that proxies to the NestJS backend
 */
export class OnboardingAPI {
  private client: AxiosInstance;

  constructor(token?: string) {
    this.client = axios.create({
      baseURL: GRAPHQL_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }

  /**
   * Call NestJS GraphQL endpoint
   */
  private async query(query: string, variables?: any) {
    const { data } = await this.client.post('', {
      query,
      variables,
    });

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data;
  }

  /**
   * Calculate sleep recommendation
   */
  async calculateSleepRecommendation(input: { wakeTime: string; timezone: string }) {
    const query = `
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

    const result = await this.query(query, { input });
    return result.calculateSleepRecommendation;
  }

  /**
   * Get AI goal suggestions
   */
  async getGoalSuggestions(input: { context: string; focusAreas: string[] }) {
    const query = `
      query GetGoalSuggestions($input: GetGoalSuggestionsInput!) {
        getGoalSuggestions(input: $input) {
          title
          description
          focusArea
          context
        }
      }
    `;

    const result = await this.query(query, { input });
    return result.getGoalSuggestions;
  }

  /**
   * Update onboarding progress
   */
  async updateOnboardingProgress(input: any) {
    const mutation = `
      mutation UpdateOnboardingProgress($input: UpdateOnboardingProgressInput!) {
        updateOnboardingProgress(input: $input)
      }
    `;

    const result = await this.query(mutation, { input });
    return result.updateOnboardingProgress;
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(input: any) {
    const mutation = `
      mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
        completeOnboarding(input: $input)
      }
    `;

    const result = await this.query(mutation, { input });
    return result.completeOnboarding;
  }
}
