'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Target,
  Calendar,
  Sparkles,
  Plus,
  CheckCircle2,
  BarChart3,
  Inbox,
} from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 p-4 rounded-full bg-muted">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={action.onClick}>
              <Plus className="mr-2 h-5 w-5" />
              {action.label}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}

export function NoTasksEmptyState({ onCreateTask }: { onCreateTask?: () => void }) {
  return (
    <EmptyState
      icon={<CheckCircle2 className="h-16 w-16 text-muted-foreground" />}
      title="No tasks yet"
      description="Create your first task to start building better habits and achieving your goals."
      action={{
        label: 'Create Your First Task',
        onClick: onCreateTask,
      }}
    />
  );
}

export function NoGoalsEmptyState() {
  return (
    <EmptyState
      icon={<Target className="h-16 w-16 text-muted-foreground" />}
      title="No goals yet"
      description="Create your first goal to start tracking your progress and building better habits."
      action={{
        label: 'Create Your First Goal',
        href: '/app/goals/new',
      }}
    />
  );
}

export function NoPlansEmptyState() {
  return (
    <EmptyState
      icon={<Sparkles className="h-16 w-16 text-muted-foreground" />}
      title="No plans yet"
      description="Generate your first AI-powered weekly plan to optimize your schedule and achieve your goals faster."
      action={{
        label: 'Generate Your First Plan',
        href: '/app/plans/generate',
      }}
    />
  );
}

export function NoAnalyticsEmptyState() {
  return (
    <EmptyState
      icon={<BarChart3 className="h-16 w-16 text-muted-foreground" />}
      title="Not enough data yet"
      description="Complete some tasks and track your progress for a few days to see your analytics and insights."
    />
  );
}

export function NoSearchResultsEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 p-4 rounded-full bg-muted">
        <Inbox className="h-16 w-16 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No results found</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn't find any results for "{query}". Try adjusting your search terms.
      </p>
    </div>
  );
}

export function NoCalendarEventsEmptyState({ date }: { date?: Date }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 p-4 rounded-full bg-muted">
        <Calendar className="h-16 w-16 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No events scheduled</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {date
          ? `You don't have any tasks scheduled for ${format(date, 'MMMM d, yyyy')}.`
          : "You don't have any tasks scheduled."}
      </p>
      <p className="text-sm text-muted-foreground">
        Click on a time slot to create a new task
      </p>
    </div>
  );
}

export function UpgradeToPro({ feature }: { feature: string }) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 p-4 rounded-full bg-primary/10">
          <Sparkles className="h-16 w-16 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Upgrade to PRO</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {feature} is a PRO feature. Upgrade your plan to unlock unlimited goals, calendar sync, advanced AI models, and more!
        </p>
        <Link href="/app/settings?tab=billing">
          <Button size="lg">
            View Plans
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
