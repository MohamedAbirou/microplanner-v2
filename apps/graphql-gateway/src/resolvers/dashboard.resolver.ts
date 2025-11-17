import { GraphQLError } from 'graphql';

export const dashboardResolvers = {
  Query: {
    // Dashboard overview stats
    dashboardStats: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      try {
        // Fetch data in parallel for performance
        const [goals, todayTasks, weekPlans] = await Promise.all([
          dataSources.goalsAPI.getGoals(user.userId, { isActive: true }),
          dataSources.tasksAPI.getTasks(user.userId, {
            scheduledDate: new Date().toISOString().split('T')[0],
          }),
          dataSources.productivityAPI.getWeeklyPlans(user.userId, { active: true }),
        ]);

        // Calculate completion rate
        const completedToday = todayTasks?.filter((t: any) => t.isCompleted).length || 0;
        const totalToday = todayTasks?.length || 0;
        const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

        // Calculate current streak (fallback to 0 if API unavailable)
        let currentStreak = 0;
        try {
          const streakData = await dataSources.productivityAPI.getProductivityStats(user.userId);
          currentStreak = streakData?.currentStreak || 0;
        } catch (error) {
          console.warn('Unable to fetch streak data:', error);
        }

        return {
          activeGoalsCount: goals?.length || 0,
          tasksTodayCount: totalToday,
          tasksCompletedToday: completedToday,
          completionRate: parseFloat(completionRate.toFixed(1)),
          weeklyPlansCount: weekPlans?.length || 0,
          productivityScore: null, // Can be enhanced later
          currentStreak,
        };
      } catch (error) {
        console.error('Dashboard stats error:', error);
        // Graceful fallback
        return {
          activeGoalsCount: 0,
          tasksTodayCount: 0,
          tasksCompletedToday: 0,
          completionRate: 0,
          weeklyPlansCount: 0,
          productivityScore: null,
          currentStreak: 0,
        };
      }
    },

    // Get upcoming tasks (next 7 days)
    upcomingTasks: async (_: any, { limit = 10 }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      try {
        // Get tasks for the next 7 days
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const tasks = await dataSources.tasksAPI.getTasks(user.userId, {
          isCompleted: false,
          orderBy: 'SCHEDULED_DATE_ASC',
          take: limit,
        });

        if (!tasks || tasks.length === 0) return [];

        // Fetch goals for tasks in parallel
        const goalsMap = new Map();
        const uniqueGoalIds = [...new Set(tasks.map((t: any) => t.goalId).filter(Boolean))];

        if (uniqueGoalIds.length > 0) {
          const goals = await Promise.all(
            uniqueGoalIds.map((id: string) => dataSources.goalsAPI.getGoal(user.userId, id))
          );
          goals.forEach((goal: any) => {
            if (goal) goalsMap.set(goal.id, goal);
          });
        }

        // Transform tasks into UpcomingTask format
        return tasks.map((task: any) => {
          const goal = goalsMap.get(task.goalId);
          return {
            id: task.id,
            title: task.title,
            dueDate: task.scheduledDate,
            priority: task.priority,
            goalId: task.goalId,
            goalTitle: goal?.title || null,
            goalEmoji: goal?.emoji || null,
            estimatedDuration: task.durationMinutes,
            isCompleted: task.isCompleted,
          };
        });
      } catch (error) {
        console.error('Upcoming tasks error:', error);
        return [];
      }
    },

    // Get recent activity
    recentActivity: async (_: any, { limit = 10 }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      try {
        // Fetch recently completed tasks and goals
        const [completedTasks, goals] = await Promise.all([
          dataSources.tasksAPI.getTasks(user.userId, {
            isCompleted: true,
            orderBy: 'CREATED_DESC',
            take: limit,
          }),
          dataSources.goalsAPI.getGoals(user.userId, {}),
        ]);

        const activities: any[] = [];

        // Add task completions
        if (completedTasks && completedTasks.length > 0) {
          const goalsMap = new Map(goals?.map((g: any) => [g.id, g]) || []);

          completedTasks.forEach((task: any) => {
            if (task.completedAt) {
              const goal = goalsMap.get(task.goalId) as any;
              activities.push({
                id: `task-${task.id}`,
                type: 'TASK_COMPLETED',
                title: task.title,
                description: goal ? `Completed for goal: ${goal.title}` : 'Task completed',
                timestamp: task.completedAt,
                metadata: {
                  taskId: task.id,
                  taskTitle: task.title,
                  goalId: task.goalId,
                  goalTitle: goal?.title || null,
                  emoji: goal?.emoji || '✅',
                  color: goal?.color || null,
                },
              });
            }
          });
        }

        // Add goal creations (most recent goals)
        if (goals && Array.isArray(goals) && goals.length > 0) {
          const recentGoals = (goals as any[])
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);

          recentGoals.forEach((goal: any) => {
            activities.push({
              id: `goal-${goal.id}`,
              type: 'GOAL_CREATED',
              title: `${goal.emoji || '🎯'} ${goal.title || 'Untitled Goal'}`,
              description: 'New goal created',
              timestamp: goal.createdAt,
              metadata: {
                goalId: goal.id,
                goalTitle: goal.title,
                emoji: goal.emoji,
                color: goal.color,
              },
            });
          });
        }

        // Sort by timestamp and limit
        return activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      } catch (error) {
        console.error('Recent activity error:', error);
        return [];
      }
    },

    // Get week overview
    weekOverview: async (_: any, { startDate }: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      try {
        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0);

        // Get start of week (Monday)
        const dayOfWeek = start.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
        start.setDate(start.getDate() + diff);

        const weekOverview = [];

        // Generate data for 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);

          const dateStr = date.toISOString().split('T')[0];

          try {
            const tasks = await dataSources.tasksAPI.getTasks(user.userId, {
              scheduledDate: dateStr,
            });

            const completed = tasks?.filter((t: any) => t.isCompleted).length || 0;
            const total = tasks?.length || 0;
            const totalDuration = tasks?.reduce((sum: number, t: any) => sum + (t.durationMinutes || 0), 0) || 0;
            const productivity = total > 0 ? (completed / total) * 100 : 0;

            weekOverview.push({
              date: date.toISOString(),
              dayOfWeek: date.getDay(),
              tasksScheduled: total,
              tasksCompleted: completed,
              totalDuration,
              productivity: parseFloat(productivity.toFixed(1)),
            });
          } catch (error) {
            // If fetching fails for a day, add empty data
            weekOverview.push({
              date: date.toISOString(),
              dayOfWeek: date.getDay(),
              tasksScheduled: 0,
              tasksCompleted: 0,
              totalDuration: 0,
              productivity: 0,
            });
          }
        }

        return weekOverview;
      } catch (error) {
        console.error('Week overview error:', error);
        return [];
      }
    },

    // Get quick actions based on user state
    quickActions: async (_: any, __: any, { dataSources, user }: any) => {
      if (!user) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });

      try {
        // Fetch user's current state
        const [goals, todayTasks, weekPlans] = await Promise.all([
          dataSources.goalsAPI.getGoals(user.userId, { isActive: true }),
          dataSources.tasksAPI.getTasks(user.userId, {
            scheduledDate: new Date().toISOString().split('T')[0],
          }),
          dataSources.productivityAPI.getWeeklyPlans(user.userId, { active: true }),
        ]);

        const actions: any[] = [];

        // If no goals, suggest creating one
        if (!goals || goals.length === 0) {
          actions.push({
            id: 'create-goal',
            title: 'Create Your First Goal',
            description: 'Define what you want to achieve',
            icon: 'Target',
            action: '/goals',
            variant: 'PRIMARY',
          });
        }

        // If no tasks today, suggest creating one or generating a plan
        if (!todayTasks || todayTasks.length === 0) {
          if (goals && goals.length > 0) {
            actions.push({
              id: 'generate-plan',
              title: 'Generate Weekly Plan',
              description: 'Let AI schedule your goals',
              icon: 'Sparkles',
              action: '/plans',
              variant: 'PRIMARY',
            });
          } else {
            actions.push({
              id: 'add-task',
              title: 'Add a Task',
              description: 'Schedule something for today',
              icon: 'Plus',
              action: '/tasks',
              variant: 'SECONDARY',
            });
          }
        }

        // If no weekly plans, suggest generating one
        if ((!weekPlans || weekPlans.length === 0) && goals && goals.length > 0) {
          actions.push({
            id: 'weekly-plan',
            title: 'Plan Your Week',
            description: 'Generate an AI-powered weekly schedule',
            icon: 'Calendar',
            action: '/plans',
            variant: 'SUCCESS',
          });
        }

        // Always show analytics action
        actions.push({
          id: 'view-analytics',
          title: 'View Analytics',
          description: 'Track your productivity trends',
          icon: 'BarChart3',
          action: '/analytics',
          variant: 'SECONDARY',
        });

        return actions.slice(0, 4); // Return max 4 actions
      } catch (error) {
        console.error('Quick actions error:', error);
        // Default actions on error
        return [
          {
            id: 'create-goal',
            title: 'Create a Goal',
            description: 'Define what you want to achieve',
            icon: 'Target',
            action: '/goals',
            variant: 'PRIMARY',
          },
          {
            id: 'add-task',
            title: 'Add a Task',
            description: 'Schedule something for today',
            icon: 'Plus',
            action: '/tasks',
            variant: 'SECONDARY',
          },
        ];
      }
    },
  },

  Mutation: {
    // Dashboard mutations can be added here if needed in the future
  },
};
