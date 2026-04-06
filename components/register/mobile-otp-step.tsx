// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
// import { Loader2, CheckCircle2, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react"
// import Link from "next/link"

// const API_HEADERS = {
//   "Content-Type": "application/json",
//   "X-Tenant-Code": "demo",
//   "Accept": "application/json",
// }
// const BASE = "https://192.168.6.6/2013/api/v1"
// const RESEND_SECS = 30

// type OtpState = "idle" | "sent" | "verified"

// interface MobileOtpStepProps {
//   onComplete: (mobile: string, customerId: string) => void
// }

// export function MobileOtpStep({ onComplete }: MobileOtpStepProps) {
//   const [mobile, setMobile]             = useState("")
//   const [otp, setOtp]                   = useState("")
//   const [otpState, setOtpState]         = useState<OtpState>("idle")
//   const [sendingOtp, setSendingOtp]     = useState(false)
//   const [verifyingOtp, setVerifyingOtp] = useState(false)
//   const [submitting, setSubmitting]     = useState(false)
//   const [mobileError, setMobileError]   = useState("")
//   const [otpError, setOtpError]         = useState("")
//   const [submitError, setSubmitError]   = useState("")
//   const [timer, setTimer]               = useState(0)
//   const [canResend, setCanResend]       = useState(false)
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

//   useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

//   const startTimer = () => {
//     setTimer(RESEND_SECS)
//     setCanResend(false)
//     if (timerRef.current) clearInterval(timerRef.current)
//     timerRef.current = setInterval(() => {
//       setTimer((t) => {
//         if (t <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0 }
//         return t - 1
//       })
//     }, 1000)
//   }

//   const validateMobile = (n: string) => /^[6-9]\d{9}$/.test(n)

//   const handleSendOtp = async () => {
//     setMobileError("")
//     if (!mobile.trim()) { setMobileError("Please enter your mobile number"); return }
//     if (!validateMobile(mobile)) { setMobileError("Enter a valid 10-digit mobile number"); return }
//     setSendingOtp(true)
//     try {
//       const res = await fetch(`${BASE}/kyc/send-otp`, {
//         method: "POST", headers: API_HEADERS,
//         body: JSON.stringify({ mobile }),
//       })
//       const data = await res.json()
//       console.log("Send OTP response:", data)
//       if (!data.success) throw new Error(data.message ?? "Failed to send OTP")
//       setOtpState("sent"); setOtp(""); setOtpError(""); startTimer()
//     } catch (e) {
//       setMobileError(e instanceof Error ? e.message : "Failed to send OTP")
//     } finally { setSendingOtp(false) }
//   }

//   const handleVerifyOtp = async () => {
//     setOtpError("")
//     if (otp.length !== 6) { setOtpError("Please enter the complete 6-digit OTP"); return }
//     setVerifyingOtp(true)
//     try {
//       const res = await fetch(`${BASE}/kyc/verifyOtp`, {
//         method: "POST", headers: API_HEADERS,
//         body: JSON.stringify({ mobile, otp }),
//       })
//       const data = await res.json()
//       if (!data.success || !data.data?.verified)
//         throw new Error(data.message ?? "Invalid OTP. Please try again.")
//       setOtpState("verified")
//       if (timerRef.current) clearInterval(timerRef.current)
//     } catch (e) {
//       setOtpError(e instanceof Error ? e.message : "Verification failed")
//     } finally { setVerifyingOtp(false) }
//   }

//   const handleSubmit = async () => {
//     setSubmitError("")
//     setSubmitting(true)
//     try {
//       const res = await fetch(`${BASE}/kyc/submitForm`, {
//         method: "POST", headers: API_HEADERS,
//         body: JSON.stringify({ mobile_no: mobile, form_data: { mobile_no: mobile } }),
//       })
//       const data = await res.json()
//       if (!data.success || !data.data)
//         throw new Error(data.message ?? "Submission failed")
//       onComplete(mobile, String(data.data?.customer_id))
//     } catch (e) {
//       setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.")
//     } finally { setSubmitting(false) }
//   }

//   const resetFlow = () => {
//     setOtpState("idle"); setOtp(""); setOtpError("")
//     if (timerRef.current) clearInterval(timerRef.current)
//     setTimer(0); setCanResend(false)
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/60 via-background to-muted/30 px-4">
//       <div className="w-full max-w-sm">

//         {/* ── Card ──────────────────────────────────────────────── */}
//         <div className="rounded-2xl border bg-background shadow-xl shadow-black/5 overflow-hidden">

//           {/* Top accent bar */}
//           <div className="w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60" />

//           <div className="px-8 pt-8 pb-10 space-y-8">

