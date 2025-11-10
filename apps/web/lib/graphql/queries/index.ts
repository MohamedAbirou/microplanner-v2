/**
 * GraphQL Queries
 * All queries for fetching data from the GraphQL API
 */

import { gql } from '@apollo/client';

// ==================== USER QUERIES ====================

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
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_SETTINGS = gql`
  query GetUserSettings {
    userSettings {
      id
      userId
      theme
      energyPattern
      notifications {
        email
        weeklySummary
        planReminders
        taskReminders
        goalMilestones
        productivityInsights
      }
      onboardingCompleted
      onboardingCompletedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_ONBOARDING_STATUS = gql`
  query GetOnboardingStatus {
    onboardingStatus {
      completed
      completedAt
      currentStep
    }
  }
`;

// ==================== DASHBOARD QUERIES ====================

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      activeGoalsCount
      tasksTodayCount
      tasksCompletedToday
      completionRate
      weeklyPlansCount
      productivityScore
      currentStreak
    }
  }
`;

export const GET_UPCOMING_TASKS = gql`
  query GetUpcomingTasks($limit: Int) {
    upcomingTasks(limit: $limit) {
      id
      title
      dueDate
      priority
      goalId
      goalTitle
      goalEmoji
      estimatedDuration
      isCompleted
    }
  }
`;

export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity($limit: Int) {
    recentActivity(limit: $limit) {
      id
      type
      title
      description
      timestamp
      metadata {
        goalId
        goalTitle
        taskId
        taskTitle
        emoji
        color
      }
    }
  }
`;

export const GET_WEEK_OVERVIEW = gql`
  query GetWeekOverview($startDate: DateTime) {
    weekOverview(startDate: $startDate) {
      date
      dayOfWeek
      tasksScheduled
      tasksCompleted
      totalDuration
      productivity
    }
  }
`;

export const GET_QUICK_ACTIONS = gql`
  query GetQuickActions {
    quickActions {
      id
      title
      description
      icon
      action
      variant
    }
  }
