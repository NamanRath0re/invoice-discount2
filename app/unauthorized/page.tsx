import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldX } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex flex-col items-center gap-3">
        <ShieldX className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          You don&apos;t have permission to view this page. Please contact your
          administrator if you think this is a mistake.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
