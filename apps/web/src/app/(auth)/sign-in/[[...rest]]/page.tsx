import { SignIn } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your MicroPlanner account',
};

export default function SignInPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Auth Form */}
      <div className="flex flex-col items-center justify-center bg-card px-4 py-12 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to your MicroPlanner account to continue
            </p>
          </div>

          {/* Clerk Sign In Component */}
          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-transparent shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground',
                socialButtonsBlockButtonText: 'font-medium text-sm',
                formButtonPrimary:
                  'bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium',
                formFieldInput:
                  'bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary',
                formFieldLabel: 'text-foreground',
                footerActionLink: 'text-primary hover:text-primary/80',
                identityPreviewText: 'text-foreground',
                formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-foreground',
                formResendCodeLink: 'text-primary hover:text-primary/80',
                otpCodeFieldInput: 'bg-background border-border text-foreground',
              },
              variables: {
                colorPrimary: 'hsl(var(--primary))',
                colorBackground: 'hsl(var(--card))',
                colorInputBackground: 'hsl(var(--background))',
                colorInputText: 'hsl(var(--foreground))',
                colorText: 'hsl(var(--foreground))',
                colorTextSecondary: 'hsl(var(--muted-foreground))',
                borderRadius: '0.5rem',
              },
            }}
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/onboarding"
          />
        </div>
      </div>

      {/* Right side - Gradient Background with Visual */}
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent" />

        <div className="relative flex h-full flex-col items-center justify-center px-12">
          <div className="space-y-6">
            {/* Logo */}
            <Image
              src="/logo-icon.svg"
              alt="MicroPlanner"
              width={40}
              height={40}
              className="h-20 w-20"
            />
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                AI-Powered Planning
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Plan smarter, not harder</h2>
              <p className="text-xl text-muted-foreground">
                Let AI handle your weekly planning while you focus on what matters.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4 pt-8">
              {[
                {
                  title: 'Intelligent Scheduling',
                  description:
                    'AI learns your energy patterns and schedules tasks when you work best',
                },
                {
                  title: 'Automatic Calendar Sync',
                  description:
                    'Seamlessly integrates with Google Calendar, Outlook, and Apple Calendar',
                },
                {
                  title: 'Goal-Driven Planning',
                  description:
                    'Turn your goals into actionable weekly plans with smart prioritization',
                },
              ].map((feature, index) => (
                <div key={index} className="flex gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
