"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smartphone } from "lucide-react"
import Link from "next/link"
import axios from "axios"

interface MobileNumberStepProps {
  onSubmit: (mobileNumber: string) => void
}

export function MobileNumberStep({ onSubmit }: MobileNumberStepProps) {
  const [mobileNumber, setMobileNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const validateMobileNumber = (number: string) => {
    // Basic validation - adjust regex based on your requirements
    const mobileRegex = /^[6-9]\d{9}$/
    return mobileRegex.test(number)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!mobileNumber.trim()) {
      setError("Please enter your mobile number")
      return
    }

    if (!validateMobileNumber(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }

    setIsLoading(true)
    try {
    // Simulate API call to send OTP
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    // const response = await fetch("https://192.168.6.6/2013/api/v1/kyc/send-otp", {
    //   method: "POST",
    //   headers: {
    //     "content-type": "application/json", 
    //     // "X-tenant-code": "demo",
    //     "Accept": "application/json",
    //     "X-Requested-With": "XMLHttpRequest",
    //   },
    //   body: JSON.stringify({ mobile: mobileNumber }),
    // })
    const response =await axios.post("/api/send-otp", { mobile: mobileNumber })
    console.log("OTP API response:", response)
    // if (!response.ok) {
    //   setError("Failed to send OTP. Please try again.")
    //   setIsLoading(false)
    //   return
    // } 
      onSubmit(mobileNumber)
    } catch (error) {
      console.error("Error sending OTP:", error)
      setError("An error occurred while sending OTP. Please try again.")
    } finally {
    setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify Mobile Number</CardTitle>
        <CardDescription>
          Enter your mobile number to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {/* <Label htmlFor="mobile">Mobile Number</Label> */}
            <div className="flex gap-2">
              <div className="flex h-9 w-16 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                +91
              </div>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                  setMobileNumber(value)
                  setError("")
                }}
                className="flex-1"
                maxLength={10}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
