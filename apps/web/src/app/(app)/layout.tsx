'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { CommandPalette } from '@/components/command-palette';
import { QuickAddTaskModal, type TaskFormData } from '@/components/tasks/quick-add-task-modal';
import { redirect } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Mock goals - will be replaced with GraphQL query
  const mockGoals = [
    { id: '1', emoji: '💼', title: 'Career Growth', color: '#3B82F6' },
    { id: '2', emoji: '💪', title: 'Fitness', color: '#10B981' },
    { id: '3', emoji: '📚', title: 'Learning', color: '#EC4899' },
    { id: '4', emoji: '🎨', title: 'Creative Projects', color: '#8B5CF6' },
  ];

  // Redirect to onboarding if not completed
  if (isLoaded && user && !user.publicMetadata?.onboardingCompleted) {
    redirect('/app/onboarding');
  }

  const userTier = (user?.publicMetadata?.tier as 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM') || 'FREE';

  const handleQuickAddSubmit = async (data: TaskFormData) => {
    console.log('Creating task:', data);
    // TODO: GraphQL mutation to create task
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
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
        goals={mockGoals}
        onSubmit={handleQuickAddSubmit}
      />

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
  );
}
