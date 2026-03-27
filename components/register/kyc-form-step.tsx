"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, ClipboardList, Loader2 } from "lucide-react"
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
  key:        string
  type:       "text" | "textarea" | "select" | "number" | "email" | "date"
  label:      string
  required?:  boolean
  options?:   FieldOption[]
  conditions?: FieldCondition[]
}

interface FormStep {
  step_key:      string
  next_step_key: string | null
  step_name:     string
  step_order:    string
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
  customerId: string
  stepKey?:   string          // defaults to "business_details"
  onBack:     () => void
  onComplete: (submissionId: string, nextStepKey: string | null) => void
}

// ─── Condition evaluator ─────────────────────────────────────────────────────

function isFieldVisible(field: FormField, values: Record<string, string>): boolean {
  if (!field.conditions?.length) return true
  return field.conditions.every((c) => {
    const actual = values[c.depends_on] ?? ""
    return c.operator === "equals"
      ? actual === c.value
      : actual !== c.value
  })
}

// ─── Individual field renderer ───────────────────────────────────────────────

function DynamicField({
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
  const base = "h-11 rounded-xl w-full"

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
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
            "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2",
            "focus:ring-ring focus:ring-offset-0 disabled:opacity-50 resize-none",
            error && "border-destructive"
          )}
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
            "appearance-none cursor-pointer",
            !value && "text-muted-foreground",
            error && "border-destructive"
          )}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((opt) => (
            <option key={opt.key} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <Input
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={cn(base, error && "border-destructive")}
        />
      )}

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-destructive inline-block" />{error}
        </p>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function KycFormStep({
  customerId,
  stepKey = "business_details",
  onBack,
  onComplete,
}: KycFormStepProps) {
  const [formData, setFormData]   = useState<KycFormData | null>(null)
  const [values, setValues]       = useState<Record<string, string>>({})
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [submitError, setSubmitError] = useState("")

  // ── Fetch form definition from API ────────────────────────────────────────
  const fetchForm = useCallback(async () => {
    setLoading(true)
    setFetchError("")
    try {
      const res  = await fetch(`${BASE}/kyc/getKycForm`, {
        method:  "POST",
        headers: API_HEADERS,
        body: JSON.stringify({
          form_type:    "onboarding",
          actor:        "buyer",
          product_code: "SCF",
          scheme_code:  "DEFAULT",
          customer_id:  customerId,
          step_key:     stepKey,
        }),
      })
      const data = await res.json()
      console.log("Fetch form response:", data)
      if (!data.success || !data.data?.[0]) throw new Error(data.message ?? "Failed to load form")

      const form: KycFormData = data.data[0]
      setFormData(form)

      // Initialise all field values to ""
      const init: Record<string, string> = {}
      form.rendered_form.fields.forEach((f) => { init[f.key] = "" })
      setValues(init)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load form. Please try again.")
    } finally { setLoading(false) }
  }, [customerId, stepKey])

  useEffect(() => { fetchForm() }, [fetchForm])

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }))
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  // ── Validate visible required fields ─────────────────────────────────────
  const validate = (): boolean => {
    if (!formData) return false
    const newErrors: Record<string, string> = {}
    formData.rendered_form.fields.forEach((f) => {
      if (!isFieldVisible(f, values)) return
      if (f.required && !values[f.key]?.trim()) {
        newErrors[f.key] = `${f.label} is required`
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate() || !formData) return
    setSubmitError("")
    setSubmitting(true)

    // Build payload — only include visible fields
    const payload: Record<string, string> = {}
    formData.rendered_form.fields.forEach((f) => {
      if (isFieldVisible(f, values)) payload[f.key] = values[f.key] ?? ""
    })

    try {
      // TODO: replace with real submit API when backend provides it
      // const res  = await fetch(`${BASE}/kyc/submitKycForm`, {
      //   method: "POST", headers: API_HEADERS,
      //   body: JSON.stringify({
      //     form_id:       formData.form_id,
      //     submission_id: formData.submission_id,
      //     customer_id:   customerId,
      //     step_key:      stepKey,
      //     data:          payload,
      //   }),
      // })
      // const data = await res.json()
      // if (!data.success) throw new Error(data.message ?? "Submission failed")
      await new Promise((r) => setTimeout(r, 600)) // remove when real API is wired

      onComplete(formData.submission_id, formData.step.next_step_key)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.")
    } finally { setSubmitting(false) }
  }

  // ── Visible fields ────────────────────────────────────────────────────────
  const visibleFields = formData?.rendered_form.fields.filter(
    (f) => isFieldVisible(f, values)
  ) ?? []

  // textarea and select fields span the full 2 columns — everything else goes in the grid
  const isFullWidth = (type: FormField["type"]) => type === "textarea"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/60 via-background to-muted/30 px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="rounded-2xl border bg-background shadow-xl shadow-black/5 overflow-hidden">
          <div className="w-full bg-gradient-to-r from-primary/80 via-primary to-primary/60" />

          <div className="px-10 pt-8 pb-10 space-y-8">

            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {loading ? "Loading form…" : (formData?.rendered_form.step_name ?? "KYC Form")}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Fill in the details below to continue
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Loading skeleton — 2-col grid */}
            {loading && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3.5 w-20 rounded-md bg-muted animate-pulse" />
                    <div className="h-11 w-full rounded-xl bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {/* Fetch error */}
            {!loading && fetchError && (
              <div className="flex flex-col items-center gap-3 py-6">
                <p className="text-sm text-destructive text-center">{fetchError}</p>
                <Button variant="outline" className="rounded-xl px-6" onClick={fetchForm}>
                  Try again
                </Button>
              </div>
            )}

            {/* Dynamic form — 2-column grid */}
            {!loading && !fetchError && formData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  {visibleFields.map((field) => (
                    <div
                      key={field.key}
                      className={isFullWidth(field.type) ? "sm:col-span-2" : ""}
                    >
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
                  <p className="text-xs text-destructive flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-destructive inline-block" />
                    {submitError}
                  </p>
                )}

                {/* Footer row: back + submit */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />Back
                  </button>

                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="h-11 px-8 rounded-xl font-semibold"
                  >
                    {submitting
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                      : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </div>
              </div>
            )}

            {/* Back when loading or error state */}
            {(loading || fetchError) && (
              <button type="button" onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />Back
              </button>
            )}
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