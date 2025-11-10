import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/book/(.*)', // Public booking pages
  '/api/waitlist(.*)',
  '/api/webhooks/(.*)',
  '/pricing',
  '/features',
  '/about',
  '/blog(.*)',
  '/legal(.*)',
]);

// Define onboarding route
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

// Define dashboard routes
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);

// Check if user has completed onboarding
async function checkOnboardingStatus(userId: string): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    const response = await fetch(`${apiUrl}/user/onboarding/status?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const data = await response.json();
      return data.completed === true;
    }
  } catch (error) {
    console.warn('Unable to check onboarding status (endpoint may not exist yet):', error);
  }

  // Default to assuming onboarding is complete if we can't check
  // This allows development to continue even if backend isn't ready
  return true;
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect to sign-in if not authenticated
  if (!userId) {
    return redirectToSignIn();
  }

  // Check if user has completed onboarding
  const hasCompletedOnboarding = await checkOnboardingStatus(userId);

  // Redirect to onboarding if not completed and trying to access dashboard
  if (!hasCompletedOnboarding && isDashboardRoute(req)) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // Redirect to dashboard if onboarding is complete and trying to access onboarding
  if (hasCompletedOnboarding && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
