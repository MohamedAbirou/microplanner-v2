'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DeleteConfirmationDialog } from '@/components/confirmation-dialog';
import { useGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/use-graphql';
import { format } from 'date-fns';
import { ArrowLeft, BarChart3, CheckCircle2, Circle, Clock, Flame, Pause, Play, Target, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { goal, loading, refetch } = useGoal(id);
  const { updateGoal } = useUpdateGoal();
  const { deleteGoal } = useDeleteGoal();
  const [showDelete, setShowDelete] = React.useState(false);

  const handlePauseToggle = async () => {
    try {
      await updateGoal({ variables: { id, input: { isPaused: !goal.isPaused } } });
      refetch();
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoal({ variables: { id } });
      router.push('/goals');
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">Loading goal...</div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Target className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Goal not found</h3>
        <p className="text-muted-foreground mb-6">
          This goal may have been deleted or you don&apos;t have access to it.
        </p>
        <Link href="/goals">
          <Button>Back to Goals</Button>
        </Link>
      </div>
    );
  }

  const tasks = goal.tasks || [];

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/goals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Goals
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            {goal.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{goal.title}</h1>
              {goal.isPaused && <Badge variant="secondary">Paused</Badge>}
            </div>
            {goal.description && (
              <p className="text-muted-foreground mt-1">{goal.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePauseToggle}>
            {goal.isPaused ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            )}
          </Button>
          <Button variant="outline" className="text-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold">{goal.completionRate}%</div>
          <div className="text-xs text-muted-foreground mt-1">Completion Rate</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold flex items-center justify-center gap-1">
            <Flame className="h-5 w-5 text-orange-500" />
            {goal.currentStreak}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Current Streak</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold">{goal.frequencyPerWeek}x</div>
          <div className="text-xs text-muted-foreground mt-1">Per Week</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <div className="text-2xl font-bold flex items-center justify-center gap-1">
            <Clock className="h-5 w-5" />
            {goal.durationMinutes}m
          </div>
          <div className="text-xs text-muted-foreground mt-1">Duration</div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall completion</span>
            <span className="font-medium">{goal.completionRate}%</span>
          </div>
          <Progress value={goal.completionRate} className="h-2" />
          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <span className="text-muted-foreground">Total completions: </span>
              <span className="font-medium">{goal.totalCompletions}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total scheduled: </span>
              <span className="font-medium">{goal.totalScheduled}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Longest streak: </span>
              <span className="font-medium">{goal.longestStreak} days</span>
            </div>
            {goal.lastCompletedAt && (
              <div>
                <span className="text-muted-foreground">Last completed: </span>
                <span className="font-medium">
                  {format(new Date(goal.lastCompletedAt), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tasks ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No tasks scheduled for this goal yet. Generate a weekly plan to create some.
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={task.isCompleted ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </div>
                    {task.scheduledDate && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(task.scheduledDate), 'MMM d')}
                        {task.startTime && ` at ${task.startTime}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        itemName={goal.title}
        itemType="goal"
        onConfirm={handleDelete}
      />
    </div>
  );
}
