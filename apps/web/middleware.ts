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
  // TODO: This will check the database via API call
  // For now, we'll skip this check until we implement the backend integration
  /*
  const hasCompletedOnboarding = await checkOnboardingStatus(userId);

  if (!hasCompletedOnboarding && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  if (hasCompletedOnboarding && isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  */

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
