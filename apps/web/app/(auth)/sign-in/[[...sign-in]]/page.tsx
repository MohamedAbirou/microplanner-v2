import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-white/80">Sign in to continue to MicroPlanner</p>
      </div>

      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-white/80',
            socialButtonsBlockButton: 'bg-white/10 border-white/20 hover:bg-white/20',
            socialButtonsBlockButtonText: 'text-white',
            formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
            formFieldLabel: 'text-white/90',
            formFieldInput: 'bg-white/10 border-white/20 text-white placeholder:text-white/50',
            footerActionLink: 'text-blue-300 hover:text-blue-200',
            identityPreviewText: 'text-white',
            formFieldInputShowPasswordButton: 'text-white/70',
          },
        }}
        fallbackRedirectUrl="/onboarding"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
