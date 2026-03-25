// import { AppSidebar } from "@/components/app-sidebar"
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar"

// export default function Page() {
//   return (
//     <SidebarProvider>
//       <AppSidebar />
//       <SidebarInset>
//         <div className="flex flex-1 flex-col gap-4 p-4">
//           {Array.from({ length: 24 }).map((_, index) => (
//             <div
//               key={index}
//               className="aspect-video h-12 w-full rounded-lg bg-muted/50"
//             />
//           ))}
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   )
// }

import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top horizontal navbar */}
        <TopNavbar />

        {/* Page content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="aspect-video h-12 w-full rounded-lg bg-muted/50"
            />
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}