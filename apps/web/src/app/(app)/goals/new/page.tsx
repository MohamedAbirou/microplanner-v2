'use client';

import { GoalForm } from '@/components/goals/goal-form';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/upgrade-modal';
import { useCreateGoal } from '@/hooks/use-graphql';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewGoalPage() {
  const router = useRouter();
  const { createGoal, loading } = useCreateGoal();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      await createGoal({ variables: { input: data } });
      toast({
        title: 'Success',
        description: 'Goal created successfully',
      });
      router.push('/goals');
    } catch (error: any) {
      console.error('Failed to create goal:', error);

      // Check if it's a 403/usage limit error
      const isLimitError =
        error?.graphQLErrors?.some(
          (e: any) =>
            e?.extensions?.code === 'FORBIDDEN' ||
            e?.message?.includes('limit') ||
            e?.message?.includes('Upgrade')
        ) || error?.networkError?.statusCode === 403;

      if (isLimitError) {
        setShowUpgradeModal(true);
      } else {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to create goal',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/goals">
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

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        description="You've reached the goal limit (3 goals) for the FREE tier. Upgrade to create unlimited goals."
        feature="goals"
      />
    </>
  );
}
