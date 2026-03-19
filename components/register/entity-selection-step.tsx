"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Store, User } from "lucide-react"

interface EntitySelectionStepProps {
  onSelect: (entity: "dealer" | "customer") => void
  onBack: () => void
}

export function EntitySelectionStep({ onSelect, onBack }: EntitySelectionStepProps) {
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
        <CardTitle className="text-2xl">Select Account Type</CardTitle>
        <CardDescription>
          Choose how you would like to register
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <button
          onClick={() => onSelect("dealer")}
          className="w-full p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-4 text-left group"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Store className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Dealer</h3>
            <p className="text-sm text-muted-foreground">
              Register as a dealer to sell products and manage inventory
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelect("customer")}
          className="w-full p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-4 text-left group"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Customer</h3>
            <p className="text-sm text-muted-foreground">
              Register as a customer to browse and purchase products
            </p>
          </div>
        </button>
      </CardContent>
    </Card>
  )
}
