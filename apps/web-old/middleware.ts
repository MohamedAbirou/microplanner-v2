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

// Check if user has completed onboarding via GraphQL
async function checkOnboardingStatus(userId: string, token: string | null): Promise<boolean> {
  try {
    const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

    const query = `
      query GetOnboardingStatus {
        onboardingStatus {
          completed
        }
      }
    `;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ query }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.data?.onboardingStatus) {
        return result.data.onboardingStatus.completed === true;
      }
    }
  } catch (error) {
    console.warn('Unable to check onboarding status (GraphQL Gateway may not be ready):', error);
  }

  // Default to assuming onboarding is complete if we can't check
  // This allows development to continue even if backend isn't ready
  return true;
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn, getToken } = await auth();

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect to sign-in if not authenticated
  if (!userId) {
    return redirectToSignIn();
  }

  // Get Clerk token for GraphQL authentication
  const token = await getToken();

  // Check if user has completed onboarding
  const hasCompletedOnboarding = await checkOnboardingStatus(userId, token);

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
