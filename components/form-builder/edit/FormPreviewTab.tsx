// "use client";

// import { useEffect, useState } from "react";
// import {
//   AlertCircle,
//   Loader2,
//   FileText,
//   ToggleLeft,
//   ChevronDown,
//   Database,
//   Globe,
//   CheckCircle2,
//   ChevronRight,
// } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface DataSource {
//   type: "api" | "database";
//   method?: string;
//   trigger?: string;
//   source_key?: string;
//   endpoint?: string;
//   response_mapping?: Record<string, string> | any[];
// }

// interface Validation {
//   regex?: string;
//   max_length?: number;
// }

// interface PreviewField {
//   key: string;
//   type: "text" | "boolean" | "select" | "number" | "decimal" | "date" | "file" | string;
//   label: string;
//   grid_width?: number;
//   required?: boolean;
//   placeholder?: string;
//   validation?: Validation;
//   data_source?: DataSource;
//   options?: Array<{ label: string; value: string }>;
//   ui?: { visible?: boolean; editable?: boolean };
// }

// interface PreviewStep {
//   step_key: string;
//   step_name: string;
//   step_order: number;
//   rendered_json: PreviewField[];
// }

// // ─── API ──────────────────────────────────────────────────────────────────────

// const BASE_URL = "http://192.168.6.6/www8/2013-Backend/api/v1";
// const HEADERS = {
//   "Content-Type": "application/json",
//   "X-tenant-code": "demo",
// };

// async function fetchActiveSection(formId: number): Promise<PreviewStep[]> {
//   const res = await fetch(`${BASE_URL}/formBuilder/getActiveSection`, {
//     method: "POST",
//     headers: HEADERS,
//     body: JSON.stringify({ form_id: formId }),
//   });
//   const json = await res.json();
//   if (!json.success) throw new Error(json.message || "Failed to fetch sections");
//   return (json.data?.steps ?? []) as PreviewStep[];
// }

// // ─── Field renderer ───────────────────────────────────────────────────────────

// function PreviewField({
//   field,
//   value,
//   onChange,
// }: {
//   field: PreviewField;
//   value: any;
//   onChange: (key: string, val: any) => void;
// }) {
//   const visible = field.ui?.visible ?? true;
//   const editable = field.ui?.editable ?? true;

//   if (!visible) return null;

//   const hasDataSource = !!field.data_source;
//   const hasValidation = !!(field.validation?.regex || field.validation?.max_length);

//   const renderInput = () => {
//     const baseProps = {
//       id: field.key,
//       disabled: !editable,
//       placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}…`,
//       className: !editable ? "bg-muted/50 cursor-not-allowed" : "",
//     };

//     switch (field.type) {
//       case "boolean":
//         return (
//           <div className="flex items-center gap-2 h-9">
//             <Switch
//               id={field.key}
//               disabled={!editable}
//               checked={!!value}
//               onCheckedChange={(checked) => onChange(field.key, checked)}
//             />
//             <Label htmlFor={field.key} className="text-xs text-muted-foreground font-normal cursor-pointer">
//               {value ? "Yes" : "No"}
//             </Label>
//           </div>
//         );

//       case "select":
//         return (
//           <Select
//             value={value || ""}
//             onValueChange={(v) => onChange(field.key, v)}
//             disabled={!editable}
//           >
//             <SelectTrigger className={baseProps.className}>
//               <SelectValue placeholder={`Select ${field.label.toLowerCase()}…`} />
//             </SelectTrigger>
//             <SelectContent>
//               {field.options?.length ? (
//                 field.options.map((opt) => (
//                   <SelectItem key={opt.value} value={opt.value}>
//                     {opt.label}
//                   </SelectItem>
//                 ))
//               ) : (
//                 <SelectItem value="__empty" disabled>
//                   No options available
//                 </SelectItem>
//               )}
//             </SelectContent>
//           </Select>
//         );

