import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { canAccess, Role } from "@/lib/route-permissions"

// Routes that never require authentication
const publicRoutes = ["/", "/login", "/register", "/forgot-password"]

// Route prefixes that require a logged-in user
const protectedPrefixes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/notifications",
  "/orders",
  "/cart",
  "/invoices",
  "/analytics",
  "/reports",
  "/team",
  "/purchase",
  "/inventory",
  "/listings",
  "/dealer-orders",
  "/admin",
]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isLoggedIn = !!session

  const isPublic = publicRoutes.includes(pathname)
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  )
  const isAuthPage = pathname === "/login" || pathname === "/register"

  // 1. Not logged in + trying to reach a protected route → send to login
  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Already logged in + visiting login or register → send to dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 3. Logged in + protected route → check role permission
  if (isLoggedIn && isProtected) {
    const role = session.user.role as Role

    if (!canAccess(pathname, role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
