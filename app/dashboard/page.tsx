import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { AppFooter } from "@/components/app-footer"
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

        {/* Page content — pb-10 so content clears the fixed footer */}
        <div className="flex flex-1 flex-col gap-4 p-4 pb-14">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="aspect-video h-12 w-full rounded-lg bg-muted/50"
            />
          ))}
        </div>
      </SidebarInset>

      {/* Fixed footer — sits above everything at bottom of viewport */}
      <AppFooter />
    </SidebarProvider>
  )
}