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

"use client"

import { useState } from "react"
import { UserTypeStep }  from "@/components/register/user-type-step"
import { MobileOtpStep } from "@/components/register/mobile-otp-step"
import { KycFormStep }   from "@/components/register/kyc-form-step"
import { useRouter } from "next/navigation"

type Step     = "userType" | "mobileOtp" | "kycForm"
type UserType = "buyer" | "seller"

export default function RegisterPage() {
  const [step, setStep]                     = useState<Step>("userType")
  const [userType, setUserType]             = useState<UserType | null>(null)
  const [mobileNumber, setMobileNumber]     = useState("")
  const [customerId, setCustomerId]         = useState("")
  const [submissionId, setSubmissionId]     = useState("")
  const [currentStepKey, setCurrentStepKey] = useState("business_details")
  const [totalSteps, setTotalSteps]         = useState(4)   // from onboardingVerifyOtp
  const router = useRouter()

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type)
    setStep("mobileOtp")
  }

  // onboardingVerifyOtp returns customer_id, submission_id, next_step, total_step
  const handleMobileOtpComplete = (
    mobile: string,
    cid: string,
    sid: string,
    nextStep: string,
    total?: number
  ) => {
    setMobileNumber(mobile)
    setCustomerId(cid)
    setSubmissionId(sid)
    setCurrentStepKey(nextStep)
    if (total) setTotalSteps(total)
    setStep("kycForm")
  }

  const handleKycComplete = (_sid: string, nextStepKey: string | null) => {
    if (nextStepKey) {
      setCurrentStepKey(nextStepKey)   // triggers KycFormStep remount via key prop
    } else {
      router.push("/login")
    }
  }

  if (step === "userType") return <UserTypeStep onSelect={handleUserTypeSelect} />

  if (step === "mobileOtp") return (
    <MobileOtpStep
      userType={userType!}
      onComplete={(mobile, cid, sid, nextStep, total) =>
        handleMobileOtpComplete(mobile, cid, sid, nextStep, total)
      }
      onBack={() => setStep("userType")}
    />
  )

  return (
    <KycFormStep
      key={currentStepKey}
      customerId={customerId}
      userType={userType!}
      stepKey={currentStepKey}
      totalSteps={totalSteps}
      onBack={() => setStep("mobileOtp")}
      onComplete={handleKycComplete}
    />
  )
}