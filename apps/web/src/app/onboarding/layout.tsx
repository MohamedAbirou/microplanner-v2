/**
 * Onboarding Layout - Clean, minimal layout without dashboard chrome
 * This ensures users have a distraction-free onboarding experience
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {children}
    </div>
  );
}
