'use client';

import * as React from 'react';
import { Search, Calendar, Target, Sparkles, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { NoSearchResultsEmptyState } from '@/components/empty-states';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with GraphQL queries
const mockSearchResults = {
  tasks: [
    {
      id: '1',
      title: 'Morning workout',
      notes: 'Cardio + strength training',
      scheduledDate: new Date().toISOString(),
      startTime: '07:00',
      goal: { emoji: '💪', title: 'Fitness', color: '#10B981' },
      isCompleted: false,
    },
    {
      id: '2',
      title: 'Review project proposal',
      notes: 'Review the Q4 proposal and provide feedback',
      scheduledDate: new Date().toISOString(),
      startTime: '09:00',
      goal: { emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
      isCompleted: true,
    },
  ],
  goals: [
    {
      id: '1',
      emoji: '💪',
      title: 'Fitness Goals',
      description: 'Maintain a consistent workout routine',
      color: '#10B981',
      frequency: 5,
      isActive: true,
    },
    {
      id: '2',
      emoji: '💼',
      title: 'Career Growth',
      description: 'Advance my career and skills',
      color: '#3B82F6',
      frequency: 3,
      isActive: true,
    },
  ],
  plans: [
    {
      id: '1',
      weekStart: new Date(),
      qualityScore: 92,
      totalTasks: 28,
      completedTasks: 18,
    },
  ],
};

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus search input on mount
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter results based on search query
  const filteredResults = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        tasks: [],
        goals: [],
        plans: [],
      };
    }

    const query = searchQuery.toLowerCase();

    return {
      tasks: mockSearchResults.tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.notes?.toLowerCase().includes(query) ||
          task.goal.title.toLowerCase().includes(query)
      ),
      goals: mockSearchResults.goals.filter(
        (goal) =>
          goal.title.toLowerCase().includes(query) ||
          goal.description.toLowerCase().includes(query)
      ),
      plans: mockSearchResults.plans.filter((plan) => {
        // Search by date, score, etc.
        const dateStr = format(plan.weekStart, 'MMM d, yyyy').toLowerCase();
        return dateStr.includes(query) || query.includes('plan');
      }),
    };
  }, [searchQuery]);

  const totalResults =
    filteredResults.tasks.length +
    filteredResults.goals.length +
    filteredResults.plans.length;

  const handleClearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Search</h1>
        <p className="text-muted-foreground">
          Search across your tasks, goals, and plans
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {totalResults > 0 ? (
            <>
              <span className="font-medium text-foreground">{totalResults}</span>
              <span>result{totalResults !== 1 ? 's' : ''} found</span>
            </>
          ) : (
            <span>No results found</span>
          )}
        </div>
      )}

      {/* Search Results */}
      {searchQuery ? (
        totalResults > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All ({totalResults})
              </TabsTrigger>
              <TabsTrigger value="tasks">
                Tasks ({filteredResults.tasks.length})
              </TabsTrigger>
              <TabsTrigger value="goals">
                Goals ({filteredResults.goals.length})
              </TabsTrigger>
              <TabsTrigger value="plans">
                Plans ({filteredResults.plans.length})
              </TabsTrigger>
            </TabsList>

            {/* All Results */}
            <TabsContent value="all" className="mt-6 space-y-6">
              {filteredResults.tasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Tasks</h3>
                  <div className="space-y-2">
                    {filteredResults.tasks.map((task) => (
                      <Card
                        key={task.id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => console.log('Open task:', task.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-1 h-12 rounded-full flex-shrink-0 mt-1"
                              style={{ backgroundColor: task.goal.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className={cn(
                                    "font-medium mb-1",
                                    task.isCompleted && "line-through text-muted-foreground"
                                  )}>
                                    {task.title}
                                  </div>
                                  {task.notes && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                      {task.notes}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(task.scheduledDate), 'MMM d, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {task.startTime}
                                    </div>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  style={{ borderColor: task.goal.color, color: task.goal.color }}
                                >
                                  <span className="mr-1">{task.goal.emoji}</span>
                                  {task.goal.title}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {filteredResults.goals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Goals</h3>
                  <div className="space-y-2">
                    {filteredResults.goals.map((goal) => (
                      <Card
                        key={goal.id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => router.push(`/app/goals/${goal.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                              style={{ backgroundColor: `${goal.color}20` }}
                            >
                              {goal.emoji}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium mb-1">{goal.title}</div>
                              <p className="text-sm text-muted-foreground">
                                {goal.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={goal.isActive ? 'default' : 'secondary'}>
                                  {goal.isActive ? 'Active' : 'Paused'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {goal.frequency}x per week
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {filteredResults.plans.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Plans</h3>
                  <div className="space-y-2">
                    {filteredResults.plans.map((plan) => (
                      <Card
                        key={plan.id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => router.push(`/app/plans/${plan.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium mb-1">
                                Week of {format(plan.weekStart, 'MMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Quality: {plan.qualityScore}/100</span>
                                <span>
                                  {plan.completedTasks}/{plan.totalTasks} tasks
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tasks Only */}
            <TabsContent value="tasks" className="mt-6">
              {filteredResults.tasks.length > 0 ? (
                <div className="space-y-2">
                  {filteredResults.tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => console.log('Open task:', task.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-1 h-12 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: task.goal.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className={cn(
                                  "font-medium mb-1",
                                  task.isCompleted && "line-through text-muted-foreground"
                                )}>
                                  {task.title}
                                </div>
                                {task.notes && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {task.notes}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(task.scheduledDate), 'MMM d, yyyy')}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {task.startTime}
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                style={{ borderColor: task.goal.color, color: task.goal.color }}
                              >
                                <span className="mr-1">{task.goal.emoji}</span>
                                {task.goal.title}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <NoSearchResultsEmptyState query={searchQuery} />
              )}
            </TabsContent>

            {/* Goals Only */}
            <TabsContent value="goals" className="mt-6">
              {filteredResults.goals.length > 0 ? (
                <div className="space-y-2">
                  {filteredResults.goals.map((goal) => (
                    <Card
                      key={goal.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => router.push(`/app/goals/${goal.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ backgroundColor: `${goal.color}20` }}
                          >
                            {goal.emoji}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium mb-1">{goal.title}</div>
                            <p className="text-sm text-muted-foreground">
                              {goal.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={goal.isActive ? 'default' : 'secondary'}>
                                {goal.isActive ? 'Active' : 'Paused'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {goal.frequency}x per week
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <NoSearchResultsEmptyState query={searchQuery} />
              )}
            </TabsContent>

            {/* Plans Only */}
            <TabsContent value="plans" className="mt-6">
              {filteredResults.plans.length > 0 ? (
                <div className="space-y-2">
                  {filteredResults.plans.map((plan) => (
                    <Card
                      key={plan.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => router.push(`/app/plans/${plan.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium mb-1">
                              Week of {format(plan.weekStart, 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Quality: {plan.qualityScore}/100</span>
                              <span>
                                {plan.completedTasks}/{plan.totalTasks} tasks
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <NoSearchResultsEmptyState query={searchQuery} />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <NoSearchResultsEmptyState query={searchQuery} />
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 p-4 rounded-full bg-muted">
            <Search className="h-16 w-16 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Start searching</h3>
          <p className="text-muted-foreground max-w-md">
            Type in the search box above to find tasks, goals, and plans. Try searching for
            keywords, dates, or goal names.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('workout')}>
              workout
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('career')}>
              career
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('plan')}>
              plan
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