//             {/* ── Header ────────────────────────────────────────── */}
//             <div className="text-center space-y-2">
//               <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
//                 <ShieldCheck className="h-7 w-7 text-primary" />
//               </div>
//               <h1 className="text-2xl font-bold tracking-tight">Verify your number</h1>
//               <p className="text-sm text-muted-foreground leading-relaxed">
//                 {otpState === "idle"
//                   ? "Enter your mobile number to get started"
//                   : otpState === "sent"
//                   ? <>OTP sent to <span className="font-medium text-foreground">+91 ••••••{mobile.slice(-4)}</span></>
//                   : <>Mobile <span className="font-medium text-foreground">+91 ••••••{mobile.slice(-4)}</span> verified</>
//                 }
//               </p>
//             </div>

//             {/* ── Step 1: Mobile input ───────────────────────────── */}
//             <div className="space-y-3">
//               {/* <label className="text-sm font-medium text-foreground">Mobile Number</label> */}
//               <div className="flex gap-2">
//                 <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl border bg-muted text-sm font-medium text-muted-foreground">
//                   +91
//                 </div>
//                 <Input
//                   type="tel"
//                   placeholder="9876543210"
//                   value={mobile}
//                   onChange={(e) => {
//                     setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
//                     setMobileError("")
//                     if (otpState !== "idle") resetFlow()
//                   }}
//                   disabled={sendingOtp || otpState === "verified"}
//                   className="h-11 flex-1 rounded-xl text-base tracking-widest"
//                   maxLength={10}
//                 />
//               </div>
//               {mobileError && (
//                 <p className="text-xs text-destructive flex items-center gap-1.5">
//                   <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
//                   {mobileError}
//                 </p>
//               )}

//               {/* Send / Resend button */}
//               {otpState !== "verified" && (
//                 <Button
//                   type="button"
//                   onClick={handleSendOtp}
//                   disabled={sendingOtp || mobile.length !== 10 || (otpState === "sent" && !canResend)}
//                   variant={otpState === "sent" ? "outline" : "default"}
//                   className="w-full h-11 rounded-xl font-medium"
//                 >
//                   {sendingOtp ? (
//                     <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP…</>
//                   ) : otpState === "idle" ? (
//                     <><ArrowRight className="mr-2 h-4 w-4" />Send OTP</>
//                   ) : canResend ? (
//                     <><RotateCcw className="mr-2 h-4 w-4" />Resend OTP</>
//                   ) : (
//                     <>Resend OTP in {timer}s</>
//                   )}
//                 </Button>
//               )}
//             </div>

//             {/* ── Step 2: OTP input (slides in after send) ──────── */}
//             {otpState !== "idle" && (
//               <div className="space-y-4">
//                 {/* Divider */}
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-dashed" />
//                   </div>
//                   <div className="relative flex justify-center">
//                     <span className="bg-background px-3 text-xs text-muted-foreground">
//                       Enter 6-digit OTP
//                     </span>
//                   </div>
//                 </div>

//                 {/* Centered OTP slots */}
//                 <div className="flex flex-col items-center gap-3">
//                   <InputOTP
//                     maxLength={6}
//                     value={otp}
//                     onChange={(v) => { setOtp(v); setOtpError("") }}
//                     disabled={verifyingOtp || otpState === "verified"}
//                   >
//                     <InputOTPGroup className="gap-2">
//                       {[0,1,2,3,4,5].map((i) => (
//                         <InputOTPSlot
//                           key={i}
//                           index={i}
//                           className="h-12 w-11 rounded-xl border-2 text-base font-bold transition-all focus:border-primary data-[active]:border-primary data-[active]:ring-2 data-[active]:ring-primary/20"
//                         />
//                       ))}
//                     </InputOTPGroup>
//                   </InputOTP>

//                   {otpError && (
//                     <p className="text-xs text-destructive flex items-center gap-1.5">
//                       <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
//                       {otpError}
//                     </p>
//                   )}

//                   {/* Verify button — only when not yet verified */}
//                   {otpState === "sent" && (
//                     <Button
//                       type="button"
//                       onClick={handleVerifyOtp}
//                       disabled={verifyingOtp || otp.length !== 6}
//                       className="w-full h-11 rounded-xl font-medium"
//                     >
//                       {verifyingOtp ? (
//                         <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</>
//                       ) : (
//                         <><ShieldCheck className="mr-2 h-4 w-4" />Verify OTP</>
//                       )}
//                     </Button>
//                   )}

//                   {/* Verified state badge */}
//                   {otpState === "verified" && (
//                     <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-950/30 px-4 py-2.5 text-sm font-medium text-green-700 dark:text-green-400 w-full justify-center">
//                       <CheckCircle2 className="h-4 w-4" />
//                       OTP verified successfully
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* ── Step 3: Continue (after verified) ─────────────── */}
//             {otpState === "verified" && (
//               <div className="space-y-2 pt-1">
//                 {submitError && (
//                   <p className="text-xs text-destructive flex items-center gap-1.5">
//                     <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
//                     {submitError}
//                   </p>
//                 )}
//                 <Button
//                   type="button"
//                   onClick={handleSubmit}
//                   disabled={submitting}
//                   className="w-full h-12 rounded-xl text-base font-semibold"
//                 >
//                   {submitting ? (
//                     <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
//                   ) : (
//                     <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
//                   )}
//                 </Button>
//               </div>
//             )}

