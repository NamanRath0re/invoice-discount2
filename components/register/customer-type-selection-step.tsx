"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2, UserCircle } from "lucide-react"

interface CustomerTypeSelectionStepProps {
  onSelect: (type: "business" | "individual") => void
  onBack: () => void
}

export function CustomerTypeSelectionStep({ onSelect, onBack }: CustomerTypeSelectionStepProps) {
  return (
    <Card>
      <CardHeader className="text-center relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <CardTitle className="text-2xl">Customer Type</CardTitle>
        <CardDescription>
          Are you registering for business or personal use?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <button
          onClick={() => onSelect("business")}
          className="w-full p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-4 text-left group"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Business</h3>
            <p className="text-sm text-muted-foreground">
              Register your company for business purchases with GST benefits
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelect("individual")}
          className="w-full p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-4 text-left group"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <UserCircle className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Individual</h3>
            <p className="text-sm text-muted-foreground">
              Register as an individual for personal purchases
            </p>
          </div>
        </button>
      </CardContent>
    </Card>
  )
}
