// import { AppSidebar } from "@/components/app-sidebar"
// import { TopNavbar }  from "@/components/top-navbar"
// import { AppFooter }  from "@/components/app-footer"
// import {
//   SidebarInset,
//   SidebarProvider,
// } from "@/components/ui/sidebar"

// export default function ProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset>
//         <TopNavbar />
//         {/* pb-14 so page content never hides behind the fixed footer */}
//         <div className="flex flex-1 flex-col p-4 pb-14">
//           {children}
//         </div>
//       </SidebarInset>
//       <AppFooter />
//     </SidebarProvider>
//   )
// }

import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar }  from "@/components/top-navbar"
import { AppFooter }  from "@/components/app-footer"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // SidebarProvider wraps everything so SidebarTrigger (in TopNavbar)
    // has access to the sidebar context
    <SidebarProvider>
      <div className="flex flex-col w-full min-h-svh">

        {/* TopNavbar — full width, logo left panel + toolbar right */}
        <TopNavbar />

        {/* Body row: sidebar + content */}
        <div className="flex flex-1">
      {/* collapsible="icon" and sidebar-offset are set inside AppSidebar */}
          <AppSidebar />
          <SidebarInset className="flex flex-col flex-1 border-l">
            <div className="flex flex-1 flex-col p-4 pb-14">
              {children}
            </div>
          </SidebarInset>
        </div>

      </div>

      <AppFooter />
    </SidebarProvider>
  )
}