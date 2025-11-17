import { GraphQLError } from 'graphql';

export const schedulingResolvers = {
  Query: {
    /**
     * Scheduling Links (Calendly-like)
     */
    schedulingLinks: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.schedulingAPI.getSchedulingLinks(user.userId);
    },

    schedulingLink: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.schedulingAPI.getSchedulingLink(id, user.userId);
    },

    schedulingLinkBySlug: async (_: any, { slug }: any, { dataSources }: any) => {
      // Public query - no auth required for viewing public links
      return dataSources.schedulingAPI.getSchedulingLinkBySlug(slug);
    },

    /**
     * Bookings
     */
    bookings: async (_: any, { linkId, status }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.schedulingAPI.getBookings(user.userId, linkId, status);
    },

    booking: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.schedulingAPI.getBooking(id, user.userId);
    },

    /**
     * Available time slots for booking
     */
    availableSlots: async (_: any, { linkId, date }: any, { dataSources }: any) => {
      // Public query - no auth required for viewing available slots
      return dataSources.schedulingAPI.getAvailableSlots(linkId, date);
    },
  },

  Mutation: {
    /**
     * Scheduling Link Management
     */
    createSchedulingLink: async (_: any, { input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.schedulingAPI.createSchedulingLink(user.userId, input);
    },

    updateSchedulingLink: async (_: any, { id, input }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.schedulingAPI.updateSchedulingLink(id, user.userId, input);
    },

    deleteSchedulingLink: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      await dataSources.schedulingAPI.deleteSchedulingLink(id, user.userId);
      return true;
    },

    toggleSchedulingLink: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.schedulingAPI.toggleSchedulingLink(id, user.userId);
    },

    /**
     * Booking Management
     */
    createBooking: async (_: any, { input }: any, { dataSources }: any) => {
      // Public mutation - anyone can create a booking
      return dataSources.schedulingAPI.createBooking(input);
    },

    confirmBooking: async (_: any, { id }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.schedulingAPI.confirmBooking(id, user.userId);
    },

    cancelBooking: async (_: any, { id, reason }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.schedulingAPI.cancelBooking(id, user.userId, reason);
    },
  },

  SchedulingLink: {
    user: async (link: any, _: any, { userLoader }: any) => {
      return userLoader.load(link.userId);
    },

    bookings: async (link: any, _: any, { dataSources }: any) => {
      return dataSources.schedulingAPI.getBookingsByLink(link.id);
    },
  },

  Booking: {
    link: async (booking: any, _: any, { dataSources }: any) => {
      return dataSources.schedulingAPI.getSchedulingLink(booking.linkId);
    },
  },
};
