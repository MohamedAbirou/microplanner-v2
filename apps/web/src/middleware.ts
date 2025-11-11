import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define core feature routes that should redirect to launching-soon
const isCoreFeatureRoute = createRouteMatcher([
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
]);

// Define public routes that should skip authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/features',
  '/how-it-works',
  '/testimonials',
  '/about',
  '/blog(.*)',
  '/legal(.*)',
  '/waitlist',
  '/book/(.*)',
  '/compare(.*)',
  '/use-cases(.*)',
  '/integrations(.*)',
  '/contact(.*)',
  '/careers',
  '/customers',
  '/affiliate',
  '/help',
  '/webinars',
  '/glossary',
  '/api',
  '/changelog',
  '/status',
  '/launching-soon',
]);

export default clerkMiddleware((auth, req) => {
  // Redirect core feature routes to launching-soon page
  if (isCoreFeatureRoute(req)) {
    auth().protect();
    return NextResponse.redirect(new URL('/launching-soon', req.url));
  }

  // Public routes are accessible to everyone
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // All other routes require authentication
  auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
