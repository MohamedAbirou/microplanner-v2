import { GraphQLError } from 'graphql';

export const productivityFeaturesResolvers = {
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
      return dataSources.productivityAPI.getKanbanBoards(projectId, user.userId);
    },

    kanbanBoard: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.getKanbanBoard(id, user.userId);
    },
  },

  Mutation: {
    /**
     * Work Hours Management
     */
    updateWorkHours: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.updateWorkHours(user.userId, input);
    },

    /**
     * Focus Time Blocks
     */
    createFocusTimeBlock: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.createFocusTimeBlock(user.userId, input);
    },

    updateFocusTimeBlock: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.updateFocusTimeBlock(id, user.userId, input);
    },

    deleteFocusTimeBlock: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.productivityAPI.deleteFocusTimeBlock(id, user.userId);
      return true;
    },

    /**
     * No Meeting Days
     */
    createNoMeetingDay: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.createNoMeetingDay(user.userId, input);
    },

    updateNoMeetingDay: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.updateNoMeetingDay(id, user.userId, input);
    },

    deleteNoMeetingDay: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.productivityAPI.deleteNoMeetingDay(id, user.userId);
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
    createKanbanBoard: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.createKanbanBoard(user.userId, input);
    },

    updateKanbanBoard: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.updateKanbanBoard(id, user.userId, input);
    },

    deleteKanbanBoard: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.productivityAPI.deleteKanbanBoard(id, user.userId);
      return true;
    },

    createKanbanColumn: async (_: any, { boardId, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.createKanbanColumn(boardId, user.userId, input);
    },

    updateKanbanColumn: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.updateKanbanColumn(id, user.userId, input);
    },

    deleteKanbanColumn: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.productivityAPI.deleteKanbanColumn(id, user.userId);
      return true;
    },

    reorderKanbanColumns: async (_: any, { boardId, columnIds }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.reorderKanbanColumns(boardId, user.userId, columnIds);
    },

    moveTaskBetweenColumns: async (_: any, { taskId, fromColumnId, toColumnId, position }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.productivityAPI.moveTaskBetweenColumns(taskId, fromColumnId, toColumnId, position, user.userId);
    },
  },

  KanbanBoard: {
    columns: async (board: any, _: any, { dataSources }: any) => {
      return dataSources.productivityAPI.getKanbanColumns(board.id);
    },
  },

  KanbanColumn: {
    tasks: async (column: any, _: any, { dataSources }: any) => {
      return dataSources.tasksAPI.getTasksByColumn(column.id);
    },
  },
};
