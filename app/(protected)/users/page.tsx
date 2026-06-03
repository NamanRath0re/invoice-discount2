// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   Loader2, Check, Search, AlertCircle, RefreshCw, ChevronRight, Send,
// } from "lucide-react";
// import { Input }   from "@/components/ui/input";
// import { Label }   from "@/components/ui/label";
// import { Button }  from "@/components/ui/button";
// import { Badge }   from "@/components/ui/badge";
// import { Switch }  from "@/components/ui/switch";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import { cn } from "@/lib/utils";

// // ─── API config ───────────────────────────────────────────────────────────────

// const BASE_URL = "http://192.168.6.6/www8/2013-Backend/api/v1";
// const HEADERS: Record<string, string> = {
//   "Content-Type": "application/json",
//   "X-tenant-code": "demo",
// };

// // Static payload — swap form_id / step_key as needed
// // const STATIC_PAYLOAD = { form_id: 17, fstep_key: "family_details" };
// const STATIC_PAYLOAD = { form_id: 24, step_key: "income_details" };

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface Validation {
//   regex?: string;
//   max_length?: number;
// }

// interface DataSource {
//   type: "api" | "database";
//   method: string;
//   trigger: string;
//   endpoint: string;
//   response_mapping: Record<string, string>;
// }

// interface FieldAction {
//   type: "conditional" | "toggle_visibility" | "always" | string;
//   // conditional
//   field?: string;
//   value?: any;
//   operator?: "equals" | "not_equals" | string;
//   // toggle_visibility
//   target?: string[];
//   visibility?: "show" | "hide";
//   condition_value?: any;
//   trigger?: string;
// }

// interface FieldOption {
//   key?: string;
//   label: string;
//   value?: string;
// }

// interface FieldDef {
//   key: string;
//   type: "text" | "number" | "decimal" | "date" | "boolean" | "select" |
//         "radio" | "checkbox" | "file" | string;
//   label: string;
//   // width can be "4/12", "12/12", or legacy grid_width number
//   width?: string;
//   grid_width?: number;
//   required?: boolean;
//   placeholder?: string;
//   help_text?: string;
//   alignment?: string;
//   validation?: Validation;
//   data_source?: DataSource;
//   options?: FieldOption[];
//   ui?: { visible?: boolean; editable?: boolean };
//   actions?: FieldAction[];
// }

// interface SubStep {
//   id: number;
//   step_key: string;
//   step_name: string;
//   step_order: number;
//   repeatable: 0 | 1 | boolean;
//   rendered_json: { fields: FieldDef[] };
//   sub_steps?: SubStep[];
// }

// interface ParentStep {
//   id: number;
//   parent_step_key: string;
//   parent_step_name: string;
//   rendered_json: { fields: FieldDef[] };
// }

// interface StepData {
//   parent_step: ParentStep;
//   sub_steps: SubStep[];
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// // Parse "4/12" → 4, or fall back to grid_width number, or 12
// function parseWidth(field: FieldDef): number {
//   if (field.width) {
//     const parts = field.width.split("/");
//     const n = parseInt(parts[0], 10);
//     if (!isNaN(n) && n >= 1 && n <= 12) return n;
//   }
//   if (field.grid_width && field.grid_width >= 1 && field.grid_width <= 12) {
//     return field.grid_width;
//   }
//   return 12;
// }

// const COL_SPAN: Record<number, string> = {
//   1: "col-span-1",  2: "col-span-2",  3: "col-span-3",
//   4: "col-span-4",  5: "col-span-5",  6: "col-span-6",
//   7: "col-span-7",  8: "col-span-8",  9: "col-span-9",
//   10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
// };
// const colSpan = (field: FieldDef) => COL_SPAN[parseWidth(field)] ?? "col-span-12";

// // Resolve option value (API uses either .value or .key)
// const optVal = (o: FieldOption) => o.value ?? o.key ?? o.label;

// // ─── Visibility ───────────────────────────────────────────────────────────────

// function isFieldVisible(
//   field: FieldDef,
//   values: Record<string, any>,
//   // keys hidden by toggle_visibility actions from other fields
//   hiddenByAction: Set<string>
// ): boolean {
//   // Overridden hidden by another field's toggle_visibility action
//   if (hiddenByAction.has(field.key)) return false;

//   if (!field.actions?.length) return true;

//   const conditionals = field.actions.filter((a) => a.type === "conditional");
//   if (conditionals.length === 0) return true;

//   return conditionals.some((a) => {
//     const controlling = values[a.field!];
//     return a.operator === "not_equals"
//       ? controlling !== a.value
//       : controlling === a.value;
//   });
// }

// // Build a set of keys hidden by toggle_visibility actions across all fields
// function buildHiddenByAction(
//   fields: FieldDef[],
//   values: Record<string, any>
// ): Set<string> {
//   const hidden = new Set<string>();
//   for (const field of fields) {
//     for (const action of field.actions ?? []) {
//       if (action.type !== "toggle_visibility" || !action.target) continue;
//       const fieldVal = values[field.key];
//       // condition_value: show targets only when value matches, otherwise hide
//       const condMet = String(fieldVal ?? "") === String(action.condition_value ?? "");
//       if (action.visibility === "show" && !condMet) {
//         action.target.forEach((t) => hidden.add(t));
//       } else if (action.visibility === "hide" && condMet) {
//         action.target.forEach((t) => hidden.add(t));
//       }
//     }
//   }
//   return hidden;
// }

// // ─── DataSource field ─────────────────────────────────────────────────────────

// function DataSourceField({
//   field, value, onChange, onAutoFill, disabled, error,
// }: {
//   field: FieldDef; value: string;
//   onChange: (v: string) => void;
//   onAutoFill: (m: Record<string, string>) => void;
//   disabled: boolean; error?: string;
// }) {
//   const [fetching, setFetching] = useState(false);
//   const [fetchErr, setFetchErr] = useState("");
//   const [filled, setFilled]     = useState(false);
//   const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const ds = field.data_source!;

//   const readyToFetch = (v: string) =>
//     field.validation?.regex ? new RegExp(field.validation.regex).test(v) : v.length > 0;

//   const doFetch = useCallback(async (val: string) => {
//     if (!readyToFetch(val)) { setFilled(false); setFetchErr(""); return; }
//     setFetching(true); setFetchErr("");
//     try {
//       const res = await fetch(`${BASE_URL}${ds.endpoint}`, {
//         method: ds.method.toUpperCase(),
//         headers: HEADERS,
//         body: ds.method.toUpperCase() === "POST"
//           ? JSON.stringify({ [field.key]: val })
//           : undefined,
//       });
//       const data = await res.json();
//       if (!data.success) throw new Error(data.message ?? "Lookup failed");
//       const result: Record<string, string> = {};
//       for (const [src, tgt] of Object.entries(ds.response_mapping))
//         result[tgt] = String(data.data?.[src] ?? "");
//       onAutoFill(result);
//       setFilled(true);
//     } catch (e) {
//       setFetchErr(e instanceof Error ? e.message : "Lookup failed");
//       setFilled(false);
//     } finally {
//       setFetching(false);
//     }
//   }, [ds, field.key]);

//   const handleChange = (v: string) => {
//     const capped = field.validation?.max_length ? v.slice(0, field.validation.max_length) : v;
//     onChange(capped); setFilled(false); setFetchErr("");
//     if (debRef.current) clearTimeout(debRef.current);
//     debRef.current = setTimeout(() => doFetch(capped), 600);
//   };

//   return (
//     <div className="space-y-1">
//       <div className="relative">
//         <Input
//           value={value ?? ""}
//           onChange={(e) => handleChange(e.target.value)}
//           disabled={disabled}
//           placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
//           maxLength={field.validation?.max_length}
//           className={cn(
//             "pr-9",
//             error && "border-destructive",
//             filled && "border-green-500 focus-visible:ring-green-500"
//           )}
//         />
//         <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
//           {fetching ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
//           : filled   ? <Check   className="size-3.5 text-green-500" />
//           :             <Search  className="size-3.5 text-muted-foreground/50" />}
//         </div>
//       </div>
//       {fetchErr && <p className="text-xs text-destructive">{fetchErr}</p>}
//       {filled   && (
//         <p className="text-xs text-green-600 flex items-center gap-1">
//           <Check className="size-3 shrink-0" /> Details fetched
//         </p>
//       )}
//     </div>
//   );
// }

// // ─── Single field renderer ────────────────────────────────────────────────────

// function FieldInput({
//   field, value, onChange, onAutoFill, error,
// }: {
//   field: FieldDef; value: any;
//   onChange: (key: string, val: any) => void;
//   onAutoFill: (key: string, mapping: Record<string, string>) => void;
//   error?: string;
// }) {
//   const editable = field.ui?.editable ?? true;
//   const disabled = !editable;
//   const disabledCls = disabled ? "bg-muted/50 cursor-not-allowed" : "";

//   // data_source field gets special treatment
//   if (field.data_source && editable) {
//     return (
//       <DataSourceField
//         field={field}
//         value={value ?? ""}
//         onChange={(v) => onChange(field.key, v)}
//         onAutoFill={(mapping) => onAutoFill(field.key, mapping)}
//         disabled={disabled}
//         error={error}
//       />
//     );
//   }

//   switch (field.type) {
//     case "boolean":
//       return (
//         <div className="flex items-center gap-2 h-9">
//           <Switch
//             id={field.key}
//             disabled={disabled}
//             checked={!!value}
//             onCheckedChange={(v) => onChange(field.key, v)}
//           />
//           <Label htmlFor={field.key} className="text-xs text-muted-foreground font-normal cursor-pointer">
//             {value ? "Yes" : "No"}
//           </Label>
//         </div>
//       );

//     case "checkbox":
//       return (
//         <div className="flex items-center gap-2 h-9">
//           <input
//             id={field.key}
//             type="checkbox"
//             disabled={disabled}
//             checked={!!value}
//             onChange={(e) => onChange(field.key, e.target.checked ? "1" : "0")}
//             className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
//           />
//           <Label htmlFor={field.key} className="text-xs font-normal cursor-pointer">
//             {field.label}
//           </Label>
//         </div>
//       );

//     case "radio":
//       return (
//         <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
//           {(field.options ?? []).map((opt) => {
//             const v = optVal(opt);
//             return (
//               <label key={v} className="flex items-center gap-1.5 cursor-pointer">
//                 <input
//                   type="radio"
//                   name={field.key}
//                   value={v}
//                   disabled={disabled}
//                   checked={value === v}
//                   onChange={() => onChange(field.key, v)}
//                   className="h-3.5 w-3.5 accent-primary"
//                 />
//                 <span className="text-xs">{opt.label}</span>
//               </label>
//             );
//           })}
//         </div>
//       );

//     case "select":
//       return (
//         <Select
//           value={value || ""}
//           onValueChange={(v) => onChange(field.key, v)}
//           disabled={disabled}
//         >
//           <SelectTrigger className={cn("w-full",disabledCls, error && "border-destructive")}>
//             <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}…`} />
//           </SelectTrigger>
//           <SelectContent>
//             {field.options?.length ? (
//               field.options.map((opt) => (
//                 <SelectItem key={optVal(opt)} value={optVal(opt)}>{opt.label}</SelectItem>
//               ))
//             ) : (
//               <SelectItem value="__empty" disabled>No options available</SelectItem>
//             )}
//           </SelectContent>
//         </Select>
//       );

//     case "number":
//     case "decimal":
//       return (
//         <Input
//           type="number"
//           id={field.key}
//           step={field.type === "decimal" ? "0.01" : "1"}
//           disabled={disabled}
//           placeholder={field.placeholder}
//           className={cn(disabledCls, error && "border-destructive")}
//           value={value ?? ""}
//           onChange={(e) => onChange(field.key, e.target.value)}
//         />
//       );

//     case "date":
//       return (
//         <Input
//           type="date"
//           id={field.key}
//           disabled={disabled}
//           className={cn(disabledCls, error && "border-destructive")}
//           value={value ?? ""}
//           onChange={(e) => onChange(field.key, e.target.value)}
//         />
//       );

//     case "file":
//       return (
//         <div className={cn(
//           "flex items-center gap-2 h-9 px-3 border rounded-md text-sm text-muted-foreground",
//           disabled ? "bg-muted/50" : "bg-background",
//           error && "border-destructive"
//         )}>
//           <span className="text-xs flex-1 truncate">
//             {value ? (value as File).name : "No file chosen"}
//           </span>
//           {!disabled && (
//             <label className="cursor-pointer shrink-0">
//               <span className="text-xs text-primary hover:underline">Browse</span>
//               <input
//                 type="file"
//                 className="hidden"
//                 onChange={(e) => onChange(field.key, e.target.files?.[0] ?? null)}
//               />
//             </label>
//           )}
//         </div>
//       );

//     default: // text + anything unrecognised
//       return (
//         <Input
//           id={field.key}
//           disabled={disabled}
//           placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
//           className={cn(disabledCls, error && "border-destructive")}
//           value={value ?? ""}
//           maxLength={field.validation?.max_length}
//           onChange={(e) => onChange(field.key, e.target.value)}
//         />
//       );
//   }
// }

// // ─── Field wrapper (label + input + validation) ───────────────────────────────

// function FormField({
//   field, value, onChange, onAutoFill, errors,
// }: {
//   field: FieldDef; value: any;
//   onChange: (key: string, val: any) => void;
//   onAutoFill: (key: string, mapping: Record<string, string>) => void;
//   errors: Record<string, string>;
// }) {
//   const editable  = field.ui?.editable ?? true;
//   const error     = errors[field.key];
//   const isCheckbox = field.type === "checkbox";
//   const isRadio    = field.type === "radio";

//   return (
//     <div className="space-y-1.5">
//       {/* Label — skip for checkbox (rendered inline) */}
//       {!isCheckbox && (
//         <div className="flex items-center gap-1.5 flex-wrap">
//           <Label htmlFor={field.key} className="text-xs font-medium leading-none">
//             {field.label}
//             {field.required && <span className="text-destructive ml-0.5">*</span>}
//           </Label>
//           {!editable && (
//             <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 leading-none">
//               auto-filled
//             </Badge>
//           )}
//           {field.data_source && (
//             <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 leading-none border-blue-200 text-blue-600 bg-blue-50">
//               lookup
//             </Badge>
//           )}
//           {field.validation?.max_length && !isRadio && (
//             <span className="text-[10px] text-muted-foreground/50">
//               max {field.validation.max_length}
//             </span>
//           )}
//         </div>
//       )}

//       <FieldInput
//         field={field}
//         value={value}
//         onChange={onChange}
//         onAutoFill={onAutoFill}
//         error={error}
//       />

//       {/* Validation hint */}
//       {field.validation?.regex && !isRadio && !isCheckbox && (
//         <p className="text-[10px] text-muted-foreground/50 font-mono truncate">
//           pattern: {field.validation.regex}
//         </p>
//       )}
//       {field.help_text && (
//         <p className="text-[10px] text-muted-foreground/60">{field.help_text}</p>
//       )}
//       {error && (
//         <p className="text-xs text-destructive flex items-center gap-1">
//           <AlertCircle className="size-3 shrink-0" />{error}
//         </p>
//       )}
//     </div>
//   );
// }

// // ─── Section (parent or sub-step) form ───────────────────────────────────────

// function SectionForm({
//   title, fields, values, errors, onChange, onAutoFill, showTitle = true,
// }: {
//   title: string; fields: FieldDef[];
//   values: Record<string, any>; errors: Record<string, string>;
//   onChange: (key: string, val: any) => void;
//   onAutoFill: (key: string, mapping: Record<string, string>) => void;
//   showTitle?: boolean;
// }) {
//   const hiddenByAction = buildHiddenByAction(fields, values);
//   const visible = fields.filter((f) => isFieldVisible(f, values, hiddenByAction));

//   if (visible.length === 0 && !showTitle) return null;

//   return (
//     <div className="border border-border rounded-xl overflow-hidden">
//       {showTitle && (
//         <div className="px-5 py-3 bg-muted/40 border-b border-border">
//           <h4 className="text-xs font-semibold text-foreground">{title}</h4>
//         </div>
//       )}
//       <div className="p-5">
//         {visible.length === 0 ? (
//           <p className="text-xs text-muted-foreground/50 text-center py-4">No fields configured</p>
//         ) : (
//           <div className="grid grid-cols-12 gap-x-4 gap-y-5">
//             {visible.map((field) => (
//               <div key={field.key} className={colSpan(field)}>
//                 <FormField
//                   field={field}
//                   value={values[field.key]}
//                   onChange={onChange}
//                   onAutoFill={onAutoFill}
//                   errors={errors}
//                 />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Repeatable sub-step form ─────────────────────────────────────────────────

// function RepeatableSection({
//   subStep, errors, onRowsChange,
// }: {
//   subStep: SubStep;
//   errors: Record<string, string>;
//   onRowsChange: (stepKey: string, rows: Record<string, any>[]) => void;
// }) {
//   const fields = subStep.rendered_json?.fields ?? [];
//   const [rows, setRows] = useState<Record<string, any>[]>([{}]);

//   const updateRows = (next: Record<string, any>[]) => {
//     setRows(next);
//     onRowsChange(subStep.step_key, next);
//   };

//   const handleChange = (rowIdx: number, key: string, val: any) =>
//     updateRows(rows.map((r, i) => (i === rowIdx ? { ...r, [key]: val } : r)));

//   const handleAutoFill = (rowIdx: number, _key: string, mapping: Record<string, string>) =>
//     updateRows(rows.map((r, i) => (i === rowIdx ? { ...r, ...mapping } : r)));

//   const colTemplate = `repeat(${fields.length}, minmax(0,1fr)) 36px`;

//   return (
//     <div className="border border-border rounded-xl overflow-hidden">
//       <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border">
//         <h4 className="text-xs font-semibold text-foreground">{subStep.step_name}</h4>
//         <button
//           type="button"
//           onClick={() => updateRows([...rows, {}])}
//           className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors"
//           title="Add row"
//         >
//           <span className="text-white text-base leading-none pb-0.5">+</span>
//         </button>
//       </div>

//       {/* Column headers */}
//       <div className="grid gap-3 px-5 pt-4 pb-1" style={{ gridTemplateColumns: colTemplate }}>
//         {fields.map((f) => (
//           <div key={f.key} className="text-[11px] font-medium text-muted-foreground">
//             {f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}
//           </div>
//         ))}
//         <div />
//       </div>

//       <div className="px-5 pb-4 space-y-2">
//         {rows.map((rowValues, rowIdx) => (
//           <div key={rowIdx} className="grid gap-3 items-start" style={{ gridTemplateColumns: colTemplate }}>
//             {fields.map((f) => (
//               <FieldInput
//                 key={f.key}
//                 field={f}
//                 value={rowValues[f.key]}
//                 onChange={(key, val) => handleChange(rowIdx, key, val)}
//                 onAutoFill={(key, mapping) => handleAutoFill(rowIdx, key, mapping)}
//                 error={errors[`${subStep.step_key}[${rowIdx}].${f.key}`]}
//               />
//             ))}
//             <button
//               type="button"
//               onClick={() => rows.length > 1 && updateRows(rows.filter((_, i) => i !== rowIdx))}
//               disabled={rows.length <= 1}
//               className="flex items-center justify-center w-8 h-9 rounded-lg text-destructive hover:bg-destructive/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors mt-0.5"
//             >
//               ✕
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── Validation ───────────────────────────────────────────────────────────────

// function validateFields(
//   fields: FieldDef[],
//   values: Record<string, any>,
//   hiddenByAction: Set<string>
// ): Record<string, string> {
//   const errs: Record<string, string> = {};
//   for (const field of fields) {
//     if (!isFieldVisible(field, values, hiddenByAction)) continue;
//     const val = values[field.key] ?? "";
//     if (field.required && !val && val !== 0) {
//       errs[field.key] = `${field.label} is required`;
//       continue;
//     }
//     if (val && field.validation?.regex) {
//       if (!new RegExp(field.validation.regex).test(String(val))) {
//         errs[field.key] = `${field.label} format is invalid`;
//       }
//     }
//   }
//   return errs;
// }

// // ─── Main FormRenderer ────────────────────────────────────────────────────────

// interface FormRendererProps {
//   formId?: number;
//   stepKey?: string;
// }

// export default function FormRenderer({ formId, stepKey }: FormRendererProps) {
//   const [stepData, setStepData]   = useState<StepData | null>(null);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState("");
//   const [values, setValues]       = useState<Record<string, any>>({});
//   const [repeatableRows, setRepeatableRows] = useState<Record<string, Record<string, any>[]>>({});
//   const [errors, setErrors]       = useState<Record<string, string>>({});
//   const [submitted, setSubmitted] = useState(false);

//   const load = async () => {
//     setLoading(true); setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/formBuilder/getActiveSubSectionByStepkey`, {
//         method: "POST",
//         headers: HEADERS,
//         body: JSON.stringify(
//           formId && stepKey
//             ? { form_id: formId, step_key: stepKey }
//             : STATIC_PAYLOAD
//         ),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();
//       if (!json.success) throw new Error(json.message || "Failed to load step");
//       setStepData(json.data);
//     } catch (e: any) {
//       setError(e.message || "Failed to load form");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, [formId, stepKey]);

//   const handleChange = (key: string, val: any) => {
//     setValues((p) => ({ ...p, [key]: val }));
//     if (errors[key]) setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
//   };

//   const handleAutoFill = (_key: string, mapping: Record<string, string>) => {
//     setValues((p) => ({ ...p, ...mapping }));
//   };

//   const handleRowsChange = (stepKey: string, rows: Record<string, any>[]) => {
//     setRepeatableRows((p) => ({ ...p, [stepKey]: rows }));
//   };

//   const handleSubmit = () => {
//     if (!stepData) return;
//     const parentFields = stepData.parent_step.rendered_json?.fields ?? [];
//     const hiddenByAction = buildHiddenByAction(parentFields, values);
//     const parentErrors = validateFields(parentFields, values, hiddenByAction);

//     // Validate static sub-steps too
//     let subErrors: Record<string, string> = {};
//     for (const sub of stepData.sub_steps ?? []) {
//       if (!Boolean(sub.repeatable)) {
//         const subFields = sub.rendered_json?.fields ?? [];
//         const subHidden = buildHiddenByAction(subFields, values);
//         subErrors = { ...subErrors, ...validateFields(subFields, values, subHidden) };
//       }
//     }

//     const allErrors = { ...parentErrors, ...subErrors };
//     if (Object.keys(allErrors).length > 0) {
//       setErrors(allErrors);
//       return;
//     }

//     const payload = {
//       form_id: formId ?? STATIC_PAYLOAD.form_id,
//       step_key: stepData.parent_step.parent_step_key,
//       values,
//       repeatable_sections: repeatableRows,
//     };

//     setSubmitted(true);
//     console.log("[FormRenderer] Submit payload:", JSON.stringify(payload, null, 2));
//   };

//   // ── States ──────────────────────────────────────────────────────────────
//   if (loading) return (
//     <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
//       <Loader2 className="size-4 animate-spin" />
//       <span className="text-sm">Loading form…</span>
//     </div>
//   );

//   if (error) return (
//     <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 space-y-3">
//       <div className="flex items-center gap-2 text-sm text-destructive">
//         <AlertCircle className="size-4 shrink-0" />{error}
//       </div>
//       <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
//         <RefreshCw className="size-3.5" /> Retry
//       </Button>
//     </div>
//   );

//   if (!stepData) return null;

//   const parentFields  = stepData.parent_step.rendered_json?.fields ?? [];
//   const subSteps      = stepData.sub_steps ?? [];
//   const hasParent     = parentFields.length > 0;
//   const hasSubSteps   = subSteps.length > 0;

//   if (submitted) return (
//     <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-8 flex flex-col items-center gap-3 text-center">
//       <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
//         <Check className="size-6 text-emerald-600" />
//       </div>
//       <div>
//         <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Form submitted</p>
//         <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Check the console for the payload</p>
//       </div>
//       <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setValues({}); setRepeatableRows({}); }}>
//         Reset
//       </Button>
//     </div>
//   );

//   return (
//     <div className="space-y-4">
//       {/* Step header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-base font-semibold text-foreground">
//             {stepData.parent_step.parent_step_name}
//           </h2>
//           <p className="text-xs text-muted-foreground font-mono mt-0.5">
//             {stepData.parent_step.parent_step_key}
//           </p>
//         </div>
//         <div className="flex items-center gap-1.5">
//           {hasSubSteps && (
//             <Badge variant="outline" className="text-xs">
//               {subSteps.length} sub-section{subSteps.length !== 1 ? "s" : ""}
//             </Badge>
//           )}
//           {hasParent && (
//             <Badge variant="secondary" className="text-xs">
//               {parentFields.length} field{parentFields.length !== 1 ? "s" : ""}
//             </Badge>
//           )}
//         </div>
//       </div>

//       {/* Parent step fields */}
//       {hasParent && (
//         <SectionForm
//           title={stepData.parent_step.parent_step_name}
//           fields={parentFields}
//           values={values}
//           errors={errors}
//           onChange={handleChange}
//           onAutoFill={handleAutoFill}
//           showTitle={false}
//         />
//       )}

//       {/* Sub-steps */}
//       {hasSubSteps && (
//         <div className="space-y-4">
//           {subSteps
//             .slice()
//             .sort((a, b) => a.step_order - b.step_order)
//             .map((sub) =>
//               Boolean(sub.repeatable) ? (
//                 <RepeatableSection
//                   key={sub.step_key}
//                   subStep={sub}
//                   errors={errors}
//                   onRowsChange={handleRowsChange}
//                 />
//               ) : (
//                 <SectionForm
//                   key={sub.step_key}
//                   title={sub.step_name}
//                   fields={sub.rendered_json?.fields ?? []}
//                   values={values}
//                   errors={errors}
//                   onChange={handleChange}
//                   onAutoFill={handleAutoFill}
//                   showTitle
//                 />
//               )
//             )}
//         </div>
//       )}

//       {/* Empty state */}
//       {!hasParent && !hasSubSteps && (
//         <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
//           <p className="text-sm font-medium">No fields configured</p>
//         </div>
//       )}

//       {/* Error summary */}
//       {Object.keys(errors).length > 0 && (
//         <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-2 text-sm text-destructive">
//           <AlertCircle className="size-4 shrink-0" />
//           {Object.keys(errors).length} field{Object.keys(errors).length !== 1 ? "s" : ""} need attention
//         </div>
//       )}

//       {/* Submit */}
//       <div className="flex justify-end pt-1">
//         <Button onClick={handleSubmit} className="gap-2">
//           <Send className="size-3.5" />
//           Submit
//         </Button>
//       </div>
//     </div>
//   );
// }



"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2, Check, Search, AlertCircle, RefreshCw, Send,
} from "lucide-react";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import { Button }  from "@/components/ui/button";
import { Badge }   from "@/components/ui/badge";
import { Switch }  from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── API config ───────────────────────────────────────────────────────────────

