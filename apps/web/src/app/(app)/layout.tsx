'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { CommandPalette } from '@/components/command-palette';
import { QuickAddTaskModal, type TaskFormData } from '@/components/tasks/quick-add-task-modal';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { ErrorBoundaryWrapper } from '@/components/error-boundary';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useGoals, useCreateTask } from '@/hooks/use-graphql';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Fetch goals from GraphQL
  const { goals } = useGoals();
  const { createTask } = useCreateTask();

  // Listen for quick add task event from keyboard shortcuts
  useEffect(() => {
    const handleQuickAdd = () => setQuickAddOpen(true);
    window.addEventListener('open-quick-add-task', handleQuickAdd);
    return () => window.removeEventListener('open-quick-add-task', handleQuickAdd);
  }, []);

  // Redirect to onboarding if not completed
  if (isLoaded && user && !user.publicMetadata?.onboardingCompleted) {
    redirect('/app/onboarding');
  }

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
          className="pt-14 transition-all duration-300"
          style={{
            marginLeft: sidebarCollapsed ? '60px' : '240px',
          }}
        >
          {children}
        </main>
      </div>
    </ErrorBoundaryWrapper>
  );
}
