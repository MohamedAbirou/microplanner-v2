'use client';

/**
 * Goals Page Client Component
 * Manages client-side state and interactions for goals
 */

import { useState } from 'react';
import { useSubscription, useMutation } from '@apollo/client';
import { Button } from '@microplanner/ui';
import { Plus, Filter } from 'lucide-react';
import { GoalsGrid } from '@/components/goals/goals-grid';
import { CreateGoalDialog } from '@/components/goals/create-goal-dialog';
import { EditGoalDialog } from '@/components/goals/edit-goal-dialog';
import { useToast } from '@/lib/hooks/use-toast';
import { useAuth } from '@clerk/nextjs';
import { GOAL_CREATED, GOAL_UPDATED, GOAL_DELETED } from '@/lib/graphql/subscriptions';
import { DELETE_GOAL, PAUSE_GOAL, RESUME_GOAL } from '@/lib/graphql/mutations';
import { GET_GOALS, GET_DASHBOARD_STATS } from '@/lib/graphql/queries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@microplanner/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@microplanner/ui';

interface Goal {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  color?: string;
  frequencyPerWeek: number;
  durationMinutes: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  isPaused: boolean;
  totalCompletions: number;
  totalScheduled: number;
}

interface GoalsPageClientProps {
  initialGoals: Goal[];
}

export function GoalsPageClient({ initialGoals }: GoalsPageClientProps) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');

  // Real-time subscriptions
  useSubscription(GOAL_CREATED, {
    variables: { userId },
    onData: ({ data }) => {
      if (data.data?.goalCreated) {
        setGoals((prev) => [...prev, data.data.goalCreated]);
      }
    },
  });

  useSubscription(GOAL_UPDATED, {
    variables: { userId },
    onData: ({ data }) => {
      if (data.data?.goalUpdated) {
        setGoals((prev) =>
          prev.map((g) => (g.id === data.data.goalUpdated.id ? { ...g, ...data.data.goalUpdated } : g))
        );
      }
    },
  });

  useSubscription(GOAL_DELETED, {
    variables: { userId },
    onData: ({ data }) => {
      if (data.data?.goalDeleted) {
        setGoals((prev) => prev.filter((g) => g.id !== data.data.goalDeleted));
      }
    },
  });

  // Mutations
  const [deleteGoal, { loading: deleting }] = useMutation(DELETE_GOAL, {
    refetchQueries: [{ query: GET_GOALS }, { query: GET_DASHBOARD_STATS }],
    onCompleted: () => {
      toast({
        title: 'Goal Deleted',
        description: 'Your goal has been deleted successfully.',
        variant: 'success',
      });
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const [pauseGoal] = useMutation(PAUSE_GOAL, {
    refetchQueries: [{ query: GET_GOALS }],
    onCompleted: () => {
      toast({
        title: 'Goal Paused',
        description: 'Your goal has been paused.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    },
  });

  const [resumeGoal] = useMutation(RESUME_GOAL, {
    refetchQueries: [{ query: GET_GOALS }],
    onCompleted: () => {
      toast({
        title: 'Goal Resumed',
        description: 'Your goal has been resumed.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    },
  });

  // Handlers
  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setGoalToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (goalToDelete) {
      deleteGoal({ variables: { id: goalToDelete } });
    }
  };

  const handlePause = (id: string) => {
    pauseGoal({ variables: { id } });
  };

  const handleResume = (id: string) => {
    resumeGoal({ variables: { id } });
  };

  const handleViewAnalytics = (id: string) => {
    // Navigate to analytics view (to be implemented)
    toast({
      title: 'Coming Soon',
      description: 'Goal analytics view is coming soon!',
      variant: 'default',
    });
  };

  // Filter goals
  const filteredGoals = goals.filter((goal) => {
    if (filter === 'active') return !goal.isPaused;
    if (filter === 'paused') return goal.isPaused;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-text-primary">Goals</h1>
          <p className="text-sm text-dark-text-secondary mt-0.5">
            Track your progress and build consistent habits
          </p>
        </div>
        <Button size="default" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-dark-text-secondary" />
          <span className="text-sm text-dark-text-secondary">Filter:</span>
        </div>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Goals</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="paused">Paused Only</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-dark-text-tertiary">
          {filteredGoals.length} {filteredGoals.length === 1 ? 'goal' : 'goals'}
        </span>
      </div>

      {/* Goals Grid */}
      <GoalsGrid
        goals={filteredGoals}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPause={handlePause}
        onResume={handleResume}
        onViewAnalytics={handleViewAnalytics}
      />

      {/* Create Goal Dialog */}
      <CreateGoalDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* Edit Goal Dialog */}
      <EditGoalDialog
        goal={selectedGoal}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Delete Goal</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete this goal? This action cannot be undone and all
              associated tasks will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="h-9 bg-error hover:bg-error/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
