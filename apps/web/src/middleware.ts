import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Public routes that don't require authentication
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/about(.*)',
  '/features(.*)',
  '/pricing(.*)',
  '/blog(.*)',
  '/legal(.*)',
  '/help(.*)',
  '/contact(.*)',
  '/how-it-works(.*)',
  '/roadmap(.*)',
  '/story(.*)',
  '/changelog(.*)',
  '/glossary(.*)',
]);

/**
 * Onboarding route - requires auth but special handling
 */
const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
]);

/**
 * Protected app routes - require authentication and completed onboarding
 */
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/goals(.*)',
  '/tasks(.*)',
  '/plans(.*)',
  '/projects(.*)',
  '/analytics(.*)',
  '/productivity(.*)',
  '/scheduling(.*)',
  '/integrations(.*)',
  '/settings(.*)',
  '/billing(.*)',
  '/book(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // Special handling for root path "/"
  // Authenticated users -> dashboard, Unauthenticated -> marketing page
  if (pathname === '/') {
    if (userId) {
      // Redirect authenticated users to dashboard
      // Note: Onboarding check happens in app/(app)/layout.tsx using database data
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Unauthenticated users see marketing page (client-side redirect to /home)
    return NextResponse.next();
  }

  // Public routes - allow access for everyone
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Onboarding route - require auth
  if (isOnboardingRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    return NextResponse.next();
  }

  // Protected app routes - require auth
  // Note: Onboarding check happens in app/(app)/layout.tsx using database data
  // The middleware can't efficiently query database (edge runtime), so we defer the check
  if (isProtectedRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    return NextResponse.next();
  }

  // Default: Require auth for all other routes (secure by default)
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
