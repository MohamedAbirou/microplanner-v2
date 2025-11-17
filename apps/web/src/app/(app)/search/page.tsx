'use client';

import { NoSearchResultsEmptyState } from '@/components/empty-states';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGoals, usePlans, useTasks } from '@/hooks/use-graphql';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar, Clock, Search, Sparkles, Target, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Fetch data from GraphQL
  const { tasks, loading: tasksLoading } = useTasks();
  const { goals, loading: goalsLoading } = useGoals();
  const { plans, loading: plansLoading } = usePlans();

  const loading = tasksLoading || goalsLoading || plansLoading;

  // Auto-focus search input on mount
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter results based on search query
  const filteredResults = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return { tasks: [], goals: [], plans: [] };
    }

    const query = searchQuery.toLowerCase();

    const filteredTasks = tasks.filter(
      (task: any) =>
        task.title?.toLowerCase().includes(query) ||
        task.notes?.toLowerCase().includes(query) ||
        task.goal?.title?.toLowerCase().includes(query)
    );

    const filteredGoals = goals.filter(
      (goal: any) =>
        goal.title?.toLowerCase().includes(query) ||
        goal.description?.toLowerCase().includes(query)
    );

    const filteredPlans = plans.filter(
      (plan: any) =>
        plan.title?.toLowerCase().includes(query) ||
        plan.description?.toLowerCase().includes(query)
    );

    return {
      tasks: filteredTasks,
      goals: filteredGoals,
      plans: filteredPlans,
    };
  }, [searchQuery, tasks, goals, plans]);

  const totalResults =
    filteredResults.tasks.length +
    filteredResults.goals.length +
    filteredResults.plans.length;

  const handleTaskClick = (taskId: string) => {
    router.push(`/today`); // Navigate to today view (task will be there)
  };

  const handleGoalClick = (goalId: string) => {
    router.push(`/goals`);
  };

  const handlePlanClick = (planId: string) => {
    router.push(`/plans`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">Search across all your tasks, goals, and plans</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for tasks, goals, plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-12 text-base"
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {loading && searchQuery && (
        <div className="text-center py-12 text-muted-foreground">
          Searching...
        </div>
      )}

      {!loading && searchQuery && (
        <>
          {/* Results Count */}
          {totalResults > 0 && (
            <div className="text-sm text-muted-foreground">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
            </div>
          )}

          {/* Search Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                All ({totalResults})
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <Clock className="mr-2 h-4 w-4" />
                Tasks ({filteredResults.tasks.length})
              </TabsTrigger>
              <TabsTrigger value="goals">
                <Target className="mr-2 h-4 w-4" />
                Goals ({filteredResults.goals.length})
              </TabsTrigger>
              <TabsTrigger value="plans">
                <Sparkles className="mr-2 h-4 w-4" />
                Plans ({filteredResults.plans.length})
              </TabsTrigger>
            </TabsList>

            {/* All Results Tab */}
            <TabsContent value="all" className="space-y-4 mt-6">
              {totalResults === 0 ? (
                <NoSearchResultsEmptyState searchQuery={searchQuery} />
              ) : (
                <>
                  {filteredResults.tasks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Tasks
                      </h3>
                      {filteredResults.tasks.map((task: any) => (
                        <Card
                          key={task.id}
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleTaskClick(task.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className={cn(
                                  "font-medium",
                                  task.isCompleted && "line-through text-muted-foreground"
                                )}>
                                  {task.title}
                                </div>
                                {task.notes && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {task.notes}
                                  </p>
                                )}
                                {task.scheduledDate && (
                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(task.scheduledDate), 'MMM d, yyyy')}
                                    {task.startTime && ` at ${task.startTime}`}
                                  </div>
                                )}
                              </div>
                              {task.goal && (
                                <Badge variant="outline" style={{ borderColor: task.goal.color }}>
                                  <span className="mr-1">{task.goal.emoji}</span>
                                  {task.goal.title}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {filteredResults.goals.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Goals
                      </h3>
                      {filteredResults.goals.map((goal: any) => (
                        <Card
                          key={goal.id}
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleGoalClick(goal.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{goal.emoji}</span>
                              <div className="flex-1">
                                <div className="font-medium">{goal.title}</div>
                                {goal.description && (
                                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                                )}
                              </div>
                              {goal.isActive && (
                                <Badge>Active</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {filteredResults.plans.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Plans
                      </h3>
                      {filteredResults.plans.map((plan: any) => (
                        <Card
                          key={plan.id}
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handlePlanClick(plan.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="font-medium">{plan.title || 'Weekly Plan'}</div>
                                {plan.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {plan.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  {plan.weekStart && (
                                    <span>
                                      Week of {format(new Date(plan.weekStart), 'MMM d')}
                                    </span>
                                  )}
                                  {plan.qualityScore && (
                                    <span>Quality: {plan.qualityScore}/100</span>
                                  )}
                                </div>
                              </div>
                              {plan.status && (
                                <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                                  {plan.status}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Tasks Only Tab */}
            <TabsContent value="tasks" className="space-y-2 mt-6">
              {filteredResults.tasks.length === 0 ? (
                <NoSearchResultsEmptyState searchQuery={searchQuery} />
              ) : (
                filteredResults.tasks.map((task: any) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className={cn(
                            "font-medium",
                            task.isCompleted && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </div>
                          {task.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.notes}
                            </p>
                          )}
                          {task.scheduledDate && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.scheduledDate), 'MMM d, yyyy')}
                              {task.startTime && ` at ${task.startTime}`}
                            </div>
                          )}
                        </div>
                        {task.goal && (
                          <Badge variant="outline" style={{ borderColor: task.goal.color }}>
                            <span className="mr-1">{task.goal.emoji}</span>
                            {task.goal.title}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Goals Only Tab */}
            <TabsContent value="goals" className="space-y-2 mt-6">
              {filteredResults.goals.length === 0 ? (
                <NoSearchResultsEmptyState searchQuery={searchQuery} />
              ) : (
                filteredResults.goals.map((goal: any) => (
                  <Card
                    key={goal.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleGoalClick(goal.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{goal.emoji}</span>
                        <div className="flex-1">
                          <div className="font-medium">{goal.title}</div>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          )}
                        </div>
                        {goal.isActive && (
                          <Badge>Active</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Plans Only Tab */}
            <TabsContent value="plans" className="space-y-2 mt-6">
              {filteredResults.plans.length === 0 ? (
                <NoSearchResultsEmptyState searchQuery={searchQuery} />
              ) : (
                filteredResults.plans.map((plan: any) => (
                  <Card
                    key={plan.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handlePlanClick(plan.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-medium">{plan.title || 'Weekly Plan'}</div>
                          {plan.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {plan.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {plan.weekStart && (
                              <span>
                                Week of {format(new Date(plan.weekStart), 'MMM d')}
                              </span>
                            )}
                            {plan.qualityScore && (
                              <span>Quality: {plan.qualityScore}/100</span>
                            )}
                          </div>
                        </div>
                        {plan.status && (
                          <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                            {plan.status}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Empty State - No Search Query */}
      {!searchQuery && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Start typing to search across your tasks, goals, and plans</p>
        </div>
      )}
    </div>
  );
}
