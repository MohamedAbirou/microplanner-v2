'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PlansPage() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Plans</h1>
          <p className="text-muted-foreground mt-1">AI-generated weekly schedules</p>
        </div>
        <Link href="/app/plans/generate">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Plan
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan History</CardTitle>
          <CardDescription>Coming soon: View and manage your weekly plans</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-md">
            The plans interface is being built. You'll be able to view your current plan,
            generate new plans, and browse your plan history.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
