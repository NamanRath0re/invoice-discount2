// NavItem has NO icon field — icons are resolved client-side in NavLink
// to avoid passing functions across the server/client boundary.
export type NavItem = {
  title: string
  href: string
  iconName: string  // string key, looked up in NavLink
}

export type NavSection = {
  label: string
  items: NavItem[]
}

// ─── All nav sections ────────────────────────────────────────────────────────

export const allNavSections: NavSection[] = [
  {
    label: "General",
    items: [
      { title: "Dashboard",     href: "/dashboard",     iconName: "LayoutDashboard" },
      { title: "Notifications", href: "/notifications", iconName: "Bell" },
      { title: "Profile",       href: "/profile",       iconName: "UserCircle" },
      { title: "Settings",      href: "/settings",      iconName: "Settings" },
    ],
  },
  {
    label: "My Account",
    items: [
      { title: "My Orders", href: "/orders",   iconName: "ShoppingCart" },
      { title: "My Cart",   href: "/cart",     iconName: "ShoppingBag" },
      { title: "Invoices",  href: "/invoices", iconName: "FileText" },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Analytics", href: "/analytics", iconName: "BarChart3" },
      { title: "Reports",   href: "/reports",   iconName: "TrendingUp" },
      { title: "Team",      href: "/team",      iconName: "Users" },
      { title: "Purchase",  href: "/purchase",  iconName: "ShoppingBag" },
    ],
  },
  {
    label: "Dealer",
    items: [
      { title: "Inventory",     href: "/inventory",     iconName: "Package" },
      { title: "Listings",      href: "/listings",      iconName: "List" },
      { title: "Dealer Orders", href: "/dealer-orders", iconName: "ClipboardList" },
    ],
  },
  {
    label: "Admin",
    items: [
      { title: "All Users",  href: "/admin/users",  iconName: "Shield" },
      { title: "All Orders", href: "/admin/orders", iconName: "ShoppingCart" },
      { title: "System",     href: "/admin/system", iconName: "Wrench" },
    ],
  },
]

// ─── Which sections each role can see ────────────────────────────────────────

export const navByRole: Record<string, string[]> = {
  individual:  ["General", "My Account"],
  business:    ["General", "Business"],
  dealer:      ["General", "Dealer"],
  admin:       ["General", "My Account", "Business", "Dealer", "Admin"],
  super_admin: ["General", "My Account", "Business", "Dealer", "Admin"],
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getNavForRole(role: string): NavSection[] {
  const allowed = navByRole[role] ?? ["General"]
  return allNavSections.filter((section) => allowed.includes(section.label))
}