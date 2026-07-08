'use client';

import { CommandPalette } from '@/components/command-palette';
import { ErrorBoundaryWrapper } from '@/components/error-boundary';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { QuickAddTaskModal, type TaskFormData } from '@/components/tasks/quick-add-task-modal';
import { PWAProvider } from '@/components/pwa/pwa-provider';
import { TierProvider } from '@/contexts/tier-context';
import { ONBOARDING_STATUS } from '@/graphql/operations';
import { useCreateTask, useGoals } from '@/hooks/use-graphql';
import { useKeyboardShortcuts, useGlobalKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Geist } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const geist = Geist({ subsets: ['latin'], variable: '--font-app-sans' });

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Fetch goals from GraphQL
  const { goals } = useGoals();
  const { createTask } = useCreateTask();

  // Register global keyboard shortcuts (T/D/W/M/G/P/A/S nav, N new task, ? help).
  useKeyboardShortcuts(useGlobalKeyboardShortcuts());

  // Track viewport so the sidebar defaults to collapsed (overlay) on mobile
  // and content isn't squished into a narrow strip.
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const apply = () => {
      setIsMobile(mql.matches);
      setSidebarCollapsed(mql.matches);
    };
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, []);

  // Collapse the mobile overlay sidebar whenever the route changes.
  useEffect(() => {
    if (isMobile) setSidebarCollapsed(true);
  }, [pathname, isMobile]);

  // Check onboarding status from database via GraphQL
  const { data: onboardingData, loading: onboardingLoading, error: onboardingError } = useQuery(
    ONBOARDING_STATUS,
    {
      skip: !isLoaded || !user,
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
    },
  );

  // Listen for quick add task event from keyboard shortcuts
  useEffect(() => {
    const handleQuickAdd = () => setQuickAddOpen(true);
    window.addEventListener('open-quick-add-task', handleQuickAdd);
    return () => window.removeEventListener('open-quick-add-task', handleQuickAdd);
  }, []);

  // Redirect to onboarding if not completed (using database data, not Clerk metadata)
  useEffect(() => {
    if (!isLoaded || !user || onboardingLoading || onboardingError) {
      return;
    }

    const isOnboardingComplete = onboardingData?.onboardingStatus?.completed;
    const isOnboardingPage = pathname?.startsWith('/onboarding');

    if (!isOnboardingComplete && !isOnboardingPage) {
      router.push('/onboarding');
    }
  }, [isLoaded, user, onboardingLoading, onboardingError, onboardingData, pathname, router]);

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

  if (isLoaded && user && onboardingLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <TierProvider>
      <ErrorBoundaryWrapper>
        <div className={`mp-app ${geist.variable} min-h-screen bg-background`}>
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

          {/* PWA: service worker registration + offline indicator + sync */}
          <PWAProvider />

          {/* Mobile backdrop — tap to close the overlay sidebar */}
          {isMobile && !sidebarCollapsed && (
            <div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setSidebarCollapsed(true)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar — on mobile it slides in/out as an overlay */}
          <div
            className={
              isMobile
                ? `fixed inset-y-0 left-0 z-40 transition-transform duration-300 ${
                    sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
                  }`
                : ''
            }
          >
            <AppSidebar
              collapsed={isMobile ? false : sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

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
              marginLeft: isMobile ? '0px' : sidebarCollapsed ? '72px' : '236px',
            }}
          >
            {children}
          </main>
        </div>
      </ErrorBoundaryWrapper>
    </TierProvider>
  );
}
