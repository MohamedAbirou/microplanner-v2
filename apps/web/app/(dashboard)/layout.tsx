import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg-primary">
      {/* Sidebar - Fixed, sleek width */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Compact */}
        <DashboardHeader />

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-tight section-padding">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
