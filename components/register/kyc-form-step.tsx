// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { ArrowLeft, ArrowRight, ClipboardList, Loader2 } from "lucide-react"
// import Link from "next/link"
// import { cn } from "@/lib/utils"

// const API_HEADERS = {
//   "Content-Type": "application/json",
//   "X-Tenant-Code": "demo",
//   "Accept":        "application/json",
// }
// const BASE = "https://192.168.6.6/2013/api/v1"

// // ─── API shapes ───────────────────────────────────────────────────────────────

// interface FieldOption {
//   key:   string
//   label: string
//   value: string
// }

// interface FieldCondition {
//   depends_on: string
//   operator:   "equals" | "not_equals"
//   value:      string
// }

// export interface FormField {
//   key:        string
//   type:       "text" | "textarea" | "select" | "number" | "email" | "date"
//   label:      string
//   required?:  boolean
//   options?:   FieldOption[]
//   conditions?: FieldCondition[]
// }

// interface FormStep {
//   step_key:      string
//   next_step_key: string | null
//   step_name:     string
//   step_order:    string
// }

// interface RenderedForm {
//   fields:    FormField[]
//   step_key:  string
//   step_name: string
// }

// interface KycFormData {
//   form_id:       string
//   form_version:  string
//   submission_id: string
//   step:          FormStep
//   rendered_form: RenderedForm
// }

// interface KycFormStepProps {
//   customerId: string
//   stepKey?:   string          // defaults to "business_details"
//   onBack:     () => void
//   onComplete: (submissionId: string, nextStepKey: string | null) => void
// }

// // ─── Condition evaluator ─────────────────────────────────────────────────────

// function isFieldVisible(field: FormField, values: Record<string, string>): boolean {
//   if (!field.conditions?.length) return true
//   return field.conditions.every((c) => {
//     const actual = values[c.depends_on] ?? ""
//     return c.operator === "equals"
//       ? actual === c.value
//       : actual !== c.value
//   })
// }

// // ─── Individual field renderer ───────────────────────────────────────────────

// function DynamicField({
//   field,
//   value,
//   onChange,
//   disabled,
//   error,
// }: {
//   field:    FormField
//   value:    string
//   onChange: (v: string) => void
//   disabled: boolean
//   error?:   string
// }) {
//   const base = "h-11 rounded-xl w-full"

//   return (
//     <div className="space-y-1.5">
//       <label className="text-sm font-medium">
//         {field.label}
//         {field.required && <span className="text-destructive ml-0.5">*</span>}
//       </label>

//       {field.type === "textarea" ? (
//         <textarea
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           disabled={disabled}
//           rows={3}
//           placeholder={`Enter ${field.label.toLowerCase()}`}
//           className={cn(
//             "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm",
//             "placeholder:text-muted-foreground focus:outline-none focus:ring-2",
//             "focus:ring-ring focus:ring-offset-0 disabled:opacity-50 resize-none",
//             error && "border-destructive"
//           )}
//         />
//       ) : field.type === "select" ? (
//         <select
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           disabled={disabled}
//           className={cn(
//             "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm",
//             "focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
//             "appearance-none cursor-pointer",
//             !value && "text-muted-foreground",
//             error && "border-destructive"
//           )}
//         >
//           <option value="">Select {field.label}</option>
//           {field.options?.map((opt) => (
//             <option key={opt.key} value={opt.value}>{opt.label}</option>
//           ))}
//         </select>
//       ) : (
//         <Input
//           type={field.type}
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           disabled={disabled}
//           placeholder={`Enter ${field.label.toLowerCase()}`}
//           className={cn(base, error && "border-destructive")}
//         />
//       )}

//       {error && (
//         <p className="text-xs text-destructive flex items-center gap-1.5">
//           <span className="h-1 w-1 rounded-full bg-destructive inline-block" />{error}
//         </p>
//       )}
//     </div>
//   )
// }

// // ─── Main component ──────────────────────────────────────────────────────────

// export function KycFormStep({
//   customerId,
//   stepKey = "business_details",
//   onBack,
//   onComplete,
// }: KycFormStepProps) {
//   const [formData, setFormData]   = useState<KycFormData | null>(null)
//   const [values, setValues]       = useState<Record<string, string>>({})
//   const [errors, setErrors]       = useState<Record<string, string>>({})
//   const [loading, setLoading]     = useState(true)
//   const [submitting, setSubmitting] = useState(false)
//   const [fetchError, setFetchError] = useState("")
//   const [submitError, setSubmitError] = useState("")

//   // ── Fetch form definition from API ────────────────────────────────────────
//   const fetchForm = useCallback(async () => {
//     setLoading(true)
//     setFetchError("")
//     try {
//       const res  = await fetch(`${BASE}/kyc/getKycForm`, {
//         method:  "POST",
//         headers: API_HEADERS,
//         body: JSON.stringify({
//           form_type:    "onboarding",
//           actor:        "buyer",
//           product_code: "SCF",
//           scheme_code:  "DEFAULT",
//           customer_id:  customerId,
//           step_key:     stepKey,
//         }),
//       })
//       const data = await res.json()
//       console.log("Fetch form response:", data)
//       if (!data.success || !data.data?.[0]) throw new Error(data.message ?? "Failed to load form")

