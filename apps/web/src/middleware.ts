import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// All routes are public for now (pre-launch, waitlist only)
// When we launch Phase 1, we'll protect /dashboard, /goals, etc.
const isPublicRoute = createRouteMatcher([
  '/(.*)', // Everything is public
]);

export default clerkMiddleware((auth, req) => {
  // For now, all routes are accessible (waitlist-only mode)
  if (isPublicRoute(req)) {
    return;
  }

  // Future: When launching Phase 1, uncomment this:
  // auth().protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
