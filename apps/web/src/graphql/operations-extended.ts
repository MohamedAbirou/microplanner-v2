import { gql } from '@apollo/client';

/**
 * Extended GraphQL Operations for Enterprise Features
 *
 * This file contains operations for:
 * - Analytics & Insights
 * - Productivity Features (Work Hours, Focus Time, Kanban, Smart 1:1s, Notifications)
 * - Calendar Integrations
 * - Teams & API Keys
 * - Scheduling Links
 * - Third-party Integrations & Webhooks
 * - Billing & Subscriptions
 */

// ============================================================================
// ANALYTICS & INSIGHTS
// ============================================================================

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      todayTasks
      todayCompleted
      todayCompletionRate
      weekTasks
      weekCompleted
      weekCompletionRate
      activeGoals
      currentStreak
      longestStreak
      totalPlans
      averagePlanQuality
    }
  }
`;

export const GET_WEEKLY_STATS = gql`
  query GetWeeklyStats($weekStart: DateTime) {
    weeklyStats(weekStart: $weekStart) {
      weekStart
      weekEnd
      totalTasks
      completedTasks
      completionRate
      totalDuration
      productivityScore
      dailyBreakdown {
        date
        tasksScheduled
        tasksCompleted
        productivity
      }
    }
  }
`;

export const GET_PRODUCTIVITY_SCORES = gql`
  query GetProductivityScores($startDate: DateTime!, $endDate: DateTime!) {
    productivityScores(startDate: $startDate, endDate: $endDate) {
      date
      score
      completedTasks
      totalTasks
      focusTimeHours
      energyLevel
    }
  }
`;

export const GET_INSIGHTS = gql`
  query GetInsights($type: String, $limit: Int) {
    insights(type: $type, limit: $limit) {
      id
      type
      title
      description
      actionable
      priority
      createdAt
    }
  }
`;

export const GENERATE_INSIGHTS = gql`
  mutation GenerateInsights {
    generateInsights {
      id
      type
      title
      description
    }
  }
`;

// ============================================================================
// PRODUCTIVITY FEATURES - WORK HOURS
// ============================================================================

export const GET_WORK_HOURS = gql`
  query GetWorkHours {
    workHours {
      id
      timezone
      schedule {
        monday { isWorkDay startTime endTime }
        tuesday { isWorkDay startTime endTime }
        wednesday { isWorkDay startTime endTime }
        thursday { isWorkDay startTime endTime }
        friday { isWorkDay startTime endTime }
        saturday { isWorkDay startTime endTime }
        sunday { isWorkDay startTime endTime }
      }
      enforceWorkHours
      maxMeetingsPerDay
    }
  }
`;

export const UPDATE_WORK_HOURS = gql`
  mutation UpdateWorkHours($input: WorkHoursInput!) {
    updateWorkHours(input: $input) {
      id
      timezone
      enforceWorkHours
    }
  }
`;

// ============================================================================
// PRODUCTIVITY FEATURES - FOCUS TIME
// ============================================================================

export const GET_FOCUS_TIME_BLOCKS = gql`
  query GetFocusTimeBlocks($isActive: Boolean) {
    focusTimeBlocks(isActive: $isActive) {
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
      color
    }
  }
`;

export const CREATE_FOCUS_BLOCK = gql`
  mutation CreateFocusBlock($input: CreateFocusBlockInput!) {
    createFocusBlock(input: $input) {
      id
      title
      frequency
      daysOfWeek
      durationMinutes
    }
  }
`;

export const UPDATE_FOCUS_BLOCK = gql`
  mutation UpdateFocusBlock($id: ID!, $input: UpdateFocusBlockInput!) {
    updateFocusBlock(id: $id, input: $input) {
      id
      title
      isActive
    }
  }
`;

export const DELETE_FOCUS_BLOCK = gql`
  mutation DeleteFocusBlock($id: ID!) {
    deleteFocusBlock(id: $id)
  }
`;

// ============================================================================
// PRODUCTIVITY FEATURES - KANBAN BOARDS
// ============================================================================

export const GET_KANBAN_BOARDS = gql`
  query GetKanbanBoards($projectId: ID) {
    kanbanBoards(projectId: $projectId) {
      id
      name
      description
      isDefault
      columns {
        id
        name
        order
        color
        taskIds
      }
    }
  }
`;

export const CREATE_KANBAN_BOARD = gql`
  mutation CreateKanbanBoard($input: CreateKanbanBoardInput!) {
    createKanbanBoard(input: $input) {
      id
      name
      isDefault
    }
  }
