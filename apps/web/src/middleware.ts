import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes that require authentication
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
]);

// Define public routes that should skip authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/features',
  '/about',
  '/blog(.*)',
  '/legal(.*)',
  '/waitlist',
  '/book/(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Protect all routes except public ones
  if (isProtectedRoute(req) && !isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