//           </div>
//         </div>

//         {/* ── Footer link ─────────────────────────────────────────── */}
//         <p className="text-center text-sm text-muted-foreground mt-6">
//           Already have an account?{" "}
//           <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
//             Sign in
//           </Link>
//         </p>

//       </div>
//     </div>
//   )
// }

// "use client"

// import { useState, useRef, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
// import { Loader2, CheckCircle2, ArrowRight, RotateCcw, ShieldCheck, ArrowLeft } from "lucide-react"
// import Link from "next/link"
// import Image from "next/image"

// const API_HEADERS = {
//   "Content-Type": "application/json",
//   "X-Tenant-Code": "demo",
//   "Accept": "application/json",
// }
// const BASE        = "https://192.168.6.6/2013/api/v1"
// const RESEND_SECS = 30

// type OtpState = "idle" | "sent" | "verified"

// interface MobileOtpStepProps {
//   userType:   "buyer" | "seller"
//   onComplete: (mobile: string, customerId: string, submissionId: string, nextStep: string) => void
//   onBack:     () => void
// }

// export function MobileOtpStep({ userType, onComplete, onBack }: MobileOtpStepProps) {
//   const [mobile, setMobile]             = useState("")
//   const [otp, setOtp]                   = useState("")
//   const [otpState, setOtpState]         = useState<OtpState>("idle")
//   const [sendingOtp, setSendingOtp]     = useState(false)
//   const [verifyingOtp, setVerifyingOtp] = useState(false)
//   const [mobileError, setMobileError]   = useState("")
//   const [otpError, setOtpError]         = useState("")
//   const [timer, setTimer]               = useState(0)
//   const [canResend, setCanResend]       = useState(false)
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

//   useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

//   const startTimer = () => {
//     setTimer(RESEND_SECS)
//     setCanResend(false)
//     if (timerRef.current) clearInterval(timerRef.current)
//     timerRef.current = setInterval(() => {
//       setTimer((t) => {
//         if (t <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0 }
//         return t - 1
//       })
//     }, 1000)
//   }

//   const validateMobile = (n: string) => /^[6-9]\d{9}$/.test(n)

//   // ── 1. Send OTP ──────────────────────────────────────────────────────────
//   const handleSendOtp = async () => {
//     setMobileError("")
//     if (!mobile.trim()) { setMobileError("Please enter your mobile number"); return }
//     if (!validateMobile(mobile)) { setMobileError("Enter a valid 10-digit mobile number"); return }
//     setSendingOtp(true)
//     try {
//       const res  = await fetch(`${BASE}/kyc/send-otp`, {
//         method: "POST", headers: API_HEADERS,
//         body: JSON.stringify({ mobile }),
//       })
//       const data = await res.json()
//       if (!data.success) throw new Error(data.message ?? "Failed to send OTP")
//       setOtpState("sent"); setOtp(""); setOtpError(""); startTimer()
//     } catch (e) {
//       setMobileError(e instanceof Error ? e.message : "Failed to send OTP")
//     } finally { setSendingOtp(false) }
//   }

//   // ── 2. Verify OTP — single call that completes step 1 and returns next_step ──
//   const handleVerifyOtp = async () => {
//     setOtpError("")
//     if (otp.length !== 6) { setOtpError("Please enter the complete 6-digit OTP"); return }
//     setVerifyingOtp(true)
//     try {
//       const res  = await fetch(`${BASE}/kyc/onboardingVerifyOtp`, {
//         method: "POST", headers: API_HEADERS,
//         body: JSON.stringify({
//           mobile,
//           otp,
//           form_data: { mobile_no: mobile },
//         }),
//       })
//       const data = await res.json()
//       if (!data.success || !data.data?.customer_id)
//         throw new Error(data.message ?? "Invalid OTP. Please try again.")

//       const { customer_id, submission_id, next_step } = data.data
//       if (timerRef.current) clearInterval(timerRef.current)
//       // Immediately complete — no separate submit step needed
//       onComplete(mobile, String(customer_id), String(submission_id), String(next_step))
//     } catch (e) {
//       setOtpError(e instanceof Error ? e.message : "Verification failed. Please try again.")
//     } finally { setVerifyingOtp(false) }
//   }

//   const resetFlow = () => {
//     setOtpState("idle"); setOtp(""); setOtpError("")
//     if (timerRef.current) clearInterval(timerRef.current)
//     setTimer(0); setCanResend(false)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-muted/60 via-background to-muted/30">

