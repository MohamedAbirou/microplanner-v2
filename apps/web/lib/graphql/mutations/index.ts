/**
 * GraphQL Mutations
 * All mutations for creating, updating, and deleting data
 */

import { gql } from '@apollo/client';

// ==================== USER MUTATIONS ====================

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
      avatar
      timezone
      updatedAt
    }
  }
`;

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($input: UpdateUserSettingsInput!) {
    updateUserSettings(input: $input) {
      id
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
      updatedAt
    }
  }
`;

export const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
    completeOnboarding(input: $input) {
      success
      user {
        id
        name
        timezone
      }
      settings {
        id
        onboardingCompleted
      }
      goals {
        id
        title
        emoji
      }
    }
  }
`;

// ==================== GOAL MUTATIONS ====================

export const CREATE_GOAL = gql`
  mutation CreateGoal($input: CreateGoalInput!) {
    createGoal(input: $input) {
      id
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
      completionRate
      currentStreak
      createdAt
    }
  }
`;

export const UPDATE_GOAL = gql`
  mutation UpdateGoal($id: ID!, $input: UpdateGoalInput!) {
    updateGoal(id: $id, input: $input) {
      id
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
      updatedAt
    }
  }
`;

export const DELETE_GOAL = gql`
  mutation DeleteGoal($id: ID!) {
    deleteGoal(id: $id)
  }
`;

export const PAUSE_GOAL = gql`
  mutation PauseGoal($id: ID!, $until: DateTime) {
    pauseGoal(id: $id, until: $until) {
      id
      isPaused
      pausedUntil
      updatedAt
    }
  }
`;

export const RESUME_GOAL = gql`
  mutation ResumeGoal($id: ID!) {
    resumeGoal(id: $id) {
      id
      isPaused
      pausedUntil
      updatedAt
    }
  }
`;

// ==================== TASK MUTATIONS ====================

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      notes
      priority
      tags
      scheduledDate
      startTime
      endTime
      durationMinutes
      goalId
      projectId
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
      priority
      tags
      scheduledDate
      startTime
      endTime
      durationMinutes
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
        completionRate
        currentStreak
      }
    }
  }
`;

export const SKIP_TASK = gql`
  mutation SkipTask($id: ID!, $reason: String) {
    skipTask(id: $id, reason: $reason) {
      id
      isSkipped
      skippedReason
      skippedAt
    }
  }
`;

export const CREATE_SUBTASK = gql`
  mutation CreateSubtask($input: CreateSubtaskInput!) {
    createSubtask(input: $input) {
      id
      title
      durationMinutes
      scheduledDate
      parentTaskId
      createdAt
    }
  }
`;

export const CREATE_TASK_DEPENDENCY = gql`
  mutation CreateTaskDependency($input: CreateTaskDependencyInput!) {
    createTaskDependency(input: $input) {
      id
      dependentTaskId
      blockingTaskId
      type
      createdAt
    }
  }
`;

export const DELETE_TASK_DEPENDENCY = gql`
  mutation DeleteTaskDependency($id: ID!) {
    deleteTaskDependency(id: $id)
  }
`;

// ==================== TIME TRACKING MUTATIONS ====================

export const START_TIMER = gql`
  mutation StartTimer($taskId: ID!) {
    startTimer(taskId: $taskId) {
      taskId
      isTimerRunning
      timerStartedAt
      timeSpentMinutes
    }
  }
`;

export const STOP_TIMER = gql`
  mutation StopTimer($taskId: ID!) {
    stopTimer(taskId: $taskId) {
      taskId
      isTimerRunning
      actualStartTime
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

// ==================== PROJECT MUTATIONS ====================

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      color
      icon
      startDate
      targetDate
      createdAt
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
      color
      icon
      isArchived
      startDate
      targetDate
      completedAt
      updatedAt
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const ARCHIVE_PROJECT = gql`
  mutation ArchiveProject($id: ID!) {
    archiveProject(id: $id) {
      id
      isArchived
      archivedAt
    }
  }
`;

export const UNARCHIVE_PROJECT = gql`
  mutation UnarchiveProject($id: ID!) {
    unarchiveProject(id: $id) {
      id
      isArchived
      archivedAt
    }
  }
`;

// ==================== PRODUCTIVITY MUTATIONS ====================

export const UPDATE_WORK_HOURS = gql`
  mutation UpdateWorkHours($input: UpdateWorkHoursInput!) {
    updateWorkHours(input: $input) {
      id
      timezone
      schedule
      enforceWorkHours
      maxMeetingsPerDay
      maxMeetingHoursPerDay
      maxConsecutiveMeetings
      updatedAt
    }
  }
`;

export const CREATE_FOCUS_TIME_BLOCK = gql`
  mutation CreateFocusTimeBlock($input: CreateFocusTimeBlockInput!) {
    createFocusTimeBlock(input: $input) {
      id
      title
      frequency
      daysOfWeek
      startTime
      durationMinutes
      priority
      protected
      autoSchedule
      preferredTimeSlots
      color
      createdAt
    }
  }
`;

export const UPDATE_FOCUS_TIME_BLOCK = gql`
  mutation UpdateFocusTimeBlock($id: ID!, $input: UpdateFocusTimeBlockInput!) {
    updateFocusTimeBlock(id: $id, input: $input) {
      id
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
      updatedAt
    }
  }
`;

export const DELETE_FOCUS_TIME_BLOCK = gql`
  mutation DeleteFocusTimeBlock($id: ID!) {
    deleteFocusTimeBlock(id: $id)
  }
`;

export const CREATE_NO_MEETING_DAY = gql`
  mutation CreateNoMeetingDay($input: CreateNoMeetingDayInput!) {
    createNoMeetingDay(input: $input) {
      id
      dayOfWeek
      isActive
      allowExceptions
      createdAt
    }
  }
`;

export const DELETE_NO_MEETING_DAY = gql`
  mutation DeleteNoMeetingDay($id: ID!) {
    deleteNoMeetingDay(id: $id)
  }
`;

export const CREATE_KANBAN_BOARD = gql`
  mutation CreateKanbanBoard($input: CreateKanbanBoardInput!) {
    createKanbanBoard(input: $input) {
      id
      name
      description
      projectId
      isDefault
      columns {
        id
        name
        order
        color
        taskIds
      }
      createdAt
    }
  }
`;

export const UPDATE_KANBAN_BOARD = gql`
  mutation UpdateKanbanBoard($id: ID!, $input: UpdateKanbanBoardInput!) {
    updateKanbanBoard(id: $id, input: $input) {
      id
      name
      description
      updatedAt
    }
  }
`;

export const DELETE_KANBAN_BOARD = gql`
  mutation DeleteKanbanBoard($id: ID!) {
    deleteKanbanBoard(id: $id)
  }
`;

export const MOVE_TASK_IN_KANBAN = gql`
  mutation MoveTaskInKanban($input: MoveTaskInKanbanInput!) {
    moveTaskInKanban(input: $input)
  }
`;

// ==================== WAITLIST MUTATIONS ====================

export const JOIN_WAITLIST = gql`
  mutation JoinWaitlist($input: JoinWaitlistInput!) {
    joinWaitlist(input: $input) {
      success
      message
      position
      email
    }
  }
`;