//       case "file":
//         return (
//           <div className={`flex items-center gap-2 h-9 px-3 border rounded-md text-sm text-muted-foreground ${!editable ? "bg-muted/50" : "bg-background"}`}>
//             <FileText className="size-3.5 shrink-0" />
//             <span className="text-xs">
//               {value ? (value as File).name : "No file chosen"}
//             </span>
//             {editable && (
//               <label className="ml-auto cursor-pointer">
//                 <span className="text-xs text-primary hover:underline">Browse</span>
//                 <input
//                   type="file"
//                   className="hidden"
//                   onChange={(e) => onChange(field.key, e.target.files?.[0] ?? null)}
//                 />
//               </label>
//             )}
//           </div>
//         );

//       case "number":
//       case "decimal":
//         return (
//           <Input
//             {...baseProps}
//             type="number"
//             step={field.type === "decimal" ? "0.01" : "1"}
//             value={value ?? ""}
//             onChange={(e) => onChange(field.key, e.target.value)}
//           />
//         );

//       case "date":
//         return (
//           <Input
//             {...baseProps}
//             type="date"
//             value={value ?? ""}
//             onChange={(e) => onChange(field.key, e.target.value)}
//           />
//         );

//       default: // text and anything unrecognised
//         return (
//           <Input
//             {...baseProps}
//             value={value ?? ""}
//             maxLength={field.validation?.max_length}
//             onChange={(e) => onChange(field.key, e.target.value)}
//           />
//         );
//     }
//   };

//   return (
//     <div className="space-y-1.5">
//       {/* Label row */}
//       <div className="flex items-center gap-1.5 flex-wrap">
//         <Label htmlFor={field.key} className="text-xs font-medium leading-none">
//           {field.label}
//           {field.required && <span className="text-destructive ml-0.5">*</span>}
//         </Label>

//         {/* Metadata badges */}
//         {!editable && (
//           <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 leading-none">
//             read-only
//           </Badge>
//         )}
//         {hasDataSource && (
//           <Badge
//             variant="outline"
//             className="text-[10px] px-1.5 py-0 h-4 leading-none flex items-center gap-0.5 border-blue-200 text-blue-600 bg-blue-50"
//           >
//             {field.data_source!.type === "api" ? (
//               <Globe className="size-2.5" />
//             ) : (
//               <Database className="size-2.5" />
//             )}
//             {field.data_source!.source_key ?? field.data_source!.type}
//           </Badge>
//         )}
//         {field.validation?.max_length && (
//           <span className="text-[10px] text-muted-foreground/60">
//             max {field.validation.max_length}
//           </span>
//         )}
//       </div>

//       {/* Input */}
//       {renderInput()}

//       {/* Regex hint */}
//       {field.validation?.regex && (
//         <p className="text-[10px] text-muted-foreground/60 font-mono truncate">
//           pattern: {field.validation.regex}
//         </p>
//       )}
//     </div>
//   );
// }

// // ─── Step form ────────────────────────────────────────────────────────────────

// function StepForm({ step }: { step: PreviewStep }) {
//   const [values, setValues] = useState<Record<string, any>>({});

//   const handleChange = (key: string, val: any) => {
//     setValues((prev) => ({ ...prev, [key]: val }));
//   };

//   const fields = step.rendered_json ?? [];

//   if (fields.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
//         <FileText className="size-8 mb-2 opacity-30" />
//         <p className="text-sm font-medium">No fields configured</p>
//         <p className="text-xs mt-1">Add fields to this section using the builder</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-5">
//       <div className="grid grid-cols-12 gap-x-4 gap-y-5">
//         {fields.map((field) => {
//           const colSpan = field.grid_width ?? 12;
//           return (
//             <div
//               key={field.key}
//               className={`col-span-12 sm:col-span-${colSpan}`}
//             >
//               <PreviewField
//                 field={field}
//                 value={values[field.key]}
//                 onChange={handleChange}
//               />
//             </div>
//           );
//         })}
//       </div>

