// "use client"

// import { useState } from "react"
// import { MobileOtpStep }        from "@/components/register/mobile-otp-step"
// import { GstVerificationStep }  from "@/components/register/gst-verification-step"
// import { KycFormStep }          from "@/components/register/kyc-form-step"
// import { useRouter } from "next/navigation"

// type Step = "mobileOtp" | "gstVerification" | "kycForm"

// interface GstResult {
//   gstNumber: string
//   name:      string
//   state:     string
// }

// export default function RegisterPage() {
//   const [step, setStep]               = useState<Step>("mobileOtp")
//   const [mobileNumber, setMobileNumber] = useState("")
//   const [customerId, setCustomerId]     = useState("")
//   const [gstResult, setGstResult]       = useState<GstResult | null>(null)
//   const [currentStepKey, setCurrentStepKey] = useState("business_details")
//   const router = useRouter()

//   // Step 1 complete → save mobile + customerId → go to GST
//   const handleMobileOtpComplete = (mobile: string, cid: string) => {
//     setMobileNumber(mobile)
//     setCustomerId(cid)
//     setStep("gstVerification")
//   }

//   // Step 2 complete → save GST data → go to KYC form
//   const handleGstComplete = (data: GstResult) => {
//     setGstResult(data)
//     setCurrentStepKey("business_details")
//     setStep("kycForm")
//   }

//   // Step 3 complete → if next_step_key exists, reload form for next step
//   // otherwise registration is done → redirect to login
//   const handleKycComplete = (_submissionId: string, nextStepKey: string | null) => {
//     if (nextStepKey) {
//       setCurrentStepKey(nextStepKey)
//       // Force remount by briefly going back and forward
//       setStep("gstVerification")
//       setTimeout(() => setStep("kycForm"), 0)
//     } else {
//       router.push("/login")
//     }
//   }

//   if (step === "mobileOtp") {
//     return <MobileOtpStep onComplete={handleMobileOtpComplete} />
//   }

//   if (step === "gstVerification") {
//     return (
//       <GstVerificationStep
//         customerId={customerId}
//         onBack={() => setStep("mobileOtp")}
//         onComplete={handleGstComplete}
//       />
//     )
//   }

//   return (
//     <KycFormStep
//       customerId={customerId}
//       stepKey={currentStepKey}
//       onBack={() => setStep("gstVerification")}
//       onComplete={handleKycComplete}
//     />
//   )
// }

// "use client"

// import { useState } from "react"
// import { UserTypeStep }        from "@/components/register/user-type-step"
// import { MobileOtpStep }       from "@/components/register/mobile-otp-step"
// import { KycFormStep }         from "@/components/register/kyc-form-step"
// import { useRouter } from "next/navigation"

// type Step     = "userType" | "mobileOtp" | "kycForm"
// type UserType = "buyer" | "seller"

// export default function RegisterPage() {
//   const [step, setStep]                     = useState<Step>("userType")
//   const [userType, setUserType]             = useState<UserType | null>(null)
//   const [mobileNumber, setMobileNumber]     = useState("")
//   const [customerId, setCustomerId]         = useState("")
//   const [submissionId, setSubmissionId]     = useState("")
//   const [currentStepKey, setCurrentStepKey] = useState("business_details")
//   const router = useRouter()

//   // Step 0 — user selected type
//   const handleUserTypeSelect = (type: UserType) => {
//     setUserType(type)
//     setStep("mobileOtp")
//   }

//   // Step 1 — OTP verified → API returns customer_id, submission_id, next_step
//   const handleMobileOtpComplete = (
//     mobile: string,
//     cid: string,
//     sid: string,
//     nextStep: string
//   ) => {
//     setMobileNumber(mobile)
//     setCustomerId(cid)
//     setSubmissionId(sid)
//     setCurrentStepKey(nextStep)   // e.g. "business_details"
//     setStep("kycForm")
//   }

//   // Step 2+ — KYC form steps (loops through next_step_key)
//   const handleKycComplete = (_sid: string, nextStepKey: string | null) => {
//     if (nextStepKey) {
//       setCurrentStepKey(nextStepKey)
//       // Force remount for next step
//       setStep("mobileOtp")
//       setTimeout(() => setStep("kycForm"), 0)
//     } else {
//       router.push("/login")
//     }
//   }

//   if (step === "userType") {
//     return <UserTypeStep onSelect={handleUserTypeSelect} />
//   }

//   if (step === "mobileOtp") {
//     return (
//       <MobileOtpStep
//         userType={userType!}
//         onComplete={handleMobileOtpComplete}
//         onBack={() => setStep("userType")}
//       />
//     )
//   }

//   return (
//     <KycFormStep
//       customerId={customerId}
//       stepKey={currentStepKey}
//       onBack={() => setStep("mobileOtp")}
//       onComplete={handleKycComplete}
//     />
//   )
// }

// "use client"

// import { useState } from "react"
// import { UserTypeStep }  from "@/components/register/user-type-step"
// import { MobileOtpStep } from "@/components/register/mobile-otp-step"
// import { KycFormStep }   from "@/components/register/kyc-form-step"
// import { useRouter } from "next/navigation"

// type Step     = "userType" | "mobileOtp" | "kycForm"
// type UserType = "buyer" | "seller"

// export default function RegisterPage() {
//   const [step, setStep]                     = useState<Step>("userType")
//   const [userType, setUserType]             = useState<UserType | null>(null)
//   const [mobileNumber, setMobileNumber]     = useState("")
//   const [customerId, setCustomerId]         = useState("")
//   const [submissionId, setSubmissionId]     = useState("")
//   const [currentStepKey, setCurrentStepKey] = useState("business_details")
//   const [totalSteps, setTotalSteps]         = useState(4)   // from onboardingVerifyOtp
//   const router = useRouter()

