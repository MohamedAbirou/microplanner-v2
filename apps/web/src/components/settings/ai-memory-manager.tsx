'use client';

import * as React from 'react';
import { Brain, Plus, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAiMemories,
  useCreateAiMemory,
  useDeleteAiMemory,
} from '@/hooks/use-graphql-extended';

const MEMORY_TYPES = [
  { value: 'TIME_PREFERENCE', label: 'Time preference' },
  { value: 'CONTEXT_PREFERENCE', label: 'Focus / context' },
  { value: 'AVOIDANCE_PATTERN', label: 'Avoid' },
  { value: 'ENERGY_INSIGHT', label: 'Energy insight' },
];

function describe(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (typeof content.text === 'string') return content.text;
  if (typeof content.note === 'string') return content.note;
  return JSON.stringify(content);
}

export function AiMemoryManager() {
  const { memories, loading } = useAiMemories();
  const { createAiMemory, loading: creating } = useCreateAiMemory();
  const { deleteAiMemory } = useDeleteAiMemory();

  const [memoryType, setMemoryType] = React.useState('TIME_PREFERENCE');
  const [text, setText] = React.useState('');

  const handleAdd = async () => {
    if (!text.trim()) return;
    try {
      await createAiMemory({
        variables: { input: { memoryType, content: { text: text.trim() } } },
      });
      setText('');
    } catch {
      /* toast in hook */
    }
  };

  return (
    <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <CardTitle className="text-[15px] flex items-center gap-2">
          <Brain className="h-4 w-4" /> AI Scheduling Memory
        </CardTitle>
        <CardDescription className="text-[13px]">
          Teach the planner your preferences. These overrides are fed into every plan you
          generate — e.g. &ldquo;Always schedule deep work before noon&rdquo;.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add form */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={memoryType} onValueChange={setMemoryType}>
            <SelectTrigger className="sm:w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEMORY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1 flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Never schedule meetings on Fridays"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
            />
            <Button onClick={handleAdd} disabled={!text.trim() || creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-[10px]" />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-accent py-8 text-center text-[13px] text-muted-foreground">
            No preferences yet. Add one above to steer how the AI schedules your week.
          </div>
        ) : (
          <div className="space-y-2">
            {memories.map((m: any) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-[10px] border border-border p-3"
              >
                <Badge variant="secondary" className="text-[10px] flex-none">
                  {(MEMORY_TYPES.find((t) => t.value === m.memoryType)?.label || m.memoryType)}
                </Badge>
                <span className="flex-1 min-w-0 text-sm truncate">{describe(m.content)}</span>
                {m.source === 'user-override' ? (
                  <Badge variant="outline" className="text-[10px] flex-none">
                    You
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] flex-none">
                    Learned {Math.round((m.confidence ?? 0) * 100)}%
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-none"
                  onClick={() => deleteAiMemory({ variables: { id: m.id } })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