//       {/* Logo */}
//       <div className="px-8 pt-7">
//         <Image src="/logo.png" alt="Logo" width={120} height={40}
//           style={{ width: 120, height: "auto" }} className="object-contain" priority />
//       </div>

//       <div className="flex items-center justify-center px-4 pt-8 pb-12">
//         <div className="w-full max-w-sm">

//           {/* Card */}
//           <div className="rounded-2xl border bg-background shadow-xl shadow-black/5 overflow-hidden">
//             <div className="w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60" />

//             <div className="px-8 pt-8 pb-10 space-y-7">

//               {/* Header */}
//               <div className="text-center space-y-2">
//                 <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
//                   {userType === "buyer" ? "🛒 Buyer" : "🏪 Seller"}
//                 </span>
//                 <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mt-4">
//                   <ShieldCheck className="h-7 w-7 text-primary" />
//                 </div>
//                 <h1 className="text-2xl font-bold tracking-tight pt-1">Verify your number</h1>
//                 <p className="text-sm text-muted-foreground leading-relaxed">
//                   {otpState === "idle"
//                     ? "Enter your mobile number to get started"
//                     : <>OTP sent to <span className="font-medium text-foreground">+91 ••••••{mobile.slice(-4)}</span></>
//                   }
//                 </p>
//               </div>

//               {/* Mobile input */}
//               <div className="space-y-3">
//                 <label className="text-sm font-medium">Mobile Number</label>
//                 <div className="flex gap-2">
//                   <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl border bg-muted text-sm font-medium text-muted-foreground">
//                     +91
//                   </div>
//                   <Input
//                     type="tel"
//                     placeholder="9876543210"
//                     value={mobile}
//                     onChange={(e) => {
//                       setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
//                       setMobileError("")
//                       if (otpState !== "idle") resetFlow()
//                     }}
//                     disabled={sendingOtp || otpState === "sent"}
//                     className="h-11 flex-1 rounded-xl text-base tracking-widest"
//                     maxLength={10}
//                   />
//                 </div>
//                 {mobileError && (
//                   <p className="text-xs text-destructive flex items-center gap-1.5">
//                     <span className="h-1 w-1 rounded-full bg-destructive inline-block" />
//                     {mobileError}
//                   </p>
//                 )}

//                 {/* Send OTP button — only in idle state */}
//                 {otpState === "idle" && (
//                   <Button type="button" onClick={handleSendOtp}
//                     disabled={sendingOtp || mobile.length !== 10}
//                     className="w-full h-11 rounded-xl font-medium">
//                     {sendingOtp
//                       ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP…</>
//                       : <><ArrowRight className="mr-2 h-4 w-4" />Send OTP</>}
//                   </Button>
//                 )}
//               </div>

//               {/* OTP section — shown after send */}
//               {otpState === "sent" && (
//                 <div className="space-y-5">
//                   <div className="relative">
//                     <div className="absolute inset-0 flex items-center">
//                       <div className="w-full border-t border-dashed" />
//                     </div>
//                     <div className="relative flex justify-center">
//                       <span className="bg-background px-3 text-xs text-muted-foreground">
//                         Enter 6-digit OTP
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex flex-col items-center gap-3">
//                     <InputOTP maxLength={6} value={otp}
//                       onChange={(v) => { setOtp(v); setOtpError("") }}
//                       disabled={verifyingOtp}>
//                       <InputOTPGroup className="gap-2">
//                         {[0,1,2,3,4,5].map((i) => (
//                           <InputOTPSlot key={i} index={i}
//                             className="h-12 w-11 rounded-xl border-2 text-base font-bold transition-all data-[active]:border-primary data-[active]:ring-2 data-[active]:ring-primary/20" />
//                         ))}
//                       </InputOTPGroup>
//                     </InputOTP>

//                     {otpError && (
//                       <p className="text-xs text-destructive flex items-center gap-1.5 w-full">
//                         <span className="h-1 w-1 rounded-full bg-destructive inline-block shrink-0" />
//                         {otpError}
//                       </p>
//                     )}
//                   </div>

//                   {/* Verify button */}
//                   <Button type="button" onClick={handleVerifyOtp}
//                     disabled={verifyingOtp || otp.length !== 6}
//                     className="w-full h-11 rounded-xl font-medium">
//                     {verifyingOtp
//                       ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</>
//                       : <><ShieldCheck className="mr-2 h-4 w-4" />Verify &amp; Continue</>}
//                   </Button>

