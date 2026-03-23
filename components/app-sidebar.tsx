// import * as React from "react"
// import { auth } from "@/auth"
// import { getNavForRole } from "@/lib/nav-config"
// import { NavLink } from "@/components/nav-link"
// import { LogoutButton } from "@/components/logout-button"
// import Image from "next/image"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarRail,
// } from "@/components/ui/sidebar"

// // Role → human-readable label + colour class for the badge
// const roleMeta: Record<string, { label: string; className: string }> = {
//   dealer:      { label: "Dealer",      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
//   business:    { label: "Business",    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
//   individual:  { label: "Individual",  className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
//   admin:       { label: "Admin",       className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
//   super_admin: { label: "Super Admin", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
// }

// export async function AppSidebar({
//   ...props
// }: React.ComponentProps<typeof Sidebar>) {
//   const session = await auth()
//   const role = session?.user?.role ?? "individual"
//   const userName = session?.user?.name ?? "User"
//   const userEmail = session?.user?.email ?? ""

//   const navSections = getNavForRole(role)
//   const meta = roleMeta[role] ?? { label: role, className: "bg-muted text-muted-foreground" }

//   return (
//     <Sidebar {...props}>
//       {/* ── Header: logo + user info ─────────────────────────────── */}
//       <SidebarHeader className="border-b px-4 py-4">
//         <div className="flex items-center gap-3">
//           <Image
//             src="/logo.png"
//             alt="Logo"
//             width={90}
//             height={30}
//             className="object-contain"
//             priority
//           />
//         </div>
//         <div className="mt-3 flex items-center justify-between">
//           <div className="min-w-0">
//             <p className="truncate text-sm font-medium leading-none">{userName}</p>
//             <p className="truncate text-xs text-muted-foreground mt-0.5">{userEmail}</p>
//           </div>
//           <span
//             className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}
//           >
//             {meta.label}
//           </span>
//         </div>
//       </SidebarHeader>

//       {/* ── Nav: role-filtered sections ──────────────────────────── */}
//       <SidebarContent className="gap-0">
//         {navSections.map((section) => (
//           <SidebarGroup key={section.label}>
//             {/* Hide "General" label — it's self-evident */}
//             {section.label !== "General" && (
//               <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
//             )}
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {section.items.map((item) => (
//                   <SidebarMenuItem key={item.href}>
//                     <NavLink item={item} />
//                   </SidebarMenuItem>
//                 ))}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         ))}
//       </SidebarContent>

//       {/* ── Footer: logout ───────────────────────────────────────── */}
//       <SidebarFooter className="border-t p-3">
//         <LogoutButton />
//       </SidebarFooter>

//       <SidebarRail />
//     </Sidebar>
//   )
// }

import * as React from "react"
import { auth } from "@/auth"
import { DynamicNavSection } from "./dynamic-nav-section"
import { LogoutButton } from "@/components/logout-button"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const roleBadge: Record<string, { label: string; className: string }> = {
  admin:       { label: "Admin",       className: "bg-red-100    text-red-800    dark:bg-red-900    dark:text-red-200"    },
  super_admin: { label: "Super Admin", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  dealer:      { label: "Dealer",      className: "bg-blue-100   text-blue-800   dark:bg-blue-900   dark:text-blue-200"   },
  business:    { label: "Business",    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  individual:  { label: "Individual",  className: "bg-green-100  text-green-800  dark:bg-green-900  dark:text-green-200"  },
}

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session  = await auth()
  const role     = session?.user?.role     ?? ""
  const userName = session?.user?.name     ?? "User"
  const userEmail = session?.user?.email   ?? ""
  const menu     = session?.user?.menu     ?? []

  const badge = roleBadge[role] ?? { label: role, className: "bg-muted text-muted-foreground" }

  return (
    <Sidebar {...props}>
      {/* ── Header ───────────────────────────────────────────── */}
      <SidebarHeader className="border-b px-4 py-4">
        <Image
          src="/logo.png"
          alt="Logo"
          width={90}
          height={30}
          className="object-contain"
          priority
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-none">{userName}</p>
            <p className="truncate text-xs text-muted-foreground mt-0.5">{userEmail}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </SidebarHeader>

      {/* ── Nav: built from API menu ─────────────────────────── */}
      <SidebarContent className="gap-0">
        {/*
          Each top-level menu item is either:
          - A direct link (has route_path, no children)  → single NavLink
          - A section header (no route_path, has children) → collapsible group
        */}
        <DynamicNavSection menu={menu} />
      </SidebarContent>

      {/* ── Footer ───────────────────────────────────────────── */}
      <SidebarFooter className="border-t p-3">
        <LogoutButton />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