`;

export const MOVE_TASK_IN_KANBAN = gql`
  mutation MoveTaskInKanban($input: MoveTaskInKanbanInput!) {
    moveTaskInKanban(input: $input)
  }
`;

// ============================================================================
// PRODUCTIVITY FEATURES - SMART 1:1 MEETINGS
// ============================================================================

export const GET_SMART_1ON1S = gql`
  query GetSmart1on1s {
    smart1on1s {
      id
      title
      participantEmail
      frequency
      duration
      preferredDays
      preferredTimes
      isActive
      lastMeetingDate
      nextMeetingDate
    }
  }
`;

export const CREATE_SMART_1ON1 = gql`
  mutation CreateSmart1on1($input: CreateSmart1on1Input!) {
    createSmart1on1(input: $input) {
      id
      title
      participantEmail
      frequency
    }
  }
`;

export const UPDATE_SMART_1ON1 = gql`
  mutation UpdateSmart1on1($id: ID!, $input: UpdateSmart1on1Input!) {
    updateSmart1on1(id: $id, input: $input) {
      id
      title
      isActive
    }
  }
`;

export const DELETE_SMART_1ON1 = gql`
  mutation DeleteSmart1on1($id: ID!) {
    deleteSmart1on1(id: $id)
  }
`;

// ============================================================================
// PRODUCTIVITY FEATURES - NOTIFICATIONS
// ============================================================================

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($unreadOnly: Boolean) {
    notifications(unreadOnly: $unreadOnly) {
      id
      type
      title
      message
      metadata
      isRead
      readAt
      createdAt
    }
  }
`;

export const GET_NOTIFICATION_PREFERENCES = gql`
  query GetNotificationPreferences {
    notificationPreferences {
      id
      enableTaskReminders
      enableGoalMilestones
      enableWeeklyPlan
      enableDailyReminders
      enableOverbookedAlerts
      enableBreakReminders
      enableFocusTimeAlerts
      enableUpcomingMeetings
      reminderMinutesBefore
      quietHoursStart
      quietHoursEnd
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id)
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateNotificationPreferences($input: UpdateNotificationPreferencesInput!) {
    updateNotificationPreferences(input: $input) {
      id
      enableTaskReminders
      enableGoalMilestones
    }
  }
`;

// ============================================================================
// CALENDAR INTEGRATIONS
// ============================================================================

export const GET_CALENDAR_CONNECTIONS = gql`
  query GetCalendarConnections {
    calendarConnections {
      id
      provider
      email
      isActive
      lastSyncedAt
      syncStatus
    }
  }
`;

export const INITIATE_CALENDAR_AUTH = gql`
  mutation InitiateCalendarAuth($provider: CalendarProvider!) {
    initiateCalendarAuth(provider: $provider) {
      authUrl
      state
    }
  }
`;

export const CONNECT_CALENDAR_WITH_CODE = gql`
  mutation ConnectCalendar($input: ConnectCalendarInput!) {
    connectCalendar(input: $input) {
      id
      provider
      email
      isActive
    }
  }
`;

export const DISCONNECT_CALENDAR_CONNECTION = gql`
  mutation DisconnectCalendar($id: ID!) {
    disconnectCalendar(id: $id)
  }
`;

export const SYNC_CALENDAR_CONNECTION = gql`
  mutation SyncCalendar($id: ID!) {
    syncCalendar(id: $id) {
      id
      lastSyncedAt
      syncStatus
    }
  }
`;

export const GET_CALENDAR_EVENTS = gql`
  query GetCalendarEvents($startDate: DateTime!, $endDate: DateTime!, $calendarIds: [ID!]) {
    calendarEvents(startDate: $startDate, endDate: $endDate, calendarIds: $calendarIds) {
      id
      title
      start
      end
      location
      attendees
      isAllDay
      calendarId
    }
  }
`;

// ============================================================================
// TEAMS & API KEYS
// ============================================================================

export const GET_TEAMS = gql`
  query GetTeams {
    teams {
      id
      name
      description
      ownerId
      createdAt
    }
  }
`;

export const CREATE_TEAM = gql`
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(input: $input) {
      id
      name
      description
    }
  }
`;

export const GET_TEAM_MEMBERS = gql`
  query GetTeamMembers($teamId: ID!) {
    teamMembers(teamId: $teamId) {
      id
      userId
      role
      joinedAt
      user {
        id
        name
        email
        avatar
      }
    }
  }
`;

export const INVITE_TEAM_MEMBER = gql`
  mutation InviteTeamMember($input: InviteTeamMemberInput!) {
    inviteTeamMember(input: $input) {
      id
      email
      role
      status
    }
  }
`;