//                   {/* Resend row */}
//                   <div className="flex items-center justify-between text-sm">
//                     <button type="button" onClick={resetFlow}
//                       className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
//                       <ArrowLeft className="h-3.5 w-3.5" />
//                       Change number
//                     </button>
//                     <button type="button"
//                       onClick={handleSendOtp}
//                       disabled={!canResend || sendingOtp}
//                       className={`flex items-center gap-1.5 font-medium transition-colors
//                         ${canResend ? "text-primary hover:text-primary/80" : "text-muted-foreground cursor-not-allowed"}`}>
//                       {sendingOtp
//                         ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending…</>
//                         : canResend
//                         ? <><RotateCcw className="h-3.5 w-3.5" />Resend OTP</>
//                         : <>Resend in {timer}s</>}
//                     </button>
//                   </div>
//                 </div>
//               )}

//             </div>
//           </div>

//           {/* Footer — back + sign in, clean design */}
//           <div className="mt-6 flex items-center justify-between">
//             <button type="button" onClick={onBack}
//               className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
//               <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
//               Back
//             </button>
//             <p className="text-sm text-muted-foreground">
//               Have an account?{" "}
//               <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
//                 Sign in
//               </Link>
//             </p>
//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }

// "use client"

// import { useState, useRef, useEffect } from "react"
// import { Input } from "@/components/ui/input"
// import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
// import { Loader2, ArrowRight, RotateCcw, ArrowLeft, CheckCircle2 } from "lucide-react"
// import Link from "next/link"
// import Image from "next/image"

// const API_HEADERS = {
//   "Content-Type": "application/json",
//   "X-Tenant-Code": "demo",
//   "Accept": "application/json",
// }
// const BASE        = "https://192.168.6.6/2013/api/v1"
// const RESEND_SECS = 30

// type OtpState = "idle" | "sent"

// interface MobileOtpStepProps {
//   userType:   "buyer" | "seller"
//   onComplete: (mobile: string, customerId: string, submissionId: string, nextStep: string) => void
//   onBack:     () => void
// }

// export function MobileOtpStep({ userType, onComplete, onBack }: MobileOtpStepProps) {
//   const [mobile, setMobile]             = useState("")
//   const [otp, setOtp]                   = useState("")
//   const [otpState, setOtpState]         = useState<OtpState>("idle")
//   const [sendingOtp, setSendingOtp]     = useState(false)
//   const [verifyingOtp, setVerifyingOtp] = useState(false)
//   const [mobileError, setMobileError]   = useState("")
//   const [otpError, setOtpError]         = useState("")
//   const [timer, setTimer]               = useState(0)
//   const [canResend, setCanResend]       = useState(false)
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

//   useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

//   const startTimer = () => {
//     setTimer(RESEND_SECS)
//     setCanResend(false)
//     if (timerRef.current) clearInterval(timerRef.current)
//     timerRef.current = setInterval(() => {
//       setTimer((t) => {
//         if (t <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0 }
//         return t - 1
//       })
//     }, 1000)
//   }

//   const validateMobile = (n: string) => /^[6-9]\d{9}$/.test(n)

//   const handleSendOtp = async () => {
//     setMobileError("")
//     if (!mobile.trim()) { setMobileError("Please enter your mobile number"); return }
//     if (!validateMobile(mobile)) { setMobileError("Enter a valid 10-digit mobile number"); return }
//     setSendingOtp(true)
//     try {
//       const res  = await fetch(`${BASE}/kyc/send-otp`, {
//         method: "POST", headers: API_HEADERS,
//         body: JSON.stringify({ mobile }),
//       })
//       const data = await res.json()
//       if (!data.success) throw new Error(data.message ?? "Failed to send OTP")
//       setOtpState("sent"); setOtp(""); setOtpError(""); startTimer()
//     } catch (e) {
//       setMobileError(e instanceof Error ? e.message : "Failed to send OTP")
//     } finally { setSendingOtp(false) }
//   }

//   const handleVerifyOtp = async () => {
//     setOtpError("")
//     if (otp.length !== 6) { setOtpError("Enter the complete 6-digit OTP"); return }
//     setVerifyingOtp(true)
//     try {
//       const res  = await fetch(`${BASE}/kyc/onboardingVerifyOtp`, {
//         method: "POST", headers: API_HEADERS,
//         body: JSON.stringify({ mobile, otp, form_data: { mobile_no: mobile } }),
//       })
//       const data = await res.json()
//       if (!data.success || !data.data?.customer_id)
//         throw new Error(data.message ?? "Invalid OTP. Please try again.")
//       const { customer_id, submission_id, next_step } = data.data
//       if (timerRef.current) clearInterval(timerRef.current)
//       onComplete(mobile, String(customer_id), String(submission_id), String(next_step))
//     } catch (e) {
//       setOtpError(e instanceof Error ? e.message : "Verification failed. Please try again.")
//     } finally { setVerifyingOtp(false) }
//   }

//   const resetToIdle = () => {
//     setOtpState("idle"); setOtp(""); setOtpError("")
//     if (timerRef.current) clearInterval(timerRef.current)
//     setTimer(0); setCanResend(false)
//   }

//   return (
//     <div className="min-h-screen flex flex-col bg-background">

