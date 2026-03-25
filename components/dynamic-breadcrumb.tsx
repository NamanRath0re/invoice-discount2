"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { ApiMenuItem } from "@/auth"

interface BreadcrumbEntry {
  label: string
  href:  string | null
}

/**
 * Walk the menu tree and find the trail that leads to the current pathname.
 * Returns an array like [{ label: "User Management", href: null }, { label: "View Users", href: "/users" }]
 */
function findBreadcrumbTrail(
  menu: ApiMenuItem[],
  pathname: string
): BreadcrumbEntry[] | null {
  for (const item of menu) {
    // Direct match on this item
    if (
      item.route_path &&
      (pathname === item.route_path ||
        pathname.startsWith(item.route_path + "/"))
    ) {
      return [{ label: item.name, href: item.route_path }]
    }

    // Check children
    if (item.children?.length) {
      for (const child of item.children) {
        if (
          child.route_path &&
          (pathname === child.route_path ||
            pathname.startsWith(child.route_path + "/"))
        ) {
          return [
            { label: item.name,  href: null             },
            { label: child.name, href: child.route_path },
          ]
        }
      }
    }
  }

  return null
}

interface DynamicBreadcrumbProps {
  menu: ApiMenuItem[]
}

export function DynamicBreadcrumb({ menu }: DynamicBreadcrumbProps) {
  const pathname = usePathname()
  const trail    = findBreadcrumbTrail(menu, pathname)

  // Fallback: capitalise the last path segment if not found in menu
  const fallbackLabel = pathname
    .split("/")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "))
    .pop() ?? "Dashboard"

  const crumbs: BreadcrumbEntry[] = trail ?? [
    { label: fallbackLabel, href: pathname },
  ]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <span key={index} className="flex items-center gap-1.5">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    {crumb.href ? (
                      <Link href={crumb.href}>{crumb.label}</Link>
                    ) : (
                      <span className="text-muted-foreground cursor-default">
                        {crumb.label}
                      </span>
                    )}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}