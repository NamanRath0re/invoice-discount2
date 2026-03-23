// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import type { ApiMenuItem } from "@/auth"
// import {
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
//   SidebarMenuSubItem,
// } from "@/components/ui/sidebar"
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible"
// import {
//   LayoutDashboard,
//   Users,
//   FileText,
//   BarChart2,
//   Settings,
//   Bell,
//   UserCircle,
//   ShoppingCart,
//   Package,
//   Shield,
//   ChevronRight,
//   type LucideIcon,
// } from "lucide-react"

// // ── Map icon strings from API → Lucide components ────────────────────────────
// const iconMap: Record<string, LucideIcon> = {
//   dashboard:  LayoutDashboard,
//   users:      Users,
//   "file-text": FileText,
//   "bar-chart": BarChart2,
//   settings:   Settings,
//   bell:       Bell,
//   profile:    UserCircle,
//   cart:       ShoppingCart,
//   package:    Package,
//   shield:     Shield,
// }

// function getIcon(iconName: string | null): LucideIcon {
//   if (!iconName) return LayoutDashboard
//   return iconMap[iconName.toLowerCase()] ?? LayoutDashboard
// }

// // ── Single nav link (top-level item with a route) ─────────────────────────────
// function TopLevelLink({ item }: { item: ApiMenuItem }) {
//   const pathname = usePathname()
//   const isActive = !!item.route_path && (
//     pathname === item.route_path || pathname.startsWith(item.route_path + "/")
//   )
//   const Icon = getIcon(item.icon)

//   return (
//     <SidebarGroup>
//       <SidebarGroupContent>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton asChild isActive={isActive}>
//               <Link href={item.route_path ?? "#"}>
//                 <Icon className="h-4 w-4" />
//                 <span>{item.name}</span>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarGroupContent>
//     </SidebarGroup>
//   )
// }

// // ── Collapsible group (top-level item with children, no route) ────────────────
// function NavGroup({ item }: { item: ApiMenuItem }) {
//   const pathname  = usePathname()
//   const Icon      = getIcon(item.icon)
//   const hasActive = item.children.some(
//     (c) => c.route_path && (pathname === c.route_path || pathname.startsWith(c.route_path + "/"))
//   )

//   return (
//     <SidebarGroup>
//       <SidebarGroupLabel className="px-0 py-0">
//         <Collapsible defaultOpen={hasActive} className="w-full group/collapsible">
//           <CollapsibleTrigger asChild>
//             <SidebarMenuButton className="w-full">
//               <Icon className="h-4 w-4" />
//               <span>{item.name}</span>
//               <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
//             </SidebarMenuButton>
//           </CollapsibleTrigger>

//           <CollapsibleContent>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 <SidebarMenuSub>
//                   {item.children
//                     .slice()
//                     .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
//                     .map((child) => {
//                       const isActive = !!child.route_path && (
//                         pathname === child.route_path ||
//                         pathname.startsWith(child.route_path + "/")
//                       )
//                       return (
//                         <SidebarMenuSubItem key={child.id}>
//                           <SidebarMenuSubButton asChild isActive={isActive}>
//                             <Link href={child.route_path ?? "#"}>
//                               {child.name}
//                             </Link>
//                           </SidebarMenuSubButton>
//                         </SidebarMenuSubItem>
//                       )
//                     })}
//                 </SidebarMenuSub>
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </CollapsibleContent>
//         </Collapsible>
//       </SidebarGroupLabel>
//     </SidebarGroup>
//   )
// }

// // ── Main export: renders the full menu ───────────────────────────────────────
// export function DynamicNavSection({ menu }: { menu: ApiMenuItem[] }) {
//   const sorted = [...menu].sort((a, b) => Number(a.sort_order) - Number(b.sort_order))

//   return (
//     <>
//       {sorted.map((item) =>
//         item.children && item.children.length > 0 ? (
//           <NavGroup key={item.id} item={item} />
//         ) : (
//           <TopLevelLink key={item.id} item={item} />
//         )
//       )}
//     </>
//   )
// }

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ApiMenuItem } from "@/auth"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart2,
  Settings,
  Bell,
  UserCircle,
  ShoppingCart,
  Package,
  Shield,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"

// ── Icon map: API icon string → Lucide component ─────────────────────────────
const iconMap: Record<string, LucideIcon> = {
  dashboard:   LayoutDashboard,
  users:       Users,
  "file-text": FileText,
  "bar-chart": BarChart2,
  settings:    Settings,
  bell:        Bell,
  profile:     UserCircle,
  cart:        ShoppingCart,
  package:     Package,
  shield:      Shield,
}

function getIcon(iconName: string | null): LucideIcon {
  if (!iconName) return LayoutDashboard
  return iconMap[iconName.toLowerCase()] ?? LayoutDashboard
}

// ── Top-level direct link (no children) ──────────────────────────────────────
function TopLevelLink({ item }: { item: ApiMenuItem }) {
  const pathname = usePathname()
  const isActive =
    !!item.route_path &&
    (pathname === item.route_path ||
      pathname.startsWith(item.route_path + "/"))
  const Icon = getIcon(item.icon)

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link href={item.route_path ?? "#"}>
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// ── Collapsible group (has children) ─────────────────────────────────────────
function NavGroup({ item }: { item: ApiMenuItem }) {
  const pathname = usePathname()
  const Icon = getIcon(item.icon)

  // Auto-open if any child is the current page
  const hasActiveChild = item.children.some(
    (c) =>
      c.route_path &&
      (pathname === c.route_path ||
        pathname.startsWith(c.route_path + "/"))
  )

  const sortedChildren = [...item.children].sort(
    (a, b) => Number(a.sort_order) - Number(b.sort_order)
  )

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent>
        <SidebarMenu>
          <Collapsible
            asChild
            defaultOpen={hasActiveChild}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {/* Trigger row */}
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              {/* Children */}
              <CollapsibleContent>
                <SidebarMenuSub>
                  {sortedChildren.map((child) => {
                    const isActive =
                      !!child.route_path &&
                      (pathname === child.route_path ||
                        pathname.startsWith(child.route_path + "/"))

                    return (
                      <SidebarMenuSubItem key={child.id}>
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <Link href={child.route_path ?? "#"}>
                            <span>{child.name}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export function DynamicNavSection({ menu }: { menu: ApiMenuItem[] }) {
  const sorted = [...menu].sort(
    (a, b) => Number(a.sort_order) - Number(b.sort_order)
  )

  return (
    <>
      {sorted.map((item) =>
        item.children && item.children.length > 0 ? (
          <NavGroup key={item.id} item={item} />
        ) : (
          <TopLevelLink key={item.id} item={item} />
        )
      )}
    </>
  )
}