//       {/* ── Top bar ───────────────────────────────────────────── */}
//       <div className="flex items-center justify-between px-8 py-5 border-b">
//         <Image src="/logo.png" alt="Logo" width={110} height={36}
//           style={{ width: 110, height: "auto" }} className="object-contain" priority />
//         <p className="text-sm text-muted-foreground">
//           Have an account?{" "}
//           <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
//             Sign in
//           </Link>
//         </p>
//       </div>

//       {/* ── Body ─────────────────────────────────────────────── */}
//       <div className="flex flex-1">

//         {/* Left panel — branding / context */}
//         <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-primary px-12 py-14">
//           <div className="space-y-6">
//             {/* Role pill */}
//             <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white">
//               {userType === "buyer" ? "🛒" : "🏪"}
//               {userType === "buyer" ? "Buyer account" : "Seller account"}
//             </span>

//             <div className="space-y-3 pt-4">
//               <h2 className="text-4xl font-bold text-white leading-tight">
//                 Secure your account with OTP
//               </h2>
//               <p className="text-white/70 text-base leading-relaxed">
//                 We'll send a one-time password to your mobile number to verify your identity. 
//               </p>
//             </div>
//           </div>

//           {/* Steps indicator */}
//           <div className="space-y-3">
//             {[
//               // { n: 1, label: "Choose your role",    done: true  },
//               { n: 2, label: "Verify mobile number", done: true },
//               // { n: 3, label: "Complete your profile", done: false },
//             ].map((s) => (
//               <div key={s.n} className="flex items-center gap-3">
//                 <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
//                   ${s.done ? "bg-white text-primary" : s.n === 2 ? "bg-white/30 text-white ring-2 ring-white" : "bg-white/10 text-white/50"}`}>
//                   {s.done ? <CheckCircle2 className="h-4 w-4" /> : s.n}
//                 </div>
//                 <span className={`text-sm font-medium ${s.n === 2 ? "text-white" : s.done ? "text-white/80" : "text-white/40"}`}>
//                   {s.label}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right panel — form */}
//         <div className="flex flex-1 items-center justify-center px-6 py-12">
//           <div className="w-full max-w-md space-y-10">

//             {/* ── Phase: idle — enter mobile ───────────────────── */}
//             {otpState === "idle" && (
//               <>
//                 <div className="space-y-2">
//                   <h1 className="text-3xl font-bold tracking-tight">Enter your mobile number</h1>
//                   <p className="text-muted-foreground">
//                     We'll send a 6-digit OTP to verify it's you.
//                   </p>
//                 </div>

//                 <div className="space-y-5">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Mobile number</label>
//                     <div className="flex gap-3">
//                       <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border-2 bg-muted text-sm font-semibold text-muted-foreground">
//                         +91
//                       </div>
//                       <Input
//                         type="tel"
//                         placeholder="9876543210"
//                         value={mobile}
//                         onChange={(e) => {
//                           setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
//                           setMobileError("")
//                         }}
//                         disabled={sendingOtp}
//                         className="h-12 flex-1 rounded-xl border-2 text-lg tracking-widest font-medium focus-visible:ring-0 focus-visible:border-primary"
//                         maxLength={10}
//                         onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
//                       />
//                     </div>
//                     {mobileError && (
//                       <p className="text-sm text-destructive">{mobileError}</p>
//                     )}
//                   </div>

//                   <button
//                     type="button"
//                     onClick={handleSendOtp}
//                     disabled={sendingOtp || mobile.length !== 10}
//                     className="group w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base
//                       flex items-center justify-center gap-2 transition-all
//                       hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {sendingOtp
//                       ? <><Loader2 className="h-4 w-4 animate-spin" />Sending OTP…</>
//                       : <>Send OTP <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
//                     }
//                   </button>
//                 </div>
//               </>
//             )}

//             {/* ── Phase: sent — enter OTP ──────────────────────── */}
//             {otpState === "sent" && (
//               <>
//                 <div className="space-y-2">
//                   <h1 className="text-3xl font-bold tracking-tight">Check your messages</h1>
//                   <p className="text-muted-foreground">
//                     Enter the 6-digit OTP sent to{" "}
//                     <span className="font-semibold text-foreground">+91 {mobile.slice(0,3)}•••••{mobile.slice(-2)}</span>
//                   </p>
//                 </div>

//                 <div className="space-y-8">
//                   {/* OTP slots — large and prominent */}
//                   <div className="space-y-3">
//                     <InputOTP maxLength={6} value={otp}
//                       onChange={(v) => { setOtp(v); setOtpError("") }}
//                       disabled={verifyingOtp}
//                       // onComplete={handleVerifyOtp}
//                     >
//                       <InputOTPGroup className="gap-3 w-full">
//                         {[0,1,2,3,4,5].map((i) => (
//                           <InputOTPSlot key={i} index={i}
//                             className="h-14 flex-1 rounded-xl border-2 text-xl font-bold
//                               transition-all data-[active]:border-primary data-[active]:ring-4
//                               data-[active]:ring-primary/15" />
//                         ))}
//                       </InputOTPGroup>
//                     </InputOTP>

