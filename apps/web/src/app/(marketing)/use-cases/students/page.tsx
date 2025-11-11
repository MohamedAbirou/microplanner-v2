'use client';

import { PageTemplate } from '@/components/marketing/page-template';
import {
  BookOpen,
  Calendar,
  Users,
  Brain,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function StudentsPage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Assignment Tracking',
      description: 'Never miss a deadline again. Track all your assignments across courses with clear due dates and progress indicators.',
    },
    {
      icon: Calendar,
      title: 'Study Schedules',
      description: 'Create structured study plans tailored to your courses and exam dates with spaced repetition reminders.',
    },
    {
      icon: Users,
      title: 'Group Project Management',
      description: 'Collaborate seamlessly with classmates on group projects, track contributions, and coordinate deadlines.',
    },
    {
      icon: Brain,
      title: 'Exam Preparation',
      description: 'Plan your exam prep with customizable study guides, review schedules, and progress tracking for each subject.',
    },
    {
      icon: FileText,
      title: 'Notes Organization',
      description: 'Organize notes by class and topic, link them to assignments, and quickly find what you need when studying.',
    },
    {
      icon: AlertCircle,
      title: 'Deadline Alerts',
      description: 'Receive smart notifications before deadlines so you have enough time to complete your work without last-minute stress.',
    },
  ];

  const benefits = [
    {
      title: 'Academic Excellence',
      description: 'Stay on top of coursework with systematic planning. Better organization leads to higher grades and deeper understanding of material.',
    },
    {
      title: 'Reduced Stress',
      description: 'Eliminate last-minute cramming and deadline panic. With clear planning and timely reminders, you can approach your studies with confidence.',
    },
    {
      title: 'Better Time Management',
      description: 'Balance academic work with extracurriculars and social life. MicroPlanner helps you see your full schedule at a glance and make intentional choices about how you spend your time.',
    },
  ];

  return (
    <PageTemplate
      title="For Students"
      subtitle="Academic Success"
      description="Master your coursework, ace your exams, and excel academically. MicroPlanner is built for students managing multiple classes, assignments, and deadlines."
      features={features}
      benefits={benefits}
    />
  );
}
