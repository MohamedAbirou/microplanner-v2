import { Brain, Zap, Calendar, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { PageTemplate } from '@/components/marketing/page-template';

export default function AIPlanningPage() {
  return (
    <PageTemplate
      title="AI-Powered Planning"
      subtitle="Intelligent Planning"
      description="Let AI analyze your goals, calendar, and work patterns to create optimized weekly plans that actually work for you."
      features={[
        {
          icon: Brain,
          title: 'Smart Scheduling',
          description: 'AI analyzes your energy levels, meeting patterns, and task complexity to schedule work at optimal times',
        },
        {
          icon: Zap,
          title: 'Auto-Prioritization',
          description: 'Automatically prioritize tasks based on deadlines, importance, and dependencies',
        },
        {
          icon: Calendar,
          title: 'Calendar Integration',
          description: 'Seamlessly works with your existing calendar to find the perfect time slots',
        },
        {
          icon: TrendingUp,
          title: 'Learning Algorithm',
          description: 'Gets smarter over time by learning from your work patterns and feedback',
        },
        {
          icon: Clock,
          title: 'Time Estimation',
          description: 'AI predicts how long tasks will take based on historical data and complexity',
        },
        {
          icon: Sparkles,
          title: 'Adaptive Planning',
          description: 'Automatically adjusts your plan when things change or unexpected tasks arise',
        },
      ]}
      benefits={[
        {
          title: 'Save 10+ Hours Per Week',
          description: 'Stop spending hours planning your week. Let AI do the heavy lifting while you focus on execution.',
        },
        {
          title: 'Reduce Decision Fatigue',
          description: 'AI makes thousands of micro-decisions about scheduling and prioritization, so you don\'t have to.',
        },
        {
          title: 'Improve Work-Life Balance',
          description: 'AI ensures you have time for deep work, meetings, breaks, and personal time.',
        },
      ]}
    />
  );
}
