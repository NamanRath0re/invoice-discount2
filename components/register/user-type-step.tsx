"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShoppingCart, Store } from "lucide-react"
import { useState } from "react"

type UserType = "buyer" | "seller"

interface UserTypeStepProps {
  onSelect: (type: UserType) => void
}

export function UserTypeStep({ onSelect }: UserTypeStepProps) {
  const [selected, setSelected] = useState<UserType | null>(null)

  const handleContinue = () => {
    if (selected) onSelect(selected)
  }

  const options: {
    type:        UserType
    icon:        React.ReactNode
    title:       string
    description: string
    bullets:     string[]
  }[] = [
    {
      type:  "buyer",
      icon:  <ShoppingCart className="h-7 w-7" />,
      title: "Buyer",
      description: "I want to purchase goods or services",
      bullets: [
        "Access invoice financing",
        "Manage purchase orders",
        "Track payment status",
      ],
    },
    {
      type:  "seller",
      icon:  <Store className="h-7 w-7" />,
      title: "Seller",
      description: "I want to sell goods or services",
      bullets: [
        "Upload & manage invoices",
        "Get early payment on invoices",
        "Track buyer payments",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/60 via-background to-muted/30">

      {/* ── Top bar with logo ──────────────────────────────────── */}
      <div className="px-8 pt-7 pb-0">
        <Image
          src="/logo.png"
          alt="Logo"
          width={120}
          height={40}
          style={{ width: 120, height: "auto" }}
          className="object-contain"
          priority
        />
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center px-4 pt-16 pb-12">

        {/* Heading */}
        <div className="text-center mb-12 space-y-3 max-w-md">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
            Get started
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            How will you use Finanza?
          </h1>
          <p className="text-base text-muted-foreground">
            Choose your role to set up the right experience for you.
          </p>
        </div>

        {/* ── Option cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {options.map((opt) => {
            const isSelected = selected === opt.type
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setSelected(opt.type)}
                className={`
                  group relative text-left rounded-2xl border-2 p-7 transition-all duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                  ${isSelected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-background hover:border-primary/40 hover:shadow-md hover:shadow-black/5"
                  }
                `}
              >
                {/* Selection indicator */}
                <div className={`
                  absolute top-5 right-5 h-5 w-5 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200
                  ${isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30"
                  }
                `}>
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>

                {/* Icon */}
                <div className={`
                  mb-5 w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-200
                  ${isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  }
                `}>
                  {opt.icon}
                </div>

                {/* Title + description */}
                <h2 className="text-xl font-bold mb-1">{opt.title}</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  {opt.description}
                </p>

                {/* Bullets */}
                <ul className="space-y-2">
                  {opt.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <span className={`
                        mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold
                        ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                      `}>
                        ✓
                      </span>
                      <span className={isSelected ? "text-foreground" : "text-muted-foreground"}>
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {/* ── Continue button ──────────────────────────────────── */}
        <div className="mt-10 w-full max-w-2xl">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected}
            className={`
              w-full h-13 rounded-2xl text-base font-semibold flex items-center justify-center gap-2
              transition-all duration-200
              ${selected
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                : "bg-muted text-muted-foreground cursor-not-allowed"
              }
            `}
          >
            Continue as {selected ? (selected === "buyer" ? "Buyer" : "Seller") : "…"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Sign in link */}
        <p className="text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}