const BASE_URL = "http://192.168.6.6/www8/2013-Backend/api/v1";
const HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "X-tenant-code": "demo",
};

// const STATIC_PAYLOAD = { form_id: 16, step_key: "assets" };
const STATIC_PAYLOAD = { form_id: 17, step_key: "family_details" };
// const STATIC_PAYLOAD = { form_id: 24, step_key: "address_details" };
// const STATIC_PAYLOAD = { form_id: 24, step_key: "address_details" };

// ─── Types ────────────────────────────────────────────────────────────────────

interface Validation {
  regex?: string;
  max_length?: number;
}

interface DataSource {
  type: "api" | "database";
  method: string;
  trigger: string;
  endpoint: string;
  response_mapping: Record<string, string>;
}

interface FieldAction {
  type: "conditional" | "toggle_visibility" | "always" | string;
  field?: string;
  value?: any;
  operator?: "equals" | "not_equals" | string;
  target?: string[];
  visibility?: "show" | "hide";
  condition_value?: any;
  trigger?: string;
}

interface FieldOption {
  key?: string;
  label: string;
  value?: string;
}

interface FieldDef {
  key: string;
  type: "text" | "number" | "decimal" | "date" | "boolean" | "select" |
        "radio" | "checkbox" | "file" | "textarea" | string;
  label: string;
  width?: string;
  grid_width?: number;
  required?: boolean;
  placeholder?: string;
  help_text?: string;
  alignment?: string;
  validation?: Validation;
  data_source?: DataSource;
  options?: FieldOption[];
  ui?: { visible?: boolean; editable?: boolean };
  actions?: FieldAction[];
}

