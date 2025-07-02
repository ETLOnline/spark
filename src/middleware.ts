import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/invite",
  "/invite(.*)",
  "/project(.*)",
  "/dashboard",
  "/admin",
  "/chat",
  "/events",
  "/connections",
  "/posts",
  "/spaces(.*)",
  "/channels(.*)",
  "/community(.*)",
  "/personas(.*)",
  "/roles(.*)"
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
    "/chat",
    "/events",
    "/channels",
    "/channels/(.*)",
    "/spaces",
    "/connections",
    "/dashboard",
    "/admin",
    "/project(.*)",
    "/invite",
    "/invite(.*)",
    "/community(.*)",
    "/personas(.*)",
    "/roles(.*)"
    // Always run for API routes
    // '/(api|trpc)(.*)',
    // '/sign-in(.*)',
  ]
}
