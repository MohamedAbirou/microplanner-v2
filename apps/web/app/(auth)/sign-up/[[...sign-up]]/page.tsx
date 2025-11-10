import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-display-md text-white mb-2 font-display">Get Started</h1>
        <p className="text-white/80">Create your account and boost your productivity</p>
      </div>

      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'glass-card',
            headerTitle: 'text-white',
            headerSubtitle: 'text-white/80',
            socialButtonsBlockButton: 'bg-white/10 border-white/20 hover:bg-white/20 transition-colors duration-150',
            socialButtonsBlockButtonText: 'text-white',
            formButtonPrimary: 'bg-gradient-brand hover:opacity-90 transition-opacity duration-150 shadow-glow-brand',
            formFieldLabel: 'text-white/90',
            formFieldInput: 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150',
            footerActionLink: 'text-primary-300 hover:text-primary-200 transition-colors duration-150',
            identityPreviewText: 'text-white',
            formFieldInputShowPasswordButton: 'text-white/70 hover:text-white transition-colors duration-150',
          },
        }}
        fallbackRedirectUrl="/onboarding"
        signInUrl="/sign-in"
      />
    </div>
  );
}
