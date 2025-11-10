'use client';

import { motion } from 'framer-motion';
import { Calendar, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/use-toast';
import type { OnboardingData } from '@/lib/types/onboarding';

interface Step5Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
}

const CALENDAR_PROVIDERS = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: '🗓️',
    popular: true,
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    icon: '📅',
    popular: true,
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: '🍎',
    popular: false,
  },
];

export function Step5Calendar({ data, updateData, onComplete, onBack }: Step5Props) {
  const { toast } = useToast();

  const handleConnectCalendar = (providerId: string) => {
    const provider = CALENDAR_PROVIDERS.find((p) => p.id === providerId);

    toast({
      title: 'Coming Soon',
      description: `Calendar integration for ${provider?.name} will be available in a future update. You can skip this step and connect later from Settings.`,
    });
  };

  const handleSkip = () => {
    updateData({ skipCalendarConnection: true });
    onComplete();
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-3xl mx-auto"
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
            <Calendar className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Connect Your Calendar
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-2">
            Sync your calendar to get the most accurate planning and avoid scheduling conflicts.
          </p>
          <p className="text-white/60 text-sm">This step is optional - you can connect later</p>
        </div>

        {/* Calendar Providers */}
        <div className="space-y-4 mb-8">
          {CALENDAR_PROVIDERS.map((provider) => (
            <motion.button
              key={provider.id}
              onClick={() => handleConnectCalendar(provider.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-2xl">
                  {provider.icon}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{provider.name}</span>
                    {provider.popular && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">Connect in seconds</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>

        {/* Benefits */}
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-6 mb-8">
          <h3 className="text-white font-semibold mb-3">Why connect your calendar?</h3>
          <ul className="space-y-2">
            {[
              'Automatically detect conflicts and free time',
              'Sync tasks as calendar events',
              'Get realistic planning based on your schedule',
              'Never double-book yourself again',
            ].map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-blue-200 text-sm">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 h-12 text-lg border-white/20 text-white hover:bg-white/10"
          >
            Back
          </Button>
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 h-12 text-lg border-white/20 text-white hover:bg-white/10"
          >
            Skip for Now
          </Button>
          <Button
            onClick={handleFinish}
            className="btn-primary flex-1 h-12 text-lg"
          >
            Finish Setup
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
