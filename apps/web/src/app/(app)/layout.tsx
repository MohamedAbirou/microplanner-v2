'use client';

import { CommandPalette } from '@/components/command-palette';
import { ErrorBoundaryWrapper } from '@/components/error-boundary';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { QuickAddTaskModal, type TaskFormData } from '@/components/tasks/quick-add-task-modal';
import { TierProvider } from '@/contexts/tier-context';
import { ONBOARDING_STATUS } from '@/graphql/operations';
import { useCreateTask, useGoals } from '@/hooks/use-graphql';
import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Fetch goals from GraphQL
  const { goals } = useGoals();
  const { createTask } = useCreateTask();

  // Check onboarding status from database via GraphQL
  const { data: onboardingData, loading: onboardingLoading } = useQuery(ONBOARDING_STATUS, {
    skip: !isLoaded || !user,
  });

  // Listen for quick add task event from keyboard shortcuts
  useEffect(() => {
    const handleQuickAdd = () => setQuickAddOpen(true);
    window.addEventListener('open-quick-add-task', handleQuickAdd);
    return () => window.removeEventListener('open-quick-add-task', handleQuickAdd);
  }, []);

  // Redirect to onboarding if not completed (using database data, not Clerk metadata)
  useEffect(() => {
    if (isLoaded && user && !onboardingLoading) {
      const isOnboardingComplete = onboardingData?.onboardingStatus?.completed;
      const isOnboardingPage = pathname?.startsWith('/onboarding');

      if (!isOnboardingComplete && !isOnboardingPage) {
        router.push('/onboarding');
      }
    }
  }, [isLoaded, user, onboardingLoading, onboardingData, pathname, router]);

  const userTier = (user?.publicMetadata?.tier as 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM') || 'FREE';

  const handleQuickAddSubmit = async (data: TaskFormData) => {
    try {
      // Remove isRecurring field - it's not in GraphQL schema
      // recurrenceRule presence indicates if task is recurring
      const { isRecurring, ...taskInput } = data;

      await createTask({ variables: { input: taskInput } });
      setQuickAddOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  console.log("Collapsed: ", sidebarCollapsed);

  return (
    <TierProvider>
      <ErrorBoundaryWrapper>
        <div className="min-h-screen bg-background">
          {/* Command Palette */}
          <CommandPalette
            open={commandPaletteOpen}
            onOpenChange={setCommandPaletteOpen}
            onQuickAddClick={() => setQuickAddOpen(true)}
          />

          {/* Quick Add Task Modal */}
          <QuickAddTaskModal
            open={quickAddOpen}
            onOpenChange={setQuickAddOpen}
            goals={goals}
            onSubmit={handleQuickAddSubmit}
          />

          {/* Keyboard Shortcuts Dialog */}
          <KeyboardShortcutsDialog />

          {/* Sidebar */}
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            userTier={userTier}
          />

          {/* Header */}
          <AppHeader
            onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            onCommandClick={() => setCommandPaletteOpen(true)}
            onQuickAddClick={() => setQuickAddOpen(true)}
          />

          {/* Main Content */}
          <main
            className="pt-16 transition-all duration-300"
            style={{
              marginLeft: sidebarCollapsed ? '70px' : '260px',
            }}
          >
            {children}
          </main>
        </div>
      </ErrorBoundaryWrapper>
    </TierProvider>
  );
}
