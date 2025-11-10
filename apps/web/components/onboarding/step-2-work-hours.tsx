'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OnboardingData } from '@/lib/types/onboarding';

interface Step2Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

export function Step2WorkHours({ data, updateData, onNext, onBack }: Step2Props) {
  const workDays = data.workDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const workStartTime = data.workStartTime || '09:00';
  const workEndTime = data.workEndTime || '17:00';
  const maxMeetingsPerDay = data.maxMeetingsPerDay || 4;

  const toggleDay = (day: string) => {
    const newDays = workDays.includes(day)
      ? workDays.filter((d) => d !== day)
      : [...workDays, day];
    updateData({ workDays: newDays });
  };

  const handleContinue = () => {
    if (workDays.length > 0 && workStartTime && workEndTime) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 md:p-12 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6"
          >
            <Calendar className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Configure Your Work Hours
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Tell us when you're available to work. We'll use this to schedule your tasks optimally.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Work Days */}
          <div>
            <Label className="text-white/90 mb-4 block text-lg">Work Days</Label>
            <div className="flex flex-wrap gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`
                    px-6 py-3 rounded-lg font-medium transition-all duration-200
                    ${
                      workDays.includes(day.value)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }
                  `}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Work Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="startTime" className="text-white/90 mb-2 block">
                <Clock className="w-4 h-4 inline mr-2" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={workStartTime}
                onChange={(e) => updateData({ workStartTime: e.target.value })}
                className="bg-white/10 border-white/20 text-white h-12 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="endTime" className="text-white/90 mb-2 block">
                <Clock className="w-4 h-4 inline mr-2" />
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={workEndTime}
                onChange={(e) => updateData({ workEndTime: e.target.value })}
                className="bg-white/10 border-white/20 text-white h-12 text-lg"
              />
            </div>
          </div>

          {/* Max Meetings */}
          <div>
            <Label htmlFor="maxMeetings" className="text-white/90 mb-2 block">
              Max Meetings Per Day
            </Label>
            <Input
              id="maxMeetings"
              type="number"
              min="1"
              max="10"
              value={maxMeetingsPerDay}
              onChange={(e) => updateData({ maxMeetingsPerDay: parseInt(e.target.value) })}
              className="bg-white/10 border-white/20 text-white h-12 text-lg"
            />
            <p className="text-white/60 text-sm mt-2">
              We'll protect your calendar from meeting overload
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 h-12 text-lg border-white/20 text-white hover:bg-white/10"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={workDays.length === 0}
              className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
