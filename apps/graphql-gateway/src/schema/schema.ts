import { readFileSync } from 'fs';
import gql from 'graphql-tag';
import { join } from 'path';

// Load all GraphQL schema files
const scalarsSchema = readFileSync(join(__dirname, 'scalars.graphql'), 'utf-8');
const indexSchema = readFileSync(join(__dirname, 'index.graphql'), 'utf-8');
const userSchema = readFileSync(join(__dirname, 'user.graphql'), 'utf-8');
const onboardingSchema = readFileSync(join(__dirname, 'onboarding.graphql'), 'utf-8');

// Load all schemas for core app features
const dashboardSchema = readFileSync(join(__dirname, 'dashboard.graphql'), 'utf-8');
const goalSchema = readFileSync(join(__dirname, 'goal.graphql'), 'utf-8');
const taskSchema = readFileSync(join(__dirname, 'task.graphql'), 'utf-8');
const projectSchema = readFileSync(join(__dirname, 'project.graphql'), 'utf-8');
const productivitySchema = readFileSync(join(__dirname, 'productivity.graphql'), 'utf-8');
const planSchema = readFileSync(join(__dirname, 'plan.graphql'), 'utf-8');

// Load advanced features
const analyticsSchema = readFileSync(join(__dirname, 'analytics.graphql'), 'utf-8');

// Load enterprise features
const calendarSchema = readFileSync(join(__dirname, 'calendar.graphql'), 'utf-8');
const teamsSchema = readFileSync(join(__dirname, 'teams.graphql'), 'utf-8');
const schedulingSchema = readFileSync(join(__dirname, 'scheduling.graphql'), 'utf-8');
const integrationsSchema = readFileSync(join(__dirname, 'integrations.graphql'), 'utf-8');
const billingSchema = readFileSync(join(__dirname, 'billing.graphql'), 'utf-8');

// Combine all schemas
export const typeDefs = gql`
  ${scalarsSchema}
  ${indexSchema}
  ${userSchema}
  ${onboardingSchema}
  ${dashboardSchema}
  ${goalSchema}
  ${taskSchema}
  ${projectSchema}
  ${productivitySchema}
  ${planSchema}
  ${analyticsSchema}
  ${calendarSchema}
  ${teamsSchema}
  ${schedulingSchema}
  ${integrationsSchema}
  ${billingSchema}
`;