//                     {otpError && (
//                       <p className="text-sm text-destructive">{otpError}</p>
//                     )}
//                   </div>

//                   {/* Verify button */}
//                   <button
//                     type="button"
//                     onClick={handleVerifyOtp}
//                     disabled={verifyingOtp || otp.length !== 6}
//                     className="group w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base
//                       flex items-center justify-center gap-2 transition-all
//                       hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {verifyingOtp
//                       ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying…</>
//                       : <>Verify &amp; Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
//                     }
//                   </button>

//                   {/* Resend + change number */}
//                   <div className="flex items-center justify-between text-sm pt-1 border-t">
//                     <button type="button" onClick={resetToIdle}
//                       className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
//                       <ArrowLeft className="h-3.5 w-3.5" />
//                       Change number
//                     </button>
//                     <button type="button"
//                       onClick={handleSendOtp}
//                       disabled={!canResend || sendingOtp}
//                       className={`flex items-center gap-1.5 font-medium transition-colors
//                         ${canResend ? "text-primary hover:text-primary/80" : "text-muted-foreground cursor-not-allowed"}`}
//                     >
//                       {sendingOtp
//                         ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending…</>
//                         : canResend
//                         ? <><RotateCcw className="h-3.5 w-3.5" />Resend OTP</>
//                         : `Resend in ${timer}s`
//                       }
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}

//             {/* Back to user type */}
//             <button type="button" onClick={onBack}
//               className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
//               <ArrowLeft className="h-4 w-4" />
//               Back to role selection
//             </button>

//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2, ArrowRight, RotateCcw, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const API_HEADERS = {
  "Content-Type": "application/json",
  "X-Tenant-Code": "demo",
  "Accept": "application/json",
}
// const BASE        = process.env.NEXT_PUBLIC_API_URL
const BASE = "https://192.168.6.6/www8/2013/api/v1"

const RESEND_SECS = 30

type OtpState = "idle" | "sent"

interface MobileOtpStepProps {
  userType:   "buyer" | "seller"
  onComplete: (mobile: string, customerId: string, submissionId: string, nextStep: string, totalSteps?: number) => void
  onBack:     () => void
}