//       const form: KycFormData = data.data[0]
//       setFormData(form)

//       // Initialise all field values to ""
//       const init: Record<string, string> = {}
//       form.rendered_form.fields.forEach((f) => { init[f.key] = "" })
//       setValues(init)
//     } catch (e) {
//       setFetchError(e instanceof Error ? e.message : "Failed to load form. Please try again.")
//     } finally { setLoading(false) }
//   }, [customerId, stepKey])

//   useEffect(() => { fetchForm() }, [fetchForm])

//   const setValue = (key: string, val: string) => {
//     setValues((prev) => ({ ...prev, [key]: val }))
//     setErrors((prev) => ({ ...prev, [key]: "" }))
//   }

//   // ── Validate visible required fields ─────────────────────────────────────
//   const validate = (): boolean => {
//     if (!formData) return false
//     const newErrors: Record<string, string> = {}
//     formData.rendered_form.fields.forEach((f) => {
//       if (!isFieldVisible(f, values)) return
//       if (f.required && !values[f.key]?.trim()) {
//         newErrors[f.key] = `${f.label} is required`
//       }
//     })
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (!validate() || !formData) return
//     setSubmitError("")
//     setSubmitting(true)

//     // Build payload — only include visible fields
//     const payload: Record<string, string> = {}
//     formData.rendered_form.fields.forEach((f) => {
//       if (isFieldVisible(f, values)) payload[f.key] = values[f.key] ?? ""
//     })

//     try {
//       // TODO: replace with real submit API when backend provides it
//       // const res  = await fetch(`${BASE}/kyc/submitKycForm`, {
//       //   method: "POST", headers: API_HEADERS,
//       //   body: JSON.stringify({
//       //     form_id:       formData.form_id,
//       //     submission_id: formData.submission_id,
//       //     customer_id:   customerId,
//       //     step_key:      stepKey,
//       //     data:          payload,
//       //   }),
//       // })
//       // const data = await res.json()
//       // if (!data.success) throw new Error(data.message ?? "Submission failed")
//       await new Promise((r) => setTimeout(r, 600)) // remove when real API is wired

//       onComplete(formData.submission_id, formData.step.next_step_key)
//     } catch (e) {
//       setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.")
//     } finally { setSubmitting(false) }
//   }

//   // ── Visible fields ────────────────────────────────────────────────────────
//   const visibleFields = formData?.rendered_form.fields.filter(
//     (f) => isFieldVisible(f, values)
//   ) ?? []

//   // textarea and select fields span the full 2 columns — everything else goes in the grid
//   const isFullWidth = (type: FormField["type"]) => type === "textarea"

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/60 via-background to-muted/30 px-4 py-10">
//       <div className="w-full max-w-3xl">
//         <div className="rounded-2xl border bg-background shadow-xl shadow-black/5 overflow-hidden">
//           <div className="w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60" />

//           <div className="px-10 pt-8 pb-10 space-y-8">

//             {/* Header */}
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center">
//                 <ClipboardList className="h-6 w-6 text-primary" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold tracking-tight">
//                   {loading ? "Loading form…" : (formData?.rendered_form.step_name ?? "KYC Form")}
//                 </h1>
//                 <p className="text-sm text-muted-foreground mt-0.5">
//                   Fill in the details below to continue
//                 </p>
//               </div>
//             </div>

//             {/* Divider */}
//             <div className="border-t" />

//             {/* Loading skeleton — 2-col grid */}
//             {loading && (
//               <div className="grid grid-cols-2 gap-x-6 gap-y-5">
//                 {[1, 2, 3, 4, 5, 6].map((i) => (
//                   <div key={i} className="space-y-1.5">
//                     <div className="h-3.5 w-20 rounded-md bg-muted animate-pulse" />
//                     <div className="h-11 w-full rounded-xl bg-muted animate-pulse" />
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Fetch error */}
//             {!loading && fetchError && (
//               <div className="flex flex-col items-center gap-3 py-6">
//                 <p className="text-sm text-destructive text-center">{fetchError}</p>
//                 <Button variant="outline" className="rounded-xl px-6" onClick={fetchForm}>
//                   Try again
//                 </Button>
//               </div>
//             )}