export const GET_API_KEYS = gql`
  query GetApiKeys {
    apiKeys {
      id
      name
      keyPrefix
      scopes
      expiresAt
      lastUsedAt
      createdAt
    }
  }
`;

export const CREATE_API_KEY = gql`
  mutation CreateApiKey($input: CreateApiKeyInput!) {
    createApiKey(input: $input) {
      id
      name
      key
      scopes
    }
  }
`;

export const DELETE_API_KEY = gql`
  mutation DeleteApiKey($id: ID!) {
    deleteApiKey(id: $id)
  }
`;

// ============================================================================
// SCHEDULING LINKS (Calendly-like)
// ============================================================================

export const GET_SCHEDULING_LINKS = gql`
  query GetSchedulingLinks {
    schedulingLinks {
      id
      slug
      title
      description
      duration
      isActive
      bookingsCount
      createdAt
    }
  }
`;

export const CREATE_SCHEDULING_LINK = gql`
  mutation CreateSchedulingLink($input: CreateSchedulingLinkInput!) {
    createSchedulingLink(input: $input) {
      id
      slug
      title
      duration
    }
  }
`;

export const GET_BOOKINGS = gql`
  query GetBookings($linkId: ID, $status: BookingStatus) {
    bookings(linkId: $linkId, status: $status) {
      id
      linkId
      attendeeName
      attendeeEmail
      startTime
      endTime
      status
      createdAt
    }
  }
`;

export const CONFIRM_BOOKING = gql`
  mutation ConfirmBooking($id: ID!) {
    confirmBooking(id: $id) {
      id
      status
    }
  }
`;

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!, $reason: String) {
    cancelBooking(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

// ============================================================================
// INTEGRATIONS & WEBHOOKS
// ============================================================================

export const GET_INTEGRATIONS = gql`
  query GetIntegrations($type: IntegrationType) {
    integrations(type: $type) {
      id
      type
      name
      isActive
      config
      lastSyncedAt
    }
  }
`;

export const CONNECT_INTEGRATION = gql`
  mutation ConnectIntegration($input: ConnectIntegrationInput!) {
    connectIntegration(input: $input) {
      id
      type
      isActive
    }
  }
`;

export const GET_WEBHOOKS = gql`
  query GetWebhooks {
    webhooks {
      id
      url
      events
      isActive
      secret
      createdAt
    }
  }
`;

export const CREATE_WEBHOOK = gql`
  mutation CreateWebhook($input: CreateWebhookInput!) {
    createWebhook(input: $input) {
      id
      url
      events
      secret
    }
  }
`;

// ============================================================================
// BILLING & SUBSCRIPTIONS
// ============================================================================

export const GET_SUBSCRIPTION = gql`
  query GetSubscription {
    subscription {
      id
      tier
      status
      currentPeriodEnd
      cancelAtPeriodEnd
      features {
        maxGoals
        maxTasks
        maxProjects
        aiPlansPerMonth
        teamMembers
        apiAccess
      }
    }
  }
`;

export const GET_USAGE_STATS = gql`
  query GetUsageStats {
    usageStats {
      goalsUsed
      tasksUsed
      projectsUsed
      aiPlansUsed
      teamMembersUsed
      resetDate
    }
  }
`;

export const CREATE_CHECKOUT_SESSION = gql`
  mutation CreateCheckoutSession($tier: SubscriptionTier!, $interval: BillingInterval!) {
    createCheckoutSession(tier: $tier, interval: $interval) {
      sessionId
      url
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription {
    cancelSubscription {
      id
      cancelAtPeriodEnd
    }
  }
`;

export const CREATE_BILLING_PORTAL_SESSION = gql`
  mutation CreateBillingPortalSession {
    createBillingPortalSession {
      url
    }
  }
`;

// ============================================================================
// PRODUCTIVITY SUBSCRIPTIONS (Real-Time)
// ============================================================================

export const NOTIFICATION_RECEIVED = gql`
  subscription NotificationReceived {
    notificationReceived {
      id
      type
      title
      message
      createdAt
    }
  }
`;

export const KANBAN_BOARD_UPDATED = gql`
  subscription KanbanBoardUpdated {
    kanbanBoardUpdated {
      id
      name
      columns {
        id
        name
        order
        taskIds
      }
    }
  }
`;

export const FOCUS_TIME_CREATED = gql`
  subscription FocusTimeCreated {
    focusTimeCreated {
      id
      title
      startTime
      durationMinutes
    }
  }
`;