//   const handleUserTypeSelect = (type: UserType) => {
//     setUserType(type)
//     setStep("mobileOtp")
//   }

//   // onboardingVerifyOtp returns customer_id, submission_id, next_step, total_step
//   const handleMobileOtpComplete = (
//     mobile: string,
//     cid: string,
//     sid: string,
//     nextStep: string,
//     total?: number
//   ) => {
//     setMobileNumber(mobile)
//     setCustomerId(cid)
//     setSubmissionId(sid)
//     setCurrentStepKey(nextStep)
//     if (total) setTotalSteps(total)
//     setStep("kycForm")
//   }

//   const handleKycComplete = (_sid: string, nextStepKey: string | null) => {
//     if (nextStepKey) {
//       setCurrentStepKey(nextStepKey)
//       setStep("mobileOtp")
//       setTimeout(() => setStep("kycForm"), 0)
//     } else {
//       router.push("/login")
//     }
//   }

//   if (step === "userType") return <UserTypeStep onSelect={handleUserTypeSelect} />

//   if (step === "mobileOtp") return (
//     <MobileOtpStep
//       userType={userType!}
//       onComplete={(mobile, cid, sid, nextStep, total) =>
//         handleMobileOtpComplete(mobile, cid, sid, nextStep, total)
//       }
//       onBack={() => setStep("userType")}
//     />
//   )

//   return (
//     <KycFormStep
//       customerId={customerId}
//       userType={userType!}
//       stepKey={currentStepKey}
//       totalSteps={totalSteps}
//       onBack={() => setStep("mobileOtp")}
//       onComplete={handleKycComplete}
//     />
//   )
// }
// "use client"

// import { useState } from "react"
// import { UserTypeStep }  from "@/components/register/user-type-step"
// import { MobileOtpStep } from "@/components/register/mobile-otp-step"
// import { KycFormStep }   from "@/components/register/kyc-form-step"
// import { useRouter } from "next/navigation"

// type Step     = "userType" | "mobileOtp" | "kycForm"
// type UserType = "buyer" | "seller"

// export default function RegisterPage() {
//   const [step, setStep]               = useState<Step>("userType")
//   const [userType, setUserType]       = useState<UserType | null>(null)
//   const [mobileNumber, setMobileNumber] = useState("")
//   const [customerId, setCustomerId]   = useState("")
//   const [submissionId, setSubmissionId] = useState("")   // latest submission_id (updated after each step submit)
//   const [currentStepKey, setCurrentStepKey] = useState("business_details")
//   const [totalSteps, setTotalSteps]   = useState(4)
//   const [completedSteps, setCompletedSteps] = useState<string[]>(["mobile_verification"])
//   const [stepNames, setStepNames]     = useState<Record<string, string>>({
//     mobile_verification: "Mobile Verification",
//   })
//   const router = useRouter()

//   // Step 0 — user type selected
//   const handleUserTypeSelect = (type: UserType) => {
//     setUserType(type)
//     setStep("mobileOtp")
//   }

//   // Step 1 — OTP verified → go to first KYC step
//   const handleMobileOtpComplete = (
//     mobile: string, cid: string, sid: string, nextStep: string, total?: number
//   ) => {
//     setMobileNumber(mobile)
//     setCustomerId(cid)
//     setSubmissionId(sid)
//     setCurrentStepKey(nextStep)
//     if (total) setTotalSteps(total)
//     setStep("kycForm")
//   }

//   // Step N — KYC form submitted → update submission_id, mark step complete, move to next
//   const handleKycComplete = (newSid: string, nextStepKey: string | null) => {
//     setSubmissionId(newSid)

//     // Mark current step as completed
//     setCompletedSteps((prev) =>
//       prev.includes(currentStepKey) ? prev : [...prev, currentStepKey]
//     )

//     if (nextStepKey) {
//       setCurrentStepKey(nextStepKey)
//       // key={currentStepKey} on KycFormStep causes clean remount
//     } else {
//       router.push("/login")
//     }
//   }

//   // Stepper click — navigate back to a completed step
//   const handleGoToStep = (stepKey: string) => {
//     if (completedSteps.includes(stepKey) && stepKey !== "mobile_verification") {
//       setCurrentStepKey(stepKey)
//     }
//   }

//   // Store step name when we learn it from the API (via KycFormStep)
//   // KycFormStep calls onComplete with the submission — we learn step names from getKycForm response
//   // Pass a callback to capture them
//   const handleStepNameLearned = (key: string, name: string) => {
//     setStepNames((prev) => ({ ...prev, [key]: name }))
//   }

//   if (step === "userType") return <UserTypeStep onSelect={handleUserTypeSelect} />

//   if (step === "mobileOtp") return (
//     <MobileOtpStep
//       userType={userType!}
//       onComplete={(mobile, cid, sid, nextStep, total) =>
//         handleMobileOtpComplete(mobile, cid, sid, nextStep, total)
//       }
//       onBack={() => setStep("userType")}
//     />
//   )

//   return (
//     <KycFormStep
//       key={currentStepKey}
//       customerId={customerId}
//       userType={userType!}
//       stepKey={currentStepKey}
//       totalSteps={totalSteps}
//       submissionId={submissionId}
//       completedSteps={completedSteps}
//       stepNames={stepNames}
//       onBack={() => setStep("mobileOtp")}
//       onComplete={handleKycComplete}
//       onGoToStep={handleGoToStep}
//     />
//   )
// }

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