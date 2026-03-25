import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { canAccessRoute, ALWAYS_ALLOWED } from "@/lib/route-permissions"

// Routes only accessible when NOT logged in
const AUTH_PAGES = ["/login", "/register"]

// Routes accessible without any auth at all
const PUBLIC_ROUTES = ["/", "/forgot-password"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session    = req.auth
  const isLoggedIn = !!session

  const isAuthPage  = AUTH_PAGES.includes(pathname)
  const isPublic    = PUBLIC_ROUTES.includes(pathname)
  const isAlwaysOk  = ALWAYS_ALLOWED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  // 1. Logged in + trying to visit login or register → redirect to dashboard
  //    Must be checked FIRST, before the public/auth-page bypass below
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 2. Truly public routes (no auth needed, no login redirect) → allow through
  if (isPublic) return NextResponse.next()

  // 3. Auth pages (login/register) for non-logged-in users → allow through
  if (isAuthPage) return NextResponse.next()

  // 4. Not logged in + any other route → send to login with return URL
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 5. Logged in + always-allowed routes (dashboard, profile, settings…) → allow
  if (isAlwaysOk) return NextResponse.next()

  // 6. Logged in + check route against API menu permissions
  const menu = session.user.menu ?? []
  if (!canAccessRoute(pathname, menu)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}