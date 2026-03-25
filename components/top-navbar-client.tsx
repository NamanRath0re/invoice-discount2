"use client"

import { signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopNavbarClientProps {
  userName:   string
  userEmail:  string
  roleLabel:  string
}

export function TopNavbarClient({
  userName,
  userEmail,
  roleLabel,
}: TopNavbarClientProps) {
  // Generate initials from name for the avatar circle
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-muted"
        >
          {/* Text info */}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{roleLabel}</p>
          </div>

          {/* Avatar circle */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {initials}
          </div>

          {/* <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> */}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        {/* Profile details in the dropdown header */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {roleLabel}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>My Profile</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}