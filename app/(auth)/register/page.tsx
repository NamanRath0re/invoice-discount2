// "use client"

// import { useState } from "react"
// import { MobileNumberStep } from "@/components/register/mobile-number-step"
// import { OtpVerificationStep } from "@/components/register/otp-verification-step"
// import { EntitySelectionStep } from "@/components/register/entity-selection-step"
// import { CustomerTypeSelectionStep } from "@/components/register/customer-type-selection-step"
// import { DealerRegistrationForm } from "@/components/register/dealer-registration-form"
// import { BusinessDetailsForm } from "@/components/register/business-details-form"
// import { IndividualCustomerForm } from "@/components/register/individual-customer-form"
// import { useRouter } from "next/navigation"

// type Step = 
//   | "mobile" 
//   | "otp" 
//   | "entity" 
//   | "customerType" 
//   | "dealerForm" 
//   | "businessDetailsForm" 
//   | "individualForm"

// type EntityType = "dealer" | "customer" | null
// type CustomerType = "business" | "individual" | null

// interface BusinessData {
//   companyName: string
//   gstNumber: string
//   businessAddress: string
//   businessCity: string
//   businessState: string
//   businessPincode: string
// }

// export default function RegisterPage() {
//   const [step, setStep] = useState<Step>("mobile")
//   const [mobileNumber, setMobileNumber] = useState("")
//   const [entityType, setEntityType] = useState<EntityType>(null)
//   const [customerType, setCustomerType] = useState<CustomerType>(null)
//   const [businessData, setBusinessData] = useState<BusinessData | null>(null)
//   const router = useRouter()

//   const handleMobileSubmit = (mobile: string) => {
//     setMobileNumber(mobile)
//     setStep("otp")
//   }

//   const handleOtpVerified = () => {
//     setStep("entity")
//   }

//   const handleEntitySelect = (entity: "dealer" | "customer") => {
//     setEntityType(entity)
//     if (entity === "dealer") {
//       setStep("dealerForm")
//     } else {
//       setStep("customerType")
//     }
//   }

//   const handleCustomerTypeSelect = (type: "business" | "individual") => {
//     setCustomerType(type)
//     if (type === "business") {
//       setStep("businessDetailsForm")
//     } else {
//       setStep("individualForm")
//     }
//   }

//   const handleBusinessDetailsComplete = (data: BusinessData) => {
//     setBusinessData(data)
//     setStep("individualForm")
//   }

//   const handleRegistrationComplete = () => {
//     router.push("/login")
//   }

//   const handleBack = () => {
//     switch (step) {
//       case "otp":
//         setStep("mobile")
//         break
//       case "entity":
//         setStep("otp")
//         break
//       case "customerType":
//         setEntityType(null)
//         setStep("entity")
//         break
//       case "dealerForm":
//         setEntityType(null)
//         setStep("entity")
//         break
//       case "businessDetailsForm":
//         setCustomerType(null)
//         setStep("customerType")
//         break
//       case "individualForm":
//         if (customerType === "business") {
//           setStep("businessDetailsForm")
//         } else {
//           setCustomerType(null)
//           setStep("customerType")
//         }
//         break
//     }
//   }

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
//       <div className="w-full max-w-md">
//         {step === "mobile" && (
//           <MobileNumberStep onSubmit={handleMobileSubmit} />
//         )}
//         {step === "otp" && (
//           <OtpVerificationStep
//             mobileNumber={mobileNumber}
//             onVerified={handleOtpVerified}
//             onBack={handleBack}
//             onResendOtp={() => {
//               console.log("Resending OTP to", mobileNumber)
//             }}
//           />
//         )}
//         {step === "entity" && (
//           <EntitySelectionStep
//             onSelect={handleEntitySelect}
//             onBack={handleBack}
//           />
//         )}
//         {step === "customerType" && (
//           <CustomerTypeSelectionStep
//             onSelect={handleCustomerTypeSelect}
//             onBack={handleBack}
//           />
//         )}
//         {step === "dealerForm" && (
//           <DealerRegistrationForm
//             mobileNumber={mobileNumber}
//             onComplete={handleRegistrationComplete}
//             onBack={handleBack}
//           />
//         )}
//         {step === "businessDetailsForm" && (
//           <BusinessDetailsForm
//             onComplete={handleBusinessDetailsComplete}
//             onBack={handleBack}
//           />
//         )}
//         {step === "individualForm" && (
//           <IndividualCustomerForm
//             mobileNumber={mobileNumber}
//             customerType={customerType}
//             businessData={businessData}
//             onComplete={handleRegistrationComplete}
//             onBack={handleBack}
//           />
//         )}
//       </div>
//     </main>
//   )
// }