//       {/* Preview submit */}
//       <div className="flex justify-end pt-2 border-t border-border">
//         <Button
//           size="sm"
//           variant="outline"
//           onClick={() => console.log("[Preview] form values:", values)}
//         >
//           <CheckCircle2 className="size-3.5 mr-1.5" />
//           Log values (preview only)
//         </Button>
//       </div>
//     </div>
//   );
// }

// // ─── Main component ───────────────────────────────────────────────────────────

// interface FormPreviewTabProps {
//   formId: number | string;
// }

// export function FormPreviewTab({ formId }: FormPreviewTabProps) {
//   const [steps, setSteps] = useState<PreviewStep[]>([]);
//   const [activeStep, setActiveStep] = useState<string>("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!formId) return;
//     setLoading(true);
//     setError("");
//     fetchActiveSection(Number(formId))
//       .then((data) => {
//         const sorted = [...data].sort((a, b) => a.step_order - b.step_order);
//         setSteps(sorted);
//         if (sorted.length > 0) setActiveStep(sorted[0].step_key);
//       })
//       .catch((e) => setError(e.message || "Failed to load preview"))
//       .finally(() => setLoading(false));
//   }, [formId]);

//   // ── Loading ───────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="mt-4 flex items-center justify-center py-20 text-muted-foreground gap-2">
//         <Loader2 className="size-4 animate-spin" />
//         <span className="text-sm">Loading preview…</span>
//       </div>
//     );
//   }

//   // ── Error ─────────────────────────────────────────────────────────────────
//   if (error) {
//     return (
//       <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
//         <AlertCircle className="size-4 shrink-0" />
//         {error}
//         <Button
//           variant="link"
//           size="sm"
//           className="ml-auto text-destructive p-0 h-auto"
//           onClick={() => {
//             setLoading(true);
//             fetchActiveSection(Number(formId))
//               .then((data) => {
//                 const sorted = [...data].sort((a, b) => a.step_order - b.step_order);
//                 setSteps(sorted);
//                 if (sorted.length > 0) setActiveStep(sorted[0].step_key);
//                 setError("");
//               })
//               .catch((e) => setError(e.message))
//               .finally(() => setLoading(false));
//           }}
//         >
//           Retry
//         </Button>
//       </div>
//     );
//   }

//   // ── Empty ─────────────────────────────────────────────────────────────────
//   if (steps.length === 0) {
//     return (
//       <div className="mt-4 flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
//         <FileText className="size-8 mb-2 opacity-30" />
//         <p className="text-sm font-medium">No active sections</p>
//         <p className="text-xs mt-1">Publish a section to see the preview here</p>
//       </div>
//     );
//   }

//   const currentStep = steps.find((s) => s.step_key === activeStep) ?? steps[0];

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="mt-4 space-y-4">
//       {/* Step progress bar */}
//       <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
//         {steps.map((step, index) => {
//           const isActive = step.step_key === activeStep;
//           const isDone = step.step_order < (currentStep?.step_order ?? 1);
//           return (
//             <div key={step.step_key} className="flex items-center shrink-0">
//               {index > 0 && (
//                 <ChevronRight className="size-3 text-muted-foreground/40 mx-0.5 shrink-0" />
//               )}
//               <button
//                 onClick={() => setActiveStep(step.step_key)}
//                 className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap
//                   ${isActive
//                     ? "bg-primary text-primary-foreground shadow-sm"
//                     : isDone
//                     ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
//                     : "bg-muted/60 text-muted-foreground hover:bg-muted"
//                   }`}
//               >
//                 <span className={`flex size-4 items-center justify-center rounded-full text-[10px] font-bold
//                   ${isActive ? "bg-white/20" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-background"}`}>
//                   {isDone ? "✓" : step.step_order}
//                 </span>
//                 {step.step_name}
//                 {step.rendered_json.length > 0 && (
//                   <span className={`text-[10px] ${isActive ? "opacity-70" : "text-muted-foreground/60"}`}>
//                     ({step.rendered_json.length})
//                   </span>
//                 )}
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {/* Step form card */}
//       <div className="rounded-xl border border-border bg-card">
//         {/* Section header */}
//         <div className="flex items-center justify-between px-5 py-4 border-b border-border">
//           <div>
//             <h3 className="text-sm font-semibold text-foreground">
//               {currentStep.step_name}
//             </h3>
//             <p className="text-xs text-muted-foreground font-mono mt-0.5">
//               {currentStep.step_key}
//             </p>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <Badge variant="secondary" className="text-xs">
//               Step {currentStep.step_order} of {steps.length}
//             </Badge>
//             <Badge variant="outline" className="text-xs">
//               {currentStep.rendered_json.length} field{currentStep.rendered_json.length !== 1 ? "s" : ""}
//             </Badge>
//           </div>
//         </div>

