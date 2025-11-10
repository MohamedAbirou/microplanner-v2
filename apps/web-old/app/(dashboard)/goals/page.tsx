import { Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Goals</h1>
        <p className="text-dark-text-secondary mt-2">
          Manage your goals and track your progress.
        </p>
      </div>

      <Card className="card p-12 text-center">
        <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Goals Management - Coming Soon
        </h2>
        <p className="text-dark-text-secondary">
          This feature will be implemented in Phase 3.
        </p>
      </Card>
    </div>
  );
}
