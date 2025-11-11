import { CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-dark-text-secondary mt-2">
          Manage your subscription and billing information.
        </p>
      </div>

      <Card className="card p-12 text-center">
        <CreditCard className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Billing - Coming Soon
        </h2>
        <p className="text-dark-text-secondary">
          This feature will be implemented in Phase 11.
        </p>
      </Card>
    </div>
  );
}
