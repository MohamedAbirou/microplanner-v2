'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import Link from 'next/link';

export default function GoalsPage() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground mt-1">Manage and track your goals</p>
        </div>
        <Link href="/app/goals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>Coming soon: Goal management interface</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-md">
            The goals management interface is being built. You'll be able to create,
            track, and manage all your goals with detailed analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
