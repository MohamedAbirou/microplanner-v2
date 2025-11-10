import { GraphQLError } from 'graphql';

/**
 * Project Resolvers
 */
export const projectResolvers = {
  Query: {
    project: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.projectsAPI.getProject(id, user.userId);
    },

    projects: async (_: any, args: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.projectsAPI.getProjects(user.userId, args);
    },

    projectWithStats: async (_: any, { id }: { id: string }, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.projectsAPI.getProjectStats(id, user.userId);
    },
  },

  Mutation: {
    createProject: async (_: any, { input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const project = await dataSources.projectsAPI.createProject(user.userId, input);

      // Publish to subscription
      await pubsub.publish(`PROJECT_CREATED_${user.userId}`, { projectCreated: project });

      return project;
    },

    updateProject: async (_: any, { id, input }: any, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const project = await dataSources.projectsAPI.updateProject(id, user.userId, input);

      // Publish to subscription
      await pubsub.publish(`PROJECT_UPDATED_${user.userId}`, { projectUpdated: project });

      return project;
    },

    deleteProject: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      await dataSources.projectsAPI.deleteProject(id, user.userId);

      // Publish to subscription
      await pubsub.publish(`PROJECT_DELETED_${user.userId}`, { projectDeleted: { id } });

      return true;
    },

    archiveProject: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const project = await dataSources.projectsAPI.archiveProject(id, user.userId);

      // Publish to subscription
      await pubsub.publish(`PROJECT_UPDATED_${user.userId}`, { projectUpdated: project });

      return project;
    },

    unarchiveProject: async (_: any, { id }: { id: string }, { dataSources, user, pubsub }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      const project = await dataSources.projectsAPI.unarchiveProject(id, user.userId);

      // Publish to subscription
      await pubsub.publish(`PROJECT_UPDATED_${user.userId}`, { projectUpdated: project });

      return project;
    },
  },

  Subscription: {
    projectCreated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`PROJECT_CREATED_${user.userId}`);
      },
    },

    projectUpdated: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`PROJECT_UPDATED_${user.userId}`);
      },
    },

    projectDeleted: {
      subscribe: (_: any, __: any, { pubsub, user }: any) => {
        if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
        return pubsub.asyncIterator(`PROJECT_DELETED_${user.userId}`);
      },
    },
  },

  Project: {
    // DataLoader batching for related entities
    tasks: async (project: any, _: any, { dataSources }: any) => {
      return dataSources.tasksAPI.getTasksByProject(project.id, project.userId);
    },

    goals: async (project: any, _: any, { dataSources }: any) => {
      return dataSources.goalsAPI.getGoalsByProject(project.id, project.userId);
    },

    members: async (project: any, _: any, { dataSources }: any) => {
      // If we implement team features later
      return [];
    },
  },
};
