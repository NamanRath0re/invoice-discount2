"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Loader2, Search } from "lucide-react"
import Link from "next/link"

const API_HEADERS = {
  "Content-Type": "application/json",
  "X-Tenant-Code": "demo",
  "Accept":        "application/json",
}
const BASE      = "https://192.168.6.6/2013/api/v1"
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

interface GstData {
  gst_number: string
  name:       string
  state:      string
  status:     string
}

interface GstVerificationStepProps {
  customerId: string
  onBack:     () => void
  onComplete: (gstData: { gstNumber: string; name: string; state: string }) => void
}

export function GstVerificationStep({ customerId, onBack, onComplete }: GstVerificationStepProps) {
  const [gstNumber, setGstNumber]       = useState("")
  const [verified, setVerified]         = useState(false)
  const [gstData, setGstData]           = useState<GstData | null>(null)
  const [editName, setEditName]         = useState("")
  const [editState, setEditState]       = useState("")
  const [verifying, setVerifying]       = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [gstError, setGstError]         = useState("")
  const [submitError, setSubmitError]   = useState("")

  const reset = () => {
    setVerified(false); setGstData(null)
    setEditName(""); setEditState("")
    setGstError(""); setSubmitError("")
  }

  const handleVerify = async () => {
    setGstError("")
    if (!gstNumber.trim()) { setGstError("Please enter your GST number"); return }
    if (!GST_REGEX.test(gstNumber.toUpperCase())) {
      setGstError("Enter a valid 15-character GST number (e.g. 22ABCDE1234F1Z5)")
      return
    }
    setVerifying(true)
    try {
      const res  = await fetch(`${BASE}/kyc/fetchGstDetails`, {
        method: "POST", headers: API_HEADERS,
        body: JSON.stringify({ gst_number: gstNumber.toUpperCase(), party_id: "10" }),
      })
      const data = await res.json()
      if (!data.success || !data.data) throw new Error(data.message ?? "Could not fetch GST details")
      setGstData(data.data)
      setEditName(data.data.name ?? "")
      setEditState(data.data.state ?? "")
      setVerified(true)
    } catch (e) {
      setGstError(e instanceof Error ? e.message : "GST verification failed. Please try again.")
    } finally { setVerifying(false) }
  }

  const handleSubmit = async () => {
    setSubmitError("")
    setSubmitting(true)
    try {
      // TODO: replace with real submit API endpoint when backend provides it
      // const res  = await fetch(`${BASE}/kyc/submitGst`, {
      //   method: "POST", headers: API_HEADERS,
      //   body: JSON.stringify({
      //     gst_number: gstNumber.toUpperCase(),
      //     name:       editName,
      //     state:      editState,
      //     customer_id: customerId,
      //   }),
      // })
      // const data = await res.json()
      // if (!data.success) throw new Error(data.message ?? "Submission failed")
      await new Promise((r) => setTimeout(r, 500)) // remove when real API is wired
      onComplete({ gstNumber: gstNumber.toUpperCase(), name: editName, state: editState })
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.")
    } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/60 via-background to-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border bg-background shadow-xl shadow-black/5 overflow-hidden">
          <div className="w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60" />

          <div className="px-8 pt-8 pb-10 space-y-7">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">GST Verification</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {verified
                  ? "Review and confirm your business details"
                  : "Enter your GST number to verify your business"}
              </p>
            </div>

            {/* GST input row */}
            <div className="space-y-2">
              <label className="text-sm font-medium">GST Number</label>
              <div className="flex gap-2">
                <Input
                  placeholder="22ABCDE1234F1Z5"
                  value={gstNumber}
                  onChange={(e) => {
                    setGstNumber(e.target.value.toUpperCase().slice(0, 15))
                    setGstError("")
                    if (verified) reset()
                  }}
                  disabled={verifying || submitting}
                  className="h-11 rounded-xl font-mono tracking-widest uppercase"
                  maxLength={15}
                />
                <Button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || gstNumber.length !== 15 || verified}
                  className="h-11 w-11 px-0 shrink-0 rounded-xl"
                  variant={verified ? "outline" : "default"}
                >
                  {verifying
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : verified
                    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                    : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {gstError && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-destructive inline-block" />{gstError}
                </p>
              )}
            </div>

            {/* Verified details */}
            {verified && gstData && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-950/30 px-4 py-2.5 text-sm font-medium text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  GST verified · Status: <span className="font-semibold ml-1">{gstData.status}</span>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs text-muted-foreground">Review &amp; edit if needed</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)}
                    disabled={submitting} className="h-11 rounded-xl" placeholder="Business name" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">State</label>
                  <Input value={editState} onChange={(e) => setEditState(e.target.value)}
                    disabled={submitting} className="h-11 rounded-xl" placeholder="State" />
                </div>

                {submitError && (
                  <p className="text-xs text-destructive flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-destructive inline-block" />{submitError}
                  </p>
                )}

                <Button type="button" onClick={handleSubmit}
                  disabled={submitting || !editName.trim() || !editState.trim()}
                  className="w-full h-12 rounded-xl text-base font-semibold">
                  {submitting
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                    : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
            )}

            <button type="button" onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto">
              <ArrowLeft className="h-3.5 w-3.5" />Back to mobile verification
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}