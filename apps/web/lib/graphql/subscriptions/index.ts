/**
 * GraphQL Subscriptions
 * Real-time updates via WebSocket
 */

import { gql } from '@apollo/client';

// ==================== GOAL SUBSCRIPTIONS ====================

export const GOAL_UPDATED = gql`
  subscription OnGoalUpdated($userId: ID!) {
    goalUpdated(userId: $userId) {
      id
      title
      description
      emoji
      color
      completionRate
      currentStreak
      longestStreak
      isPaused
      isActive
      updatedAt
    }
  }
`;

export const GOAL_CREATED = gql`
  subscription OnGoalCreated($userId: ID!) {
    goalCreated(userId: $userId) {
      id
      title
      description
      emoji
      color
      frequencyPerWeek
      durationMinutes
      priority
      createdAt
    }
  }
`;

export const GOAL_DELETED = gql`
  subscription OnGoalDeleted($userId: ID!) {
    goalDeleted(userId: $userId)
  }
`;

// ==================== TASK SUBSCRIPTIONS ====================

export const TASK_UPDATED = gql`
  subscription OnTaskUpdated($userId: ID!) {
    taskUpdated(userId: $userId) {
      id
      title
      notes
      priority
      scheduledDate
      startTime
      endTime
      durationMinutes
      isCompleted
      completedAt
      isSkipped
      skippedReason
      isTimerRunning
      timeSpentMinutes
      goal {
        id
        title
        emoji
        completionRate
      }
      updatedAt
    }
  }
`;

export const TASK_CREATED = gql`
  subscription OnTaskCreated($userId: ID!) {
    taskCreated(userId: $userId) {
      id
      title
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

export const TASK_DELETED = gql`
  subscription OnTaskDeleted($userId: ID!) {
    taskDeleted(userId: $userId)
  }
`;

export const TIMER_STARTED = gql`
  subscription OnTimerStarted($userId: ID!) {
    timerStarted(userId: $userId) {
      taskId
      isTimerRunning
      timerStartedAt
      timeSpentMinutes
    }
  }
`;

export const TIMER_STOPPED = gql`
  subscription OnTimerStopped($userId: ID!) {
    timerStopped(userId: $userId) {
      taskId
      isTimerRunning
      actualStartTime
      actualEndTime
      timeSpentMinutes
    }
  }
`;

// ==================== PROJECT SUBSCRIPTIONS ====================

export const PROJECT_UPDATED = gql`
  subscription OnProjectUpdated($userId: ID!) {
    projectUpdated(userId: $userId) {
      id
      name
      description
      color
      icon
      isArchived
      taskCount
      completedTaskCount
      progressPercentage
      updatedAt
    }
  }
`;
