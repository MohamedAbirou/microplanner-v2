import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your MicroPlanner account',
};

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Auth Form */}
      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Get started</h1>
            <p className="text-muted-foreground">
              Create your account and start planning smarter
            </p>
          </div>

          {/* Clerk Sign Up Component */}
          <SignUp
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-transparent shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'bg-card border-border text-card-foreground hover:bg-accent hover:text-accent-foreground',
                socialButtonsBlockButtonText: 'font-medium text-sm',
                formButtonPrimary:
                  'bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium',
                formFieldInput:
                  'bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-primary',
                formFieldLabel: 'text-foreground',
                footerActionLink: 'text-primary hover:text-primary/80',
                identityPreviewText: 'text-foreground',
                formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-foreground',
                formResendCodeLink: 'text-primary hover:text-primary/80',
                otpCodeFieldInput: 'bg-card border-border text-foreground',
              },
              variables: {
                colorPrimary: 'hsl(var(--primary))',
                colorBackground: 'hsl(var(--background))',
                colorInputBackground: 'hsl(var(--card))',
                colorInputText: 'hsl(var(--foreground))',
                colorText: 'hsl(var(--foreground))',
                colorTextSecondary: 'hsl(var(--muted-foreground))',
                borderRadius: '0.5rem',
              },
            }}
            signInUrl="/sign-in"
            fallbackRedirectUrl="/onboarding"
          />
        </div>
      </div>

      {/* Right side - Gradient Background with Visual */}
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-primary/20 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-secondary/40 via-transparent to-transparent" />

        <div className="relative flex h-full flex-col justify-center px-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                Join thousands of users
              </div>
              <h2 className="text-4xl font-bold tracking-tight">
                Your productivity journey starts here
              </h2>
              <p className="text-xl text-muted-foreground">
                Join MicroPlanner and experience the future of weekly planning.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              {[
                { value: '10K+', label: 'Active Users' },
                { value: '50K+', label: 'Plans Generated' },
                { value: '95%', label: 'Satisfaction' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="space-y-1"
                >
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-4 pt-8">
              {[
                'Free tier available - no credit card required',
                'AI-powered planning with multiple models',
                'Calendar sync with Google, Outlook & Apple',
                'Mobile apps for iOS and Android (coming soon)',
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                    <svg
                      className="h-3 w-3 text-secondary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
