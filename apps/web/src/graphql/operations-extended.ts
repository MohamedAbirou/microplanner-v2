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
// REFERRALS
// ============================================================================

export const GET_MY_REFERRAL_STATS = gql`
  query MyReferralStats {
    myReferralStats {
      code
      totalReferrals
      activeReferrals
      pendingReferrals
      referrals {
        id
        status
        referredName
        createdAt
      }
    }
  }
`;

export const REDEEM_REFERRAL = gql`
  mutation RedeemReferral($code: String!) {
    redeemReferral(code: $code)
  }
`;

// ============================================================================
// AI MEMORY (scheduling overrides)
// ============================================================================

export const GET_AI_MEMORIES = gql`
  query GetAiMemories {
    aiMemories {
      id
      memoryType
      content
      confidence
      source
      lastUsedAt
      createdAt
    }
  }
`;

export const CREATE_AI_MEMORY = gql`
  mutation CreateAiMemory($input: CreateAiMemoryInput!) {
    createAiMemory(input: $input) {
      id
      memoryType
      content
      confidence
    }
  }
`;

export const DELETE_AI_MEMORY = gql`
  mutation DeleteAiMemory($id: ID!) {
    deleteAiMemory(id: $id)
  }
`;

// ============================================================================
// GDPR (account deletion + data export)
// ============================================================================

export const EXPORT_MY_DATA = gql`
  query ExportMyData {
    exportMyData
  }
`;

export const DELETE_MY_ACCOUNT = gql`
  mutation DeleteMyAccount {
    deleteMyAccount
  }
`;

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

export const REGISTER_PUSH_TOKEN = gql`
  mutation RegisterPushToken($subscription: JSON!) {
    registerPushToken(subscription: $subscription)
  }
`;

export const UNREGISTER_PUSH_TOKEN = gql`
  mutation UnregisterPushToken($endpoint: String!) {
    unregisterPushToken(endpoint: $endpoint)
  }
`;

// ============================================================================
// PROJECTS & KANBAN
// ============================================================================

export const GET_PROJECTS = gql`
  query GetProjects($includeArchived: Boolean, $orderBy: ProjectOrderBy) {
    projects(includeArchived: $includeArchived, orderBy: $orderBy) {
      id
      name
      description
      color
      icon
      isArchived
      taskCount
      completedTaskCount
      progressPercentage
      createdAt
    }
  }
`;

export const GET_PROJECT_BOARD = gql`
  query GetProjectBoard($id: ID!) {
    project(id: $id) {
      id
      name
      description
      color
      icon
      taskCount
      completedTaskCount
      progressPercentage
      tasks {
        id
        title
        isCompleted
        isTimerRunning
        timeSpentMinutes
        durationMinutes
        priority
        scheduledDate
        startTime
        endTime
        goal {
          id
          emoji
          title
          color
        }
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      color
      icon
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
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

// ============================================================================
// PLAN TEMPLATES
// ============================================================================

export const GET_PLAN_TEMPLATES = gql`
  query GetPlanTemplates($category: String, $featured: Boolean, $limit: Int, $offset: Int) {
    planTemplates(category: $category, featured: $featured, limit: $limit, offset: $offset) {
      id
      name
      description
      emoji
      category
      tags
      isPublic
      isFeatured
      usageCount
      rating
      structure
      createdAt
    }
  }
`;

export const SAVE_AS_PLAN_TEMPLATE = gql`
  mutation SaveAsPlanTemplate($planId: ID!, $name: String!, $description: String) {
    saveAsPlanTemplate(planId: $planId, name: $name, description: $description) {
      id
      name
    }
  }
`;

export const GENERATE_PLAN_FROM_TEMPLATE = gql`
  mutation GeneratePlanFromTemplate($input: GenerateFromTemplateInput!) {
    generatePlanFromTemplate(input: $input) {
      id
      status
      weekStartDate
    }
  }
`;

export const SET_DEFAULT_PLAN_TEMPLATE = gql`
  mutation SetDefaultPlanTemplate($id: ID!) {
    setDefaultPlanTemplate(id: $id) {
      id
    }
  }
`;

export const DELETE_PLAN_TEMPLATE = gql`
  mutation DeletePlanTemplate($id: ID!) {
    deletePlanTemplate(id: $id)
  }
`;

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
      totalDuration: totalHoursScheduled
      productivityScore: averageProductivityScore
      currentStreak
      longestStreak
    }
  }
`;