export function MobileOtpStep({ userType, onComplete, onBack }: MobileOtpStepProps) {
  const [mobile, setMobile]             = useState("")
  const [otp, setOtp]                   = useState("")
  const [otpState, setOtpState]         = useState<OtpState>("idle")
  const [sendingOtp, setSendingOtp]     = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [mobileError, setMobileError]   = useState("")
  const [otpError, setOtpError]         = useState("")
  const [timer, setTimer]               = useState(0)
  const [canResend, setCanResend]       = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const startTimer = () => {
    setTimer(RESEND_SECS)
    setCanResend(false)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const validateMobile = (n: string) => /^[6-9]\d{9}$/.test(n)

  const handleSendOtp = async () => {
    setMobileError("")
    if (!mobile.trim()) { setMobileError("Please enter your mobile number"); return }
    if (!validateMobile(mobile)) { setMobileError("Enter a valid 10-digit mobile number"); return }
    setSendingOtp(true)
    try {
      const res  = await fetch(`${BASE}/kyc/send-otp`, {
        method: "POST", headers: API_HEADERS,
        body: JSON.stringify({ mobile }),
      })
      const data = await res.json()
      console.log("send otp res", data);
      if (!data.success) throw new Error(data.message ?? "Failed to send OTP")
      setOtpState("sent"); setOtp(""); setOtpError(""); startTimer()
    } catch (e) {
      setMobileError(e instanceof Error ? e.message : "Failed to send OTP")
    } finally { setSendingOtp(false) }
  }

  const handleVerifyOtp = async () => {
    setOtpError("")
    if (otp.length !== 6) { setOtpError("Enter the complete 6-digit OTP"); return }
    setVerifyingOtp(true)
    try {
      const res  = await fetch(`${BASE}/kyc/onboardingVerifyOtp`, {
        method: "POST", headers: API_HEADERS,
        body: JSON.stringify({ mobile, otp, form_data: { mobile_no: mobile } }),
      })
      const data = await res.json()
      if (!data.success || !data.data?.customer_id)
        throw new Error(data.message ?? "Invalid OTP. Please try again.")
      const { customer_id, submission_id, next_step, total_step } = data.data
      if (timerRef.current) clearInterval(timerRef.current)
      onComplete(mobile, String(customer_id), String(submission_id), String(next_step), total_step ? Number(total_step) : undefined)
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Verification failed. Please try again.")
    } finally { setVerifyingOtp(false) }
  }

  const resetToIdle = () => {
    setOtpState("idle"); setOtp(""); setOtpError("")
    if (timerRef.current) clearInterval(timerRef.current)
    setTimer(0); setCanResend(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-5 border-b">
        <Image src="/logo.png" alt="Logo" width={110} height={36}
          style={{ width: 110, height: "auto" }} className="object-contain" priority />
        <p className="text-sm text-muted-foreground">
          Have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex flex-1">

        {/* Left panel — branding / context */}
        <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-primary px-12 py-14">
          <div className="space-y-6">
            {/* Role pill */}
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white">
              {userType === "buyer" ? "🛒" : "🏪"}
              {userType === "buyer" ? "Buyer account" : "Seller account"}
            </span>

            <div className="space-y-3 pt-4">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Secure your account with OTP
              </h2>
              <p className="text-white/70 text-base leading-relaxed">
                We'll send a one-time password to your mobile number to verify your identity.
              </p>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="space-y-3">
            {[
              { n: 1, label: "Choose your role",    done: true  },
              { n: 2, label: "Verify mobile number", done: false },
              { n: 3, label: "Complete your profile", done: false },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
                  ${s.done ? "bg-white text-primary" : s.n === 2 ? "bg-white/30 text-white ring-2 ring-white" : "bg-white/10 text-white/50"}`}>
                  {s.done ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                </div>
                <span className={`text-sm font-medium ${s.n === 2 ? "text-white" : s.done ? "text-white/80" : "text-white/40"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-10">

            {/* ── Phase: idle — enter mobile ───────────────────── */}
            {otpState === "idle" && (
              <>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Enter your mobile number</h1>
                  <p className="text-muted-foreground">
                    We'll send a 6-digit OTP to verify it's you.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile number</label>
                    <div className="flex gap-3">
                      <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border-2 bg-muted text-sm font-semibold text-muted-foreground">
                        +91
                      </div>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        value={mobile}
                        onChange={(e) => {
                          setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                          setMobileError("")
                        }}
                        disabled={sendingOtp}
                        className="h-12 flex-1 rounded-xl border-2 text-lg tracking-widest font-medium focus-visible:ring-0 focus-visible:border-primary"
                        maxLength={10}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      />
                    </div>
                    {mobileError && (
                      <p className="text-sm text-destructive">{mobileError}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || mobile.length !== 10}
                    className="group w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base
                      flex items-center justify-center gap-2 transition-all
                      hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingOtp
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Sending OTP…</>
                      : <>Send OTP <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                    }
                  </button>
                </div>
              </>
            )}

            {/* ── Phase: sent — enter OTP ──────────────────────── */}
            {otpState === "sent" && (
              <>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Check your messages</h1>
                  <p className="text-muted-foreground">
                    Enter the 6-digit OTP sent to{" "}
                    <span className="font-semibold text-foreground">+91 {mobile.slice(0,3)}•••••{mobile.slice(-2)}</span>
                  </p>
                </div>

                <div className="space-y-8">
                  {/* OTP slots — large and prominent */}
                  <div className="space-y-3">
                    <InputOTP maxLength={6} value={otp}
                      onChange={(v) => { setOtp(v); setOtpError("") }}
                      disabled={verifyingOtp}
                      onComplete={handleVerifyOtp}
                    >
                      <InputOTPGroup className="gap-3 w-full">
                        {[0,1,2,3,4,5].map((i) => (
                          <InputOTPSlot key={i} index={i}
                            className="h-14 flex-1 rounded-xl border-2 text-xl font-bold
                              transition-all data-[active]:border-primary data-[active]:ring-4
                              data-[active]:ring-primary/15" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>

                    {otpError && (
                      <p className="text-sm text-destructive">{otpError}</p>
                    )}
                  </div>

                  {/* Verify button */}
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || otp.length !== 6}
                    className="group w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base
                      flex items-center justify-center gap-2 transition-all
                      hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyingOtp
                      ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying…</>
                      : <>Verify &amp; Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                    }
                  </button>

                  {/* Resend + change number */}
                  <div className="flex items-center justify-between text-sm pt-1 border-t">
                    <button type="button" onClick={resetToIdle}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Change number
                    </button>
                    <button type="button"
                      onClick={handleSendOtp}
                      disabled={!canResend || sendingOtp}
                      className={`flex items-center gap-1.5 font-medium transition-colors
                        ${canResend ? "text-primary hover:text-primary/80" : "text-muted-foreground cursor-not-allowed"}`}
                    >
                      {sendingOtp
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending…</>
                        : canResend
                        ? <><RotateCcw className="h-3.5 w-3.5" />Resend OTP</>
                        : `Resend in ${timer}s`
                      }
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Back to user type */}
            <button type="button" onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to role selection
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}