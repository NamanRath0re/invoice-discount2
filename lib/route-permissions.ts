// Roles come directly from the JWT payload your API returns.
// Add more here as your API introduces new roles.
export type Role =
  | "super_admin"
  | "admin"
  | "dealer"
  | "business"
  | "individual"

const ALL_ROLES: Role[] = ["super_admin", "admin", "dealer", "business", "individual"]
const ADMIN_ROLES: Role[] = ["super_admin", "admin"]

// Maps route prefixes → which roles are allowed to access them.
export const routePermissions: Record<string, Role[]> = {
  // ── Shared (all logged-in users) ─────────────────────────────
  "/dashboard":     ALL_ROLES,
  "/profile":       ALL_ROLES,
  "/settings":      ALL_ROLES,
  "/notifications": ALL_ROLES,

  // ── Individual customer routes ────────────────────────────────
  "/orders":        ["individual", ...ADMIN_ROLES],
  "/cart":          ["individual", ...ADMIN_ROLES],
  "/invoices":      ["individual", ...ADMIN_ROLES],

  // ── Business customer routes ──────────────────────────────────
  "/analytics":     ["business", ...ADMIN_ROLES],
  "/reports":       ["business", ...ADMIN_ROLES],
  "/team":          ["business", ...ADMIN_ROLES],
  "/purchase":      ["business", "individual", ...ADMIN_ROLES],

  // ── Dealer routes ─────────────────────────────────────────────
  "/inventory":     ["dealer", ...ADMIN_ROLES],
  "/listings":      ["dealer", ...ADMIN_ROLES],
  "/dealer-orders": ["dealer", ...ADMIN_ROLES],

  // ── Admin only ────────────────────────────────────────────────
  "/admin":         ADMIN_ROLES,
}

/**
 * Returns true if the given role is allowed to visit the given pathname.
 * Falls back to true (open/public) if the path is not in the map at all.
 */
export function canAccess(pathname: string, role: Role): boolean {
  // Exact match
  if (routePermissions[pathname]) {
    return routePermissions[pathname].includes(role)
  }

  // Prefix match — e.g. /orders/123 → /orders
  const matchedKey = Object.keys(routePermissions).find((route) =>
    pathname.startsWith(route + "/") || pathname === route
  )

  if (matchedKey) {
    return routePermissions[matchedKey].includes(role)
  }

  // Not in the map → public route, allow through
  return true
}