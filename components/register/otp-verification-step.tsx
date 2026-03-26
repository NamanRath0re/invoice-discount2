// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
// import { ArrowLeft, ShieldCheck } from "lucide-react"

// interface OtpVerificationStepProps {
//   mobileNumber: string
//   onVerified: () => void
//   onBack: () => void
//   onResendOtp: () => void
// }

// export function OtpVerificationStep({
//   mobileNumber,
//   onVerified,
//   onBack,
//   onResendOtp,
// }: OtpVerificationStepProps) {
//   const [otp, setOtp] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [resendTimer, setResendTimer] = useState(30)
//   const [canResend, setCanResend] = useState(false)

//   useEffect(() => {
//     if (resendTimer > 0) {
//       const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
//       return () => clearTimeout(timer)
//     } else {
//       setCanResend(true)
//     }
//   }, [resendTimer])

//   const handleVerify = async () => {
//     setError("")

//     if (otp.length !== 6) {
//       setError("Please enter the complete 6-digit OTP")
//       return
//     }

//     setIsLoading(true)
    
//     // Simulate API call to verify OTP
//     await new Promise((resolve) => setTimeout(resolve, 1000))
    
//     // For demo purposes, accept any 6-digit OTP
//     // In production, verify with your backend
//     setIsLoading(false)
//     onVerified()
//   }

//   const handleResend = () => {
//     if (!canResend) return
//     setCanResend(false)
//     setResendTimer(30)
//     setOtp("")
//     setError("")
//     onResendOtp()
//   }

//   const maskedNumber = `******${mobileNumber.slice(-4)}`

//   return (
//     <Card>
//       <CardHeader className="text-center">
//         <Button
//           variant="ghost"
//           size="icon"
//           className="absolute left-4 top-4"
//           onClick={onBack}
//         >
//           <ArrowLeft className="h-4 w-4" />
//           <span className="sr-only">Go back</span>
//         </Button>
//         <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
//           <ShieldCheck className="h-6 w-6 text-primary" />
//         </div>
//         <CardTitle className="text-2xl">Verify your number</CardTitle>
//         <CardDescription>
//           We&apos;ve sent a 6-digit code to +91 {maskedNumber}
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="flex flex-col items-center gap-4">
//           <InputOTP
//             maxLength={6}
//             value={otp}
//             onChange={(value) => {
//               setOtp(value)
//               setError("")
//             }}
//           >
//             <InputOTPGroup>
//               <InputOTPSlot index={0} />
//               <InputOTPSlot index={1} />
//               <InputOTPSlot index={2} />
//               <InputOTPSlot index={3} />
//               <InputOTPSlot index={4} />
//               <InputOTPSlot index={5} />
//             </InputOTPGroup>
//           </InputOTP>
//           {error && (
//             <p className="text-sm text-destructive">{error}</p>
//           )}
//         </div>
//         <Button
//           className="w-full"
//           onClick={handleVerify}
//           disabled={isLoading || otp.length !== 6}
//         >
//           {isLoading ? "Verifying..." : "Verify OTP"}
//         </Button>
//         <div className="text-center text-sm text-muted-foreground">
//           Didn&apos;t receive the code?{" "}
//           {canResend ? (
//             <button
//               type="button"
//               onClick={handleResend}
//               className="text-primary underline-offset-4 hover:underline"
//             >
//               Resend OTP
//             </button>
//           ) : (
//             <span>Resend in {resendTimer}s</span>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ArrowLeft, ShieldCheck } from "lucide-react"

const API_HEADERS = {
  "Content-Type": "application/json",
  "X-Tenant-Code": "demo",
  "Accept":        "application/json",
}

const RESEND_SECONDS = 30

interface OtpVerificationStepProps {
  mobileNumber: string
  onVerified:   () => void
  onBack:       () => void
  onResendOtp:  () => void
}

export function OtpVerificationStep({
  mobileNumber,
  onVerified,
  onBack,
  onResendOtp,
}: OtpVerificationStepProps) {
  const [otp, setOtp]               = useState("")
  const [isLoading, setIsLoading]   = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError]           = useState("")
  const [timer, setTimer]           = useState(RESEND_SECONDS)
  const [canResend, setCanResend]   = useState(false)

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timer])

  // ── Verify OTP against real API ──────────────────────────────────────────────
  const handleVerify = async () => {
    setError("")
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    setIsLoading(true)
    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
      const res  = await fetch("https://192.168.6.6/2013/api/v1/kyc/verifyOtp", {
        method:  "POST",
        headers: API_HEADERS,
        body:    JSON.stringify({ mobile: mobileNumber, otp }),
      })
      const data = await res.json()
      console.log("Verify OTP API response:", data)

      if (!data.success || !data.data?.verified) {
        setError(data.message ?? "Invalid OTP. Please try again.")
        return
      }

      onVerified()    // ✅ OTP verified — move to next step
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Resend OTP ───────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return
    setIsResending(true)
    setError("")
    setOtp("")

    try {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
      const res  = await fetch("https://192.168.6.6/2013/api/v1/kyc/send-otp", {
        method:  "POST",
        headers: API_HEADERS,
        body:    JSON.stringify({ mobile: mobileNumber }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.message ?? "Failed to resend OTP.")
        return
      }

      // Reset countdown
      setCanResend(false)
      setTimer(RESEND_SECONDS)
      onResendOtp()
    } catch {
      setError("Failed to resend OTP. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const maskedNumber = `******${mobileNumber.slice(-4)}`

  return (
    <Card>
      <CardHeader className="text-center">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Go back</span>
        </Button>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify your number</CardTitle>
        <CardDescription>
          We&apos;ve sent a 6-digit code to +91 {maskedNumber}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* OTP input */}
        <div className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value)
              setError("")
            }}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* Verify button */}
        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>

        {/* Resend */}
        <div className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-primary underline-offset-4 hover:underline disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <span className="font-medium text-foreground">
              Resend in {timer}s
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}