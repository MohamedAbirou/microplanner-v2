import { SignIn } from '@clerk/nextjs';

/**
 * Sign In Page
 * Professional auth page with Clerk integration
 */

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'glass-card shadow-xl',
            headerTitle: 'text-gradient text-2xl',
            headerSubtitle: 'text-dark-text-secondary',
            socialButtonsBlockButton: 'glass-card-hover border-dark-border-primary',
            formButtonPrimary: 'bg-gradient-brand hover:shadow-glow-brand',
            footerActionLink: 'text-primary-400 hover:text-primary-300',
          },
          variables: {
            colorPrimary: '#2563EB',
            colorBackground: '#171717',
            colorText: '#FAFAFA',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
        }}
      />
    </div>
  );
}
