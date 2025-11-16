'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { redirect } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, user } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect to onboarding if not completed
  if (isLoaded && user && !user.publicMetadata?.onboardingCompleted) {
    redirect('/app/onboarding');
  }

  const userTier = (user?.publicMetadata?.tier as 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM') || 'FREE';

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        userTier={userTier}
      />

      {/* Header */}
      <AppHeader
        onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCommandClick={() => {
          // TODO: Open command palette
          console.log('Open command palette');
        }}
        onQuickAddClick={() => {
          // TODO: Open quick add task
          console.log('Open quick add');
        }}
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
