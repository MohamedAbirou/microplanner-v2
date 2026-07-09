'use client';

import { CommandPalette } from '@/components/command-palette';
import { ErrorBoundaryWrapper } from '@/components/error-boundary';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { QuickAddTaskModal, type TaskFormData } from '@/components/tasks/quick-add-task-modal';
import { PWAProvider } from '@/components/pwa/pwa-provider';
import { RealtimeSync } from '@/components/realtime/realtime-sync';
import { GoalsProvider, useAppGoals } from '@/contexts/goals-context';
import { TierProvider } from '@/contexts/tier-context';
import { ONBOARDING_STATUS } from '@/graphql/operations';
import { PageLoader } from '@/components/ui/page-loader';
import { useCreateTask } from '@/hooks/use-graphql';
import { useKeyboardShortcuts, useGlobalKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Geist } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
  const { createTask } = useCreateTask();

  useKeyboardShortcuts(useGlobalKeyboardShortcuts());

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

  useEffect(() => {
    if (isMobile) setSidebarCollapsed(true);
  }, [pathname, isMobile]);

  const { data: onboardingData, loading: onboardingLoading, error: onboardingError } = useQuery(
    ONBOARDING_STATUS,
    {
      skip: !isLoaded || !user,
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: false,
    },
  );

  useEffect(() => {
    const handleQuickAdd = () => setQuickAddOpen(true);
    window.addEventListener('open-quick-add-task', handleQuickAdd);
    return () => window.removeEventListener('open-quick-add-task', handleQuickAdd);
  }, []);

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
      const { isRecurring, ...taskInput } = data;
      await createTask({ variables: { input: taskInput } });
      setQuickAddOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Once the app shell has painted once, never replace it with the
  // full-screen gate loader again - `onboardingLoading` can flip back to
  // true later (e.g. Clerk's `isLoaded` resolving after the shell already
  // rendered), and re-showing this would flash the sidebar away and back.
  const shellRenderedRef = useRef(false);
  const showGateLoader = isLoaded && user && onboardingLoading && !onboardingData && !shellRenderedRef.current;
  if (!showGateLoader) {
    shellRenderedRef.current = true;
  }

  if (showGateLoader) {
    return <PageLoader label="default" variant="shell" showSkeleton={false} />;
  }

  return (
    <TierProvider>
      <GoalsProvider>
        <AppLayoutShell
          geist={geist}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          isMobile={isMobile}
          commandPaletteOpen={commandPaletteOpen}
          setCommandPaletteOpen={setCommandPaletteOpen}
          quickAddOpen={quickAddOpen}
          setQuickAddOpen={setQuickAddOpen}
          onQuickAddSubmit={handleQuickAddSubmit}
        >
          {children}
        </AppLayoutShell>
      </GoalsProvider>
    </TierProvider>
  );
}

function AppLayoutShell({
  children,
  geist,
  sidebarCollapsed,
  setSidebarCollapsed,
  isMobile,
  commandPaletteOpen,
  setCommandPaletteOpen,
  quickAddOpen,
  setQuickAddOpen,
  onQuickAddSubmit,
}: {
  children: React.ReactNode;
  geist: { variable: string };
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  isMobile: boolean;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (v: boolean) => void;
  onQuickAddSubmit: (data: TaskFormData) => Promise<void>;
}) {
  const { goals } = useAppGoals();

  return (
    <ErrorBoundaryWrapper>
      <div className={`mp-app ${geist.variable} min-h-screen bg-background`}>
        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          onQuickAddClick={() => setQuickAddOpen(true)}
        />

        <QuickAddTaskModal
          open={quickAddOpen}
          onOpenChange={setQuickAddOpen}
          goals={goals}
          onSubmit={onQuickAddSubmit}
        />

        <KeyboardShortcutsDialog />
        <PWAProvider />
        <RealtimeSync />

        {isMobile && !sidebarCollapsed && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarCollapsed(true)}
            aria-hidden="true"
          />
        )}

        <div
          className={
            isMobile
              ? `fixed inset-y-0 left-0 z-40 w-[236px] transition-transform duration-300 ${
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

        <AppHeader
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCommandClick={() => setCommandPaletteOpen(true)}
          onQuickAddClick={() => setQuickAddOpen(true)}
        />

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
  );
}
