'use client';

import { motion } from 'framer-motion';
import { Rocket, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OnboardingData } from '@/lib/types/onboarding';

interface Step1Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

// Common timezones
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

export function Step1Welcome({ data, updateData, onNext }: Step1Props) {
  const { user } = useUser();
  const fullName = data.fullName || user?.fullName || '';
  const timezone = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleContinue = () => {
    if (fullName && timezone) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card rounded-2xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-brand rounded-full mb-6"
          >
            <Rocket className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to MicroPlanner!
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Let's set up your account in just a few steps. We'll help you create the perfect
            productivity system tailored to your needs.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-purple-300">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">AI-powered planning awaits</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName" className="text-white/90 mb-2 block">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => updateData({ fullName: e.target.value })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-lg"
            />
          </div>

          {/* Timezone */}
          <div>
            <Label htmlFor="timezone" className="text-white/90 mb-2 block">
              Timezone
            </Label>
            <Select
              value={timezone}
              onValueChange={(value) => updateData({ timezone: value })}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 text-lg">
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-white/60 text-sm mt-2">
              Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!fullName || !timezone}
            className="btn-primary w-full h-12 text-lg"
          >
            Continue
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-white/60 text-sm mt-8">
          This will only take 2-3 minutes to complete
        </p>
      </div>
    </motion.div>
  );
}
