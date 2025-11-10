'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sparkles, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  useCase: z.enum(['personal', 'team', 'business', 'other']).optional(),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistFormProps {
  variant?: 'hero' | 'inline' | 'modal';
  onSuccess?: () => void;
}

export function WaitlistForm({ variant = 'hero', onSuccess }: WaitlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      setIsSuccess(true);
      reset();
      onSuccess?.();

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
      console.error('Waitlist error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center p-6 bg-gradient-to-r from-primary-600/20 to-accent-700/20 border border-primary-600/30 rounded-xl animate-fade-in">
        <CheckCircle2 className="w-6 h-6 text-success mr-3" />
        <div>
          <p className="text-lg font-semibold text-dark-text-primary">
            You're on the list!
          </p>
          <p className="text-sm text-dark-text-secondary">
            Check your email for early access details.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
              <input
                {...register('email')}
                type="email"
                placeholder="Enter your email address"
                className="w-full pl-12 pr-4 py-4 bg-dark-bg-secondary/70 backdrop-blur-xl border border-dark-border-primary rounded-xl text-dark-text-primary placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all duration-250"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-error">{errors.email.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 bg-gradient-brand text-white font-semibold rounded-xl shadow-glow-brand hover:shadow-glow-brand/80 active:scale-95 transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Get Early Access</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
        {errorMessage && (
          <p className="mt-3 text-sm text-error text-center">{errorMessage}</p>
        )}
        <p className="mt-4 text-sm text-dark-text-tertiary text-center">
          Join <span className="text-primary-500 font-semibold">1,234</span> people waiting.
          Get <span className="text-accent-500 font-semibold">3 months PRO free</span> as an
          early adopter.
        </p>
      </form>
    );
  }

  // Inline variant (for other sections)
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2">
      <input
        {...register('email')}
        type="email"
        placeholder="your@email.com"
        className="flex-1 px-4 py-3 bg-dark-bg-secondary border border-dark-border-primary rounded-lg text-dark-text-primary placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all duration-150"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 bg-gradient-brand text-white font-semibold rounded-lg hover:shadow-glow-brand transition-all duration-250 disabled:opacity-50"
      >
        {isSubmitting ? 'Joining...' : 'Join Waitlist'}
      </button>
      {errors.email && (
        <p className="text-sm text-error mt-1">{errors.email.message}</p>
      )}
      {errorMessage && (
        <p className="text-sm text-error mt-1">{errorMessage}</p>
      )}
    </form>
  );
}

export default WaitlistForm;
