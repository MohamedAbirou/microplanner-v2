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

export const GET_MY_TIER = gql`
  query GetMyTier {
    me {
      id
      tier
      subscriptionStatus
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

/** Apollo refetch-by-name targets — keep mutations in sync with every task query variant. */
export const TASK_QUERY_NAMES = [
  'GetTasks',
  'GetTasksList',
  'GetTasksAnalytics',
] as const;

export const GOAL_QUERY_NAMES = ['GetGoals', 'GetGoalsList'] as const;

export const PLAN_QUERY_NAMES = ['GetPlans', 'GetPlansSummary'] as const;

/**
 * Full task list — dependencies, blockers, and subtasks (batched server-side).
 * Use on Today, Dashboard, Tasks, and Calendar where relationship data is needed.
 */
export const GET_TASKS = gql`
  query GetTasks($filter: TaskFilterInput, $sort: TaskSortInput, $take: Int, $skip: Int) {
    tasks(filter: $filter, sort: $sort, take: $take, skip: $skip) {
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

/**
 * Lightweight task list — no nested relationship arrays.
 * Count fields use the same batch loaders when present (one REST call each).
 * Use on Search, Command Palette, Plan Day, and other browse-only views.
 */
export const GET_TASKS_LIST = gql`
  query GetTasksList($filter: TaskFilterInput, $sort: TaskSortInput, $take: Int, $skip: Int) {
    tasks(filter: $filter, sort: $sort, take: $take, skip: $skip) {
      id
      userId
      goalId
      planId
      parentTaskId
      projectId
      title
      notes
      priority
      tags
      scheduledDate
      startTime
      endTime
      durationMinutes
      isCompleted
      completedAt
      isSkipped
      skippedReason
      timeSpentMinutes
      isTimerRunning
      aiGenerated
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
      dependencyCount
      blockedByCount
      subtaskCount
      createdAt
      updatedAt
    }
  }
`;

/** Lightweight task list for analytics — skips per-task dependency/subtask resolution. */
export const GET_TASKS_ANALYTICS = gql`
  query GetTasksAnalytics($filter: TaskFilterInput, $sort: TaskSortInput, $take: Int, $skip: Int) {
    tasks(filter: $filter, sort: $sort, take: $take, skip: $skip) {
      id
      goalId
      title
      priority
      tags
      scheduledDate
      startTime
      endTime
      durationMinutes
      isCompleted
      completedAt
      timeSpentMinutes
    }
  }
`;

export const GET_RESCHEDULE_SUGGESTION = gql`
  query RescheduleSuggestion($taskId: ID!) {
    rescheduleSuggestion(taskId: $taskId) {
      taskId
      scheduledDate
      startTime
      endTime
      reason
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
    deleteTask(id: $id)
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

// Time entry history (lazy — detail view only)
export const TASK_TIME_ENTRIES = gql`
  query TaskTimeEntries($taskId: ID!, $take: Int, $skip: Int) {
    taskTimeEntries(taskId: $taskId, take: $take, skip: $skip) {
      id
      taskId
      minutes
      note
      source
      startedAt
      createdAt
    }
  }
`;

export const UPDATE_TIME_ENTRY = gql`
  mutation UpdateTimeEntry($id: ID!, $input: UpdateTimeEntryInput!) {
    updateTimeEntry(id: $id, input: $input) {
      id
      minutes
      note
      startedAt
    }
  }
`;

export const DELETE_TIME_ENTRY = gql`
  mutation DeleteTimeEntry($id: ID!) {
    deleteTimeEntry(id: $id)
  }
`;

// Date-bounded time report for tables / CSV export
export const TIME_REPORT = gql`
  query TimeReport($startDate: DateTime!, $endDate: DateTime!) {
    timeReport(startDate: $startDate, endDate: $endDate) {
      id
      taskId
      taskTitle
      goalTitle
      projectName
      minutes
      note
      source
      startedAt
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

/** Sidebar / layout / quick-pick — no nested project or tasks. */
export const GET_GOALS_LIST = gql`
  query GetGoalsList {
    goals {
      id
      emoji
      title
      description
      color
      priority
      frequencyPerWeek
      durationMinutes
      isActive
      isPaused
      currentStreak
      longestStreak
      completionRate
      projectId
    }
  }
`;

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
      isActive
      isPaused
      pausedUntil
      updatedAt
    }
  }
`;

export const DELETE_GOAL = gql`
  mutation DeleteGoal($id: ID!) {
    deleteGoal(id: $id)
  }
`;

// ============================================================================
// PLAN OPERATIONS
// ============================================================================

/** Plans list / history — stats from DB, goals from planJson (no per-plan task fetch). */
export const GET_PLANS_SUMMARY = gql`
  query GetPlansSummary($filter: PlanFilterInput) {
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
        taskCount
      }
      createdAt
      updatedAt
    }
  }
`;

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

export const GET_PLAN = gql`
  query GetPlan($id: ID!) {
    plan(id: $id) {
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
        notes
        scheduledDate
        startTime
        endTime
        durationMinutes
        isCompleted
        priority
        aiReasoning
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

export const REGENERATE_PLAN = gql`
  mutation RegeneratePlan($id: ID!) {
    regeneratePlan(id: $id) {
      id
      status
      weekStartDate
      weekEndDate
      qualityScore
    }
  }
`;

// ============================================================================
// DEPENDENCY OPERATIONS
// ============================================================================

export const ADD_DEPENDENCY = gql`
  mutation AddDependency($input: CreateTaskDependencyInput!) {
    createTaskDependency(input: $input) {
      id
      dependentTaskId
      blockingTaskId
      type
      createdAt
    }
  }
`;

export const REMOVE_DEPENDENCY = gql`
  mutation RemoveDependency($id: ID!) {
    deleteTaskDependency(id: $id)
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
      timezone
      energyPattern
      settings {
        theme
        energyPattern
        workingHours {
          start
          end
        }
        defaultTaskDuration
        notifications {
          email
          weeklySummary
          planReminders
          taskReminders
          goalMilestones
          productivityInsights
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

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
      fullName
      timezone
    }
  }
`;

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($input: UpdateUserSettingsInput!) {
    updateUserSettings(input: $input) {
      id
      theme
      energyPattern
      workingHours {
        start
        end
      }
      defaultTaskDuration
      notifications {
        email
        weeklySummary
        planReminders
        taskReminders
        goalMilestones
        productivityInsights
      }
    }
  }
`;

// ============================================================================
// CALENDAR INTEGRATION OPERATIONS
// ============================================================================

export const CONNECT_CALENDAR = gql`
  mutation ConnectCalendar($input: ConnectCalendarInput!) {
    connectCalendar(input: $input) {
      id
      provider
      email
      syncEnabled
      lastSyncAt
    }
  }
`;

export const DISCONNECT_CALENDAR = gql`
  mutation DisconnectCalendar($id: ID!) {
    disconnectCalendar(id: $id)
  }
`;

export const SYNC_CALENDAR = gql`
  mutation SyncCalendar($id: ID!) {
    syncCalendar(id: $id) {
      success
      provider
      tasksSucceeded
      tasksFailed
      duration
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
    taskDeleted(userId: $userId)
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
