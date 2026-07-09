'use client';

import * as React from 'react';
import Link from 'next/link';
import { FolderKanban, Plus, Loader2, Trash2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeleteConfirmationDialog } from '@/components/confirmation-dialog';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/use-graphql-extended';

const COLORS = ['#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4', '#EF4444', '#84CC16'];
const ICONS = ['📁', '🚀', '🎯', '💡', '🛠️', '📊', '🎨', '📝'];

export default function ProjectsPage() {
  const { projects, loading } = useProjects();
  const { createProject, loading: creating } = useCreateProject();
  const { deleteProject } = useDeleteProject();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState(COLORS[0]);
  const [icon, setIcon] = React.useState(ICONS[0]);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createProject({
        variables: { input: { name: name.trim(), description: description.trim() || null, color, icon } },
      });
      setName('');
      setDescription('');
      setColor(COLORS[0]);
      setIcon(ICONS[0]);
      setOpen(false);
    } catch {
      /* toast in hook */
    }
  };

  const projectToDelete = projects.find((p: any) => p.id === deleteId);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto mp-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6" /> Projects
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Group related tasks and track them on a kanban board.
          </p>
        </div>
        <Button className="h-9" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[14px]" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardContent className="py-12 text-center">
            <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No projects yet</p>
            <p className="text-[13px] text-muted-foreground mt-1 mb-4">
              Create a project to organize tasks into a board.
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create a project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p: any) => (
            <Card key={p.id} className="rounded-[14px] shadow-[var(--sh-sm)] group min-w-0">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-9 w-9 rounded-[10px] flex items-center justify-center text-lg flex-none"
                      style={{ backgroundColor: `${p.color}20` }}
                    >
                      {p.icon || '📁'}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-[15px] truncate">{p.name}</CardTitle>
                      <CardDescription className="text-[13px] truncate">
                        {p.description || `${p.taskCount} tasks`}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => setDeleteId(p.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>
                      {p.completedTaskCount}/{p.taskCount} done
                    </span>
                    <span>{Math.round(p.progressPercentage || 0)}%</span>
                  </div>
                  <Progress value={p.progressPercentage || 0} className="h-2" />
                </div>
                <Link href={`/projects/${p.id}`}>
                  <Button variant="outline" size="sm" className="h-8 w-full">
                    Open board <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[14px]">
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>Projects group tasks into a kanban board.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="proj-name">Name</Label>
              <Input
                id="proj-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Website redesign"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proj-desc">Description (optional)</Label>
              <Textarea
                id="proj-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex gap-1.5 flex-wrap">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`h-9 w-9 rounded-[10px] text-lg flex items-center justify-center border ${
                      icon === ic ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-1.5 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        itemName={projectToDelete?.name || 'this project'}
        itemType="project"
        onConfirm={async () => {
          if (deleteId) await deleteProject({ variables: { id: deleteId } });
          setDeleteId(null);
        }}
      />
    </div>
  );
}
