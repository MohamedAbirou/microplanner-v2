import { GraphQLError } from 'graphql';

/**
 * Productivity Resolvers (Phase 18 Features)
 */
export const productivityResolvers = {
  Query: {
    // ==================== WORK HOURS ====================
    workHours: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getWorkHours(user.userId);
    },

    // ==================== FOCUS TIME ====================
    focusTimeBlocks: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getFocusTimeBlocks(user.userId);
    },

    // ==================== NO-MEETING DAYS ====================
    noMeetingDays: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getNoMeetingDays(user.userId);
    },

    // ==================== PRIORITY HOURS ====================
    priorityHours: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getPriorityHours(user.userId);
    },

    // ==================== CALENDAR DEFENSE ====================
    calendarDefense: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getCalendarDefense(user.userId);
    },

    // ==================== SMART 1:1 ====================
    smart1on1s: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getSmart1on1s(user.userId);
    },

    // ==================== KANBAN BOARDS ====================
    kanbanBoards: async (_: any, { projectId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getKanbanBoards(user.userId, projectId);
    },

    kanbanBoard: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getKanbanBoard(id, user.userId);
    },

    // ==================== PRODUCTIVITY SCORING ====================
    productivityScore: async (_: any, { date }: { date: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getProductivityScore(user.userId, date);
    },

    productivityScores: async (
      _: any,
      { startDate, endDate }: { startDate: string; endDate: string },
      { dataSources, user }: any,
    ) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getProductivityScores(user.userId, startDate, endDate);
    },

    // ==================== NOTIFICATIONS ====================
    notifications: async (_: any, { unreadOnly }: { unreadOnly?: boolean }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getNotifications(user.userId, unreadOnly);
    },

    notificationPreferences: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getNotificationPreferences(user.userId);
    },
  },

  Mutation: {
    // ==================== WORK HOURS ====================
    updateWorkHours: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const workHours = await dataSources.productivityAPI.updateWorkHours(user.userId, input);

      await pubsub.publish(`WORK_HOURS_UPDATED_${user.userId}`, { workHoursUpdated: workHours });

      return workHours;
    },

    // ==================== FOCUS TIME ====================
    createFocusTime: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const focusTime = await dataSources.productivityAPI.createFocusTime(user.userId, input);

      await pubsub.publish(`FOCUS_TIME_CREATED_${user.userId}`, { focusTimeCreated: focusTime });

      return focusTime;
    },

    updateFocusTime: async (_: any, { id, input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const focusTime = await dataSources.productivityAPI.updateFocusTime(id, user.userId, input);

      await pubsub.publish(`FOCUS_TIME_UPDATED_${user.userId}`, { focusTimeUpdated: focusTime });

      return focusTime;
    },

    deleteFocusTime: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      await dataSources.productivityAPI.deleteFocusTime(id, user.userId);

      await pubsub.publish(`FOCUS_TIME_DELETED_${user.userId}`, { focusTimeDeleted: { id } });

      return true;
    },

    // ==================== NO-MEETING DAYS ====================
    createNoMeetingDay: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const noMeetingDay = await dataSources.productivityAPI.createNoMeetingDay(user.userId, input);

      await pubsub.publish(`NO_MEETING_DAY_CREATED_${user.userId}`, { noMeetingDayCreated: noMeetingDay });

      return noMeetingDay;
    },

    deleteNoMeetingDay: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      await dataSources.productivityAPI.deleteNoMeetingDay(id, user.userId);

      await pubsub.publish(`NO_MEETING_DAY_DELETED_${user.userId}`, { noMeetingDayDeleted: { id } });

      return true;
    },

    // ==================== PRIORITY HOURS ====================
    updatePriorityHours: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const priorityHours = await dataSources.productivityAPI.updatePriorityHours(user.userId, input);

      await pubsub.publish(`PRIORITY_HOURS_UPDATED_${user.userId}`, { priorityHoursUpdated: priorityHours });

      return priorityHours;
    },

    // ==================== CALENDAR DEFENSE ====================
    updateCalendarDefense: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const calendarDefense = await dataSources.productivityAPI.updateCalendarDefense(user.userId, input);

      await pubsub.publish(`CALENDAR_DEFENSE_UPDATED_${user.userId}`, { calendarDefenseUpdated: calendarDefense });

      return calendarDefense;
    },

    // ==================== SMART 1:1 ====================
    createSmart1on1: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const smart1on1 = await dataSources.productivityAPI.createSmart1on1(user.userId, input);

      await pubsub.publish(`SMART_1ON1_CREATED_${user.userId}`, { smart1on1Created: smart1on1 });

      return smart1on1;
    },

    updateSmart1on1: async (_: any, { id, input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const smart1on1 = await dataSources.productivityAPI.updateSmart1on1(id, user.userId, input);

      await pubsub.publish(`SMART_1ON1_UPDATED_${user.userId}`, { smart1on1Updated: smart1on1 });

      return smart1on1;
    },

    deleteSmart1on1: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      await dataSources.productivityAPI.deleteSmart1on1(id, user.userId);

      await pubsub.publish(`SMART_1ON1_DELETED_${user.userId}`, { smart1on1Deleted: { id } });

      return true;
    },

    // ==================== TRAVEL TIME ====================
    calculateTravelTime: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.calculateTravelTime(user.userId, input);
    },

    // ==================== KANBAN BOARDS ====================
    createKanbanBoard: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const board = await dataSources.productivityAPI.createKanbanBoard(user.userId, input);

      await pubsub.publish(`KANBAN_BOARD_CREATED_${user.userId}`, { kanbanBoardCreated: board });

      return board;
    },

    updateKanbanBoard: async (_: any, { id, input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const board = await dataSources.productivityAPI.updateKanbanBoard(id, user.userId, input);

      await pubsub.publish(`KANBAN_BOARD_UPDATED_${user.userId}`, { kanbanBoardUpdated: board });

      return board;
    },

    deleteKanbanBoard: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      await dataSources.productivityAPI.deleteKanbanBoard(id, user.userId);

      await pubsub.publish(`KANBAN_BOARD_DELETED_${user.userId}`, { kanbanBoardDeleted: { id } });

      return true;
    },

    moveTaskInKanban: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      await dataSources.productivityAPI.moveTaskInKanban(user.userId, input);

      // Publish board update
      const board = await dataSources.productivityAPI.getKanbanBoard(input.boardId, user.userId);
      await pubsub.publish(`KANBAN_BOARD_UPDATED_${user.userId}`, { kanbanBoardUpdated: board });

      return true;
    },

    // ==================== NOTIFICATIONS ====================
    markNotificationAsRead: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      await dataSources.productivityAPI.markNotificationAsRead(id, user.userId);

      await pubsub.publish(`NOTIFICATION_READ_${user.userId}`, { notificationRead: { id } });

      return true;
    },

    updateNotificationPreferences: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const prefs = await dataSources.productivityAPI.updateNotificationPreferences(user.userId, input);

      await pubsub.publish(`NOTIFICATION_PREFS_UPDATED_${user.userId}`, { notificationPreferencesUpdated: prefs });

      return prefs;
    },
  },

  Subscription: {
    // Work Hours
    workHoursUpdated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`WORK_HOURS_UPDATED_${user.userId}`);
      },
    },

    // Focus Time
    focusTimeCreated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`FOCUS_TIME_CREATED_${user.userId}`);
      },
    },

    focusTimeUpdated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`FOCUS_TIME_UPDATED_${user.userId}`);
      },
    },

    // Kanban Boards
    kanbanBoardUpdated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`KANBAN_BOARD_UPDATED_${user.userId}`);
      },
    },

    // Notifications (Real-time)
    notificationReceived: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`NOTIFICATION_RECEIVED_${user.userId}`);
      },
    },
  },

  KanbanBoard: {
    columns: async (board: any, _: any, { dataSources }: any) => {
      // Columns are already included in the board response
      return board.columns || [];
    },
  },
};
