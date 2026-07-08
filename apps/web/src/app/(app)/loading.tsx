import { PageLoader } from '@/components/ui/page-loader';

/** Shown automatically by Next.js while an app route segment is loading. */
export default function AppRouteLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      <PageLoader label="default" variant="page" />
    </div>
  );
}
