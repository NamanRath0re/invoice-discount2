"use client"

import { useState } from "react"
import { MobileOtpStep }        from "@/components/register/mobile-otp-step"
import { GstVerificationStep }  from "@/components/register/gst-verification-step"
import { KycFormStep }          from "@/components/register/kyc-form-step"
import { useRouter } from "next/navigation"

type Step = "mobileOtp" | "gstVerification" | "kycForm"

interface GstResult {
  gstNumber: string
  name:      string
  state:     string
}

export default function RegisterPage() {
  const [step, setStep]               = useState<Step>("mobileOtp")
  const [mobileNumber, setMobileNumber] = useState("")
  const [customerId, setCustomerId]     = useState("")
  const [gstResult, setGstResult]       = useState<GstResult | null>(null)
  const [currentStepKey, setCurrentStepKey] = useState("business_details")
  const router = useRouter()

  // Step 1 complete → save mobile + customerId → go to GST
  const handleMobileOtpComplete = (mobile: string, cid: string) => {
    setMobileNumber(mobile)
    setCustomerId(cid)
    setStep("gstVerification")
  }

  // Step 2 complete → save GST data → go to KYC form
  const handleGstComplete = (data: GstResult) => {
    setGstResult(data)
    setCurrentStepKey("business_details")
    setStep("kycForm")
  }

  // Step 3 complete → if next_step_key exists, reload form for next step
  // otherwise registration is done → redirect to login
  const handleKycComplete = (_submissionId: string, nextStepKey: string | null) => {
    if (nextStepKey) {
      setCurrentStepKey(nextStepKey)
      // Force remount by briefly going back and forward
      setStep("gstVerification")
      setTimeout(() => setStep("kycForm"), 0)
    } else {
      router.push("/login")
    }
  }

  if (step === "mobileOtp") {
    return <MobileOtpStep onComplete={handleMobileOtpComplete} />
  }

  if (step === "gstVerification") {
    return (
      <GstVerificationStep
        customerId={customerId}
        onBack={() => setStep("mobileOtp")}
        onComplete={handleGstComplete}
      />
    )
  }

  return (
    <KycFormStep
      customerId={customerId}
      stepKey={currentStepKey}
      onBack={() => setStep("gstVerification")}
      onComplete={handleKycComplete}
    />
  )
}