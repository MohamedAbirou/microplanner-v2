'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, startOfWeek } from 'date-fns';
import { Sparkles, Plus, Star, Trash2, Loader2, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TierGate } from '@/components/tier-gate';
import { usePlansSummary } from '@/hooks/use-graphql';
import {
  usePlanTemplates,
  useSaveAsPlanTemplate,
  useGeneratePlanFromTemplate,
  useSetDefaultPlanTemplate,
  useDeletePlanTemplate,
} from '@/hooks/use-graphql-extended';

function nextWeekStart(): string {
  return format(startOfWeek(addDays(new Date(), 7), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

function SaveCurrentPlanDialog() {
  const { plans } = usePlansSummary();
  const { saveAsTemplate, loading } = useSaveAsPlanTemplate();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const currentPlan = plans?.[0];

  const handleSave = async () => {
    if (!currentPlan) return;
    await saveAsTemplate({
      variables: { planId: currentPlan.id, name: name.trim(), description: description.trim() || undefined },
    });
    setOpen(false);
    setName('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!currentPlan}>
          <Plus className="mr-1.5 h-4 w-4" />
          Save current plan
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[14px]">
        <DialogHeader>
          <DialogTitle>Save plan as template</DialogTitle>
          <DialogDescription>
            {currentPlan
              ? 'Reuse your most recent plan’s structure to generate future weeks.'
              : 'Generate a plan first to save it as a template.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">Template name</Label>
            <Input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My ideal week" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-desc">Description</Label>
            <Textarea
              id="tpl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this template is good for…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !name.trim() || !currentPlan}>
            {loading ? 'Saving…' : 'Save template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({ template }: { template: any }) {
  const router = useRouter();
  const { generateFromTemplate, loading: generating } = useGeneratePlanFromTemplate();
  const { setDefaultTemplate } = useSetDefaultPlanTemplate();
  const { deleteTemplate } = useDeletePlanTemplate();

  const handleUse = async () => {
    const { data } = await generateFromTemplate({
      variables: { input: { templateId: template.id, weekStartDate: nextWeekStart() } },
    });
    const planId = data?.generatePlanFromTemplate?.id;
    if (planId) {
      router.push(`/plans/review?id=${planId}`);
    }
  };

  return (
    <Card className="flex flex-col rounded-[14px] shadow-[var(--sh-sm)]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-[15px]">
            <span className="text-xl">{template.emoji || '🗓️'}</span>
            {template.name}
          </CardTitle>
          <div className="flex items-center gap-1">
            {template.isFeatured && <Badge variant="secondary">Featured</Badge>}
            {template.category && <Badge variant="outline">{template.category}</Badge>}
          </div>
        </div>
        <CardDescription className="text-[13px] line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-3">
        {template.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {template.tags.slice(0, 4).map((tag: string) => (
              <span key={tag} className="rounded-[6px] bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="text-[12px] text-muted-foreground">Used {template.usageCount ?? 0} times</div>
        <div className="flex items-center gap-2">
          <Button className="flex-1" size="sm" onClick={handleUse} disabled={generating}>
            {generating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
            Use template
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            title="Set as default"
            onClick={() => setDefaultTemplate({ variables: { id: template.id } })}
          >
            <Star className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" title="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[14px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete template?</AlertDialogTitle>
                <AlertDialogDescription>
                  “{template.name}” will be permanently removed. This can’t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteTemplate({ variables: { id: template.id } })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplatesContent() {
  const { templates, loading } = usePlanTemplates();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plan templates</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Reusable weekly structures — apply one to generate a new plan in seconds.
          </p>
        </div>
        <SaveCurrentPlanDialog />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-[14px]" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="rounded-[14px] shadow-[var(--sh-sm)]">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">
              No templates yet. Save a plan as a template to reuse its structure.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template: any) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlanTemplatesPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto mp-fade-in">
      <TierGate requiredTier="STARTER" feature="Plan templates">
        <TemplatesContent />
      </TierGate>
    </div>
  );
}
