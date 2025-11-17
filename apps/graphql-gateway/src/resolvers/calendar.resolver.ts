import { GraphQLError } from 'graphql';

export const calendarResolvers = {
  Query: {
    /**
     * Get all calendar connections for current user
     */
    calendarConnections: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.calendarAPI.getConnections(user.userId);
    },

    calendarConnection: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.calendarAPI.getConnection(id, user.userId);
    },

    calendarEvents: async (_: any, { startDate, endDate, calendarIds }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.calendarAPI.getEvents(user.userId, startDate, endDate, calendarIds);
    },

    busySlots: async (_: any, { startDate, endDate }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.calendarAPI.getBusySlots(user.userId, startDate, endDate);
    },
  },

  Mutation: {
    /**
     * OAuth flow - Step 1: Get authorization URL
     */
    initiateCalendarAuth: async (_: any, { provider }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.calendarAPI.initiateAuth(user.userId, provider);
    },

    /**
     * OAuth flow - Step 2: Complete connection with auth code
     */
    connectCalendar: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.calendarAPI.connectCalendar(user.userId, input);
    },

    disconnectCalendar: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.calendarAPI.disconnectCalendar(id, user.userId);
      return true;
    },

    syncCalendar: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.calendarAPI.syncCalendar(id, user.userId);
    },

    syncAllCalendars: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const connections = await dataSources.calendarAPI.syncAllCalendars(user.userId);
      return connections;
    },

    createCalendarEvent: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.calendarAPI.createEvent(user.userId, input);
    },

    updateCalendarEvent: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.calendarAPI.updateEvent(id, user.userId, input);
    },

    deleteCalendarEvent: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.calendarAPI.deleteEvent(id, user.userId);
      return true;
    },
  },

  CalendarConnection: {
    events: async (connection: any, { startDate, endDate }: any, { dataSources }: any) => {
      return dataSources.calendarAPI.getEventsByConnection(connection.id, startDate, endDate);
    },
  },
};
