import { gql } from '@apollo/client';

/**
 * GraphQL Operations for MicroPlanner
 *
 * Organized by domain:
 * - Tasks
 * - Goals
 * - Plans
 * - Dependencies
 * - User
 * - Calendar Integrations
 */

// ============================================================================
// TASK OPERATIONS
// ============================================================================

export const GET_TASKS = gql`
  query GetTasks($filter: TaskFilterInput, $sort: TaskSortInput) {
    tasks(filter: $filter, sort: $sort) {
      id
      title
      notes
      scheduledDate
      startTime
      endTime
      durationMinutes
      isCompleted
      priority
      tags
      recurrenceRule {
        frequency
        interval
        daysOfWeek
        dayOfMonth
        endDate
        occurrences
      }
      goal {
        id
        emoji
        title
        color
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      notes
      scheduledDate
      startTime
      endTime
      durationMinutes
      isCompleted
      priority
      tags
      recurrenceRule {
        frequency
        interval
        daysOfWeek
        dayOfMonth
        endDate
        occurrences
      }
      goal {
        id
        emoji
        title
        color
      }
      dependencies {
        id
        fromTaskId
        toTaskId
        type
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      notes
      scheduledDate
      startTime
      endTime
      durationMinutes
      isCompleted
      priority
      tags
      goal {
        id
        emoji
        title
        color
      }
      createdAt
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      notes
      scheduledDate
      startTime
      endTime
      durationMinutes
      isCompleted
      priority
      tags
      updatedAt
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;

export const COMPLETE_TASK = gql`
  mutation CompleteTask($id: ID!) {
    completeTask(id: $id) {
      id
      isCompleted
      updatedAt
    }
  }
`;

export const BULK_UPDATE_TASKS = gql`
  mutation BulkUpdateTasks($ids: [ID!]!, $input: UpdateTaskInput!) {
    bulkUpdateTasks(ids: $ids, input: $input) {
      id
      isCompleted
      priority
      updatedAt
    }
  }
`;

export const BULK_DELETE_TASKS = gql`
  mutation BulkDeleteTasks($ids: [ID!]!) {
    bulkDeleteTasks(ids: $ids) {
      count
    }
  }
`;

// ============================================================================
// GOAL OPERATIONS
// ============================================================================

export const GET_GOALS = gql`
  query GetGoals {
    goals {
      id
      emoji
      title
      description
      color
      targetMetric
      currentProgress
      targetValue
      deadline
      isArchived
      createdAt
      updatedAt
    }
  }
