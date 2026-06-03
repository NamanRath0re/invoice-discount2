"use client"

import { useState, useEffect } from "react"
import { UserTypeStep }  from "@/components/register/user-type-step"
import { MobileOtpStep } from "@/components/register/mobile-otp-step"
import { KycFormStep }   from "@/components/register/kyc-form-step"
import { useRouter } from "next/navigation"

type Step     = "userType" | "mobileOtp" | "kycForm"
type UserType = "buyer" | "seller"

const SESSION_KEY = "reg_state"

interface RegState {
  step:           Step
  userType:       UserType | null
  mobileNumber:   string
  customerId:     string
  submissionId:   string
  currentStepKey: string
  totalSteps:     number
  completedSteps: string[]
  stepNames:      Record<string, string>
}

const DEFAULT_STATE: RegState = {
  step:           "userType",
  userType:       null,
  mobileNumber:   "",
  customerId:     "",
  submissionId:   "",
  currentStepKey: "business_details",
  totalSteps:     4,
  completedSteps: ["mobile_verification"],
  stepNames:      { mobile_verification: "Mobile Verification" },
}

function loadState(): RegState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_STATE
}

function saveState(s: RegState) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch {}
}

function clearState() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}

export default function RegisterPage() {
  const [state, setStateRaw] = useState<RegState>(DEFAULT_STATE)
  const [hydrated, setHydrated] = useState(false)
  const router = useRouter()

  // Hydrate from sessionStorage on first render (client only)
  useEffect(() => {
    setStateRaw(loadState())
    setHydrated(true)
  }, [])

  // Persist every state change to sessionStorage
  const setState = (updater: Partial<RegState> | ((prev: RegState) => Partial<RegState>)) => {
    setStateRaw((prev) => {
      const patch  = typeof updater === "function" ? updater(prev) : updater
      const next   = { ...prev, ...patch }
      saveState(next)
      return next
    })
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleUserTypeSelect = (type: UserType) => {
    setState({ userType: type, step: "mobileOtp" })
  }

  const handleMobileOtpComplete = (
    mobile: string, cid: string, sid: string, nextStep: string, total?: number
  ) => {
    setState({
      mobileNumber:   mobile,
      customerId:     cid,
      submissionId:   sid,
      currentStepKey: nextStep,
      step:           "kycForm",
      ...(total ? { totalSteps: total } : {}),
    })
  }

  const handleKycComplete = (newSid: string, nextStepKey: string | null) => {
    if (nextStepKey) {
      setState((prev) => ({
        submissionId:   newSid,
        currentStepKey: nextStepKey,
        completedSteps: prev.completedSteps.includes(prev.currentStepKey)
          ? prev.completedSteps
          : [...prev.completedSteps, prev.currentStepKey],
      }))
    } else {
      clearState()
      router.push("/login")
    }
  }

  const handleGoToStep = (stepKey: string) => {
    if (state.completedSteps.includes(stepKey) && stepKey !== "mobile_verification") {
      setState({ currentStepKey: stepKey })
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  // Don't render until hydrated to avoid SSR/client mismatch
  if (!hydrated) return null

  const { step, userType, customerId, submissionId, currentStepKey,
          totalSteps, completedSteps, stepNames } = state

  if (step === "userType") {
    return <UserTypeStep onSelect={handleUserTypeSelect} />
  }

  if (step === "mobileOtp") {
    return (
      <MobileOtpStep
        userType={userType!}
        onComplete={handleMobileOtpComplete}
        onBack={() => setState({ step: "userType" })}
      />
    )
  }

  return (
    <KycFormStep
      key={currentStepKey}
      customerId={customerId}
      userType={userType!}
      stepKey={currentStepKey}
      totalSteps={totalSteps}
      submissionId={submissionId}
      completedSteps={completedSteps}
      stepNames={stepNames}
      onBack={() => setState({ step: "mobileOtp" })}
      onComplete={handleKycComplete}
      onGoToStep={handleGoToStep}
    />
  )
}