//             {/* Dynamic form — 2-column grid */}
//             {!loading && !fetchError && formData && (
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
//                   {visibleFields.map((field) => (
//                     <div
//                       key={field.key}
//                       className={isFullWidth(field.type) ? "sm:col-span-2" : ""}
//                     >
//                       <DynamicField
//                         field={field}
//                         value={values[field.key] ?? ""}
//                         onChange={(v) => setValue(field.key, v)}
//                         disabled={submitting}
//                         error={errors[field.key]}
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 {submitError && (
//                   <p className="text-xs text-destructive flex items-center gap-1.5">
//                     <span className="h-1 w-1 rounded-full bg-destructive inline-block" />
//                     {submitError}
//                   </p>
//                 )}

//                 {/* Footer row: back + submit */}
//                 <div className="flex items-center justify-between pt-2 border-t">
//                   <button
//                     type="button"
//                     onClick={onBack}
//                     className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
//                   >
//                     <ArrowLeft className="h-3.5 w-3.5" />Back
//                   </button>

//                   <Button
//                     type="button"
//                     onClick={handleSubmit}
//                     disabled={submitting}
//                     className="h-11 px-8 rounded-xl font-semibold"
//                   >
//                     {submitting
//                       ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
//                       : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {/* Back when loading or error state */}
//             {(loading || fetchError) && (
//               <button type="button" onClick={onBack}
//                 className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
//                 <ArrowLeft className="h-3.5 w-3.5" />Back
//               </button>
//             )}
//           </div>
//         </div>

//         <p className="text-center text-sm text-muted-foreground mt-6">
//           Already have an account?{" "}
//           <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">Sign in</Link>
//         </p>
//       </div>
//     </div>
//   )
// }

// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { ArrowLeft, ArrowRight, Check, ChevronDown, Loader2 } from "lucide-react"
// import Image from "next/image"
// import Link from "next/link"
// import { cn } from "@/lib/utils"

// const API_HEADERS = {
//   "Content-Type": "application/json",
//   "X-Tenant-Code": "demo",
//   "Accept":        "application/json",
// }
// const BASE = "https://192.168.6.6/2013/api/v1"

// // ─── API shapes ───────────────────────────────────────────────────────────────

// interface FieldOption {
//   key:   string
//   label: string
//   value: string
// }

// interface FieldCondition {
//   depends_on: string
//   operator:   "equals" | "not_equals"
//   value:      string
// }

// export interface FormField {
//   key:         string
//   type:        "text" | "textarea" | "select" | "number" | "email" | "date"
//   label:       string
//   required?:   boolean
//   options?:    FieldOption[]
//   conditions?: FieldCondition[]
// }

// interface FormStep {
//   step_key:      string
//   next_step_key: string | null
//   pre_step_key:  string | null
//   step_name:     string
//   step_order:    string
//   total_steps:   string
// }

// interface RenderedForm {
//   fields:    FormField[]
//   step_key:  string
//   step_name: string
// }

// interface KycFormData {
//   form_id:       string
//   form_version:  string
//   submission_id: string
//   step:          FormStep
//   rendered_form: RenderedForm
// }

// interface KycFormStepProps {
//   customerId:  string
//   userType:    "buyer" | "seller"
//   stepKey:     string
//   totalSteps:  number        // passed from register page (from onboardingVerifyOtp)
//   onBack:      () => void
//   onComplete:  (submissionId: string, nextStepKey: string | null) => void
// }

// // ─── Condition evaluator ──────────────────────────────────────────────────────

// function isFieldVisible(field: FormField, values: Record<string, string>): boolean {
//   if (!field.conditions?.length) return true
//   return field.conditions.every((c) => {
//     const actual = values[c.depends_on] ?? ""
//     return c.operator === "equals" ? actual === c.value : actual !== c.value
//   })
// }

// // ─── Dynamic stepper ──────────────────────────────────────────────────────────
// // Step 1 is always "Mobile Verification" (already completed before this component)
// // Subsequent steps come from the API (step_order, step_name, total_steps)

// function Stepper({
//   totalSteps,
//   currentOrder,
//   currentName,
// }: {
//   totalSteps:   number
//   currentOrder: number   // 1-based, step 1 = mobile verification (done)
//   currentName:  string
// }) {
//   return (
//     <div className="w-full">
//       {/* Step labels row */}
//       <div className="flex items-start gap-0 w-full">
//         {Array.from({ length: totalSteps }, (_, i) => {
//           const stepNum  = i + 1
//           const isDone   = stepNum < currentOrder
//           const isActive = stepNum === currentOrder
//           const isLast   = stepNum === totalSteps

//           const label = stepNum === 1
//             ? "Mobile Verification"
//             : isActive
//             ? currentName
//             : `Step ${stepNum}`

//           return (
//             <div key={i} className="flex flex-1 flex-col items-center">
//               {/* Connector + circle row */}
//               <div className="flex items-center w-full">
//                 {/* Left line */}
//                 {stepNum > 1 && (
//                   <div className={cn(
//                     "flex-1 h-0.5 transition-colors duration-300",
//                     isDone || isActive ? "bg-primary" : "bg-border"
//                   )} />
//                 )}

//                 {/* Circle */}
//                 <div className={cn(
//                   "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 z-10",
//                   isDone
//                     ? "border-primary bg-primary text-primary-foreground"
//                     : isActive
//                     ? "border-primary bg-background text-primary ring-4 ring-primary/15"
//                     : "border-border bg-background text-muted-foreground"
//                 )}>
//                   {isDone ? <Check className="h-4 w-4" /> : stepNum}
//                 </div>

//                 {/* Right line */}
//                 {!isLast && (
//                   <div className={cn(
//                     "flex-1 h-0.5 transition-colors duration-300",
//                     isDone ? "bg-primary" : "bg-border"
//                   )} />
//                 )}
//               </div>

//               {/* Label below */}
//               <span className={cn(
//                 "mt-2 text-center text-xs leading-tight max-w-[80px] px-1 transition-colors duration-300",
//                 isActive
//                   ? "text-primary font-semibold"
//                   : isDone
//                   ? "text-primary/70 font-medium"
//                   : "text-muted-foreground"
//               )}>
//                 {label}
//               </span>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// // ─── Select field with chevron ────────────────────────────────────────────────

// function SelectField({
//   field,
//   value,
//   onChange,
//   disabled,
//   error,
// }: {
//   field:    FormField
//   value:    string
//   onChange: (v: string) => void
//   disabled: boolean
//   error?:   string
// }) {
//   return (
//     <div className="relative">
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         disabled={disabled}
//         className={cn(
//           "h-11 w-full appearance-none rounded-xl border border-input bg-background",
//           "pl-3 pr-10 text-sm transition-colors",
//           "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
//           "disabled:cursor-not-allowed disabled:opacity-50",
//           !value ? "text-muted-foreground" : "text-foreground",
//           error && "border-destructive focus:ring-destructive"
//         )}
//       >
//         <option value="" disabled>Select {field.label}…</option>
//         {field.options?.map((opt) => (
//           <option key={opt.key} value={opt.value}>{opt.label}</option>
//         ))}
//       </select>
//       {/* Custom chevron */}
//       <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//     </div>
//   )
// }

// // ─── Dynamic field renderer ───────────────────────────────────────────────────

// function DynamicField({
//   field, value, onChange, disabled, error,
// }: {
//   field: FormField; value: string; onChange: (v: string) => void
//   disabled: boolean; error?: string
// }) {
//   return (
//     <div className="space-y-1.5">
//       <label className="text-sm font-medium text-foreground">
//         {field.label}
//         {field.required && <span className="text-destructive ml-0.5">*</span>}
//       </label>

//       {field.type === "textarea" ? (
//         <textarea
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           disabled={disabled}
//           rows={3}
//           placeholder={`Enter ${field.label.toLowerCase()}`}
//           className={cn(
//             "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm",
//             "placeholder:text-muted-foreground resize-none transition-colors",
//             "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
//             "disabled:cursor-not-allowed disabled:opacity-50",
//             error && "border-destructive focus:ring-destructive"
//           )}
//         />
//       ) : field.type === "select" ? (
//         <SelectField field={field} value={value} onChange={onChange}
//           disabled={disabled} error={error} />
//       ) : (
//         <Input
//           type={field.type}
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           disabled={disabled}
//           placeholder={`Enter ${field.label.toLowerCase()}`}
//           className={cn(
//             "h-11 rounded-xl",
//             error && "border-destructive focus-visible:ring-destructive"
//           )}
//         />
//       )}

//       {error && (
//         <p className="text-xs text-destructive flex items-center gap-1.5">
//           <span className="h-1 w-1 rounded-full bg-destructive inline-block shrink-0" />
//           {error}
//         </p>
//       )}
//     </div>
//   )
// }

// // ─── Main component ───────────────────────────────────────────────────────────

// export function KycFormStep({
//   customerId,
//   userType,
//   stepKey,
//   totalSteps,
//   onBack,
//   onComplete,
// }: KycFormStepProps) {
//   const [formData, setFormData]       = useState<KycFormData | null>(null)
//   const [values, setValues]           = useState<Record<string, string>>({})
//   const [errors, setErrors]           = useState<Record<string, string>>({})
//   const [loading, setLoading]         = useState(true)
//   const [submitting, setSubmitting]   = useState(false)
//   const [fetchError, setFetchError]   = useState("")
//   const [submitError, setSubmitError] = useState("")

//   const fetchForm = useCallback(async () => {
//     setLoading(true); setFetchError("")
//     try {
//       const res  = await fetch(`${BASE}/kyc/getKycForm`, {
//         method: "POST", headers: API_HEADERS,
//         body: JSON.stringify({
//           form_type:    "onboarding",
//           actor:        userType,
//           product_code: "SCF",
//           scheme_code:  "DEFAULT",
//           customer_id:  customerId,
//           step_key:     stepKey,
//         }),
//       })
//       const data = await res.json()
//       if (!data.success || !data.data?.[0]) throw new Error(data.message ?? "Failed to load form")
//       const form: KycFormData = data.data[0]
//       setFormData(form)
//       const init: Record<string, string> = {}
//       form.rendered_form.fields.forEach((f) => { init[f.key] = "" })
//       setValues(init)
//     } catch (e) {
//       setFetchError(e instanceof Error ? e.message : "Failed to load form. Please try again.")
//     } finally { setLoading(false) }
//   }, [customerId, userType, stepKey])

//   useEffect(() => { fetchForm() }, [fetchForm])

//   const setValue = (key: string, val: string) => {
//     setValues((prev) => ({ ...prev, [key]: val }))
//     setErrors((prev)  => ({ ...prev, [key]: "" }))
//   }

//   const validate = (): boolean => {
//     if (!formData) return false
//     const newErrors: Record<string, string> = {}
//     formData.rendered_form.fields.forEach((f) => {
//       if (!isFieldVisible(f, values)) return
//       if (f.required && !values[f.key]?.trim()) newErrors[f.key] = `${f.label} is required`
//     })
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = async () => {
//     if (!validate() || !formData) return
//     setSubmitError(""); setSubmitting(true)
//     const payload: Record<string, string> = {}
//     formData.rendered_form.fields.forEach((f) => {
//       if (isFieldVisible(f, values)) payload[f.key] = values[f.key] ?? ""
//     })
//     try {
//       // TODO: replace stub with real submit API when backend provides endpoint
//       // const res  = await fetch(`${BASE}/kyc/submitKycForm`, {
//       //   method: "POST", headers: API_HEADERS,
//       //   body: JSON.stringify({
//       //     form_id: formData.form_id, submission_id: formData.submission_id,
//       //     customer_id: customerId, step_key: stepKey, data: payload,
//       //   }),
//       // })
//       // const data = await res.json()
//       // if (!data.success) throw new Error(data.message ?? "Submission failed")
//       await new Promise((r) => setTimeout(r, 600))
//       onComplete(formData.submission_id, formData.step.next_step_key)
//     } catch (e) {
//       setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.")
//     } finally { setSubmitting(false) }
//   }

//   const visibleFields = formData?.rendered_form.fields.filter(
//     (f) => isFieldVisible(f, values)
//   ) ?? []

//   const isFullWidth = (type: FormField["type"]) => type === "textarea"

//   // Step info from API — step_order is 1-based, step 1 = mobile verification
//   const stepOrder   = formData ? Number(formData.step.step_order) : 2
//   const totalFromApi = formData ? Number(formData.step.total_steps) : totalSteps
//   const stepName    = formData?.rendered_form.step_name ?? "KYC Details"

//   return (
//     <div className="min-h-screen flex flex-col bg-background">

//       {/* ── Top bar ───────────────────────────────────────────── */}
//       <div className="flex items-center justify-between px-8 py-5 border-b shrink-0">
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
//       <div className="flex flex-1 overflow-hidden">

//         {/* Left sidebar — stepper */}
//         <div className="hidden lg:flex flex-col w-72 shrink-0 border-r px-8 py-10 bg-muted/20">
//           <div className="space-y-1 mb-10">
//             <span className="text-xs font-semibold uppercase tracking-widest text-primary">
//               Registration
//             </span>
//             <h2 className="text-xl font-bold">Complete your profile</h2>
//             <p className="text-sm text-muted-foreground">
//               Follow the steps to get started.
//             </p>
//           </div>

//           {/* Vertical stepper */}
//           <div className="flex flex-col gap-0">
//             {Array.from({ length: totalFromApi }, (_, i) => {
//               const stepNum  = i + 1
//               const isDone   = stepNum < stepOrder
//               const isActive = stepNum === stepOrder
//               const isLast   = stepNum === totalFromApi
//               const label    = stepNum === 1
//                 ? "Mobile Verification"
//                 : isActive
//                 ? stepName
//                 : `Step ${stepNum}`

//               return (
//                 <div key={i} className="flex gap-4">
//                   {/* Left: circle + connector */}
//                   <div className="flex flex-col items-center">
//                     <div className={cn(
//                       "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
//                       isDone
//                         ? "border-primary bg-primary text-primary-foreground"
//                         : isActive
//                         ? "border-primary bg-background text-primary ring-4 ring-primary/15"
//                         : "border-border bg-background text-muted-foreground"
//                     )}>
//                       {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
//                     </div>
//                     {!isLast && (
//                       <div className={cn(
//                         "w-0.5 flex-1 min-h-[2rem] mt-1 mb-1 rounded transition-colors",
//                         isDone ? "bg-primary" : "bg-border"
//                       )} />
//                     )}
//                   </div>

//                   {/* Right: label */}
//                   <div className={cn("pb-8", isLast && "pb-0")}>
//                     <p className={cn(
//                       "text-sm font-medium leading-none pt-1.5",
//                       isActive ? "text-foreground" : isDone ? "text-primary/70" : "text-muted-foreground"
//                     )}>
//                       {label}
//                     </p>
//                     {isActive && (
//                       <p className="text-xs text-muted-foreground mt-1">In progress</p>
//                     )}
//                     {isDone && (
//                       <p className="text-xs text-primary/60 mt-1">Completed</p>
//                     )}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>

//         {/* Right: form area */}
//         <div className="flex-1 overflow-y-auto">
//           <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">

//             {/* Mobile stepper (horizontal, shown on small screens) */}
//             <div className="lg:hidden mb-8">
//               <Stepper
//                 totalSteps={totalFromApi}
//                 currentOrder={stepOrder}
//                 currentName={stepName}
//               />
//             </div>

//             {/* Page heading */}
//             <div className="mb-8 space-y-1">
//               <p className="text-xs font-semibold uppercase tracking-widest text-primary">
//                 Step {stepOrder} of {totalFromApi}
//               </p>
//               <h1 className="text-2xl font-bold tracking-tight">
//                 {loading ? "Loading…" : stepName}
//               </h1>
//               <p className="text-muted-foreground text-sm">
//                 Fill in the details below to continue your registration.
//               </p>
//             </div>

//             {/* Loading skeleton */}
//             {loading && (
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
//                 {[1,2,3,4,5,6].map((i) => (
//                   <div key={i} className={cn("space-y-1.5", i === 5 ? "sm:col-span-2" : "")}>
//                     <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
//                     <div className="h-11 w-full rounded-xl bg-muted animate-pulse" />
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Fetch error */}
//             {!loading && fetchError && (
//               <div className="flex flex-col items-center gap-3 py-10 text-center">
//                 <p className="text-sm text-destructive">{fetchError}</p>
//                 <Button variant="outline" className="rounded-xl" onClick={fetchForm}>
//                   Try again
//                 </Button>
//               </div>
//             )}

//             {/* Form fields — 2-col grid */}
//             {!loading && !fetchError && formData && (
//               <div className="space-y-8">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
//                   {visibleFields.map((field) => (
//                     <div key={field.key}
//                       className={isFullWidth(field.type) ? "sm:col-span-2" : ""}>
//                       <DynamicField
//                         field={field}
//                         value={values[field.key] ?? ""}
//                         onChange={(v) => setValue(field.key, v)}
//                         disabled={submitting}
//                         error={errors[field.key]}
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 {submitError && (
//                   <p className="text-sm text-destructive flex items-center gap-1.5">
//                     <span className="h-1 w-1 rounded-full bg-destructive inline-block shrink-0" />
//                     {submitError}
//                   </p>
//                 )}

//                 {/* Footer */}
//                 <div className="flex items-center justify-between pt-4 border-t">
//                   <button type="button" onClick={onBack}
//                     className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
//                     <ArrowLeft className="h-4 w-4" />
//                     Back
//                   </button>
//                   <Button type="button" onClick={handleSubmit}
//                     disabled={submitting}
//                     className="h-11 px-8 rounded-xl font-semibold">
//                     {submitting
//                       ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
//                       : <>Save &amp; Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {/* Back link during loading/error */}
//             {(loading || fetchError) && !formData && (
//               <button type="button" onClick={onBack}
//                 className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4">
//                 <ArrowLeft className="h-4 w-4" />Back
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, Check, ChevronDown, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const API_HEADERS = {
  "Content-Type": "application/json",
  "X-Tenant-Code": "demo",
  "Accept":        "application/json",
}
const BASE = "https://192.168.6.6/2013/api/v1"

// ─── API shapes ───────────────────────────────────────────────────────────────

interface FieldOption {
  key:   string
  label: string
  value: string
}

interface FieldCondition {
  depends_on: string
  operator:   "equals" | "not_equals"
  value:      string
}

export interface FormField {
  key:         string
  type:        "text" | "textarea" | "select" | "number" | "email" | "date"
  label:       string
  required?:   boolean
  options?:    FieldOption[]
  conditions?: FieldCondition[]
}

interface FormStep {
  step_key:      string
  next_step_key: string | null
  pre_step_key:  string | null
  step_name:     string
  step_order:    string
  total_steps:   string
}

interface RenderedForm {
  fields:    FormField[]
  step_key:  string
  step_name: string
}

interface KycFormData {
  form_id:       string
  form_version:  string
  submission_id: string
  step:          FormStep
  rendered_form: RenderedForm
}

interface KycFormStepProps {
  customerId:  string
  userType:    "buyer" | "seller"
  stepKey:     string
  totalSteps:  number        // passed from register page (from onboardingVerifyOtp)
  onBack:      () => void
  onComplete:  (submissionId: string, nextStepKey: string | null) => void
}

// ─── Condition evaluator ──────────────────────────────────────────────────────

function isFieldVisible(field: FormField, values: Record<string, string>): boolean {
  if (!field.conditions?.length) return true
  return field.conditions.every((c) => {
    const actual = values[c.depends_on] ?? ""
    return c.operator === "equals" ? actual === c.value : actual !== c.value
  })
}

// ─── Dynamic stepper ──────────────────────────────────────────────────────────
// Step 1 is always "Mobile Verification" (already completed before this component)
// Subsequent steps come from the API (step_order, step_name, total_steps)

function Stepper({
  totalSteps,
  currentOrder,
  currentName,
}: {
  totalSteps:   number
  currentOrder: number   // 1-based, step 1 = mobile verification (done)
  currentName:  string
}) {
  return (
    <div className="w-full">
      {/* Step labels row */}
      <div className="flex items-start gap-0 w-full">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum  = i + 1
          const isDone   = stepNum < currentOrder
          const isActive = stepNum === currentOrder
          const isLast   = stepNum === totalSteps

          const label = stepNum === 1
            ? "Mobile Verification"
            : isActive
            ? currentName
            : `Step ${stepNum}`

          return (
            <div key={i} className="flex flex-1 flex-col items-center">
              {/* Connector + circle row */}
              <div className="flex items-center w-full">
                {/* Left line */}
                {stepNum > 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 transition-colors duration-300",
                    isDone || isActive ? "bg-primary" : "bg-border"
                  )} />
                )}

                {/* Circle */}
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 z-10",
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                    ? "border-primary bg-background text-primary ring-4 ring-primary/15"
                    : "border-border bg-background text-muted-foreground"
                )}>
                  {isDone ? <Check className="h-4 w-4" /> : stepNum}
                </div>

                {/* Right line */}
                {!isLast && (
                  <div className={cn(
                    "flex-1 h-0.5 transition-colors duration-300",
                    isDone ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>

              {/* Label below */}
              <span className={cn(
                "mt-2 text-center text-xs leading-tight max-w-[80px] px-1 transition-colors duration-300",
                isActive
                  ? "text-primary font-semibold"
                  : isDone
                  ? "text-primary/70 font-medium"
                  : "text-muted-foreground"
              )}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Select field with chevron ────────────────────────────────────────────────

function SelectField({
  field,
  value,
  onChange,
  disabled,
  error,
}: {
  field:    FormField
  value:    string
  onChange: (v: string) => void
  disabled: boolean
  error?:   string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "h-11 w-full appearance-none rounded-xl border border-input bg-background",
          "pl-3 pr-10 text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value ? "text-muted-foreground" : "text-foreground",
          error && "border-destructive focus:ring-destructive"
        )}
      >
        <option value="" disabled>Select {field.label}…</option>
        {field.options?.map((opt) => (
          <option key={opt.key} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {/* Custom chevron */}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  )
}

// ─── Dynamic field renderer ───────────────────────────────────────────────────

function DynamicField({
  field, value, onChange, disabled, error,
}: {
  field: FormField; value: string; onChange: (v: string) => void
  disabled: boolean; error?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={cn(
            "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm",
            "placeholder:text-muted-foreground resize-none transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive"
          )}
        />
      ) : field.type === "select" ? (
        <SelectField field={field} value={value} onChange={onChange}
          disabled={disabled} error={error} />
      ) : (
        <Input
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={cn(
            "h-11 rounded-xl",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      )}

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-destructive inline-block shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function KycFormStep({
  customerId,
  userType,
  stepKey,
  totalSteps,
  onBack,
  onComplete,
}: KycFormStepProps) {
  const [formData, setFormData]       = useState<KycFormData | null>(null)
  const [values, setValues]           = useState<Record<string, string>>({})
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [fetchError, setFetchError]   = useState("")
  const [submitError, setSubmitError] = useState("")

  const fetchForm = useCallback(async () => {
    setLoading(true); setFetchError("")
    try {
      const res  = await fetch(`${BASE}/kyc/getKycForm`, {
        method: "POST", headers: API_HEADERS,
        body: JSON.stringify({
          form_type:    "onboarding",
          actor:        userType,
          product_code: "SCF",
          scheme_code:  "DEFAULT",
          customer_id:  customerId,
          step_key:     stepKey,
        }),
      })
      const data = await res.json()
      if (!data.success || !data.data?.[0]) throw new Error(data.message ?? "Failed to load form")
      const form: KycFormData = data.data[0]
      setFormData(form)
      const init: Record<string, string> = {}
      form.rendered_form.fields.forEach((f) => { init[f.key] = "" })
      setValues(init)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load form. Please try again.")
    } finally { setLoading(false) }
  }, [customerId, userType, stepKey])

  useEffect(() => { fetchForm() }, [fetchForm])

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }))
    setErrors((prev)  => ({ ...prev, [key]: "" }))
  }

  const validate = (): boolean => {
    if (!formData) return false
    const newErrors: Record<string, string> = {}
    formData.rendered_form.fields.forEach((f) => {
      if (!isFieldVisible(f, values)) return
      if (f.required && !values[f.key]?.trim()) newErrors[f.key] = `${f.label} is required`
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || !formData) return
    setSubmitError(""); setSubmitting(true)
    const payload: Record<string, string> = {}
    formData.rendered_form.fields.forEach((f) => {
      if (isFieldVisible(f, values)) payload[f.key] = values[f.key] ?? ""
    })
    try {
      // TODO: replace stub with real submit API when backend provides endpoint
      // const res  = await fetch(`${BASE}/kyc/submitKycForm`, {
      //   method: "POST", headers: API_HEADERS,
      //   body: JSON.stringify({
      //     form_id: formData.form_id, submission_id: formData.submission_id,
      //     customer_id: customerId, step_key: stepKey, data: payload,
      //   }),
      // })
      // const data = await res.json()
      // if (!data.success) throw new Error(data.message ?? "Submission failed")
      await new Promise((r) => setTimeout(r, 600))
      onComplete(formData.submission_id, formData.step.next_step_key)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.")
    } finally { setSubmitting(false) }
  }

  const visibleFields = formData?.rendered_form.fields.filter(
    (f) => isFieldVisible(f, values)
  ) ?? []

  const isFullWidth = (type: FormField["type"]) => type === "textarea"

  // Step info from API — step_order is 1-based, step 1 = mobile verification
  const stepOrder   = formData ? Number(formData.step.step_order) : 2
  const totalFromApi = formData ? Number(formData.step.total_steps) : totalSteps
  const stepName    = formData?.rendered_form.step_name ?? "KYC Details"

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Top bar — sticky so it stays visible while form scrolls ── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b bg-background shrink-0">
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
      <div className="flex flex-1 min-h-0">

        {/* Left sidebar — sticky stepper */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 border-r px-8 py-10 bg-muted/20 sticky top-[73px] self-start max-h-[calc(100vh-73px)] overflow-y-auto">
          <div className="space-y-1 mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Registration
            </span>
            <h2 className="text-xl font-bold">Complete your profile</h2>
            <p className="text-sm text-muted-foreground">
              Follow the steps to get started.
            </p>
          </div>

          {/* Vertical stepper */}
          <div className="flex flex-col gap-0">
            {Array.from({ length: totalFromApi }, (_, i) => {
              const stepNum  = i + 1
              const isDone   = stepNum < stepOrder
              const isActive = stepNum === stepOrder
              const isLast   = stepNum === totalFromApi
              const label    = stepNum === 1
                ? "Mobile Verification"
                : isActive
                ? stepName
                : `Step ${stepNum}`

              return (
                <div key={i} className="flex gap-4">
                  {/* Left: circle + connector */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : isActive
                        ? "border-primary bg-background text-primary ring-4 ring-primary/15"
                        : "border-border bg-background text-muted-foreground"
                    )}>
                      {isDone ? <Check className="h-3.5 w-3.5" /> : stepNum}
                    </div>
                    {!isLast && (
                      <div className={cn(
                        "w-0.5 flex-1 min-h-[2rem] mt-1 mb-1 rounded transition-colors",
                        isDone ? "bg-primary" : "bg-border"
                      )} />
                    )}
                  </div>

                  {/* Right: label */}
                  <div className={cn("pb-8", isLast && "pb-0")}>
                    <p className={cn(
                      "text-sm font-medium leading-none pt-1.5",
                      isActive ? "text-foreground" : isDone ? "text-primary/70" : "text-muted-foreground"
                    )}>
                      {label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-muted-foreground mt-1">In progress</p>
                    )}
                    {isDone && (
                      <p className="text-xs text-primary/60 mt-1">Completed</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: form area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">

            {/* Mobile stepper (horizontal, shown on small screens) */}
            <div className="lg:hidden mb-8">
              <Stepper
                totalSteps={totalFromApi}
                currentOrder={stepOrder}
                currentName={stepName}
              />
            </div>

            {/* Page heading */}
            <div className="mb-8 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Step {stepOrder} of {totalFromApi}
              </p>
              <h1 className="text-2xl font-bold tracking-tight">
                {loading ? "Loading…" : stepName}
              </h1>
              <p className="text-muted-foreground text-sm">
                Fill in the details below to continue your registration.
              </p>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className={cn("space-y-1.5", i === 5 ? "sm:col-span-2" : "")}>
                    <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-11 w-full rounded-xl bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {/* Fetch error */}
            {!loading && fetchError && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-destructive">{fetchError}</p>
                <Button variant="outline" className="rounded-xl" onClick={fetchForm}>
                  Try again
                </Button>
              </div>
            )}

            {/* Form fields — 2-col grid */}
            {!loading && !fetchError && formData && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  {visibleFields.map((field) => (
                    <div key={field.key}
                      className={isFullWidth(field.type) ? "sm:col-span-2" : ""}>
                      <DynamicField
                        field={field}
                        value={values[field.key] ?? ""}
                        onChange={(v) => setValue(field.key, v)}
                        disabled={submitting}
                        error={errors[field.key]}
                      />
                    </div>
                  ))}
                </div>

                {submitError && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-destructive inline-block shrink-0" />
                    {submitError}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <button type="button" onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <Button type="button" onClick={handleSubmit}
                    disabled={submitting}
                    className="h-11 px-8 rounded-xl font-semibold">
                    {submitting
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                      : <>Save &amp; Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </div>
              </div>
            )}

            {/* Back link during loading/error */}
            {(loading || fetchError) && !formData && (
              <button type="button" onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4">
                <ArrowLeft className="h-4 w-4" />Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}