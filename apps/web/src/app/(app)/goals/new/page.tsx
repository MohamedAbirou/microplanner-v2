'use client';

import { useRouter } from 'next/navigation';
import { GoalForm } from '@/components/goals/goal-form';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewGoalPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    console.log('Creating goal:', data);
    // TODO: GraphQL mutation to create goal
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push('/app/goals');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/app/goals">
        <Button variant="ghost" size="sm">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Goals
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create New Goal</h1>
        <p className="text-muted-foreground mt-1">
          Define what you want to achieve and how often you want to work on it
        </p>
      </div>

      {/* Form */}
      <GoalForm onSubmit={handleSubmit} submitLabel="Create Goal" />
    </div>
  );
}