export const GET_PRODUCTIVITY_SCORES = gql`
  query GetProductivityScores($startDate: DateTime!, $endDate: DateTime!) {
    productivityScores(startDate: $startDate, endDate: $endDate) {
      date
      score: overallScore
      focusTimeScore
      taskCompletionScore
      totalFocusMinutes
      totalTaskMinutes
    }
  }
`;

export const GET_INSIGHTS = gql`
  query GetInsights($type: String, $limit: Int) {
    insights(type: $type, limit: $limit)
  }
`;

export const GET_WEEKLY_REVIEW = gql`
  query GetWeeklyReview {
    weeklyReview {
      weekStartDate
      weekEndDate
      goalsCreated
      plansGenerated
      tasksCompleted
      completionRate
      productivity
      recommendation
      topGoals {
        title
        completions
      }
    }
  }
`;

export const GENERATE_INSIGHTS = gql`
  mutation GenerateInsights {
    generateInsights
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
  mutation CreateFocusBlock($input: CreateFocusTimeBlockInput!) {
    createFocusTimeBlock(input: $input) {
      id
      title
      frequency
      daysOfWeek
      durationMinutes
    }
  }
`;

export const UPDATE_FOCUS_BLOCK = gql`
  mutation UpdateFocusBlock($id: ID!, $input: UpdateFocusTimeBlockInput!) {
    updateFocusTimeBlock(id: $id, input: $input) {
      id
      title
      isActive
    }
  }
`;

export const DELETE_FOCUS_BLOCK = gql`
  mutation DeleteFocusBlock($id: ID!) {
    deleteFocusTimeBlock(id: $id)
  }
`;

// ============================================================================
// PRODUCTIVITY FEATURES - NO MEETING DAYS
// ============================================================================

export const GET_NO_MEETING_DAYS = gql`
  query GetNoMeetingDays($isActive: Boolean) {
    noMeetingDays(isActive: $isActive) {
      id
      dayOfWeek
      isActive
      allowExceptions
    }
  }
`;

export const CREATE_NO_MEETING_DAY = gql`
  mutation CreateNoMeetingDay($input: CreateNoMeetingDayInput!) {
    createNoMeetingDay(input: $input) {
      id
      dayOfWeek
      isActive
      allowExceptions
    }
  }
`;

export const DELETE_NO_MEETING_DAY = gql`
  mutation DeleteNoMeetingDay($id: ID!) {
    deleteNoMeetingDay(id: $id)
  }
`;

// ============================================================================
// PRODUCTIVITY FEATURES - CALENDAR DEFENSE
// ============================================================================

export const GET_CALENDAR_DEFENSE = gql`
  query GetCalendarDefense {
    calendarDefense {
      id
      autoAcceptDuringOpenHours
      autoDeclineDuringFocusTime
      autoDeclineOutsideWorkHours
      autoDeclineDoubleBookings
      requireMinimumNotice
      minimumNoticeHours
      requireBufferBetweenMeetings
      bufferMinutes
      suggestShorterMeetings
      defaultMeetingDuration
    }
  }
`;

export const UPDATE_CALENDAR_DEFENSE = gql`
  mutation UpdateCalendarDefense($input: UpdateCalendarDefenseInput!) {
    updateCalendarDefense(input: $input) {
      id
      autoAcceptDuringOpenHours
      autoDeclineDuringFocusTime
      autoDeclineOutsideWorkHours
      autoDeclineDoubleBookings
      requireMinimumNotice
      minimumNoticeHours
      requireBufferBetweenMeetings
      bufferMinutes
      suggestShorterMeetings
      defaultMeetingDuration
    }
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
      isActive: syncEnabled
      lastSyncedAt: lastSyncAt
      syncErrors
    }
  }
`;

export const INITIATE_CALENDAR_AUTH = gql`
  mutation InitiateCalendarAuth($provider: CalendarProvider!) {
    initiateCalendarAuth(provider: $provider) {
      authUrl: url
      provider
    }
  }
`;

export const CONNECT_CALENDAR_WITH_CODE = gql`
  mutation ConnectCalendar($input: ConnectCalendarInput!) {
    connectCalendar(input: $input) {
      id
      provider
      email
      isActive: syncEnabled
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
      success
      tasksSucceeded
      tasksFailed
      duration
    }
  }
`;

export const GET_CALENDAR_EVENTS = gql`
  query GetCalendarEvents($startDate: DateTime!, $endDate: DateTime!, $calendarIds: [String!]) {
    calendarEvents(startDate: $startDate, endDate: $endDate, calendarIds: $calendarIds) {
      id
      title
      start
      end
      location
      attendees
      isAllDay: allDay
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

export const DELETE_TEAM = gql`
  mutation DeleteTeam($id: ID!) {
    deleteTeam(id: $id)
  }