`;

export const GET_GOAL = gql`
  query GetGoal($id: ID!) {
    goal(id: $id) {
      id
      emoji
      title
      description
      color
      targetMetric
      currentProgress
      targetValue
      deadline
      isArchived
      tasks {
        id
        title
        isCompleted
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_GOAL = gql`
  mutation CreateGoal($input: CreateGoalInput!) {
    createGoal(input: $input) {
      id
      emoji
      title
      description
      color
      createdAt
    }
  }
`;

export const UPDATE_GOAL = gql`
  mutation UpdateGoal($id: ID!, $input: UpdateGoalInput!) {
    updateGoal(id: $id, input: $input) {
      id
      emoji
      title
      description
      color
      updatedAt
    }
  }
`;

export const DELETE_GOAL = gql`
  mutation DeleteGoal($id: ID!) {
    deleteGoal(id: $id) {
      id
    }
  }
`;

// ============================================================================
// PLAN OPERATIONS
// ============================================================================

export const GET_PLANS = gql`
  query GetPlans($filter: PlanFilterInput) {
    plans(filter: $filter) {
      id
      title
      description
      status
      qualityScore
      tasks {
        id
        title
        scheduledDate
        isCompleted
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PLAN = gql`
  mutation CreatePlan($input: CreatePlanInput!) {
    createPlan(input: $input) {
      id
      title
      description
      status
      tasks {
        id
        title
      }
      createdAt
    }
  }
`;

export const GENERATE_PLAN = gql`
  mutation GeneratePlan($input: GeneratePlanInput!) {
    generatePlan(input: $input) {
      id
      title
      description
      status
      qualityScore
      tasks {
        id
        title
        scheduledDate
        durationMinutes
      }
      createdAt
    }
  }
`;

export const UPDATE_PLAN = gql`
  mutation UpdatePlan($id: ID!, $input: UpdatePlanInput!) {
    updatePlan(id: $id, input: $input) {
      id
      title
      description
      status
      qualityScore
      createdAt
      updatedAt
    }
  }
`;

export const ACCEPT_PLAN = gql`
  mutation AcceptPlan($id: ID!) {
    acceptPlan(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

// ============================================================================
// DEPENDENCY OPERATIONS
// ============================================================================

export const ADD_DEPENDENCY = gql`
  mutation AddDependency($input: AddDependencyInput!) {
    addDependency(input: $input) {
      id
      fromTaskId
      toTaskId
      type
      createdAt
    }
  }
`;

export const REMOVE_DEPENDENCY = gql`
  mutation RemoveDependency($id: ID!) {
    removeDependency(id: $id) {
      id
    }
  }
`;

// ============================================================================
// USER & SETTINGS OPERATIONS
// ============================================================================

export const GET_USER_SETTINGS = gql`
  query GetUserSettings {
    me {
      id
      email
      fullName
      tier
      settings {
        theme
        workingHours {
          start
          end
        }
        defaultTaskDuration
        notifications {
          email
          push
          reminders
        }
        calendarIntegrations {
          provider
          email
          isConnected
          lastSyncedAt
        }
      }
    }
  }
`;

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($input: UpdateUserSettingsInput!) {
    updateUserSettings(input: $input) {
      id
      settings {
        theme
        workingHours {
          start
          end
        }
        defaultTaskDuration
        notifications {
          email
          push
          reminders
        }
      }
    }
  }
`;

// ============================================================================
// CALENDAR INTEGRATION OPERATIONS
// ============================================================================

export const CONNECT_CALENDAR = gql`
  mutation ConnectCalendar($provider: CalendarProvider!, $authCode: String!) {
    connectCalendar(provider: $provider, authCode: $authCode) {
      provider
      email
      isConnected
      lastSyncedAt
    }
  }
`;

export const DISCONNECT_CALENDAR = gql`
  mutation DisconnectCalendar($provider: CalendarProvider!) {
    disconnectCalendar(provider: $provider) {
      provider
      isConnected
    }
  }
`;

export const SYNC_CALENDAR = gql`
  mutation SyncCalendar($provider: CalendarProvider!) {
    syncCalendar(provider: $provider) {
      provider
      lastSyncedAt
      syncedEventsCount
    }
  }
`;

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const TASK_UPDATED = gql`
  subscription TaskUpdated($userId: ID!) {
    taskUpdated(userId: $userId) {
      id
      title
      scheduledDate
      isCompleted
      updatedAt
    }
  }
`;

export const TASK_CREATED = gql`
  subscription TaskCreated($userId: ID!) {
    taskCreated(userId: $userId) {
      id
      title
      scheduledDate
      goal {
        id
        emoji
        title
      }
      createdAt
    }
  }
`;

export const TASK_DELETED = gql`
  subscription TaskDeleted($userId: ID!) {
    taskDeleted(userId: $userId) {
      id
    }
  }
`;

export const GOAL_UPDATED = gql`
  subscription GoalUpdated($userId: ID!) {
    goalUpdated(userId: $userId) {
      id
      title
      currentProgress
      updatedAt
    }
  }
`;

export const PLAN_GENERATED = gql`
  subscription PlanGenerated($userId: ID!) {
    planGenerated(userId: $userId) {
      id
      title
      status
      qualityScore
      tasks {
        id
        title
      }
      createdAt
    }
  }
`;
