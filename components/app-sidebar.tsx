// import * as React from "react"
// import { auth } from "@/auth"
// import { DynamicNavSection } from "./dynamic-nav-section"
// import { LogoutButton } from "@/components/logout-button"
// import Image from "next/image"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarRail,
// } from "@/components/ui/sidebar"

// const roleBadge: Record<string, { label: string; className: string }> = {
//   admin:       { label: "Admin",       className: "bg-red-100    text-red-800    dark:bg-red-900    dark:text-red-200"    },
//   super_admin: { label: "Super Admin", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
//   dealer:      { label: "Dealer",      className: "bg-blue-100   text-blue-800   dark:bg-blue-900   dark:text-blue-200"   },
//   business:    { label: "Business",    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
//   individual:  { label: "Individual",  className: "bg-green-100  text-green-800  dark:bg-green-900  dark:text-green-200"  },
// }

// export async function AppSidebar({
//   ...props
// }: React.ComponentProps<typeof Sidebar>) {
//   const session  = await auth()
//   const role     = session?.user?.role     ?? ""
//   const userName = session?.user?.name     ?? "User"
//   const userEmail = session?.user?.email   ?? ""
//   const menu     = session?.user?.menu     ?? []

//   const badge = roleBadge[role] ?? { label: role, className: "bg-muted text-muted-foreground" }

//   return (
//     <Sidebar {...props}>
//       {/* ── Header ───────────────────────────────────────────── */}
//       <SidebarHeader className="border-b px-4 py-4">
//         <Image
//           src="/logo.png"
//           alt="Logo"
//           width={90}
//           height={30}
//           className="object-contain"
//           priority
//         />
//         <div className="mt-3 flex items-center justify-between gap-2">
//           <div className="min-w-0">
//             <p className="truncate text-sm font-medium leading-none">{userName}</p>
//             <p className="truncate text-xs text-muted-foreground mt-0.5">{userEmail}</p>
//           </div>
//           <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
//             {badge.label}
//           </span>
//         </div>
//       </SidebarHeader>

//       {/* ── Nav: built from API menu ─────────────────────────── */}
//       <SidebarContent className="gap-0">
//         {/*
//           Each top-level menu item is either:
//           - A direct link (has route_path, no children)  → single NavLink
//           - A section header (no route_path, has children) → collapsible group
//         */}
//         <DynamicNavSection menu={menu} />
//       </SidebarContent>

//       {/* ── Footer ───────────────────────────────────────────── */}
//       <SidebarFooter className="border-t p-3">
//         <LogoutButton />
//       </SidebarFooter>

//       <SidebarRail />
//     </Sidebar>
//   )
// }

// import * as React from "react"
// import { auth } from "@/auth"
// import { DynamicNavSection } from "@/components/dynamic-nav-section"
// import Image from "next/image"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarRail,
// } from "@/components/ui/sidebar"

// export async function AppSidebar({
//   ...props
// }: React.ComponentProps<typeof Sidebar>) {
//   const session = await auth()
//   const menu    = session?.user?.menu ?? []

//   return (
//     <Sidebar {...props}>
//       {/* ── Logo ─────────────────────────────────────────────── */}
//       <SidebarHeader className="px-4 py-5">
//         <Image
//           src="/logo.png"
//           alt="Logo"
//           width={110}
//           height={36}
//           style={{ width: 110, height: "auto" }}
//           className="object-contain"
//           priority
//         />
//       </SidebarHeader>

//       {/* ── Nav: built dynamically from API menu ─────────────── */}
//       <SidebarContent className="gap-0.5 mt-2">
//         <DynamicNavSection menu={menu} />
//       </SidebarContent>

//       <SidebarRail />
//     </Sidebar>
//   )
// }

import * as React from "react"
import { auth } from "@/auth"
import { DynamicNavSection } from "@/components/dynamic-nav-section"
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar"

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await auth()
  const menu    = session?.user?.menu ?? []

  return (
    <Sidebar
      collapsible="icon"
      // --sidebar-offset tells the sidebar container to start below the 56px (h-14) topbar
      style={{ "--sidebar-offset": "3.5rem" } as React.CSSProperties}
      {...props}
    >
      <SidebarContent className="gap-0 pt-2">
        <DynamicNavSection menu={menu} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}