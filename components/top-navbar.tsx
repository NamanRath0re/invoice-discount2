// import { auth } from "@/auth"
// import { TopNavbarClient } from "./top-navbar-client"
// import { SidebarTrigger } from "@/components/ui/sidebar"
// import { Separator } from "@/components/ui/separator"

// export async function TopNavbar() {
//   const session = await auth()

//   const userName  = session?.user?.name  ?? "User"
//   const userEmail = session?.user?.email ?? ""
//   const role      = session?.user?.role  ?? ""

//   const roleLabelMap: Record<string, string> = {
//     admin:       "Admin",
//     super_admin: "Premium Admin",
//     dealer:      "Dealer",
//     business:    "Business",
//     individual:  "Individual",
//   }

//   const roleLabel = roleLabelMap[role] ?? role

//   return (
//     <header className="sticky top-0 z-50 flex h-13.5 shrink-0 items-center gap-2 border-b bg-background px-4">
//       {/* Left: sidebar toggle */}
//       <SidebarTrigger className="-ml-1" />
//       <Separator
//         orientation="vertical"
//         className="mr-2 data-vertical:h-4 data-vertical:self-auto"
//       />

//       {/* Spacer */}
//       <div className="flex-1" />

//       {/* Right: profile dropdown — client component handles interactivity */}
//       <TopNavbarClient
//         userName={userName}
//         userEmail={userEmail}
//         roleLabel={roleLabel}
//       />
//     </header>
//   )
// }

// import { auth } from "@/auth"
// import { TopNavbarClient } from "@/components/top-navbar-client"
// import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
// import { SidebarTrigger } from "@/components/ui/sidebar"
// import { Separator } from "@/components/ui/separator"

// export async function TopNavbar() {
//   const session = await auth()

//   const userName  = session?.user?.name  ?? "User"
//   const userEmail = session?.user?.email ?? ""
//   const role      = session?.user?.role  ?? ""
//   const menu      = session?.user?.menu  ?? []

//   const roleLabelMap: Record<string, string> = {
//     admin:       "Admin",
//     super_admin: "Premium Admin",
//     dealer:      "Dealer",
//     business:    "Business",
//     individual:  "Individual",
//   }

//   const roleLabel = roleLabelMap[role] ?? role

//   return (
//     <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
//       {/* Sidebar collapse toggle */}
//       <SidebarTrigger className="-ml-1" />

//       <Separator
//         orientation="vertical"
//         className="mr-2 data-vertical:h-4 data-vertical:self-auto"
//       />

//       {/* Dynamic breadcrumb — shows current page path from API menu */}
//       <DynamicBreadcrumb menu={menu} />

//       {/* Spacer */}
//       <div className="flex-1" />

//       {/* Profile dropdown */}
//       <TopNavbarClient
//         userName={userName}
//         userEmail={userEmail}
//         roleLabel={roleLabel}
//       />
//     </header>
//   )
// }

// import { auth } from "@/auth"
// import { TopNavbarClient } from "@/components/top-navbar-client"
// import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
// import { SidebarTrigger } from "@/components/ui/sidebar"
// import { Separator } from "@/components/ui/separator"
// import Image from "next/image"

// export async function TopNavbar() {
//   const session = await auth()

//   const userName  = session?.user?.name  ?? "User"
//   const userEmail = session?.user?.email ?? ""
//   const role      = session?.user?.role  ?? ""
//   const menu      = session?.user?.menu  ?? []

//   const roleLabelMap: Record<string, string> = {
//     admin:       "Admin",
//     super_admin: "Premium Admin",
//     dealer:      "Dealer",
//     business:    "Business",
//     individual:  "Individual",
//   }

//   const roleLabel = roleLabelMap[role] ?? role

//   return (
//     <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b bg-background">

//       {/* ── Logo panel — same width as sidebar, always fixed ─────
//            Uses the same --sidebar-width CSS var that ShadCN sets
//            so it perfectly aligns with the sidebar below it.       */}
//       <div className="flex h-full w-(--sidebar-width) shrink-0 items-center px-5 transition-[width] duration-200 ease-linear">
//         <Image
//           src="/logo.png"
//           alt="Logo"
//           width={110}
//           height={36}
//           style={{ width: 110, height: "auto" }}
//           className="object-contain"
//           priority
//         />
//       </div>

//       {/* ── Toolbar: trigger + breadcrumb + profile ──────────── */}
//       <div className="flex flex-1 items-center gap-2 px-4">
//         <SidebarTrigger className="-ml-1" />

//         <Separator
//           orientation="vertical"
//           className="mr-2 data-vertical:h-4 data-vertical:self-auto"
//         />

//         <DynamicBreadcrumb menu={menu} />

//         <div className="flex-1" />

//         <TopNavbarClient
//           userName={userName}
//           userEmail={userEmail}
//           roleLabel={roleLabel}
//         />
//       </div>
//     </header>
//   )
// }

import { auth } from "@/auth"
import { TopNavbarClient } from "@/components/top-navbar-client"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"

export async function TopNavbar() {
  const session = await auth() 

  const userName  = session?.user?.name  ?? "User"
  const userEmail = session?.user?.email ?? ""
  const role      = session?.user?.role  ?? ""
  const menu      = session?.user?.menu  ?? []

  const roleLabelMap: Record<string, string> = {
    admin:       "Admin",
    super_admin: "Premium Admin",
    dealer:      "Dealer",
    business:    "Business",
    individual:  "Individual",
  }

  const roleLabel = roleLabelMap[role] ?? role

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b bg-background">

      {/* ── Logo panel — matches sidebar width exactly, no border here
           The border comes from SidebarInset border-l below          */}
      <div className="flex h-full w-(--sidebar-width) shrink-0 items-center px-5 transition-[width] duration-200 ease-linear">
        <Image  
          src="/logo.png"
          alt="Logo"
          width={110}
          height={36}
          style={{ width: 110, height: "auto" }}
          className="object-contain"
          priority
        />
      </div>

      {/* ── Toolbar: trigger + breadcrumb + profile ──────────── */}
      <div className="flex flex-1 items-center gap-2 border-l px-4">
        <SidebarTrigger className="-ml-1" />

        <DynamicBreadcrumb menu={menu} />

        <div className="flex-1" />

        <TopNavbarClient
          userName={userName}
          userEmail={userEmail}
          roleLabel={roleLabel}
        />
      </div>
    </header>
  )
}