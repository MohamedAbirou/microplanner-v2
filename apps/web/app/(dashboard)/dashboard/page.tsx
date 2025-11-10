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
        <p className="text-neutral-400 mt-2">
          Here's what's happening with your productivity today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-600/10 to-blue-600/5 border-blue-600/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Active Goals</p>
              <p className="text-3xl font-bold text-white mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-600/10 to-purple-600/5 border-purple-600/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Tasks Today</p>
              <p className="text-3xl font-bold text-white mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-600/10 to-green-600/5 border-green-600/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Completion Rate</p>
              <p className="text-3xl font-bold text-white mt-1">0%</p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-600/10 to-orange-600/5 border-orange-600/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Weekly Plans</p>
              <p className="text-3xl font-bold text-white mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Empty State */}
      <Card className="p-12 text-center bg-neutral-900/50 border-neutral-800">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Let's Start Your Productivity Journey!
          </h2>
          <p className="text-neutral-400 mb-6">
            You're all set up! Start by creating your first goal, and we'll help you plan your week
            with AI-powered scheduling.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/goals"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Create Your First Goal
            </a>
            <a
              href="/plans"
              className="px-6 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-all"
            >
              Generate a Plan
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
