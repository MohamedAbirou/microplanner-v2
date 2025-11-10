'use client';

/**
 * SLEEK Dashboard Empty State
 * - Compact design
 * - Clear call-to-action
 * - Professional spacing
 */

import { Card } from '@microplanner/ui';
import { Button } from '@microplanner/ui';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function DashboardEmpty() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="glass-card max-w-lg">
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-brand">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-dark-text-primary mb-2">
            Welcome to MicroPlanner! 🚀
          </h2>
          <p className="text-sm text-dark-text-secondary mb-6">
            You're all set up! Start by creating your first goal, and we'll help you plan your week
            with AI-powered scheduling.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/goals">
              <Button variant="default" size="default">
                Create Your First Goal
              </Button>
            </Link>
            <Link href="/plans">
              <Button variant="secondary" size="default">
                Generate a Plan
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
