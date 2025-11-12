import { BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-dark-text-secondary mt-2">
          Track your productivity and gain insights.
        </p>
      </div>

      <Card className="card p-12 text-center">
        <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Analytics - Coming Soon
        </h2>
        <p className="text-dark-text-secondary">
          This feature will be implemented in Phase 9.
        </p>
      </Card>
    </div>
  );
}
