"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Globe,
  Database,
  ChevronRight,
  Plus,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── API config ───────────────────────────────────────────────────────────────

const BASE_URL = "http://192.168.6.6/www8/2013-Backend/api/v1";
const HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "X-tenant-code": "demo",
};


// ─── Grid width → Tailwind col-span map ──────────────────────────────────────
// Dynamic class names get purged by Tailwind — must use static map.
const COL_SPAN: Record<number, string> = {
  1:  "col-span-1",
  2:  "col-span-2",
  3:  "col-span-3",
  4:  "col-span-4",
  5:  "col-span-5",
  6:  "col-span-6",
  7:  "col-span-7",
  8:  "col-span-8",
  9:  "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

function colSpan(width?: number) {
  return COL_SPAN[width ?? 12] ?? "col-span-12";
}

// ─── API types (raw shape from server) ────────────────────────────────────────

interface ApiSubStep {
  id: number;
  form_id?: number;
  parent_step_id: number;
  step_key: string;
  step_name: string;
  step_order: number;
  repeatable: 0 | 1 | boolean; // server sends 0/1
  is_mandatory?: number;
  is_skippable?: number;
  rendered_json: { fields: FieldDef[] };
  sub_steps?: any[];
}

interface ApiParentStep {
  id: number;
  form_id?: number;
  parent_step_key: string;
  parent_step_name: string;
  rendered_json: { fields: FieldDef[] };
}

// Each element in data.steps is { parent_step, sub_steps }
interface ApiStepWrapper {
  parent_step: ApiParentStep;
  sub_steps: ApiSubStep[];
}

// ─── Internal types ───────────────────────────────────────────────────────────

interface DataSource {
  type: "api" | "database";
  method?: string;
  trigger?: string;
  source_key?: string;
  endpoint?: string;
  response_mapping?: Record<string, string> | any[];
}

interface Validation {
  regex?: string;
  max_length?: number;
}

interface FieldAction {
  type: "conditional" | "always" | string;
  field: string;       // key of the controlling field
  value: any;          // value that triggers visibility
  trigger?: string;
  operator?: "equals" | "not_equals" | string;
}

interface FieldDef {
  key: string;
  type: "text" | "boolean" | "select" | "number" | "decimal" | "date" | "file" | string;
  label: string;
  grid_width?: number;
  required?: boolean;
  placeholder?: string;
  validation?: Validation;
  data_source?: DataSource;
  options?: Array<{ key: string; label: string }>;
  ui?: { visible?: boolean; editable?: boolean };
  actions?: FieldAction[];
}

// ─── Visibility helper ────────────────────────────────────────────────────────
// A field is visible when:
//   • it has no actions array, OR
//   • none of its actions are "conditional" (treat as always-show), OR
//   • at least one "conditional" action's condition is satisfied

function isFieldVisible(field: FieldDef, values: Record<string, any>): boolean {
  const conditionals = (field.actions ?? []).filter((a) => a.type === "conditional");

  // No conditional actions → always show
  if (conditionals.length === 0) return true;

  // Show if ANY conditional passes (OR logic across multiple actions)
  return conditionals.some((action) => {
    const controllingValue = values[action.field];
    switch (action.operator) {
      case "not_equals":
        return controllingValue !== action.value;
      case "equals":
      default:
        return controllingValue === action.value;
    }
  });
}

// Normalised sub-section used internally
interface SubSection {
  id?: number;
  sub_section_key: string;
  sub_section_name: string;
  sub_section_order: number;
  parent_step_id?: number;
  repeatable: boolean;
  rendered_json: FieldDef[];
}

// Normalised step used internally
interface Step {
  step_key: string;
  step_name: string;
  step_order: number;
  rendered_json: FieldDef[];
  sub_sections: SubSection[];
}

// ─── Normalise API response → internal shape ──────────────────────────────────

function normaliseWrapper(wrapper: ApiStepWrapper, index: number): Step {
  const p = wrapper.parent_step;
  return {
    step_key: p.parent_step_key,
    step_name: p.parent_step_name,
    step_order: index + 1,           // no step_order on parent_step; use array position
    rendered_json: p.rendered_json?.fields ?? [],
    sub_sections: (wrapper.sub_steps ?? []).map((s) => ({
      id: s.id,
      sub_section_key: s.step_key,
      sub_section_name: s.step_name,
      sub_section_order: s.step_order,
      parent_step_id: s.parent_step_id,
      repeatable: Boolean(s.repeatable),  // coerce 0/1 → false/true
      rendered_json: s.rendered_json?.fields ?? [],
    })),
  };
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchSteps(formId: number): Promise<Step[]> {
  const res = await fetch(`${BASE_URL}/formBuilder/getActiveSection`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ form_id: formId }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);

  const json = await res.json();
  if (!json.success) throw new Error(json.message || "API returned success: false");

  const wrappers: ApiStepWrapper[] = json.data?.steps ?? [];
  return wrappers.map(normaliseWrapper);  // order preserved from API array
}

// ─── FieldInput ───────────────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: any;
  onChange: (key: string, val: any) => void;
}) {
  const editable = field.ui?.editable ?? true;
  const disabledClass = !editable ? "bg-muted/50 cursor-not-allowed" : "";

  switch (field.type) {
    case "boolean":
      return (
        <div className="flex items-center gap-2 h-9">
          <Switch
            id={field.key}
            disabled={!editable}
            checked={!!value}
            onCheckedChange={(v) => onChange(field.key, v)}
          />
          <Label htmlFor={field.key} className="text-xs text-muted-foreground font-normal cursor-pointer">
            {value ? "Yes" : "No"}
          </Label>
        </div>
      );

    case "select":
      return (
        <Select value={value || ""} onValueChange={(v) => onChange(field.key, v)} disabled={!editable}>
          <SelectTrigger className={`w-full ${disabledClass}`}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}…`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.length ? (
              field.options.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
              ))
            ) : (
              <SelectItem value="__empty" disabled>No options available</SelectItem>
            )}
          </SelectContent>
        </Select>
      );

    case "file":
      return (
        <div className={`flex items-center gap-2 h-9 px-3 border rounded-md text-sm text-muted-foreground ${!editable ? "bg-muted/50" : "bg-background"}`}>
          <FileText className="size-3.5 shrink-0" />
          <span className="text-xs">{value ? (value as File).name : "No file chosen"}</span>
          {editable && (
            <label className="ml-auto cursor-pointer">
              <span className="text-xs text-primary hover:underline">Browse</span>
              <input type="file" className="hidden" onChange={(e) => onChange(field.key, e.target.files?.[0] ?? null)} />
            </label>
          )}
        </div>
      );

    case "number":
    case "decimal":
      return (
        <Input
          id={field.key}
          type="number"
          step={field.type === "decimal" ? "0.01" : "1"}
          disabled={!editable}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}…`}
          className={disabledClass}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "date":
      return (
        <Input
          id={field.key}
          type="date"
          disabled={!editable}
          className={disabledClass}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    default:
      return (
        <Input
          id={field.key}
          disabled={!editable}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}…`}
          className={disabledClass}
          value={value ?? ""}
          maxLength={field.validation?.max_length}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
  }
}

// ─── PreviewField (label + badges + input) ────────────────────────────────────

function PreviewField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: any;
  onChange: (key: string, val: any) => void;
}) {
  const visible = field.ui?.visible ?? true;
  const editable = field.ui?.editable ?? true;

  if (!visible) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <Label htmlFor={field.key} className="text-xs font-medium leading-none">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {!editable && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 leading-none">read-only</Badge>
        )}
        {field.data_source && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 leading-none flex items-center gap-0.5 border-blue-200 text-blue-600 bg-blue-50">
            {field.data_source.type === "api" ? <Globe className="size-2.5" /> : <Database className="size-2.5" />}
            {field.data_source.source_key ?? field.data_source.type}
          </Badge>
        )}
        {field.validation?.max_length && (
          <span className="text-[10px] text-muted-foreground/60">max {field.validation.max_length}</span>
        )}
      </div>
      <FieldInput field={field} value={value} onChange={onChange} />
      {field.validation?.regex && (
        <p className="text-[10px] text-muted-foreground/60 font-mono truncate">pattern: {field.validation.regex}</p>
      )}
    </div>
  );
}

// ─── RepeatableSubSection ─────────────────────────────────────────────────────

function RepeatableSubSection({ subSection }: { subSection: SubSection }) {
  const fields = subSection.rendered_json;
  const [rows, setRows] = useState<Record<string, any>[]>([{}]);

  const addRow = () => setRows((p) => [...p, {}]);
  const removeRow = (i: number) => {
    if (rows.length <= 1) return;
    setRows((p) => p.filter((_, idx) => idx !== i));
  };
  const handleChange = (rowIdx: number, key: string, val: any) =>
    setRows((p) => p.map((row, i) => (i === rowIdx ? { ...row, [key]: val } : row)));

  const colTemplate = `repeat(${fields.length}, minmax(0,1fr)) 36px`;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
        <span className="text-xs font-medium text-foreground">{subSection.sub_section_name}</span>
        <button
          onClick={addRow}
          className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-600 hover:bg-emerald-700 transition-colors"
          title="Add row"
        >
          <Plus className="size-3.5 text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Column headers */}
      <div className="grid gap-3 px-4 pt-3 pb-1" style={{ gridTemplateColumns: colTemplate }}>
        {fields.map((f) => (
          <div key={f.key} className="text-[11px] font-medium text-muted-foreground">
            {f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}
          </div>
        ))}
        <div />
      </div>

      {/* Rows */}
      <div className="px-4 pb-3 space-y-2">
        {rows.map((rowValues, rowIdx) => (
          <div key={rowIdx} className="grid gap-3 items-center" style={{ gridTemplateColumns: colTemplate }}>
            {fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={rowValues[f.key]}
                onChange={(key, val) => handleChange(rowIdx, key, val)}
              />
            ))}
            <button
              onClick={() => removeRow(rowIdx)}
              disabled={rows.length <= 1}
              className="flex items-center justify-center w-8 h-9 rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Remove row"
            >
              <X className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── StaticSubSection ─────────────────────────────────────────────────────────

function StaticSubSection({ subSection }: { subSection: SubSection }) {
  const [values, setValues] = useState<Record<string, any>>({});
  const handleChange = (key: string, val: any) => setValues((p) => ({ ...p, [key]: val }));

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
        <span className="text-xs font-medium text-foreground">{subSection.sub_section_name}</span>
      </div>
      <div className="p-4">
        {subSection.rendered_json.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 text-center py-4">No fields configured</p>
        ) : (
          <div className="grid grid-cols-12 gap-x-4 gap-y-4">
            {subSection.rendered_json.map((field) =>
              isFieldVisible(field, values) ? (
                <div key={field.key} className={colSpan(field.grid_width)}>
                  <PreviewField field={field} value={values[field.key]} onChange={handleChange} />
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── StepForm ─────────────────────────────────────────────────────────────────

function StepForm({ step }: { step: Step }) {
  const [values, setValues] = useState<Record<string, any>>({});
  const handleChange = (key: string, val: any) => setValues((p) => ({ ...p, [key]: val }));

  const hasTopFields = step.rendered_json.length > 0;
  const hasSubSections = step.sub_sections.length > 0;

  if (!hasTopFields && !hasSubSections) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FileText className="size-8 mb-2 opacity-30" />
        <p className="text-sm font-medium">No fields configured</p>
        <p className="text-xs mt-1">Add fields to this step using the builder</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top-level fields */}
      {hasTopFields && (
        <div className="grid grid-cols-12 gap-x-4 gap-y-5">
          {step.rendered_json.map((field) =>
            isFieldVisible(field, values) ? (
              <div key={field.key} className={colSpan(field.grid_width)}>
                <PreviewField field={field} value={values[field.key]} onChange={handleChange} />
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Sub-sections */}
      {hasSubSections && (
        <div className="space-y-3">
          {step.sub_sections
            .slice()
            .sort((a, b) => a.sub_section_order - b.sub_section_order)
            .map((sub) =>
              sub.repeatable ? (
                <RepeatableSubSection key={sub.sub_section_key} subSection={sub} />
              ) : (
                <StaticSubSection key={sub.sub_section_key} subSection={sub} />
              )
            )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface FormPreviewTabProps {
  formId: number | string;
}

export function FormPreviewTab({ formId }: FormPreviewTabProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [activeStep, setActiveStep] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSteps(Number(formId));
      setSteps(data);
      // Preserve active step across reloads if still present, else default to first
      setActiveStep((prev) =>
        data.find((s) => s.step_key === prev) ? prev : data[0]?.step_key ?? ""
      );
    } catch (e: any) {
      setError(e.message || "Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [formId]); // re-fetch when formId changes

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mt-4 flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-sm">Loading form…</span>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (steps.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
        <FileText className="size-8 mb-2 opacity-30" />
        <p className="text-sm font-medium">No active sections</p>
        <p className="text-xs mt-1">Publish a section to see the preview here</p>
      </div>
    );
  }

  const currentStep = steps.find((s) => s.step_key === activeStep) ?? steps[0];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mt-4 space-y-4 w-full min-w-0 overflow-hidden">
      {/* Step progress bar */}
      <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="flex items-center gap-1 pb-2 w-max">
        {steps.map((step, index) => {
          const isActive = step.step_key === activeStep;
          const isDone = step.step_order < currentStep.step_order;
          return (
            <div key={step.step_key} className="flex items-center shrink-0">
              {index > 0 && (
                <ChevronRight className="size-3 text-muted-foreground/40 mx-0.5 shrink-0" />
              )}
              <button
                onClick={() => setActiveStep(step.step_key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap
                  ${isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isDone
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full text-[10px] font-bold
                  ${isActive ? "bg-white/20" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-background"}`}
                >
                  {isDone ? "✓" : step.step_order}
                </span>
                {step.step_name}
                {step.rendered_json.length > 0 && (
                  <span className={`text-[10px] ${isActive ? "opacity-70" : "text-muted-foreground/60"}`}>
                    ({step.rendered_json.length})
                  </span>
                )}
              </button>
            </div>
          );
        })}
        </div>
      </div>

      {/* Step card */}
      <div className="rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{currentStep.step_name}</h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{currentStep.step_key}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep.step_order} of {steps.length}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {currentStep.rendered_json.length} field{currentStep.rendered_json.length !== 1 ? "s" : ""}
            </Badge>
            {currentStep.sub_sections.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {currentStep.sub_sections.length} sub-step{currentStep.sub_sections.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <StepForm key={currentStep.step_key} step={currentStep} />
        </div>
      </div>

      {/* Navigation */}
      {steps.length > 1 && (
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentStep.step_order === 1}
            onClick={() => {
              const prev = steps.find((s) => s.step_order === currentStep.step_order - 1);
              if (prev) setActiveStep(prev.step_key);
            }}
          >
            ← Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentStep.step_order} / {steps.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentStep.step_order === steps.length}
            onClick={() => {
              const next = steps.find((s) => s.step_order === currentStep.step_order + 1);
              if (next) setActiveStep(next.step_key);
            }}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}