"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2, CheckCircle2, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react"
import Link from "next/link"

const API_HEADERS = {
  "Content-Type": "application/json",
  "X-Tenant-Code": "demo",
  "Accept": "application/json",
}
const BASE = "https://192.168.6.6/2013/api/v1"
const RESEND_SECS = 30

type OtpState = "idle" | "sent" | "verified"

interface MobileOtpStepProps {
  onComplete: (mobile: string, customerId: string) => void
}

export function MobileOtpStep({ onComplete }: MobileOtpStepProps) {
  const [mobile, setMobile]             = useState("")
  const [otp, setOtp]                   = useState("")
  const [otpState, setOtpState]         = useState<OtpState>("idle")
  const [sendingOtp, setSendingOtp]     = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [mobileError, setMobileError]   = useState("")
  const [otpError, setOtpError]         = useState("")
  const [submitError, setSubmitError]   = useState("")
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
      const res = await fetch(`${BASE}/kyc/send-otp`, {
        method: "POST", headers: API_HEADERS,
        body: JSON.stringify({ mobile }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message ?? "Failed to send OTP")
      setOtpState("sent"); setOtp(""); setOtpError(""); startTimer()
    } catch (e) {
      setMobileError(e instanceof Error ? e.message : "Failed to send OTP")
    } finally { setSendingOtp(false) }
  }

  const handleVerifyOtp = async () => {
    setOtpError("")
    if (otp.length !== 6) { setOtpError("Please enter the complete 6-digit OTP"); return }
    setVerifyingOtp(true)
    try {
      const res = await fetch(`${BASE}/kyc/verifyOtp`, {
        method: "POST", headers: API_HEADERS,
        body: JSON.stringify({ mobile, otp }),
      })
      const data = await res.json()
      if (!data.success || !data.data?.verified)
        throw new Error(data.message ?? "Invalid OTP. Please try again.")
      setOtpState("verified")
      if (timerRef.current) clearInterval(timerRef.current)
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Verification failed")
    } finally { setVerifyingOtp(false) }
  }

  const handleSubmit = async () => {
    setSubmitError("")
    setSubmitting(true)
    try {
      const res = await fetch(`${BASE}/kyc/submitCustomer`, {
        method: "POST", headers: API_HEADERS,
        body: JSON.stringify({ mobile }),
      })
      const data = await res.json()
      if (!data.success || !data.data?.[0])
        throw new Error(data.message ?? "Submission failed")
      onComplete(mobile, String(data.data[0].customer_id))
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.")
    } finally { setSubmitting(false) }
  }

  const resetFlow = () => {
    setOtpState("idle"); setOtp(""); setOtpError("")
    if (timerRef.current) clearInterval(timerRef.current)
    setTimer(0); setCanResend(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/60 via-background to-muted/30 px-4">
      <div className="w-full max-w-sm">

        {/* ── Card ──────────────────────────────────────────────── */}
        <div className="rounded-2xl border bg-background shadow-xl shadow-black/5 overflow-hidden">

          {/* Top accent bar */}
          <div className="w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60" />

          <div className="px-8 pt-8 pb-10 space-y-8">

            {/* ── Header ────────────────────────────────────────── */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Verify your number</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {otpState === "idle"
                  ? "Enter your mobile number to get started"
                  : otpState === "sent"
                  ? <>OTP sent to <span className="font-medium text-foreground">+91 ••••••{mobile.slice(-4)}</span></>
                  : <>Mobile <span className="font-medium text-foreground">+91 ••••••{mobile.slice(-4)}</span> verified</>
                }
              </p>
            </div>

            {/* ── Step 1: Mobile input ───────────────────────────── */}
            <div className="space-y-3">
              {/* <label className="text-sm font-medium text-foreground">Mobile Number</label> */}
              <div className="flex gap-2">
                <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl border bg-muted text-sm font-medium text-muted-foreground">
                  +91
                </div>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    setMobileError("")
                    if (otpState !== "idle") resetFlow()
                  }}
                  disabled={sendingOtp || otpState === "verified"}
                  className="h-11 flex-1 rounded-xl text-base tracking-widest"
                  maxLength={10}
                />
              </div>
              {mobileError && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
                  {mobileError}
                </p>
              )}

              {/* Send / Resend button */}
              {otpState !== "verified" && (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || mobile.length !== 10 || (otpState === "sent" && !canResend)}
                  variant={otpState === "sent" ? "outline" : "default"}
                  className="w-full h-11 rounded-xl font-medium"
                >
                  {sendingOtp ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP…</>
                  ) : otpState === "idle" ? (
                    <><ArrowRight className="mr-2 h-4 w-4" />Send OTP</>
                  ) : canResend ? (
                    <><RotateCcw className="mr-2 h-4 w-4" />Resend OTP</>
                  ) : (
                    <>Resend OTP in {timer}s</>
                  )}
                </Button>
              )}
            </div>

            {/* ── Step 2: OTP input (slides in after send) ──────── */}
            {otpState !== "idle" && (
              <div className="space-y-4">
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs text-muted-foreground">
                      Enter 6-digit OTP
                    </span>
                  </div>
                </div>

                {/* Centered OTP slots */}
                <div className="flex flex-col items-center gap-3">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(v) => { setOtp(v); setOtpError("") }}
                    disabled={verifyingOtp || otpState === "verified"}
                  >
                    <InputOTPGroup className="gap-2">
                      {[0,1,2,3,4,5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="h-12 w-11 rounded-xl border-2 text-base font-bold transition-all focus:border-primary data-[active]:border-primary data-[active]:ring-2 data-[active]:ring-primary/20"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>

                  {otpError && (
                    <p className="text-xs text-destructive flex items-center gap-1.5">
                      <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
                      {otpError}
                    </p>
                  )}

                  {/* Verify button — only when not yet verified */}
                  {otpState === "sent" && (
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otp.length !== 6}
                      className="w-full h-11 rounded-xl font-medium"
                    >
                      {verifyingOtp ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying…</>
                      ) : (
                        <><ShieldCheck className="mr-2 h-4 w-4" />Verify OTP</>
                      )}
                    </Button>
                  )}

                  {/* Verified state badge */}
                  {otpState === "verified" && (
                    <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-950/30 px-4 py-2.5 text-sm font-medium text-green-700 dark:text-green-400 w-full justify-center">
                      <CheckCircle2 className="h-4 w-4" />
                      OTP verified successfully
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 3: Continue (after verified) ─────────────── */}
            {otpState === "verified" && (
              <div className="space-y-2 pt-1">
                {submitError && (
                  <p className="text-xs text-destructive flex items-center gap-1.5">
                    <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
                    {submitError}
                  </p>
                )}
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full h-12 rounded-xl text-base font-semibold"
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
                  ) : (
                    <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer link ─────────────────────────────────────────── */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}