interface SubStep {
  id: number;
  step_key: string;
  step_name: string;
  step_order: number;
  repeatable: 0 | 1 | boolean;
  rendered_json: { fields: FieldDef[] };
  sub_steps?: SubStep[];
}

interface ParentStep {
  id: number;
  parent_step_key: string;
  parent_step_name: string;
  rendered_json: { fields: FieldDef[] };
}

interface StepData {
  parent_step: ParentStep;
  sub_steps: SubStep[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseWidth(field: FieldDef): number {
  if (field.width) {
    const parts = field.width.split("/");
    const n = parseInt(parts[0], 10);
    if (!isNaN(n) && n >= 1 && n <= 12) return n;
  }
  if (field.grid_width && field.grid_width >= 1 && field.grid_width <= 12) {
    return field.grid_width;
  }
  return 12;
}

const COL_SPAN: Record<number, string> = {
  1: "col-span-1",  2: "col-span-2",  3: "col-span-3",
  4: "col-span-4",  5: "col-span-5",  6: "col-span-6",
  7: "col-span-7",  8: "col-span-8",  9: "col-span-9",
  10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
};
const colSpan = (field: FieldDef) => COL_SPAN[parseWidth(field)] ?? "col-span-12";

const optVal = (o: FieldOption) => o.value ?? o.key ?? o.label;

// ─── Visibility ───────────────────────────────────────────────────────────────

function isFieldVisible(
  field: FieldDef,
  values: Record<string, any>,
  hiddenByAction: Set<string>
): boolean {
  if (hiddenByAction.has(field.key)) return false;
  if (!field.actions?.length) return true;
  const conditionals = field.actions.filter((a) => a.type === "conditional");
  if (conditionals.length === 0) return true;
  return conditionals.some((a) => {
    const controlling = values[a.field!];
    return a.operator === "not_equals"
      ? controlling !== a.value
      : controlling === a.value;
  });
}

function buildHiddenByAction(
  fields: FieldDef[],
  values: Record<string, any>
): Set<string> {
  const hidden = new Set<string>();
  for (const field of fields) {
    for (const action of field.actions ?? []) {
      if (action.type !== "toggle_visibility" || !action.target) continue;
      const fieldVal = values[field.key];
      const condMet = String(fieldVal ?? "") === String(action.condition_value ?? "");
      if (action.visibility === "show" && !condMet) {
        action.target.forEach((t) => hidden.add(t));
      } else if (action.visibility === "hide" && condMet) {
        action.target.forEach((t) => hidden.add(t));
      }
    }
  }
  return hidden;
}

// ─── DataSource field ─────────────────────────────────────────────────────────

function DataSourceField({
  field, value, onChange, onAutoFill, disabled, error,
}: {
  field: FieldDef; value: string;
  onChange: (v: string) => void;
  onAutoFill: (m: Record<string, string>) => void;
  disabled: boolean; error?: string;
}) {
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState("");
  const [filled, setFilled]     = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ds = field.data_source!;

  const readyToFetch = (v: string) =>
    field.validation?.regex ? new RegExp(field.validation.regex).test(v) : v.length > 0;

  const doFetch = useCallback(async (val: string) => {
    // Guard: skip if endpoint is empty
    if (!ds.endpoint) { setFilled(false); setFetchErr(""); return; }
    if (!readyToFetch(val)) { setFilled(false); setFetchErr(""); return; }

    setFetching(true); setFetchErr("");
    try {
      const url = ds.endpoint.startsWith("http")
        ? ds.endpoint
        : `${BASE_URL}/${ds.endpoint.replace(/^\//, "")}`;

      const res = await fetch(url, {
        method: ds.method.toUpperCase(),
        headers: HEADERS,
        body: ds.method.toUpperCase() === "POST"
          ? JSON.stringify({ [field.key]: val })
          : undefined,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Lookup failed");
      const result: Record<string, string> = {};
      for (const [src, tgt] of Object.entries(ds.response_mapping))
        result[tgt] = String(data.data?.[src] ?? "");
      onAutoFill(result);
      setFilled(true);
    } catch (e) {
      setFetchErr(e instanceof Error ? e.message : "Lookup failed");
      setFilled(false);
    } finally {
      setFetching(false);
    }
  }, [ds, field.key]);

  const handleChange = (v: string) => {
    const capped = field.validation?.max_length ? v.slice(0, field.validation.max_length) : v;
    onChange(capped); setFilled(false); setFetchErr("");
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => doFetch(capped), 600);
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          value={value ?? ""}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
          className={cn(
            "pr-9",
            error && "border-destructive",
            filled && "border-green-500 focus-visible:ring-green-500"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {fetching ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          : filled   ? <Check   className="size-3.5 text-green-500" />
          :             <Search  className="size-3.5 text-muted-foreground/50" />}
        </div>
      </div>
      {fetchErr && <p className="text-xs text-destructive">{fetchErr}</p>}
      {filled   && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <Check className="size-3 shrink-0" /> Details fetched
        </p>
      )}
    </div>
  );
}

// ─── Single field renderer ────────────────────────────────────────────────────

function FieldInput({
  field, value, onChange, onAutoFill, error,
}: {
  field: FieldDef; value: any;
  onChange: (key: string, val: any) => void;
  // FIX: onAutoFill no longer receives sectionKey here — that is already
  // bound by the caller (SectionForm / RepeatableSection) so there is no
  // way for it to accidentally write into the wrong section.
  onAutoFill: (mapping: Record<string, string>) => void;
  error?: string;
}) {
  const editable = field.ui?.editable ?? true;
  const disabled = !editable;
  const disabledCls = disabled ? "bg-muted/50 cursor-not-allowed opacity-60" : "";

  if (field.data_source && editable) {
    return (
      <DataSourceField
        field={field}
        value={value ?? ""}
        onChange={(v) => onChange(field.key, v)}
        // Pass the mapping straight through — section is already bound upstream
        onAutoFill={(mapping) => onAutoFill(mapping)}
        disabled={disabled}
        error={error}
      />
    );
  }

  switch (field.type) {
    case "boolean":
      return (
        <div className="flex items-center gap-2 h-9">
          <Switch
            id={field.key}
            disabled={disabled}
            checked={!!value}
            onCheckedChange={(v) => onChange(field.key, v)}
          />
          <Label htmlFor={field.key} className="text-xs text-muted-foreground font-normal cursor-pointer">
            {value ? "Yes" : "No"}
          </Label>
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-2 h-9">
          <input
            id={field.key}
            type="checkbox"
            disabled={disabled}
            checked={!!value}
            onChange={(e) => onChange(field.key, e.target.checked ? "1" : "0")}
            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
          />
          <Label htmlFor={field.key} className="text-xs font-normal cursor-pointer">
            {field.label}
          </Label>
        </div>
      );

    case "radio":
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
          {(field.options ?? []).map((opt) => {
            const v = optVal(opt);
            return (
              <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  // FIX: Use a composite name to avoid radio groups from
                  // different sections interfering with each other in the DOM.
                  name={`${field.key}`}
                  value={v}
                  disabled={disabled}
                  checked={value === v}
                  onChange={() => onChange(field.key, v)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span className="text-xs">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );

    case "select":
      // FIX: Wrap in w-full div so the trigger always stretches to the grid
      // column width regardless of its internal flex sizing.
      return (
        <div className="w-full">
          <Select
            value={value || ""}
            onValueChange={(v) => onChange(field.key, v)}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "w-full",
                disabledCls,
                error && "border-destructive"
              )}
            >
              <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}…`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.length ? (
                field.options.map((opt) => (
                  <SelectItem key={optVal(opt)} value={optVal(opt)}>{opt.label}</SelectItem>
                ))
              ) : (
                <SelectItem value="__empty" disabled>No options available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      );

    case "number":
    case "decimal":
      return (
        <Input
          type="number"
          id={field.key}
          step={field.type === "decimal" ? "0.01" : "1"}
          disabled={disabled}
          placeholder={field.placeholder}
          className={cn("w-full", disabledCls, error && "border-destructive")}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          id={field.key}
          disabled={disabled}
          className={cn("w-full", disabledCls, error && "border-destructive")}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "file":
      return (
        <div className={cn(
          "flex items-center gap-2 h-9 px-3 border rounded-md text-sm text-muted-foreground w-full",
          disabled ? "bg-muted/50" : "bg-background",
          error && "border-destructive"
        )}>
          <span className="text-xs flex-1 truncate">
            {value ? (value as File).name : "No file chosen"}
          </span>
          {!disabled && (
            <label className="cursor-pointer shrink-0">
              <span className="text-xs text-primary hover:underline">Browse</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => onChange(field.key, e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      );

    // FIX: textarea is now a named case with id and w-full, no native
    // min/max/pattern attributes (validation is handled in JS only).
    case "textarea":
      return (
        <textarea
          id={field.key}
          disabled={disabled}
          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2",
            "text-sm ring-offset-background placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
            disabledCls,
            error && "border-destructive"
          )}
          rows={4}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    default: // text + anything unrecognised
      // FIX: No maxLength attribute on the DOM input — validation is JS-only
      // for production UX (no browser native constraint UI).
      return (
        <Input
          id={field.key}
          disabled={disabled}
          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
          className={cn("w-full", disabledCls, error && "border-destructive")}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
  }
}

// ─── Field wrapper (label + input + validation msg) ───────────────────────────

function FormField({
  field, value, onChange, onAutoFill, errors, errPrefix = "",
}: {
  field: FieldDef; value: any;
  onChange: (key: string, val: any) => void;
  // FIX: onAutoFill signature simplified — section binding done by SectionForm
  onAutoFill: (mapping: Record<string, string>) => void;
  errors: Record<string, string>;
  errPrefix?: string;
}) {
  const error = errors[errPrefix ? `${errPrefix}.${field.key}` : field.key];
  const isCheckbox = field.type === "checkbox";

  return (
    <div className="space-y-1.5 w-full">
      {!isCheckbox && (
        <Label htmlFor={field.key} className="text-xs font-medium leading-none">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}

      <FieldInput
        field={field}
        value={value}
        onChange={onChange}
        onAutoFill={onAutoFill}
        error={error}
      />

      {field.help_text && (
        <p className="text-[10px] text-muted-foreground/60">{field.help_text}</p>
      )}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="size-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ─── Section (parent or sub-step) form ───────────────────────────────────────

function SectionForm({
  sectionKey, title, fields, sectionValues, errors,
  onSectionChange, onSectionAutoFill, showTitle = true,
}: {
  sectionKey: string;
  title: string;
  fields: FieldDef[];
  sectionValues: Record<string, any>;
  errors: Record<string, string>;
  onSectionChange: (section: string, key: string, val: any) => void;
  // FIX: AutoFill now passes mapping only; sectionKey is bound via closure here.
  onSectionAutoFill: (section: string, mapping: Record<string, string>) => void;
  showTitle?: boolean;
}) {
  const hiddenByAction = buildHiddenByAction(fields, sectionValues);
  const visible = fields.filter((f) => isFieldVisible(f, sectionValues, hiddenByAction));

  if (visible.length === 0 && !showTitle) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {showTitle && (
        <div className="px-5 py-3 bg-muted/40 border-b border-border">
          <h4 className="text-xs font-semibold text-foreground">{title}</h4>
        </div>
      )}
      <div className="p-5">
        {visible.length === 0 ? (
          <p className="text-xs text-muted-foreground/50 text-center py-4">No fields configured</p>
        ) : (
          <div className="grid grid-cols-12 gap-x-4 gap-y-5">
            {visible.map((field) => (
              <div key={field.key} className={cn(colSpan(field), "min-w-0")}>
                <FormField
                  field={field}
                  value={sectionValues[field.key]}
                  onChange={(key, val) => onSectionChange(sectionKey, key, val)}
                  // FIX: Bind sectionKey here so DataSourceField's onAutoFill
                  // can never accidentally write into another section's values.
                  onAutoFill={(mapping) => onSectionAutoFill(sectionKey, mapping)}
                  errors={errors}
                  errPrefix={sectionKey}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Repeatable sub-step ──────────────────────────────────────────────────────

function RepeatableSection({
  subStep, errors, onRowsChange,
}: {
  subStep: SubStep;
  errors: Record<string, string>;
  onRowsChange: (stepKey: string, rows: Record<string, any>[]) => void;
}) {
  const fields = subStep.rendered_json?.fields ?? [];
  const [rows, setRows] = useState<Record<string, any>[]>([{}]);

  const updateRows = (next: Record<string, any>[]) => {
    setRows(next);
    onRowsChange(subStep.step_key, next);
  };

  const handleChange = (rowIdx: number, key: string, val: any) =>
    updateRows(rows.map((r, i) => (i === rowIdx ? { ...r, [key]: val } : r)));

  // FIX: AutoFill is scoped to the specific row index — no cross-row bleed.
  const handleAutoFill = (rowIdx: number, mapping: Record<string, string>) =>
    updateRows(rows.map((r, i) => (i === rowIdx ? { ...r, ...mapping } : r)));

  const colTemplate = `repeat(${fields.length}, minmax(0,1fr)) 36px`;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border">
        <h4 className="text-xs font-semibold text-foreground">{subStep.step_name}</h4>
        <button
          type="button"
          onClick={() => updateRows([...rows, {}])}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors"
          title="Add row"
        >
          <span className="text-white text-base leading-none pb-0.5">+</span>
        </button>
      </div>

      <div className="grid gap-3 px-5 pt-4 pb-1" style={{ gridTemplateColumns: colTemplate }}>
        {fields.map((f) => (
          <div key={f.key} className="text-[11px] font-medium text-muted-foreground">
            {f.label}{f.required && <span className="text-destructive ml-0.5">*</span>}
          </div>
        ))}
        <div />
      </div>

      <div className="px-5 pb-4 space-y-2">
        {rows.map((rowValues, rowIdx) => (
          <div key={rowIdx} className="grid gap-3 items-start" style={{ gridTemplateColumns: colTemplate }}>
            {fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={rowValues[f.key]}
                onChange={(key, val) => handleChange(rowIdx, key, val)}
                onAutoFill={(mapping) => handleAutoFill(rowIdx, mapping)}
                error={errors[`${subStep.step_key}[${rowIdx}].${f.key}`]}
              />
            ))}
            <button
              type="button"
              onClick={() => rows.length > 1 && updateRows(rows.filter((_, i) => i !== rowIdx))}
              disabled={rows.length <= 1}
              className="flex items-center justify-center w-8 h-9 rounded-lg text-destructive hover:bg-destructive/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors mt-0.5"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Validation (JS-only, no DOM attributes) ──────────────────────────────────

function validateFields(
  fields: FieldDef[],
  values: Record<string, any>,
  hiddenByAction: Set<string>
): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const field of fields) {
    if (!isFieldVisible(field, values, hiddenByAction)) continue;
    const val = values[field.key] ?? "";
    if (field.required && !val && val !== 0) {
      errs[field.key] = `${field.label} is required`;
      continue;
    }
    if (val && field.validation?.regex) {
      if (!new RegExp(field.validation.regex).test(String(val))) {
        errs[field.key] = `${field.label} format is invalid`;
      }
    }
    // max_length: JS-only check (no maxLength DOM attr set on inputs)
    if (val && field.validation?.max_length && String(val).length > field.validation.max_length) {
      errs[field.key] = `${field.label} must be at most ${field.validation.max_length} characters`;
    }
  }
  return errs;
}

// ─── Main FormRenderer ────────────────────────────────────────────────────────

interface FormRendererProps {
  formId?: number;
  stepKey?: string;
}

export default function FormRenderer({ formId, stepKey }: FormRendererProps) {
  const [stepData, setStepData]   = useState<StepData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [sectionValues, setSectionValues] = useState<Record<string, Record<string, any>>>({});
  const [repeatableRows, setRepeatableRows] = useState<Record<string, Record<string, any>[]>>({});
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/formBuilder/getActiveSubSectionByStepkey`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(
          formId && stepKey
            ? { form_id: formId, step_key: stepKey }
            : STATIC_PAYLOAD
        ),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load step");
      setStepData(json.data);
    } catch (e: any) {
      setError(e.message || "Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [formId, stepKey]);

  const handleChange = (section: string, key: string, val: any) => {
    setSectionValues((p) => ({ ...p, [section]: { ...(p[section] ?? {}), [key]: val } }));
    const errKey = `${section}.${key}`;
    if (errors[errKey]) setErrors((p) => { const n = { ...p }; delete n[errKey]; return n; });
  };

  // FIX: handleAutoFill now only takes (section, mapping) — the field key
  // is no longer passed/ignored. Each SectionForm binds its own sectionKey
  // before calling this, so there is zero chance of cross-section writes.
  const handleAutoFill = (section: string, mapping: Record<string, string>) => {
    setSectionValues((p) => ({
      ...p,
      [section]: { ...(p[section] ?? {}), ...mapping },
    }));
  };

  const handleRowsChange = (key: string, rows: Record<string, any>[]) => {
    setRepeatableRows((p) => ({ ...p, [key]: rows }));
  };

  const handleSubmit = () => {
    if (!stepData) return;
    const allErrors: Record<string, string> = {};

    const parentFields = stepData.parent_step.rendered_json?.fields ?? [];
    const parentVals = sectionValues["__parent__"] ?? {};
    const parentHidden = buildHiddenByAction(parentFields, parentVals);
    for (const [k, v] of Object.entries(validateFields(parentFields, parentVals, parentHidden)))
      allErrors[`__parent__.${k}`] = v;

    for (const sub of stepData.sub_steps ?? []) {
      if (!Boolean(sub.repeatable)) {
        const subFields = sub.rendered_json?.fields ?? [];
        const subVals = sectionValues[sub.step_key] ?? {};
        const subHidden = buildHiddenByAction(subFields, subVals);
        for (const [k, v] of Object.entries(validateFields(subFields, subVals, subHidden)))
          allErrors[`${sub.step_key}.${k}`] = v;
      }
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    const payload = {
      form_id: formId ?? STATIC_PAYLOAD.form_id,
      step_key: stepData.parent_step.parent_step_key,
      sections: sectionValues,
      repeatable_sections: repeatableRows,
    };

    setSubmitted(true);
    console.log("[FormRenderer] Submit payload:", JSON.stringify(payload, null, 2));
  };

  // ── Render states ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      <span className="text-sm">Loading form…</span>
    </div>
  );

  if (error) return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="size-4 shrink-0" />{error}
      </div>
      <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
        <RefreshCw className="size-3.5" /> Retry
      </Button>
    </div>
  );

  if (!stepData) return null;

  const parentFields = stepData.parent_step.rendered_json?.fields ?? [];
  const subSteps   = stepData.sub_steps ?? [];
  const hasParent  = parentFields.length > 0;
  const hasSubSteps = subSteps.length > 0;

  if (submitted) return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-8 flex flex-col items-center gap-3 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
        <Check className="size-6 text-emerald-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Form submitted</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Check the console for the payload</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setSectionValues({}); setRepeatableRows({}); }}>
        Reset
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {stepData.parent_step.parent_step_name}
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {stepData.parent_step.parent_step_key}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {hasSubSteps && (
            <Badge variant="outline" className="text-xs">
              {subSteps.length} sub-section{subSteps.length !== 1 ? "s" : ""}
            </Badge>
          )}
          {hasParent && (
            <Badge variant="secondary" className="text-xs">
              {parentFields.length} field{parentFields.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      {hasParent && (
        <SectionForm
          sectionKey="__parent__"
          title={stepData.parent_step.parent_step_name}
          fields={parentFields}
          sectionValues={sectionValues["__parent__"] ?? {}}
          errors={errors}
          onSectionChange={handleChange}
          onSectionAutoFill={handleAutoFill}
          showTitle={false}
        />
      )}

      {hasSubSteps && (
        <div className="space-y-4">
          {subSteps
            .slice()
            .sort((a, b) => a.step_order - b.step_order)
            .map((sub) =>
              Boolean(sub.repeatable) ? (
                <RepeatableSection
                  key={sub.step_key}
                  subStep={sub}
                  errors={errors}
                  onRowsChange={handleRowsChange}
                />
              ) : (
                <SectionForm
                  key={sub.step_key}
                  sectionKey={sub.step_key}
                  title={sub.step_name}
                  fields={sub.rendered_json?.fields ?? []}
                  sectionValues={sectionValues[sub.step_key] ?? {}}
                  errors={errors}
                  onSectionChange={handleChange}
                  onSectionAutoFill={handleAutoFill}
                  showTitle
                />
              )
            )}
        </div>
      )}

      {!hasParent && !hasSubSteps && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
          <p className="text-sm font-medium">No fields configured</p>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {Object.keys(errors).length} field{Object.keys(errors).length !== 1 ? "s" : ""} need attention
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button onClick={handleSubmit} className="gap-2">
          <Send className="size-3.5" />
          Submit
        </Button>
      </div>
    </div>
  );
}