`;

// ==================== GOAL QUERIES ====================

export const GET_GOALS = gql`
  query GetGoals($isActive: Boolean, $isPaused: Boolean, $orderBy: GoalOrderBy, $skip: Int, $take: Int) {
    goals(isActive: $isActive, isPaused: $isPaused, orderBy: $orderBy, skip: $skip, take: $take) {
      id
      userId
      title
      description
      emoji
      color
      frequencyPerWeek
      durationMinutes
      preferredTimes
      flexibilityScore
      priority
      isActive
      isPaused
      pausedUntil
      completionRate
      totalCompletions
      totalScheduled
      currentStreak
      longestStreak
      lastCompletedAt
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
      title
      description
      emoji
      color
      frequencyPerWeek
      durationMinutes
      preferredTimes
      flexibilityScore
      priority
      isActive
      isPaused
      pausedUntil
      completionRate
      totalCompletions
      totalScheduled
      currentStreak
      longestStreak
      lastCompletedAt
      tasks {
        id
        title
        isCompleted
        scheduledDate
      }
      project {
        id
        name
        color
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_GOAL_ANALYTICS = gql`
  query GetGoalAnalytics($id: ID!) {
    goalAnalytics(id: $id) {
      goalId
      completionRate
      totalCompletions
      averageDuration
      bestTimeOfDay
      weeklyProgress {
        week
        scheduled
        completed
        completionRate
      }
      streakData {
        currentStreak
        longestStreak
        streakHistory {
          date
          completed
        }
      }
    }
  }
`;

// ==================== TASK QUERIES ====================

export const GET_TASKS = gql`
  query GetTasks(
    $goalId: ID
    $projectId: ID
    $scheduledDate: DateTime
    $isCompleted: Boolean
    $orderBy: TaskOrderBy
    $skip: Int
    $take: Int
  ) {
    tasks(
      goalId: $goalId
      projectId: $projectId
      scheduledDate: $scheduledDate
      isCompleted: $isCompleted
      orderBy: $orderBy
      skip: $skip
      take: $take
    ) {
      id
      userId
      goalId
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
      actualStartTime
      actualEndTime
      timeSpentMinutes
      isTimerRunning
      timerStartedAt
      aiGenerated
      goal {
        id
        title
        emoji
        color
      }
      project {
        id
        name
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
      userId
      goalId
      projectId
      parentTaskId
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
      actualStartTime
      actualEndTime
      timeSpentMinutes
      isTimerRunning
      timerStartedAt
      aiGenerated
      manuallyAdded
      aiReasoning
      goal {
        id
        title
        emoji
        color
      }
      project {
        id
        name
        color
        icon
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
        blockingTask {
          id
          title
          isCompleted
        }
      }
      createdAt
      updatedAt
    }
  }
`;

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

export const GET_SUBTASKS = gql`
  query GetSubtasks($parentTaskId: ID!) {
    subtasks(parentTaskId: $parentTaskId) {
      id
      title
      notes
      durationMinutes
      isCompleted
      completedAt
      scheduledDate
      createdAt
      updatedAt
    }
  }
`;

// ==================== PROJECT QUERIES ====================

export const GET_PROJECTS = gql`
  query GetProjects($includeArchived: Boolean, $orderBy: ProjectOrderBy) {
    projects(includeArchived: $includeArchived, orderBy: $orderBy) {
      id
      userId
      name
      description
      color
      icon
      isArchived
      archivedAt
      startDate
      targetDate
      completedAt
      taskCount
      completedTaskCount
      progressPercentage
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      userId
      name
      description
      color
      icon
      isArchived
      archivedAt
      startDate
      targetDate
      completedAt
      tasks {
        id
        title
        isCompleted
        scheduledDate
        durationMinutes
      }
      goals {
        id
        title
        emoji
        completionRate
      }
      kanbanBoards {
        id
        name
      }
      taskCount
      completedTaskCount
      progressPercentage
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECT_WITH_STATS = gql`
  query GetProjectWithStats($id: ID!) {
    projectWithStats(id: $id) {
      id
      name
      description
      color
      taskCount
      completedTaskCount
      totalEstimatedMinutes
      totalTrackedMinutes
      progressPercentage
      goalCount
      createdAt
      updatedAt
    }
  }
`;

// ==================== PRODUCTIVITY QUERIES ====================

export const GET_WORK_HOURS = gql`
  query GetWorkHours {
    workHours {
      id
      userId
      timezone
      schedule
      enforceWorkHours
      maxMeetingsPerDay
      maxMeetingHoursPerDay
      maxConsecutiveMeetings
      createdAt
      updatedAt
    }
  }
`;

export const GET_FOCUS_TIME_BLOCKS = gql`
  query GetFocusTimeBlocks {
    focusTimeBlocks {
      id
      userId
      title
      frequency
      daysOfWeek
      startTime
      durationMinutes
      priority
      protected
      isActive
      autoSchedule
      preferredTimeSlots
      color
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCTIVITY_SCORE = gql`
  query GetProductivityScore($date: DateTime!) {
    productivityScore(date: $date) {
      id
      userId
      date
      overallScore
      focusTimeScore
      taskCompletionScore
      meetingEfficiencyScore
      workLifeBalanceScore
      totalFocusMinutes
      totalMeetingMinutes
      totalTaskMinutes
      totalBreakMinutes
      insights
      recommendations
      createdAt
    }
  }
`;

export const GET_KANBAN_BOARDS = gql`
  query GetKanbanBoards($projectId: ID) {
    kanbanBoards(projectId: $projectId) {
      id
      userId
      projectId
      name
      description
      isDefault
      columns {
        id
        boardId
        name
        order
        color
        taskIds
      }
      createdAt
      updatedAt
    }
  }
`;