//         {/* Fields */}
//         <div className="p-5">
//           <StepForm key={currentStep.step_key} step={currentStep} />
//         </div>
//       </div>

//       {/* Step navigation */}
//       {steps.length > 1 && (
//         <div className="flex items-center justify-between pt-1">
//           <Button
//             variant="outline"
//             size="sm"
//             disabled={currentStep.step_order === 1}
//             onClick={() => {
//               const prev = steps.find((s) => s.step_order === currentStep.step_order - 1);
//               if (prev) setActiveStep(prev.step_key);
//             }}
//           >
//             ← Previous
//           </Button>
//           <span className="text-xs text-muted-foreground">
//             {currentStep.step_order} / {steps.length}
//           </span>
//           <Button
//             variant="outline"
//             size="sm"
//             disabled={currentStep.step_order === steps.length}
//             onClick={() => {
//               const next = steps.find((s) => s.step_order === currentStep.step_order + 1);
//               if (next) setActiveStep(next.step_key);
//             }}
//           >
//             Next →
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import {
  FileText,
  Globe,
  Database,
  ChevronRight,
  Plus,
  X,
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

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface FieldDef {
  key: string;
  type: "text" | "boolean" | "select" | "number" | "decimal" | "date" | "file" | string;
  label: string;
  grid_width?: number;
  required?: boolean;
  placeholder?: string;
  validation?: Validation;
  data_source?: DataSource;
  options?: Array<{ label: string; value: string }>;
  ui?: { visible?: boolean; editable?: boolean };
}

interface SubSection {
  sub_section_key: string;
  sub_section_name: string;
  sub_section_order: number;
  parent_step_key: string;
  repeatable: boolean;
  rendered_json: FieldDef[];
}

interface Step {
  step_key: string;
  step_name: string;
  step_order: number;
  rendered_json: FieldDef[];
  sub_sections?: SubSection[];
}

// ─── Hardcoded data ───────────────────────────────────────────────────────────

const HARDCODED_STEPS: Step[] = [
  {
    step_key: "applicant_details",
    step_name: "Applicant Details",
    step_order: 1,
    rendered_json: [
      {
        key: "full_name",
        type: "text",
        label: "Full Name",
        grid_width: 12,
        validation: { max_length: 150 },
      },
      {
        key: "family_members",
        type: "number",
        label: "Family Members",
        grid_width: 6,
        validation: { max_length: 150 },
      },
    ],
    sub_sections: [
      {
        sub_section_key: "qwe",
        sub_section_name: "Family Members",
        sub_section_order: 1,
        parent_step_key: "applicant_details",
        repeatable: true,
        rendered_json: [
          {
            key: "full_name",
            type: "text",
            label: "Full Name",
            grid_width: 12,
            validation: { max_length: 10 },
          },
          {
            key: "Relation",
            type: "text",
            label: "Relation",
            grid_width: 12,
          },
          {
            key: "Age",
            type: "number",
            label: "Age",
            grid_width: 12,
          },
        ],
      },
      {
        sub_section_key: "awe",
        sub_section_name: "Family Members",
        sub_section_order: 1,
        parent_step_key: "applicant_details",
        repeatable: false,
        rendered_json: [
          {
            key: "full_name",
            type: "text",
            label: "Full Name",
            grid_width: 12,
            validation: { max_length: 150 },
          },
          {
            key: "Relation",
            type: "text",
            label: "Relation",
            grid_width: 12,
          },
          {
            key: "Age",
            type: "number",
            label: "Age",
            grid_width: 12,
          },
        ],
      },
    ],
  },
  {
    step_key: "residence_details",
    step_name: "Residence Details",
    step_order: 2,
    rendered_json: [
      {
        key: "address_line1",
        type: "text",
        label: "Address",
        grid_width: 12,
        validation: { max_length: 255 },
        data_source: {
          type: "database",
          method: "GET",
          trigger: "onChange",
          source_key: "PINCODE_DB",
          response_mapping: { district: "address_line1" },
        },
        placeholder: "Enter your address",
      },
    ],
  },
  {
    step_key: "business",
    step_name: "Business",
    step_order: 3,
    rendered_json: [],
  },
];

// ─── Single field renderer ────────────────────────────────────────────────────

function FieldInput({
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

  const disabledClass = !editable ? "bg-muted/50 cursor-not-allowed" : "";

  switch (field.type) {
    case "boolean":
      return (
        <div className="flex items-center gap-2 h-9">
          <Switch
            id={field.key}
            disabled={!editable}
            checked={!!value}
            onCheckedChange={(checked) => onChange(field.key, checked)}
          />
          <Label htmlFor={field.key} className="text-xs text-muted-foreground font-normal cursor-pointer">
            {value ? "Yes" : "No"}
          </Label>
        </div>
      );

    case "select":
      return (
        <Select value={value || ""} onValueChange={(v) => onChange(field.key, v)} disabled={!editable}>
          <SelectTrigger className={disabledClass}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}…`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.length ? (
              field.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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

// ─── Field with label + badges ────────────────────────────────────────────────

function PreviewField({
  field,
  value,
  onChange,
  hideLabel = false,
}: {
  field: FieldDef;
  value: any;
  onChange: (key: string, val: any) => void;
  hideLabel?: boolean;
}) {
  const visible = field.ui?.visible ?? true;
  const editable = field.ui?.editable ?? true;
  const hasDataSource = !!field.data_source;

  if (!visible) return null;

  return (
    <div className="space-y-1.5">
      {!hideLabel && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Label htmlFor={field.key} className="text-xs font-medium leading-none">
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          {!editable && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 leading-none">
              read-only
            </Badge>
          )}
          {hasDataSource && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 leading-none flex items-center gap-0.5 border-blue-200 text-blue-600 bg-blue-50">
              {field.data_source!.type === "api" ? <Globe className="size-2.5" /> : <Database className="size-2.5" />}
              {field.data_source!.source_key ?? field.data_source!.type}
            </Badge>
          )}
          {field.validation?.max_length && (
            <span className="text-[10px] text-muted-foreground/60">max {field.validation.max_length}</span>
          )}
        </div>
      )}
      <FieldInput field={field} value={value} onChange={onChange} />
      {field.validation?.regex && (
        <p className="text-[10px] text-muted-foreground/60 font-mono truncate">
          pattern: {field.validation.regex}
        </p>
      )}
    </div>
  );
}

// ─── Repeatable sub-section ───────────────────────────────────────────────────

function RepeatableSubSection({ subSection }: { subSection: SubSection }) {
  const fields = subSection.rendered_json;
  // Each row is a Record<fieldKey, value>
  const [rows, setRows] = useState<Record<string, any>[]>([{}]);

  const addRow = () => setRows((prev) => [...prev, {}]);

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (rowIndex: number, key: string, val: any) => {
    setRows((prev) =>
      prev.map((row, i) => (i === rowIndex ? { ...row, [key]: val } : row))
    );
  };

  // Build grid template: fields split equally, last col for remove button
  const colTemplate = `repeat(${fields.length}, minmax(0,1fr)) 36px`;

  return (
    <div className="mt-4 border border-border rounded-lg overflow-hidden">
      {/* Sub-section header */}
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
      <div
        className="grid gap-3 px-4 pt-3 pb-1"
        style={{ gridTemplateColumns: colTemplate }}
      >
        {fields.map((field) => (
          <div key={field.key} className="text-[11px] font-medium text-muted-foreground">
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </div>
        ))}
        <div /> {/* spacer for remove col */}
      </div>

      {/* Rows */}
      <div className="px-4 pb-3 space-y-2">
        {rows.map((rowValues, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3 items-center"
            style={{ gridTemplateColumns: colTemplate }}
          >
            {fields.map((field) => (
              <FieldInput
                key={field.key}
                field={field}
                value={rowValues[field.key]}
                onChange={(key, val) => handleChange(rowIndex, key, val)}
              />
            ))}
            <button
              onClick={() => removeRow(rowIndex)}
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

// ─── Non-repeatable sub-section ───────────────────────────────────────────────

function StaticSubSection({ subSection }: { subSection: SubSection }) {
  const [values, setValues] = useState<Record<string, any>>({});
  const handleChange = (key: string, val: any) => setValues((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="mt-4 border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
        <span className="text-xs font-medium text-foreground">{subSection.sub_section_name}</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-12 gap-x-4 gap-y-4">
          {subSection.rendered_json.map((field) => (
            <div key={field.key} className={`col-span-12 sm:col-span-${field.grid_width ?? 12}`}>
              <PreviewField field={field} value={values[field.key]} onChange={handleChange} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step form ────────────────────────────────────────────────────────────────

function StepForm({ step }: { step: Step }) {
  const [values, setValues] = useState<Record<string, any>>({});
  const handleChange = (key: string, val: any) => setValues((prev) => ({ ...prev, [key]: val }));

  const hasTopFields = step.rendered_json.length > 0;
  const hasSubSections = (step.sub_sections ?? []).length > 0;

  if (!hasTopFields && !hasSubSections) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FileText className="size-8 mb-2 opacity-30" />
        <p className="text-sm font-medium">No fields configured</p>
        <p className="text-xs mt-1">Add fields to this section using the builder</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Top-level fields */}
      {hasTopFields && (
        <div className="grid grid-cols-12 gap-x-4 gap-y-5">
          {step.rendered_json.map((field) => (
            <div key={field.key} className={`col-span-12 sm:col-span-${field.grid_width ?? 12}`}>
              <PreviewField field={field} value={values[field.key]} onChange={handleChange} />
            </div>
          ))}
        </div>
      )}

      {/* Sub-sections */}
      {(step.sub_sections ?? [])
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
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FormPreviewTab({ formId }: { formId: number | string }) {
  const steps = HARDCODED_STEPS.slice().sort((a, b) => a.step_order - b.step_order);
  const [activeStep, setActiveStep] = useState<string>(steps[0]?.step_key ?? "");

  const currentStep = steps.find((s) => s.step_key === activeStep) ?? steps[0];

  return (
    <div className="mt-4 space-y-4">
      {/* Step progress bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {steps.map((step, index) => {
          const isActive = step.step_key === activeStep;
          const isDone = step.step_order < (currentStep?.step_order ?? 1);
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
                {(step.rendered_json.length + (step.sub_sections?.length ?? 0)) > 0 && (
                  <span className={`text-[10px] ${isActive ? "opacity-70" : "text-muted-foreground/60"}`}>
                    ({step.rendered_json.length})
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Step card */}
      <div className="rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{currentStep.step_name}</h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{currentStep.step_key}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep.step_order} of {steps.length}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {currentStep.rendered_json.length} field{currentStep.rendered_json.length !== 1 ? "s" : ""}
            </Badge>
            {(currentStep.sub_sections?.length ?? 0) > 0 && (
              <Badge variant="outline" className="text-xs">
                {currentStep.sub_sections!.length} sub-section{currentStep.sub_sections!.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="p-5">
          <StepForm key={currentStep.step_key} step={currentStep} />
        </div>
      </div>

      {/* Step navigation */}
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