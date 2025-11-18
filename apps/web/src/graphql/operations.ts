import { gql } from '@apollo/client';

/**
 * GraphQL Operations for MicroPlanner
 *
 * Organized by domain:
 * - User & Onboarding
 * - Tasks
 * - Goals
 * - Plans
 * - Dependencies
 * - Calendar Integrations
 */

// ============================================================================
// USER & ONBOARDING OPERATIONS
// ============================================================================

export const ONBOARDING_STATUS = gql`
  query OnboardingStatus {
    onboardingStatus {
      completed
      completedAt
      currentStep
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      clerkId
      email
      name
      avatar
      timezone
      tier
      onboardingCompleted
      onboardingStep
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// TASK OPERATIONS
// ============================================================================

export const GET_TASKS = gql`
  query GetTasks($filter: TaskFilterInput, $sort: TaskSortInput) {
    tasks(filter: $filter, sort: $sort) {
      id
      userId
      goalId
      planId
      parentTaskId
      projectId

      # Task details
      title
      notes
      priority
      tags

      # Scheduling
      scheduledDate
      startTime
      endTime
      durationMinutes

      # Recurrence
      recurrenceRule {
        frequency
        interval
        daysOfWeek
        dayOfMonth
        endDate
        occurrences
      }

      # Status
      isCompleted
      completedAt
      isSkipped
      skippedReason
      skippedAt

      # Time tracking
      actualStartTime
      actualEndTime
      timeSpentMinutes
      isTimerRunning
      timerStartedAt

      # Source tracking
      aiGenerated
      manuallyAdded
      aiReasoning

      # Relations
      goal {
        id
        emoji
        title
        color
      }
      project {
        id
        name
        color
        icon
      }
      parentTask {
        id
        title
        isCompleted
      }
      subtasks {
        id
        title
        isCompleted
        durationMinutes
      }
      dependencies {
        id
        dependentTaskId
        blockingTaskId
        type
      }
      blockedBy {
        id
        dependentTaskId
        blockingTaskId
        type
      }

      # Timestamps
      createdAt
      updatedAt
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      userId
      goalId
      planId
      parentTaskId
      projectId

      # Task details
      title
      notes
      priority
      tags

      # Scheduling
      scheduledDate
      startTime
      endTime
      durationMinutes

      # Recurrence
      recurrenceRule {
        frequency
        interval
        daysOfWeek
        dayOfMonth
        endDate
        occurrences
      }

      # Status
      isCompleted
      completedAt
      isSkipped
      skippedReason
      skippedAt

      # Time tracking
      actualStartTime
      actualEndTime
      timeSpentMinutes
      isTimerRunning
      timerStartedAt

      # Source tracking
      aiGenerated
      manuallyAdded
      aiReasoning

      # Relations
      goal {
        id
        emoji
        title
        color
      }
      project {
        id
        name
        color
        icon
      }
      parentTask {
        id
        title
        isCompleted
      }
      subtasks {
        id
        title
        isCompleted
        scheduledDate
        startTime
        endTime
        durationMinutes
      }
      dependencies {
        id
        dependentTaskId
        blockingTaskId
        type
        dependentTask {
          id
          title
          isCompleted
        }
        blockingTask {
          id
          title
          isCompleted
        }
        createdAt
      }
      blockedBy {
        id
        dependentTaskId
        blockingTaskId
        type
        dependentTask {
          id
          title
          isCompleted
        }
        blockingTask {
          id
          title
          isCompleted
        }
      }

      # Timestamps
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      userId
      goalId
      projectId
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
      project {
        id
        name
        color
        icon
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      userId
      goalId
      projectId
      title
      notes
      scheduledDate
      startTime
      endTime
      durationMinutes
      isCompleted
      completedAt
      priority
      tags
      goal {
        id
        emoji
        title
        color
      }
      project {
        id
        name
        color
        icon
      }
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
      completedAt
      goal {
        id
        currentStreak
        longestStreak
        completionRate
        totalCompletions
      }
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

// Task Skip/Uncomplete
export const SKIP_TASK = gql`
  mutation SkipTask($id: ID!, $reason: String) {
    skipTask(id: $id, reason: $reason) {
      id
      isSkipped
      skippedReason
      skippedAt
      updatedAt
    }
  }
`;

export const UNCOMPLETE_TASK = gql`
  mutation UncompleteTask($id: ID!) {
    uncompleteTask(id: $id) {
      id
      isCompleted
      completedAt
      updatedAt
    }
  }
`;

// Subtasks
export const CREATE_SUBTASK = gql`
  mutation CreateSubtask($input: CreateSubtaskInput!) {
    createSubtask(input: $input) {
      id
      parentTaskId
      title
      durationMinutes
      scheduledDate
      isCompleted
      createdAt
    }
  }
`;

// Task Dependencies
export const CREATE_TASK_DEPENDENCY = gql`
  mutation CreateTaskDependency($input: CreateTaskDependencyInput!) {
    createTaskDependency(input: $input) {
      id
      dependentTaskId
      blockingTaskId
      type
      dependentTask {
        id
        title
        isCompleted
      }
      blockingTask {
        id
        title
        isCompleted
      }
      createdAt
    }
  }
`;

export const DELETE_TASK_DEPENDENCY = gql`
  mutation DeleteTaskDependency($id: ID!) {
    deleteTaskDependency(id: $id)
  }
`;

// Time Tracking
export const START_TIMER = gql`
  mutation StartTimer($taskId: ID!) {
    startTimer(taskId: $taskId) {
      taskId
      isTimerRunning
      timerStartedAt
      actualStartTime
    }
  }
`;

export const STOP_TIMER = gql`
  mutation StopTimer($taskId: ID!) {
    stopTimer(taskId: $taskId) {
      taskId
      isTimerRunning
      actualEndTime
      timeSpentMinutes
    }
  }
`;

export const LOG_TIME = gql`
  mutation LogTime($taskId: ID!, $minutes: Int!, $date: DateTime) {
    logTime(taskId: $taskId, minutes: $minutes, date: $date) {
      taskId
      timeSpentMinutes
      actualStartTime
      actualEndTime
    }
  }
`;

// Task with Dependencies Query
export const GET_TASK_WITH_DEPENDENCIES = gql`
  query GetTaskWithDependencies($id: ID!) {
    taskWithDependencies(id: $id) {
      id
      title
      isCompleted
      scheduledDate
      blockingTasks {
        id
        title
        isCompleted
      }
      dependentTasks {
        id
        title
        isCompleted
      }
      isBlocked
      canStart
    }
  }
`;

// Subtasks Query
export const GET_SUBTASKS = gql`
  query GetSubtasks($parentTaskId: ID!) {
    subtasks(parentTaskId: $parentTaskId) {
      id
      title
      isCompleted
      scheduledDate
      startTime
      endTime
      durationMinutes
      createdAt
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
      userId
      projectId
      emoji
      title
      description
      color
      # Scheduling fields
      frequencyPerWeek
      durationMinutes
      preferredTimes
      flexibilityScore
      priority
      # Status fields
      isActive
      isPaused
      pausedUntil
      # Analytics fields
      completionRate
      totalCompletions
      totalScheduled
      currentStreak
      longestStreak
      lastCompletedAt
      # Legacy fields (for backward compatibility)
      targetMetric
      currentProgress
      targetValue
      deadline
      isArchived
      # Relations
      project {
        id
        name
        color
        icon
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_GOAL = gql`
  query GetGoal($id: ID!) {
    goal(id: $id) {
      id
      userId
      projectId
      emoji
      title
      description
      color
      # Scheduling fields
      frequencyPerWeek
      durationMinutes
      preferredTimes
      flexibilityScore
      priority
      # Status fields
      isActive
      isPaused
      pausedUntil
      # Analytics fields
      completionRate
      totalCompletions
      totalScheduled
      currentStreak
      longestStreak
      lastCompletedAt
      # Legacy fields (for backward compatibility)
      targetMetric
      currentProgress
      targetValue
      deadline
      isArchived
      # Relations
      project {
        id
        name
        color
        icon
      }
      tasks {
        id
        title
        isCompleted
        scheduledDate
        startTime
        endTime
        durationMinutes
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
      qualityMetrics
      aiModel
      reasoning
      weekStartDate
      weekEndDate
      generationTime
      totalTasks
      completedTasks
      completionRate
      goals {
        id
        emoji
        title
        color
      }
      tasks {
        id
        title
        scheduledDate
        startTime
        endTime
        durationMinutes
        isCompleted
        goal {
          id
          emoji
          title
          color
        }
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
      qualityMetrics
      aiModel
      reasoning
      weekStartDate
      weekEndDate
      generationTime
      totalTasks
      completedTasks
      completionRate
      goals {
        id
        emoji
        title
        color
      }
      tasks {
        id
        title
        scheduledDate
        startTime
        endTime
        durationMinutes
        isCompleted
        goal {
          id
          emoji
          title
          color
        }
      }
      createdAt
      updatedAt
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