`;

export const REMOVE_TEAM_MEMBER = gql`
  mutation RemoveTeamMember($teamId: ID!, $userId: ID!) {
    removeTeamMember(teamId: $teamId, userId: $userId)
  }
`;

export const UPDATE_TEAM_MEMBER_ROLE = gql`
  mutation UpdateTeamMemberRole($teamId: ID!, $userId: ID!, $role: TeamRole!) {
    updateTeamMemberRole(teamId: $teamId, userId: $userId, role: $role) {
      id
      role
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
      title: name
      description
      duration
      isActive
      bookingsCount: bookingCount
      createdAt
    }
  }
`;

export const CREATE_SCHEDULING_LINK = gql`
  mutation CreateSchedulingLink($input: CreateSchedulingLinkInput!) {
    createSchedulingLink(input: $input) {
      id
      slug
      title: name
      duration
    }
  }
`;

export const DELETE_SCHEDULING_LINK = gql`
  mutation DeleteSchedulingLink($id: ID!) {
    deleteSchedulingLink(id: $id)
  }
`;

export const TOGGLE_SCHEDULING_LINK = gql`
  mutation ToggleSchedulingLink($id: ID!) {
    toggleSchedulingLink(id: $id) {
      id
      isActive
    }
  }
`;

// Public (no auth) — used by the booking page
export const GET_SCHEDULING_LINK_BY_SLUG = gql`
  query GetSchedulingLinkBySlug($slug: String!) {
    schedulingLinkBySlug(slug: $slug) {
      id
      name
      slug
      description
      duration
      location
      meetingType
      color
      isActive
      requiresConfirmation
      user {
        name
      }
    }
  }
`;

export const GET_AVAILABLE_SLOTS = gql`
  query GetAvailableSlots($linkId: ID!, $date: DateTime!) {
    availableSlots(linkId: $linkId, date: $date) {
      start
      end
    }
  }
`;

export const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      status
      startTime
      endTime
      attendeeName
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
      lastSyncedAt: lastSyncAt
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

export const DISCONNECT_INTEGRATION = gql`
  mutation DisconnectIntegration($id: ID!) {
    disconnectIntegration(id: $id)
  }
`;

export const SYNC_INTEGRATION = gql`
  mutation SyncIntegration($id: ID!) {
    syncIntegration(id: $id) {
      id
      lastSyncedAt: lastSyncAt
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

export const DELETE_WEBHOOK = gql`
  mutation DeleteWebhook($id: ID!) {
    deleteWebhook(id: $id)
  }
`;

export const TOGGLE_WEBHOOK = gql`
  mutation ToggleWebhook($id: ID!) {
    toggleWebhook(id: $id) {
      id
      isActive
    }
  }
`;

export const GET_WEBHOOK_DELIVERIES = gql`
  query GetWebhookDeliveries($webhookId: ID!, $limit: Int) {
    webhookDeliveries(webhookId: $webhookId, limit: $limit) {
      id
      event
      status
      statusCode
      attempts
      error
      lastAttemptAt
      createdAt
    }
  }
`;

export const RETRY_WEBHOOK_DELIVERY = gql`
  mutation RetryWebhookDelivery($deliveryId: ID!) {
    retryWebhookDelivery(deliveryId: $deliveryId) {
      id
      status
      attempts
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
      goalsCreated
      plansGenerated
      tasksCreated
      aiGenerationsUsed
      goalLimit
      planLimit
      taskLimit
      aiGenerationLimit
      goalUsagePercent
      planUsagePercent
      taskUsagePercent
      aiUsagePercent
      resetsAt
    }
  }
`;

export const GET_BILLING_INFO = gql`
  query GetBillingInfo {
    billingInfo {
      stripeCustomerId
      paymentMethod {
        brand
        last4
        expMonth
        expYear
      }
      upcomingInvoice {
        amountDue
        currency
        periodStart
        periodEnd
        total
      }
      invoices {
        id
        amountPaid
        amountDue
        currency
        status
        invoicePdf
        hostedInvoiceUrl
        created
      }
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

export const UPGRADE_SUBSCRIPTION = gql`
  mutation UpgradeSubscription($tier: SubscriptionTier!) {
    upgradeSubscription(tier: $tier) {
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

export const RESUME_SUBSCRIPTION = gql`
  mutation ResumeSubscription {
    resumeSubscription {
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
