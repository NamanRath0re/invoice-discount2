"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, ArrowRight, Check, ChevronDown,
  Loader2, Search, Upload, X, FileText,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const API_HEADERS = {
  "Content-Type": "application/json",
  "X-Tenant-Code": "demo",
  "Accept":        "application/json",
}
const BASE = "http://192.168.6.6/www8/2013-Backend/api/v1"

// ─── Shapes ───────────────────────────────────────────────────────────────────

interface FieldOption    { key?: string; label: string; value: string }
interface FieldCondition { depends_on: string; operator: "equals" | "not_equals"; value: string } 
interface FieldUi        { visible: boolean; editable: boolean }
interface FieldValidation { regex?: string; max_length?: number; min_length?: number }
interface FieldDataSource {
  type: string; method: string; endpoint: string
  response_mapping: Record<string, string>
}
interface FieldUpload {
  endpoint:    string          // e.g. "/kyc/uploadDocument"
  method?:     string          // default POST
  field_name?: string          // multipart field name, default "file"
  accept?:     string          // e.g. "image/*,application/pdf"
}

export interface FormField {
  key:          string
  type:         "text" | "textarea" | "select" | "number" | "email" | "date" | "file"
  label:        string
  required?:    boolean
  placeholder?: string
  options?:     FieldOption[]
  conditions?:  FieldCondition[]
  ui?:          FieldUi
  validation?:  FieldValidation
  data_source?: FieldDataSource
  upload?:      FieldUpload
}

interface FormStep {
  step_key:      string
  next_step_key: string | null
  pre_step_key:  string | null
  step_name:     string
  step_order:    string
  total_steps:   string
}

interface KycFormData {
  form_id:       string
  form_version:  string
  submission_id: string
  step:          FormStep
  rendered_form: { fields: FormField[]; step_key: string; step_name: string }
}

