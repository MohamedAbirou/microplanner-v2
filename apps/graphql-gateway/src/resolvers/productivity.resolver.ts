import { GraphQLError } from 'graphql';

export const productivityResolvers = {
  Query: {
    /**
     * Work Hours & Calendar Defense
     */
    workHours: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getWorkHours(user.userId);
    },

    focusTimeBlocks: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getFocusTimeBlocks(user.userId);
    },

    noMeetingDays: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getNoMeetingDays(user.userId);
    },

    priorityHours: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getPriorityHours(user.userId);
    },

    calendarDefense: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getCalendarDefense(user.userId);
    },

    /**
     * Kanban Boards
     */
    kanbanBoards: async (_: any, { projectId }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getKanbanBoards(user.userId, projectId);
    },

    kanbanBoard: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getKanbanBoard(id, user.userId);
    },

    /**
     * Smart 1:1 Meetings
     */
    smart1on1s: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getSmart1on1s(user.userId);
    },

    /**
     * Notifications
     */
    notifications: async (_: any, { unreadOnly }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getNotifications(user.userId, unreadOnly);
    },

    notificationPreferences: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getNotificationPreferences(user.userId);
    },
  },

  Mutation: {
    /**
     * Work Hours Management
     */
    updateWorkHours: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const workHours = await dataSources.productivityAPI.updateWorkHours(user.userId, input);
      await pubsub.publish(`WORK_HOURS_UPDATED_${user.userId}`, { workHoursUpdated: workHours });
      return workHours;
    },

    /**
     * Focus Time Blocks
     */
    createFocusTimeBlock: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const focusTime = await dataSources.productivityAPI.createFocusTime(user.userId, input);
      await pubsub.publish(`FOCUS_TIME_CREATED_${user.userId}`, { focusTimeCreated: focusTime });
      return focusTime;
    },

    updateFocusTimeBlock: async (_: any, { id, input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const focusTime = await dataSources.productivityAPI.updateFocusTime(id, user.userId, input);
      await pubsub.publish(`FOCUS_TIME_UPDATED_${user.userId}`, { focusTimeUpdated: focusTime });
      return focusTime;
    },

    deleteFocusTimeBlock: async (_: any, { id }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.productivityAPI.deleteFocusTime(id, user.userId);
      await pubsub.publish(`FOCUS_TIME_DELETED_${user.userId}`, { focusTimeDeleted: id });
      return true;
    },

    /**
     * No Meeting Days
     */
    createNoMeetingDay: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const noMeetingDay = await dataSources.productivityAPI.createNoMeetingDay(user.userId, input);
      await pubsub.publish(`NO_MEETING_DAY_CREATED_${user.userId}`, { noMeetingDayCreated: noMeetingDay });
      return noMeetingDay;
    },

    deleteNoMeetingDay: async (_: any, { id }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.productivityAPI.deleteNoMeetingDay(id, user.userId);
      await pubsub.publish(`NO_MEETING_DAY_DELETED_${user.userId}`, { noMeetingDayDeleted: id });
      return true;
    },

    /**
     * Priority Hours
     */
    updatePriorityHours: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.updatePriorityHours(user.userId, input);
    },

    /**
     * Calendar Defense
     */
    updateCalendarDefense: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.updateCalendarDefense(user.userId, input);
    },

    /**
     * Kanban Board Management
     */
    createKanbanBoard: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const board = await dataSources.productivityAPI.createKanbanBoard(user.userId, input);
      await pubsub.publish(`KANBAN_BOARD_UPDATED_${user.userId}`, { kanbanBoardUpdated: board });
      return board;
    },

    updateKanbanBoard: async (_: any, { id, input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const board = await dataSources.productivityAPI.updateKanbanBoard(id, user.userId, input);
      await pubsub.publish(`KANBAN_BOARD_UPDATED_${user.userId}`, { kanbanBoardUpdated: board });
      return board;
    },

    deleteKanbanBoard: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.productivityAPI.deleteKanbanBoard(id, user.userId);
      return true;
    },

    moveTaskInKanban: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const result = await dataSources.productivityAPI.moveTaskInKanban(user.userId, input);
      // Publish board update to trigger UI refresh
      await pubsub.publish(`KANBAN_BOARD_UPDATED_${user.userId}`, { kanbanBoardUpdated: result });
      return true;
    },

    /**
     * Smart 1:1 Meetings
     */
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

    deleteSmart1on1: async (_: any, { id }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.productivityAPI.deleteSmart1on1(id, user.userId);
      await pubsub.publish(`SMART_1ON1_DELETED_${user.userId}`, { smart1on1Deleted: id });
      return true;
    },

    /**
     * Travel Time Calculation
     */
    calculateTravelTime: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.calculateTravelTime(user.userId, input);
    },

    /**
     * Notifications
     */
    markNotificationAsRead: async (_: any, { id }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.productivityAPI.markNotificationAsRead(id, user.userId);
      await pubsub.publish(`NOTIFICATION_READ_${user.userId}`, { notificationRead: id });
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

    focusTimeDeleted: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`FOCUS_TIME_DELETED_${user.userId}`);
      },
    },

    // No Meeting Days
    noMeetingDayCreated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`NO_MEETING_DAY_CREATED_${user.userId}`);
      },
    },

    noMeetingDayDeleted: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`NO_MEETING_DAY_DELETED_${user.userId}`);
      },
    },

    // Kanban Boards
    kanbanBoardUpdated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`KANBAN_BOARD_UPDATED_${user.userId}`);
      },
    },

    // Smart 1:1
    smart1on1Created: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`SMART_1ON1_CREATED_${user.userId}`);
      },
    },

    smart1on1Updated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`SMART_1ON1_UPDATED_${user.userId}`);
      },
    },

    smart1on1Deleted: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`SMART_1ON1_DELETED_${user.userId}`);
      },
    },

    // Notifications
    notificationReceived: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`NOTIFICATION_RECEIVED_${user.userId}`);
      },
    },

    notificationRead: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`NOTIFICATION_READ_${user.userId}`);
      },
    },

    notificationPreferencesUpdated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`NOTIFICATION_PREFS_UPDATED_${user.userId}`);
      },
    },
  },

  KanbanBoard: {
    columns: async (board: any, _: any, { dataSources }: any) => {
      // Columns are typically returned with the board from the backend
      return board.columns || [];
    },
  },

  KanbanColumn: {
    tasks: async (column: any, _: any, { dataSources, taskLoader }: any) => {
      // Use taskLoader for efficient batching
      if (!column.taskIds || column.taskIds.length === 0) return [];
      return Promise.all(column.taskIds.map((id: string) => taskLoader.load(id)));
    },
  },
};
