'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@apollo/client';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { CommandPalette } from '@/components/command-palette';
import { QuickAddTaskModal, type TaskFormData } from '@/components/tasks/quick-add-task-modal';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { ErrorBoundaryWrapper } from '@/components/error-boundary';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useGoals, useCreateTask } from '@/hooks/use-graphql';
import { TierProvider } from '@/contexts/tier-context';
import { useRouter, usePathname } from 'next/navigation';
import { ONBOARDING_STATUS } from '@/graphql/operations';

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
      await createTask({ variables: { input: data } });
      setQuickAddOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

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
