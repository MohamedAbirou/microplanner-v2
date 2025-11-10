import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PlansPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Weekly Plans</h1>
        <p className="text-dark-text-secondary mt-2">
          Generate and manage your AI-powered weekly plans.
        </p>
      </div>

      <Card className="card p-12 text-center">
        <Calendar className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          AI Planning - Coming Soon
        </h2>
        <p className="text-dark-text-secondary">
          This feature will be implemented in Phase 4.
        </p>
      </Card>
    </div>
  );
}