export interface KycFormStepProps {
  customerId:     string
  userType:       "buyer" | "seller"
  stepKey:        string
  totalSteps:     number
  submissionId:   string               // latest submission_id from previous submit
  completedSteps: string[]             // step_keys already submitted
  stepNames:      Record<string, string> // step_key → step_name for stepper labels
  onBack:         () => void
  onComplete:     (submissionId: string, nextStepKey: string | null) => void
  onGoToStep:     (stepKey: string) => void  // stepper click → navigate to completed step
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isFieldVisible(f: FormField, vals: Record<string, string>): boolean {
  if (f.ui && !f.ui.visible) return false
  if (!f.conditions?.length) return true
  return f.conditions.every((c) => {
    const actual = vals[c.depends_on] ?? ""
    return c.operator === "equals" ? actual === c.value : actual !== c.value
  })
}

function validateField(f: FormField, val: string): string | null {
  if (f.type === "file") return null  // file handled separately
  if (f.required && !val.trim()) return `${f.label} is required`
  if (val && f.validation?.regex && !new RegExp(f.validation.regex).test(val))
    return `Invalid ${f.label.toLowerCase()}`
  if (val && f.validation?.max_length && val.length > f.validation.max_length)
    return `${f.label} must be at most ${f.validation.max_length} characters`
  return null
}

// ─── Stepper — vertical (desktop sidebar) ─────────────────────────────────────

function VerticalStepper({
  totalSteps, stepOrder, stepName, stepNames, completedSteps, allStepKeys, onGoToStep,
}: {
  totalSteps:     number
  stepOrder:      number
  stepName:       string
  stepNames:      Record<string, string>
  completedSteps: string[]
  allStepKeys:    string[]          // ordered list of step_keys
  onGoToStep:     (key: string) => void
}) {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: totalSteps }, (_, i) => {
        const n        = i + 1
        const isDone   = n < stepOrder
        const isActive = n === stepOrder
        const isLast   = n === totalSteps
        // Step 1 is always mobile verification (non-navigable)
        const isMobile = n === 1
        const stepKey  = allStepKeys[i] ?? ""
        const isNavigable = isDone && !isMobile  // can click completed steps (not mobile)

        const label = isMobile
          ? "Mobile Verification"
          : stepNames[stepKey] ?? (isActive ? stepName : `Step ${n}`)

        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={!isNavigable}
                onClick={() => isNavigable && onGoToStep(stepKey)}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                    ? "border-primary bg-background text-primary ring-4 ring-primary/15"
                    : "border-border bg-background text-muted-foreground",
                  isNavigable && "cursor-pointer hover:opacity-80"
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : n}
              </button>
              {!isLast && (
                <div className={cn(
                  "w-0.5 flex-1 min-h-[2rem] mt-1 mb-1 rounded transition-colors",
                  isDone ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
            <div className={cn("pb-8", isLast && "pb-0")}>
              <p className={cn(
                "text-sm font-medium leading-none pt-1.5 transition-colors",
                isActive ? "text-foreground"
                : isDone ? cn("text-primary/70", isNavigable && "cursor-pointer hover:text-primary")
                : "text-muted-foreground"
              )}
                onClick={() => isNavigable && onGoToStep(stepKey)}
              >
                {label}
              </p>
              {isActive && <p className="text-xs text-muted-foreground mt-1">In progress</p>}
              {isDone && <p className="text-xs text-primary/60 mt-1">
                {isNavigable ? "Completed · click to review" : "Completed"}
              </p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Stepper — horizontal (mobile) ────────────────────────────────────────────

function HorizontalStepper({
  totalSteps, stepOrder, stepName, stepNames, allStepKeys, onGoToStep,
}: {
  totalSteps: number; stepOrder: number; stepName: string
  stepNames: Record<string, string>; allStepKeys: string[]
  onGoToStep: (key: string) => void
}) {
  return (
    <div className="flex items-start w-full">
      {Array.from({ length: totalSteps }, (_, i) => {
        const n = i + 1
        const isDone = n < stepOrder; const isActive = n === stepOrder
        const isLast = n === totalSteps; const isMobile = n === 1
        const stepKey = allStepKeys[i] ?? ""
        const isNavigable = isDone && !isMobile
        const label = isMobile ? "Mobile" : stepNames[stepKey] ?? (isActive ? stepName : `Step ${n}`)
        return (
          <div key={i} className="flex flex-1 flex-col items-center">
            <div className="flex items-center w-full">
              {n > 1 && <div className={cn("flex-1 h-0.5", isDone || isActive ? "bg-primary" : "bg-border")} />}
              <button
                type="button"
                disabled={!isNavigable}
                onClick={() => isNavigable && onGoToStep(stepKey)}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all z-10",
                  isDone ? "border-primary bg-primary text-primary-foreground"
                  : isActive ? "border-primary bg-background text-primary ring-4 ring-primary/15"
                  : "border-border bg-background text-muted-foreground",
                  isNavigable && "cursor-pointer hover:opacity-80"
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : n}
              </button>
              {!isLast && <div className={cn("flex-1 h-0.5", isDone ? "bg-primary" : "bg-border")} />}
            </div>
            <span className={cn(
              "mt-1.5 text-center text-[10px] leading-tight max-w-[60px] px-0.5 transition-colors",
              isActive ? "text-primary font-semibold" : isDone ? "text-primary/70" : "text-muted-foreground",
              isNavigable && "cursor-pointer hover:text-primary"
            )}
              onClick={() => isNavigable && onGoToStep(stepKey)}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Select field ─────────────────────────────────────────────────────────────

function SelectField({ field, value, onChange, disabled, error }: {
  field: FormField; value: string; onChange: (v: string) => void
  disabled: boolean; error?: string
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className={cn(
          "h-11 w-full appearance-none rounded-xl border border-input bg-background",
          "pl-3 pr-10 text-sm cursor-pointer transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !value ? "text-muted-foreground" : "text-foreground",
          error && "border-destructive"
        )}>
        <option value="" disabled>Select {field.label}…</option>
        {field.options?.map((opt, i) => (
          <option key={opt.key ?? i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  )
}

// ─── Data-source field (e.g. pincode auto-fill) ───────────────────────────────

function DataSourceField({ field, value, onChange, onAutoFill, disabled, error }: {
  field: FormField; value: string; onChange: (v: string) => void
  onAutoFill: (m: Record<string, string>) => void; disabled: boolean; error?: string
}) {
  const [fetching, setFetching] = useState(false)
  const [fetchErr, setFetchErr] = useState("")
  const [filled, setFilled]     = useState(false)
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ds = field.data_source!

  const readyToFetch = (v: string) =>
    field.validation?.regex ? new RegExp(field.validation.regex).test(v) : v.length > 0

  const doFetch = useCallback(async (val: string) => {
    if (!readyToFetch(val)) { setFilled(false); setFetchErr(""); return }
    setFetching(true); setFetchErr("")
    try {
      const res = await fetch(`${BASE}${ds.endpoint}`, {
        method:  ds.method.toUpperCase(),
        headers: API_HEADERS,
        body:    ds.method.toUpperCase() === "POST" ? JSON.stringify({ [field.key]: val }) : undefined,
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message ?? "Lookup failed")
      const filled: Record<string, string> = {}
      for (const [src, tgt] of Object.entries(ds.response_mapping))
        filled[tgt] = String(data.data?.[src] ?? "")
      onAutoFill(filled); setFilled(true)
    } catch (e) {
      setFetchErr(e instanceof Error ? e.message : "Lookup failed"); setFilled(false)
    } finally { setFetching(false) }
  }, [ds, field.key])

  const handleChange = (v: string) => {
    const capped = field.validation?.max_length ? v.slice(0, field.validation.max_length) : v
    onChange(capped); setFilled(false); setFetchErr("")
    if (debRef.current) clearTimeout(debRef.current)
    debRef.current = setTimeout(() => doFetch(capped), 600)
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input type={field.type} value={value} onChange={(e) => handleChange(e.target.value)}
          disabled={disabled} placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
          maxLength={field.validation?.max_length}
          className={cn(
            "h-11 rounded-xl pr-10",
            error && "border-destructive",
            filled && "border-green-500"
          )} />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {fetching ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          : filled   ? <Check   className="h-4 w-4 text-green-500" />
          :             <Search  className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
      {fetchErr && <p className="text-xs text-destructive">{fetchErr}</p>}
      {filled && <p className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" />Details fetched</p>}
    </div>
  )
}

// ─── File upload field ────────────────────────────────────────────────────────
// Uses the real upload API: POST /kyc/uploadDocument
// FormData fields: file, submission_id, field_key, customer_id

function FileField({ field, submissionId, customerId, onUploadComplete, disabled, error }: {
  field:            FormField
  submissionId:     string
  customerId:       string
  onUploadComplete: (key: string, val: string) => void
  disabled:         boolean
  error?:           string
}) {
  const [file, setFile]           = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded]   = useState(false)
  const [uploadErr, setUploadErr] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // accept comes from field root (e.g. ".jpg,.jpeg,.png,.pdf")
  const accept = (field as FormField & { accept?: string }).accept ?? "*/*"

  const handleFile = async (f: File) => {
    setFile(f); setUploaded(false); setUploadErr("")
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file",          f)
      formData.append("submission_id", submissionId)
      formData.append("field_key",     field.key)
      formData.append("customer_id",   customerId)

      const res = await fetch(`${BASE}/kyc/uploadDocument`, {
        method: "POST",
        // No Content-Type header — browser sets multipart/form-data with boundary automatically
        headers: { "X-Tenant-Code": "demo" },
        body: formData,
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message ?? "Upload failed")
      // Store the returned file reference (url, path, or id)
      const fileRef = data.data?.document?.url ?? data.data?.file_url ?? data.data?.file_id ?? f.name
      onUploadComplete(field.key, String(fileRef))
      setUploaded(true)
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : "Upload failed. Please try again.")
    } finally { setUploading(false) }
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" className="hidden" accept={accept}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

      {!file ? (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled}
          className={cn(
            "w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-7",
            "text-sm text-muted-foreground transition-all duration-200",
            "hover:border-primary hover:text-primary hover:bg-primary/5",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-destructive"
          )}>
          <Upload className="h-6 w-6" />
          <div className="text-center">
            <span className="font-medium">Click to upload</span>
            <p className="text-xs mt-0.5 opacity-60">{accept.replace(/\./g, "").toUpperCase().split(",").join(", ")}</p>
          </div>
        </button>
      ) : (
        <div className={cn(
          "flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors",
          uploaded ? "border-green-500 bg-green-50 dark:bg-green-950/20"
          : uploadErr ? "border-destructive bg-destructive/5"
          : uploading ? "border-primary/40 bg-primary/5"
          : "border-border"
        )}>
          <FileText className={cn("h-5 w-5 shrink-0",
            uploaded ? "text-green-600" : uploading ? "text-primary" : "text-muted-foreground")} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(file.size / 1024).toFixed(1)} KB
              {uploading && " · Uploading…"}
              {uploaded  && " · Uploaded successfully"}
            </p>
          </div>
          {uploading && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
          {uploaded  && <Check   className="h-4 w-4 text-green-600 shrink-0" />}
          {!uploading && (
            <button type="button"
              onClick={() => { setFile(null); setUploaded(false); setUploadErr(""); onUploadComplete(field.key, "") }}
              className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {uploadErr && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-destructive inline-block shrink-0" />{uploadErr}
          <button type="button" onClick={() => file && handleFile(file)}
            className="ml-1 underline underline-offset-2 hover:no-underline">Retry</button>
        </p>
      )}
    </div>
  )
}

// ─── Dynamic field router ─────────────────────────────────────────────────────

function DynamicField({ field, value, onChange, onAutoFill, onUploadComplete, submissionId, customerId, disabled, error }: {
  field: FormField; value: string
  onChange:         (v: string) => void
  onAutoFill:       (m: Record<string, string>) => void
  onUploadComplete: (key: string, val: string) => void
  submissionId:     string
  customerId:       string
  disabled:         boolean; error?: string
}) {
  const isEditable = field.ui ? field.ui.editable : true

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
        {!isEditable && <span className="ml-2 text-xs text-muted-foreground font-normal">(auto-filled)</span>}
      </label>

      {field.type === "file" ? (
        <FileField field={field} submissionId={submissionId} customerId={customerId}
          onUploadComplete={onUploadComplete} disabled={disabled} error={error} />
      ) : field.type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          disabled={disabled || !isEditable} rows={3}
          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
          className={cn(
            "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none",
            "placeholder:text-muted-foreground transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40",
            error && "border-destructive"
          )} />
      ) : field.type === "select" ? (
        <SelectField field={field} value={value} onChange={onChange}
          disabled={disabled || !isEditable} error={error} />
      ) : field.data_source ? (
        <DataSourceField field={field} value={value} onChange={onChange}
          onAutoFill={onAutoFill} disabled={disabled || !isEditable} error={error} />
      ) : (
        <Input type={field.type} value={value} onChange={(e) => onChange(e.target.value)}
          disabled={disabled || !isEditable} readOnly={!isEditable}
          placeholder={field.placeholder ?? (isEditable ? `Enter ${field.label.toLowerCase()}` : "Auto-filled")}
          maxLength={field.validation?.max_length}
          className={cn(
            "h-11 rounded-xl",
            !isEditable && "bg-muted/40 text-muted-foreground",
            error && "border-destructive"
          )} />
      )}

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-destructive inline-block shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function KycFormStep({
  customerId, userType, stepKey, totalSteps, submissionId,
  completedSteps, stepNames, onBack, onComplete, onGoToStep,
}: KycFormStepProps) {
  const [formData, setFormData]       = useState<KycFormData | null>(null)
  const [values, setValues]           = useState<Record<string, string>>({})
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [fetchError, setFetchError]   = useState("")
  const [submitError, setSubmitError] = useState("")

  // ── Fetch form definition ─────────────────────────────────────────────────
  const fetchForm = useCallback(async () => {
    setLoading(true); setFetchError("")
    try {
      const res  = await fetch(`${BASE}/kyc/getKycForm`, {
        method: "POST", headers: API_HEADERS,
        body: JSON.stringify({
          form_type: "onboarding", actor: userType, product_code: "SCF",
          scheme_code: "DEFAULT", customer_id: customerId, step_key: stepKey,
        }),
      })
      const data = await res.json()
      if (!data.success || !data.data?.[0]) throw new Error(data.message ?? "Failed to load form")
      const form: KycFormData = data.data[0]
      setFormData(form)

      // ── If this step was already completed, pre-fill with saved data ──────
      if (completedSteps.includes(stepKey) && submissionId) {
        try {
          const prevRes  = await fetch(`${BASE}/kyc/getFormDetails`, {
            method: "POST", headers: API_HEADERS,
            body: JSON.stringify({ submission_id: submissionId, step_key: stepKey }),
          })
          const prevData = await prevRes.json()
          if (prevData.success && prevData.data?.form_data_json) {
            const saved = prevData.data.form_data_json as Record<string, string>
            const init: Record<string, string> = {}
            form.rendered_form.fields.forEach((f) => { init[f.key] = saved[f.key] ?? "" })
            setValues(init)
            return
          }
        } catch { /* fall through to empty init */ }
      }

      // Fresh step — init all empty
      const init: Record<string, string> = {}
      form.rendered_form.fields.forEach((f) => { init[f.key] = "" })
      setValues(init)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load form. Please try again.")
    } finally { setLoading(false) }
  }, [customerId, userType, stepKey, submissionId, completedSteps])

  useEffect(() => { fetchForm() }, [fetchForm])

  const setValue       = (key: string, val: string) => {
    setValues((p) => ({ ...p, [key]: val }))
    setErrors((p) => ({ ...p, [key]: "" }))
  }
  const handleAutoFill = (mapping: Record<string, string>) => {
    setValues((p) => ({ ...p, ...mapping }))
    setErrors((p) => { const n = { ...p }; Object.keys(mapping).forEach((k) => delete n[k]); return n })
  }
  const handleUpload   = (key: string, val: string) => setValue(key, val)

  const validate = (): boolean => {
    if (!formData) return false
    const errs: Record<string, string> = {}
    formData.rendered_form.fields.forEach((f) => {
      if (!isFieldVisible(f, values)) return
      if (f.type === "file" && f.required && !values[f.key]) { errs[f.key] = `${f.label} is required`; return }
      const e = validateField(f, values[f.key] ?? "")
      if (e) errs[f.key] = e
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate() || !formData) return
    setSubmitError(""); setSubmitting(true)
    const form_data: Record<string, string> = {}
    formData.rendered_form.fields.forEach((f) => {
      if (isFieldVisible(f, values)) form_data[f.key] = values[f.key] ?? ""
    })
    try {
      const res  = await fetch(`${BASE}/kyc/formSubmission2`, {
        method: "POST", headers: API_HEADERS,
        body: JSON.stringify({
          customer_id:   customerId,
          submission_id: submissionId || formData.submission_id,
          form_id:       formData.form_id,
          step_key:      stepKey,
          form_data,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message ?? "Submission failed")
      const newSubmissionId = data.data?.submission_id ?? submissionId
      const nextStepKey     = data.data?.step?.next_step_key ?? null
      onComplete(String(newSubmissionId), nextStepKey)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.")
    } finally { setSubmitting(false) }
  }

  const visibleFields = formData?.rendered_form.fields.filter(
    (f) => isFieldVisible(f, values)
  ) ?? []
  const isFullWidth = (f: FormField) => f.type === "textarea" || f.type === "file"

  const stepOrder    = formData ? Number(formData.step.step_order) : 2
  const totalFromApi = formData ? Number(formData.step.total_steps) : totalSteps
  const stepName     = formData?.rendered_form.step_name ?? "KYC Details"

  // Build ordered step keys: mobile_verification is always index 0
  const allStepKeys = ["mobile_verification", ...completedSteps.filter(k => k !== "mobile_verification")]
  if (!allStepKeys.includes(stepKey)) allStepKeys.push(stepKey)

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b bg-background shrink-0">
        <Image src="/logo.png" alt="Logo" width={110} height={36}
          style={{ width: 110, height: "auto" }} className="object-contain" priority />
        <p className="text-sm text-muted-foreground">
          Have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">Sign in</Link>
        </p>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* Desktop vertical stepper sidebar */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 border-r px-8 py-10 bg-muted/20
          sticky top-[73px] self-start max-h-[calc(100vh-73px)] overflow-y-auto">
          <div className="space-y-1 mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Registration</span>
            <h2 className="text-xl font-bold">Complete your profile</h2>
            <p className="text-sm text-muted-foreground">Follow the steps to get started.</p>
          </div>
          <VerticalStepper
            totalSteps={totalFromApi} stepOrder={stepOrder} stepName={stepName}
            stepNames={stepNames} completedSteps={completedSteps}
            allStepKeys={allStepKeys} onGoToStep={onGoToStep}
          />
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">

            {/* Mobile horizontal stepper */}
            <div className="lg:hidden mb-8">
              <HorizontalStepper
                totalSteps={totalFromApi} stepOrder={stepOrder} stepName={stepName}
                stepNames={stepNames} allStepKeys={allStepKeys} onGoToStep={onGoToStep}
              />
            </div>

            {/* Heading */}
            <div className="mb-8 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Step {stepOrder} of {totalFromApi}
              </p>
              <h1 className="text-2xl font-bold tracking-tight">
                {loading ? "Loading…" : stepName}
              </h1>
              <p className="text-muted-foreground text-sm">Fill in the details below to continue.</p>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className={cn("space-y-1.5", i % 5 === 0 ? "sm:col-span-2" : "")}>
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
                <Button variant="outline" className="rounded-xl" onClick={fetchForm}>Try again</Button>
              </div>
            )}

            {/* Form fields */}
            {!loading && !fetchError && formData && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  {visibleFields.map((field) => (
                    <div key={field.key} className={isFullWidth(field) ? "sm:col-span-2" : ""}>
                      <DynamicField
                        field={field}
                        value={values[field.key] ?? ""}
                        onChange={(v) => setValue(field.key, v)}
                        onAutoFill={handleAutoFill}
                        onUploadComplete={handleUpload}
                        submissionId={submissionId}
                        customerId={customerId}
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

                <div className="flex items-center justify-between pt-4 border-t">
                  <button type="button" onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />Back
                  </button>
                  <Button type="button" onClick={handleSubmit} disabled={submitting}
                    className="h-11 px-8 rounded-xl font-semibold">
                    {submitting
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                      : <>Save &amp; Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </div>
              </div>
            )}

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