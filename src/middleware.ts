import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/invite",
  "/invite(.*)",
  "/project(.*)",
  "/dashboard",
  "/admin(.*)",
  "/chat",
  "/events(.*)",
  "/connections",
  "/posts",
  "/posts/(.*)",
  "/spaces(.*)",
  "/channels(.*)",
  "/personas(.*)",
  "/communities(.*)",
  "/email_preview(.*)",
  "/api-keys(.*)",
  "/trust-engine(.*)",
  "/feedback",
  "/support"
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    // '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    "/",
    "/contact-us",
    "/profile(.*)",
    "/posts",
    "/posts/(.*)",
    "/chat",
    "/events(.*)",
    "/channels",
    "/channels/(.*)",
    "/spaces",
    "/connections",
    "/dashboard",
    "/admin(.*)",
    "/project(.*)",
    "/invite",
    "/invite(.*)",
    "/personas(.*)",
    "/communities(.*)",
    "/terms",
    "/privacy",
    "/email_preview(.*)",
    "/api-keys(.*)",
    "/api/app/(.*)",
    "/trust-engine(.*)",
    "/feedback",
    "/support"
    // Always run for API routes
    // '/(api|trpc)(.*)',
    // '/sign-in(.*)',
  ]
}
