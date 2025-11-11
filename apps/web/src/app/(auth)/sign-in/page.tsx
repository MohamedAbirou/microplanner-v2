import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-secondary-700/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md px-4">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-card border border-border shadow-xl',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'border-border hover:bg-accent',
              formButtonPrimary: 'bg-gradient-primary hover:shadow-lg',
              footerActionLink: 'text-primary-500 hover:text-primary-600',
              formFieldLabel: 'text-foreground',
              formFieldInput: 'bg-background border-border text-foreground',
              identityPreviewText: 'text-foreground',
              identityPreviewEditButton: 'text-primary-500',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          redirectUrl="/launching-soon"
        />
      </div>
    </div>
  );
}