"use client"

import { useState } from "react"
import { MobileOtpStep } from "@/components/register/mobile-otp-step"
import { EntitySelectionStep } from "@/components/register/entity-selection-step"
import { CustomerTypeSelectionStep } from "@/components/register/customer-type-selection-step"
import { DealerRegistrationForm } from "@/components/register/dealer-registration-form"
import { BusinessDetailsForm } from "@/components/register/business-details-form"
import { IndividualCustomerForm } from "@/components/register/individual-customer-form"
import { useRouter } from "next/navigation"

type Step = "mobileOtp" | "entity" | "customerType" | "dealerForm" | "businessDetailsForm" | "individualForm"
type EntityType   = "dealer" | "customer" | null
type CustomerType = "business" | "individual" | null

interface BusinessData {
  companyName: string; gstNumber: string; businessAddress: string
  businessCity: string; businessState: string; businessPincode: string
}

export default function RegisterPage() {
  const [step, setStep]                 = useState<Step>("mobileOtp")
  const [mobileNumber, setMobileNumber] = useState("")
  const [entityType, setEntityType]     = useState<EntityType>(null)
  const [customerType, setCustomerType] = useState<CustomerType>(null)
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const router = useRouter()

  const handleMobileOtpComplete = (mobile: string, _cid: string) => {
    setMobileNumber(mobile); setStep("entity")
  }

  const handleEntitySelect = (entity: "dealer" | "customer") => {
    setEntityType(entity)
    setStep(entity === "dealer" ? "dealerForm" : "customerType")
  }

  const handleCustomerTypeSelect = (type: "business" | "individual") => {
    setCustomerType(type)
    setStep(type === "business" ? "businessDetailsForm" : "individualForm")
  }

  const handleBack = () => {
    switch (step) {
      case "entity":              setStep("mobileOtp"); break
      case "customerType":        setEntityType(null);  setStep("entity"); break
      case "dealerForm":          setEntityType(null);  setStep("entity"); break
      case "businessDetailsForm": setCustomerType(null); setStep("customerType"); break
      case "individualForm":
        customerType === "business"
          ? setStep("businessDetailsForm")
          : (setCustomerType(null), setStep("customerType"))
        break
    }
  }

  // mobileOtp step renders its own full-page layout
  if (step === "mobileOtp") return <MobileOtpStep onComplete={handleMobileOtpComplete} />

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
      <div className="w-full max-w-md">
        {step === "entity" && (
          <EntitySelectionStep onSelect={handleEntitySelect} onBack={handleBack} />
        )}
        {step === "customerType" && (
          <CustomerTypeSelectionStep onSelect={handleCustomerTypeSelect} onBack={handleBack} />
        )}
        {step === "dealerForm" && (
          <DealerRegistrationForm mobileNumber={mobileNumber}
            onComplete={() => router.push("/login")} onBack={handleBack} />
        )}
        {step === "businessDetailsForm" && (
          <BusinessDetailsForm onComplete={(d) => { setBusinessData(d); setStep("individualForm") }} onBack={handleBack} />
        )}
        {step === "individualForm" && (
          <IndividualCustomerForm mobileNumber={mobileNumber} customerType={customerType}
            businessData={businessData} onComplete={() => router.push("/login")} onBack={handleBack} />
        )}
      </div>
    </main>
  )
}