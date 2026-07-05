import type DataLoader from 'dataloader';
import type {
  UserAPI,
  OnboardingAPI,
  GoalsAPI,
  TasksAPI,
  ProductivityAPI,
  ProjectsAPI,
  PlansAPI,
  AnalyticsAPI,
  CalendarAPI,
  TeamsAPI,
  SchedulingAPI,
  IntegrationsAPI,
  BillingAPI,
} from '../datasources/rest-api';
import type { OnboardingAPI as OnboardingApiClass } from '../datasources/onboarding-api';

export interface AuthenticatedUser {
  id: string;
  clerkId: string;
  email: string;
  tier: string;
}

export interface GraphQLContext {
  user: AuthenticatedUser | null;
  token: string | null;
  dataSources: {
    userAPI: UserAPI;
    onboardingAPI: OnboardingApiClass;
    goalsAPI: GoalsAPI;
    tasksAPI: TasksAPI;
    productivityAPI: ProductivityAPI;
    projectsAPI: ProjectsAPI;
    plansAPI: PlansAPI;
    analyticsAPI: AnalyticsAPI;
    calendarAPI: CalendarAPI;
    teamsAPI: TeamsAPI;
    schedulingAPI: SchedulingAPI;
    integrationsAPI: IntegrationsAPI;
    billingAPI: BillingAPI;
  };
  loaders: {
    taskLoader: DataLoader<string, unknown>;
    goalLoader: DataLoader<string, unknown>;
    projectLoader: DataLoader<string, unknown>;
    taskByGoalLoader: DataLoader<string, unknown[]>;
    taskByPlanLoader: DataLoader<string, unknown[]>;
    userLoader: DataLoader<string, unknown>;
  };
  pubsub: {
    publish: (trigger: string, payload: unknown) => void;
    asyncIterator: (triggers: string | string[]) => AsyncIterable<unknown>;
  };
}

export interface ResolverContext {
  dataSources: GraphQLContext['dataSources'];
  user: GraphQLContext['user'];
  loaders: GraphQLContext['loaders'];
  pubsub: GraphQLContext['pubsub'];
}
