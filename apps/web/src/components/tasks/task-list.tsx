'use client';

import { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { TaskItem } from './task-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, List, LayoutGrid, Calendar } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  notes?: string;
  startTime: string;
  endTime: string;
  scheduledDate: string;
  durationMinutes: number;
  isCompleted: boolean;
  priority: number;
  goal?: {
    id: string;
    emoji: string;
    title: string;
    color: string;
  };
}

interface TaskListProps {
  tasks: Task[];
  groupBy?: 'date' | 'goal' | 'priority';
  showFilters?: boolean;
  onComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskList({
  tasks,
  groupBy = 'date',
  showFilters = false,
  onComplete,
  onEdit,
  onDelete,
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | '1' | '2' | '3'>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus === 'todo' && task.isCompleted) return false;
    if (filterStatus === 'completed' && !task.isCompleted) return false;
    if (filterPriority !== 'all' && task.priority.toString() !== filterPriority) return false;
    return true;
  });

  // Group tasks
  const groupedTasks = groupTasksBy(filteredTasks, groupBy);

  return (
    <div className="space-y-4">
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={filterPriority} onValueChange={(v: any) => setFilterPriority(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grouped Task Lists */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([group, groupTasks]) => (
          <div key={group}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{group}</h3>
            <div className="space-y-2">
              {groupTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={onComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to group tasks
function groupTasksBy(tasks: Task[], groupBy: 'date' | 'goal' | 'priority') {
  const grouped: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    let key: string;

    switch (groupBy) {
      case 'date':
        key = format(parseISO(task.scheduledDate), 'EEEE, MMM d');
        break;
      case 'goal':
        key = task.goal?.title || 'No Goal';
        break;
      case 'priority':
        key = task.priority === 1 ? 'High Priority' : task.priority === 2 ? 'Medium Priority' : 'Low Priority';
        break;
      default:
        key = 'All Tasks';
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(task);
  });

  return grouped;
}
