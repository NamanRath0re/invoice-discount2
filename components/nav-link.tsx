// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { SidebarMenuButton } from "@/components/ui/sidebar"
// import { NavItem } from "@/lib/nav-config"

// interface NavLinkProps {
//   item: NavItem
// }

// export function NavLink({ item }: NavLinkProps) {
//   const pathname = usePathname()
//   const isActive =
//     pathname === item.href || pathname.startsWith(item.href + "/")

//   const Icon = item.icon

//   return (
//     <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
//       <Link href={item.href}>
//         <Icon className="h-4 w-4" />
//         <span>{item.title}</span>
//       </Link>
//     </SidebarMenuButton>
//   )
// }
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { NavItem } from "@/lib/nav-config"
import {
  LayoutDashboard,
  Bell,
  UserCircle,
  Settings,
  ShoppingCart,
  ShoppingBag,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  Package,
  List,
  ClipboardList,
  Shield,
  Wrench,
  type LucideIcon,
} from "lucide-react"

// Icon registry — all icons resolved here on the client, never passed as props
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Bell,
  UserCircle,
  Settings,
  ShoppingCart,
  ShoppingBag,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  Package,
  List,
  ClipboardList,
  Shield,
  Wrench,
}

interface NavLinkProps {
  item: NavItem
}

export function NavLink({ item }: NavLinkProps) {
  const pathname = usePathname()
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/")

  const Icon = iconMap[item.iconName] ?? LayoutDashboard

  return (
    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
      <Link href={item.href}>
        <Icon className="h-4 w-4" />
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  )
}