import { currentUser } from '@clerk/nextjs/server';
import { Sparkles, Target, Calendar, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.firstName || 'there'}! 👋
        </h1>
        <p className="text-dark-text-secondary mt-2">
          Here's what's happening with your productivity today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Active Goals</p>
              <p className="text-3xl font-bold text-white mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Tasks Today</p>
              <p className="text-3xl font-bold text-white mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Completion Rate</p>
              <p className="text-3xl font-bold text-white mt-1">0%</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-text-secondary">Weekly Plans</p>
              <p className="text-3xl font-bold text-white mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Empty State */}
      <Card className="card p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Let's Start Your Productivity Journey!
          </h2>
          <p className="text-dark-text-secondary mb-6">
            You're all set up! Start by creating your first goal, and we'll help you plan your week
            with AI-powered scheduling.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/goals"
              className="btn-primary px-6 py-3 rounded-lg"
            >
              Create Your First Goal
            </a>
            <a
              href="/plans"
              className="btn-secondary px-6 py-3 rounded-lg"
            >
              Generate a Plan
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
