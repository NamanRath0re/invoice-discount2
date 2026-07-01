"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2, Check, Search, AlertCircle, RefreshCw, Send, X, CalendarRange, ChevronDown, ChevronRight,Trash2
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
// const STATIC_PAYLOAD = { form_id: 25, step_key: "Seocnd" };
// const STATIC_PAYLOAD = { form_id: 24, step_key: "income_details" };
const STATIC_PAYLOAD = { form_id: 24, step_key: "personal_discussion" };
// const STATIC_PAYLOAD = { form_id: 17, step_key: "family_details" };
// const STATIC_PAYLOAD = { form_id: 15, step_key: "personal_info" };

const dummyData = {
  "parent_step": {
            "id": 66,
            "form_id": 17,
            "parent_step_key": "family_details",
            "parent_step_name": "Family Details",
            "repeatable": 0,
            "rendered_json": {
                "fields": [
                    {
                        "ui": {
                            "visible": true,
                            "editable": true
                        },
                        "key": "number_of_family_member",
                        "type": "text",
                        "label": "Number of Family Members",
                        "grid_width": 12,
                        "validation": {
                            "max_length": 100
                        }
                    }
                ]
            }
        },
        "sub_steps": [
            // {
            //     "id": 69,
            //     "form_id": 17,
            //     "parent_step_id": 66,
            //     "step_key": "family_members",
            //     "step_name": "Family Members",
            //     "step_order": 1,
            //     "repeatable_section": 1,
            //     "is_mandatory": 1,
            //     "is_skippable": 0,
            //     "rendered_json": {
            //         "fields": [
            //             {
            //                 "ui": {
            //                     "visible": true,
            //                     "editable": true
            //                 },
            //                 "key": "full_name",
            //                 "type": "text",
            //                 "label": "Name",
            //                 "grid_width": 4,
            //                 "validation": {
            //                     "max_length": 150
            //                 }
            //             },
            //             {
            //                 "ui": {
            //                     "visible": true,
            //                     "editable": true
            //                 },
            //                 "key": "relation_with_applicant",
            //                 "type": "text",
            //                 "label": "Relation with Applicant",
            //                 "grid_width": 4
            //             },
            //             {
            //                 "ui": {
            //                     "visible": true,
            //                     "editable": true
            //                 },
            //                 "key": "age",
            //                 "type": "text",
            //                 "label": "Age",
            //                 "grid_width": 4
            //             }
            //         ]
            //     },
            //     "sub_steps": []
            // }
               {
                "id": 69,
                "form_id": 17,
                "parent_step_id": 66,
                "step_key": "co_applicant_details",
                "step_name": "Co-Applicant Details",
                "step_order": 1,
                "accordion": 0,
                "repeatable": 1,
                "is_mandatory": 1,
                "is_skippable": 0,
                "rendered_json": {
                    "fields": [
                        {
                            "ui": {
                                "visible": true,
                                "editable": true
                            },
                            "key": "full_name",
                            "type": "text",
                            "label": "Full Name",
                            "width": "3\/12",
                            "required": false,
                            "alignment": "left",
                            "help_text": "",
                            "validation": {
                                "max_length": 150
                            },
                            "placeholder": ""
                        },
                        {
                            "ui": {
                                "visible": true,
                                "editable": true
                            },
                            "key": "mobile_no",
                            "type": "text",
                            "label": "Mobile Number",
                            "width": "3\/12",
                            "required": false,
                            "alignment": "left",
                            "help_text": "",
                            "validation": {
                                "regex": "^[6-9][0-9]{9}$",
                                "max_length": 10
                            },
                            "placeholder": ""
                        },
                        {
                            "ui": {
                                "visible": true,
                                "editable": true
                            },
                            "key": "email",
                            "type": "text",
                            "label": "Email Address",
                            "width": "3\/12",
                            "required": false,
                            "alignment": "left",
                            "help_text": "",
                            "validation": {
                                "regex": "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$",
                                "max_length": 150
                            },
                            "placeholder": ""
                        },
                        {
                            "ui": {
                                "visible": true,
                                "editable": true
                            },
                            "key": "gender",
                            "type": "select",
                            "label": "Gender",
                            "width": "3\/12",
                            "options": [
                                {
                                    "key": "male",
                                    "label": "Male"
                                },
                                {
                                    "key": "female",
                                    "label": "Female"
                                },
                                {
                                    "key": "other",
                                    "label": "Other"
                                }
                            ],
                            "required": false,
                            "alignment": "left",
                            "help_text": "",
                            "max_value": null,
                            "min_value": null,
                            "placeholder": ""
                        },
                        {
                            "ui": {
                                "visible": true,
                                "editable": true
                            },
                            "key": "name",
                            "type": "text",
                            "label": "Name",
                            "grid_width": 4,
                            "validation": {
                                "max_length": 150
                            }
                        },
                        {
                            "ui": {
                                "visible": true,
                                "editable": true
                            },
                            "key": "relation_with_applicant",
                            "type": "text",
                            "label": "Relation with Applicant",
                            "grid_width": 4
                        },
                        {
                            "ui": {
                                "visible": true,
                                "editable": true
                            },
                            "key": "age",
                            "type": "text",
                            "label": "Age",
                            "grid_width": 4
                        },
                        {
                          "ui": {
                              "visible": true,
                              "editable": true
                          },
                          "key": "pincode",
                          "type": "text",
                          "label": "Pincode",
                          "required": true,
                          "grid_width": 12,
                          "responsive": {
                              "lg": 4,
                              "md": 4,
                              "sm": 12
                          },
                          "validation": {
                              "regex": "^[0-9]{6}$",
                              "max_length": 6
                          },
                          "data_source": {
                              "type": "database",
                              "method": "POST",
                              "trigger": "onChange",
                              "endpoint": "gateway\/internal\/getPincode",
                              "source_key": "PINCODE_DB",
                              "response_mapping": {
                                  "city": "city",
                                  "state": "state"
                              }
                          },
                          "placeholder": "Enter Pincode"
                    },
                    {
                        "ui": {
                            "visible": true,
                            "editable": true
                        },
                        "key": "city",
                        "type": "text",
                        "label": "City",
                        "grid_width": 12,
                        "responsive": {
                            "lg": 4,
                            "md": 4,
                            "sm": 12
                        },
                        "validation": {
                            "max_length": 100
                        }
                    },
                    {
                        "ui": {
                            "visible": true,
                            "editable": true
                        },
                        "key": "state",
                        "type": "text",
                        "label": "State",
                        "grid_width": 12,
                        "responsive": {
                            "lg": 4,
                            "md": 4,
                            "sm": 12
                        },
                        "validation": {
                            "max_length": 100
                        }
                    },
                    //   {
                    //     "ui": {
                    //         "visible": true,
                    //         "editable": true
                    //     },
                    //     "key": "submit_btn",
                    //     "type": "button",
                    //     "label": "Submit",
                    //     "grid_width": 6,
                    //     "responsive": {
                    //         "lg": 6,
                    //         "md": 6,
                    //         "sm": 12
                    //     },
                    //     "data_source": {
                    //         "type": "database",
                    //         "method": "POST",
                    //         "trigger": "onClick",
                    //         "endpoint": "gateway\/internal\/submitPD",
                    //         "source_key": "PINCODE_DB",
                    //         "response_mapping": {
                    //             "city": "city",
                    //             "state": "state",
                    //             "district": "district"
                    //         }
                    //     }
                    // }
                    ]
                },
                "sub_steps": []
            },
            {
            "id": 70,
                "form_id": 17,
                "parent_step_id": 66,
                "step_key": "btn",
                "step_name": "Form Submission",
                "step_order": 2,
                "repeatable": 0,
                "is_mandatory": 1,
                "is_skippable": 0,
                "rendered_json": {
                    "fields": [
                        {
                          "ui": {
                              "visible": true,
                              "editable": true
                          },
                          "key": "submit_btn",
                          "type": "button",
                          "label": "Submit",
                          "grid_width": 12,
                          "responsive": {
                              "lg": 4,
                              "md": 4,
                              "sm": 12
                          },
                          "required": false,
                          "help_text": "",
                          "max_value": "",
                          "min_value": "",
                          "data_source": {
                              "type": "api",
                              "method": "POST",
                              "trigger": "onClick",
                              "endpoint": "gateway\/internal\/submitPD",
                              "source_key": "SUBMIT_PD",
                              "source_name": "Submit PD",
                              "response_mapping": []
                          },
                          "placeholder": ""
                      }
                    ]
                }
            }
        ]
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Validation {
  regex?: string;
  max_length?: number;
  min_length?: number;
  max_value?: number;
  min_value?: number;
}

interface DataSource {
  type: "api" | "database";
  method: string;
  trigger: string;
  endpoint?: string;
  source_key?: string;                      // identifier for the backend data source
  response_mapping?: Record<string, string>;
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

interface ResponsiveWidth {
  sm?: number;  // mobile-first base  → col-span-N
  md?: number;  // ≥ 768px            → md:col-span-N
  lg?: number;  // ≥ 1024px           → lg:col-span-N  (== grid_width)
}

interface FieldDef {
  key: string;
  type:
    | "text" | "number" | "decimal" | "date" | "boolean"
    | "select" | "radio" | "checkbox" | "file"
    | "button" | "textarea" | string;
  label: string;
  // layout
  width?: string;
  grid_width?: number;
  responsive?: ResponsiveWidth;
  size?: "sm" | "md" | "lg" | "default" | "icon"; // shadcn Button size
  // behaviour
  required?: boolean;
  placeholder?: string;
  help_text?: string;
  alignment?: string;
  validation?: Validation;
  data_source?: DataSource;
  options?: FieldOption[];
  ui?: { visible?: boolean; editable?: boolean };
  actions?: FieldAction[];
  // type-specific flags
  multi_select?: boolean;
  multi_upload?: boolean;
  date_range?: boolean;
  // button-level overrides (variant / label already on top-level; kept for back-compat)
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
}

interface SubStep {
  id: number;
  step_key: string;
  step_name: string;
  step_order: number;
  repeatable: 0 | 1 | boolean;  // duplicates the WHOLE section/card (with Add More / Remove)
  accordion: 0 | 1 | boolean;   // collapses the section into a togglable accordion
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
    const n = parseInt(field.width.split("/")[0], 10);
    if (!isNaN(n) && n >= 1 && n <= 12) return n;
  }
  if (field.grid_width && field.grid_width >= 1 && field.grid_width <= 12)
    return field.grid_width;
  return 12;
}

// Tailwind requires full static class names — no dynamic interpolation
const SM_SPAN: Record<number, string> = {
  1:"col-span-1",2:"col-span-2",3:"col-span-3",4:"col-span-4",
  5:"col-span-5",6:"col-span-6",7:"col-span-7",8:"col-span-8",
  9:"col-span-9",10:"col-span-10",11:"col-span-11",12:"col-span-12",
};
const MD_SPAN: Record<number, string> = {
  1:"md:col-span-1",2:"md:col-span-2",3:"md:col-span-3",4:"md:col-span-4",
  5:"md:col-span-5",6:"md:col-span-6",7:"md:col-span-7",8:"md:col-span-8",
  9:"md:col-span-9",10:"md:col-span-10",11:"md:col-span-11",12:"md:col-span-12",
};
const LG_SPAN: Record<number, string> = {
  1:"lg:col-span-1",2:"lg:col-span-2",3:"lg:col-span-3",4:"lg:col-span-4",
  5:"lg:col-span-5",6:"lg:col-span-6",7:"lg:col-span-7",8:"lg:col-span-8",
  9:"lg:col-span-9",10:"lg:col-span-10",11:"lg:col-span-11",12:"lg:col-span-12",
};

// grid_width == lg per spec; sm defaults to 12 (full width on mobile)
function colSpan(field: FieldDef): string {
  const r   = field.responsive;
  const lg  = r?.lg ?? parseWidth(field);
  const md  = r?.md ?? lg;
  const sm  = r?.sm ?? 12;
  const cls: string[] = [SM_SPAN[sm] ?? "col-span-12"];
  if (md !== sm)  cls.push(MD_SPAN[md]  ?? "md:col-span-12");
  if (lg !== md)  cls.push(LG_SPAN[lg]  ?? "lg:col-span-12");
  else if (md !== sm) cls.push(LG_SPAN[lg] ?? "lg:col-span-12");
  return cls.join(" ");
}

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
  if (!conditionals.length) return true;
  return conditionals.some((a) => {
    const ctrl = values[a.field!];
    return a.operator === "not_equals" ? ctrl !== a.value : ctrl === a.value;
  });
}

function buildHiddenByAction(fields: FieldDef[], values: Record<string, any>): Set<string> {
  const hidden = new Set<string>();
  for (const field of fields) {
    for (const action of field.actions ?? []) {
      if (action.type !== "toggle_visibility" || !action.target) continue;
      const condMet = String(values[field.key] ?? "") === String(action.condition_value ?? "");
      if (action.visibility === "show" && !condMet)
        action.target.forEach((t) => hidden.add(t));
      else if (action.visibility === "hide" && condMet)
        action.target.forEach((t) => hidden.add(t));
    }
  }
  return hidden;
}

// ─── Multi-Select ─────────────────────────────────────────────────────────────

function MultiSelectField({
  field, value, onChange, disabled, error,
}: {
  field: FieldDef; value: string[];
  onChange: (v: string[]) => void;
  disabled: boolean; error?: string;
}) {
  const [open, setOpen]         = useState(false);
  const triggerRef              = useRef<HTMLDivElement>(null);
  const dropdownRef             = useRef<HTMLDivElement>(null);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const selected: string[]      = Array.isArray(value) ? value : [];

  const recalc = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openAbove  = spaceBelow < 220 && r.top > spaceBelow;
    setDropStyle({
      position: "fixed",
      left: r.left,
      width: r.width,
      zIndex: 9999,
      ...(openAbove ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
    });
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    if (!open) recalc();
    setOpen((o) => !o);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!open) return;
    const u = () => recalc();
    window.addEventListener("scroll", u, true);
    window.addEventListener("resize", u);
    return () => { window.removeEventListener("scroll", u, true); window.removeEventListener("resize", u); };
  }, [open, recalc]);

  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);

  const removeItem = (v: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== v));
  };

  const labelFor = (v: string) => field.options?.find((o) => optVal(o) === v)?.label ?? v;

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleOpen}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOpen(); } }}
        className={cn(
          "min-h-9 w-full flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm cursor-pointer select-none",
          disabled && "bg-muted/50 cursor-not-allowed opacity-60",
          error && "border-destructive",
          open && "ring-2 ring-ring ring-offset-2"
        )}
      >
        {selected.length === 0
          ? <span className="text-muted-foreground text-sm">{field.placeholder ?? `Select ${field.label.toLowerCase()}…`}</span>
          : selected.map((v) => (
              <span key={v} className="inline-flex items-center gap-1 rounded-md bg-secondary text-secondary-foreground px-1.5 py-0.5 text-xs font-medium">
                {labelFor(v)}
                {!disabled && (
                  <button type="button" onClick={(e) => removeItem(v, e)} className="rounded-sm hover:bg-destructive/20 p-0.5" tabIndex={-1}>
                    <X className="size-2.5" />
                  </button>
                )}
              </span>
            ))
        }
        <span className="ml-auto pl-1 text-muted-foreground/60 text-xs">▾</span>
      </div>

      {open && !disabled && (
        <div ref={dropdownRef} style={dropStyle} className="rounded-md border border-border bg-popover shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
            {field.options?.length ? field.options.map((opt) => {
              const v = optVal(opt);
              const checked = selected.includes(v);
              return (
                <div key={v} role="option" aria-selected={checked} onClick={() => toggle(v)}
                  className={cn("flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors", checked && "bg-accent/50")}
                >
                  <div className={cn("flex items-center justify-center w-4 h-4 rounded border border-input shrink-0 transition-colors", checked && "bg-primary border-primary")}>
                    {checked && <Check className="size-2.5 text-primary-foreground" />}
                  </div>
                  <span>{opt.label}</span>
                </div>
              );
            }) : <div className="px-3 py-2 text-xs text-muted-foreground">No options available</div>}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-border px-3 py-1.5">
              <button type="button" onClick={() => onChange([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear all</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Checkbox group (when field has options) ──────────────────────────────────
// value is string[] of selected option values

function CheckboxGroupField({
  field, value, onChange, disabled, error,
}: {
  field: FieldDef; value: string[];
  onChange: (v: string[]) => void;
  disabled: boolean; error?: string;
}) {
  const selected: string[] = Array.isArray(value) ? value : [];

  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);

  return (
    <div className={cn("flex flex-wrap gap-x-5 gap-y-2 pt-0.5", error && "")}>
      {field.options!.map((opt) => {
        const v   = optVal(opt);
        const id  = `${field.key}__${v}`;
        const on  = selected.includes(v);
        return (
          <label key={v} htmlFor={id} className={cn("flex items-center gap-2 cursor-pointer select-none", disabled && "cursor-not-allowed opacity-60")}>
            <div
              onClick={() => !disabled && toggle(v)}
              className={cn(
                "flex items-center justify-center w-4 h-4 rounded border transition-colors shrink-0",
                on ? "bg-primary border-primary" : "border-input bg-background",
                disabled && "pointer-events-none"
              )}
            >
              {on && <Check className="size-2.5 text-primary-foreground" />}
            </div>
            <input id={id} type="checkbox" checked={on} disabled={disabled} onChange={() => toggle(v)} className="sr-only" />
            <span className="text-xs">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Date Range ───────────────────────────────────────────────────────────────

function DateRangeField({
  field, value, onChange, disabled, error,
}: {
  field: FieldDef; value: { start?: string; end?: string } | undefined;
  onChange: (v: { start?: string; end?: string }) => void;
  disabled: boolean; error?: string;
}) {
  const c = value ?? {};
  return (
    <div className="flex items-center gap-2">
      <Input type="date" disabled={disabled} value={c.start ?? ""} max={c.end || undefined}
        onChange={(e) => onChange({ ...c, start: e.target.value })}
        className={cn("flex-1", error && "border-destructive")} />
      <CalendarRange className="size-3.5 text-muted-foreground/50 shrink-0" />
      <Input type="date" disabled={disabled} value={c.end ?? ""} min={c.start || undefined}
        onChange={(e) => onChange({ ...c, end: e.target.value })}
        className={cn("flex-1", error && "border-destructive")} />
    </div>
  );
}

// ─── Multi-Upload ─────────────────────────────────────────────────────────────

function MultiUploadField({
  field, value, onChange, disabled, error,
}: {
  field: FieldDef; value: File[];
  onChange: (v: File[]) => void;
  disabled: boolean; error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const add = (files: FileList | null) => {
    if (files) onChange([...value, ...Array.from(files)]);
  };
  return (
    <div className="space-y-2">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex items-center gap-2 h-9 px-3 border rounded-md text-sm text-muted-foreground",
          disabled ? "bg-muted/50" : "bg-background cursor-pointer hover:bg-accent/30 transition-colors",
          error && "border-destructive"
        )}
      >
        <span className="text-xs flex-1 truncate text-muted-foreground/70">
          {value.length === 0 ? "No files chosen" : `${value.length} file${value.length !== 1 ? "s" : ""} selected`}
        </span>
        {!disabled && <span className="text-xs text-primary hover:underline shrink-0">Browse</span>}
        <input ref={inputRef} type="file" multiple className="hidden" disabled={disabled}
          onChange={(e) => add(e.target.files)}
          onClick={(e) => ((e.target as HTMLInputElement).value = "")} />
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((file, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground">
              <span className="max-w-[140px] truncate">{file.name}</span>
              {!disabled && (
                <button type="button" onClick={() => onChange(value.filter((_, i) => i !== idx))}
                  className="rounded-sm text-muted-foreground hover:text-destructive ml-0.5">
                  <X className="size-2.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DataSource lookup field (text with auto-fetch) ───────────────────────────

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
    if (!readyToFetch(val)) { setFilled(false); setFetchErr(""); return; }
    setFetching(true); setFetchErr("");
    try {
      const res = await fetch(`${BASE_URL}/${ds.endpoint}`, {
        method: ds.method.toUpperCase(),
        headers: HEADERS,
        body: ds.method.toUpperCase() === "POST" ? JSON.stringify({ [field.key]: val }) : undefined,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Lookup failed");
      const result: Record<string, string> = {};
      for (const [src, tgt] of Object.entries(ds.response_mapping ?? {}))
        result[tgt] = String(data.data[0]?.[src] ?? "");
      onAutoFill(result);
      setFilled(true);
    } catch (e) {
      setFetchErr(e instanceof Error ? e.message : "Lookup failed");
      setFilled(false);
    } finally { setFetching(false); }
  }, [ds, field.key]);

  const handleChange = (v: string) => {
    const capped = field.validation?.max_length ? v.slice(0, field.validation.max_length) : v;
    onChange(capped);
    setFetchErr("");

    // If data was already fetched and the user is now editing the trigger field,
    // immediately blank out all response-mapped fields so stale data isn't shown
    // while waiting for the next fetch (or if the new value never satisfies regex).
    if (filled) {
      const cleared: Record<string, string> = {};
      for (const tgt of Object.values(ds.response_mapping ?? {}))
        cleared[tgt as string] = "";
      onAutoFill(cleared);
      setFilled(false);
    }

    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => doFetch(capped), 600);
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input value={value ?? ""} onChange={(e) => handleChange(e.target.value)} disabled={disabled}
          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}`}
          maxLength={field.validation?.max_length}
          className={cn("pr-9", error && "border-destructive", filled && "border-green-500 focus-visible:ring-green-500")} />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {fetching ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          : filled   ? <Check   className="size-3.5 text-green-500" />
          :             <Search  className="size-3.5 text-muted-foreground/50" />}
        </div>
      </div>
      {fetchErr && <p className="text-xs text-destructive">{fetchErr}</p>}
      {/* {filled && <p className="text-xs text-green-600 flex items-center gap-1"><Check className="size-3 shrink-0" /> Details fetched</p>} */}
    </div>
  );
}

// ─── Button field ─────────────────────────────────────────────────────────────
// Clicking always:
//   1. asks the parent to validate (onValidate → returns errors or null)
//   2. if clean, POSTs to data_source.endpoint with the full form payload
//   3. if no data_source, falls back to onAction("submit") for parent to handle

function ButtonField({
  field, disabled, onValidateAndGetPayload, onAction,
}: {
  field: FieldDef;
  disabled: boolean;
  /** Parent runs validation; returns the payload if valid, or null if there are errors */
  onValidateAndGetPayload: () => Record<string, any> | null;
  onAction?: (action: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus]         = useState<"idle" | "success" | "error">("idle");
  const [errMsg, setErrMsg]         = useState("");

  const ds      = field.data_source;
  const variant = (field.variant ?? "default") as any;
  const size    = (field.size    ?? "default") as any;

  const handleClick = async () => {
    if (disabled || submitting) return;
    setStatus("idle"); setErrMsg("");

    // Always validate first
    const payload = onValidateAndGetPayload();
    if (payload === null) return; // validation failed — errors shown in form

    // If button has a data_source with an endpoint, POST directly
    if (ds?.endpoint) {
      setSubmitting(true);
      try {
        const url    = `${BASE_URL}/${ds.endpoint.replace(/^\//, "")}`;
        const method = (ds.method ?? "POST").toUpperCase();
        const res    = await fetch(url, {
          method,
          headers: HEADERS,
          body: method !== "GET" ? JSON.stringify(payload) : undefined,
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message ?? "Submission failed");
        setStatus("success");
        onAction?.("submit_success");
      } catch (e) {
        setErrMsg(e instanceof Error ? e.message : "Submission failed");
        setStatus("error");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // No endpoint — parent handles the actual submission
    onAction?.("submit");
  };

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={disabled || submitting}
        className="w-full"
        onClick={handleClick}
      >
        {submitting ? (
          <><Loader2 className="size-3.5 mr-1.5 animate-spin" />Submitting…</>
        ) : status === "success" ? (
          <><Check className="size-3.5 mr-1.5" />Submitted</>
        ) : (
          <><Send className="size-3.5 mr-1.5" />{field.label}</>
        )}
      </Button>
      {status === "error" && errMsg && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="size-3 shrink-0" />{errMsg}
        </p>
      )}
      {status === "success" && (
        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
          <Check className="size-3 shrink-0" />Submitted successfully
        </p>
      )}
    </div>
  );
}

// ─── Single field renderer ────────────────────────────────────────────────────

function FieldInput({
  field, value, onChange, onAutoFill, onAction, onValidateAndGetPayload, error,
}: {
  field: FieldDef; value: any;
  onChange: (key: string, val: any) => void;
  onAutoFill: (key: string, mapping: Record<string, string>) => void;
  onAction?: (action: string) => void;
  onValidateAndGetPayload: () => Record<string, any> | null;
  error?: string;
}) {
  const editable    = field.ui?.editable ?? true;
  const disabled    = !editable;
  const disabledCls = disabled ? "bg-muted/50 cursor-not-allowed" : "";

  // ── button type ───────────────────────────────────────────────────────────
  if (field.type === "button") {
    return (
      <ButtonField
        field={field}
        disabled={disabled}
        onValidateAndGetPayload={onValidateAndGetPayload}
        onAction={onAction}
      />
    );
  }

  // ── DataSource lookup fields (non-button) ─────────────────────────────────
  if (field.data_source && field.data_source.endpoint && editable) {
    return (
      <DataSourceField
        field={field} value={value ?? ""}
        onChange={(v) => onChange(field.key, v)}
        onAutoFill={(mapping) => onAutoFill(field.key, mapping)}
        disabled={disabled} error={error}
      />
    );
  }

  switch (field.type) {
    case "boolean":
      return (
        <div className="flex items-center gap-2 h-9">
          <Switch id={field.key} disabled={disabled} checked={!!value}
            onCheckedChange={(v) => onChange(field.key, v)} />
          <Label htmlFor={field.key} className="text-xs text-muted-foreground font-normal cursor-pointer">
            {value ? "Yes" : "No"}
          </Label>
        </div>
      );

    case "checkbox":
      // ── Multi-option checkbox group ────────────────────────────────────
      if (field.options && field.options.length > 0) {
        return (
          <CheckboxGroupField
            field={field}
            value={Array.isArray(value) ? value : value ? [value] : []}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
            error={error}
          />
        );
      }
      // ── Single boolean checkbox (no options) ───────────────────────────
      return (
        <div className="flex items-center gap-2 h-9">
          <input id={field.key} type="checkbox" disabled={disabled}
            checked={!!value}
            // onChange={(e) => onChange(field.key, e.target.checked ? "1" : "0")}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
          <Label htmlFor={field.key} className="text-xs font-normal cursor-pointer">{field.label}</Label>
        </div>
      );

    case "radio":
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
          {(field.options ?? []).map((opt) => {
            const v = optVal(opt);
            return (
              <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name={field.key} value={v} disabled={disabled}
                  checked={value === v} onChange={() => onChange(field.key, v)}
                  className="h-3.5 w-3.5 accent-primary" />
                <span className="text-xs">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );

    case "select":
      if (field.multi_select) {
        return (
          <MultiSelectField field={field}
            value={Array.isArray(value) ? value : value ? [value] : []}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled} error={error} />
        );
      }
      return (
        <Select value={value || ""} onValueChange={(v) => onChange(field.key, v)} disabled={disabled}>
          <SelectTrigger className={cn("w-full", disabledCls, error && "border-destructive")}>
            <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}…`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.length
              ? field.options.map((opt) => (
                  <SelectItem key={optVal(opt)} value={optVal(opt)}>{opt.label}</SelectItem>
                ))
              : <SelectItem value="__empty" disabled>No options available</SelectItem>}
          </SelectContent>
        </Select>
      );

    case "number":
    case "decimal":
      return (
        <Input type="number" id={field.key}
          step={field.type === "decimal" ? "0.01" : "1"}
          disabled={disabled} placeholder={field.placeholder}
          min={field.validation?.min_value} max={field.validation?.max_value}
          className={cn(disabledCls, error && "border-destructive")}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)} />
      );

    case "date":
      if (field.date_range) {
        return (
          <DateRangeField field={field} value={value}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled} error={error} />
        );
      }
      return (
        <Input type="date" id={field.key} disabled={disabled}
          className={cn(disabledCls, error && "border-destructive")}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)} />
      );

    case "file":
      if (field.multi_upload) {
        return (
          <MultiUploadField field={field}
            value={Array.isArray(value) ? value : value ? [value] : []}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled} error={error} />
        );
      }
      return (
        <div className={cn(
          "flex items-center gap-2 h-9 px-3 border rounded-md text-sm text-muted-foreground",
          disabled ? "bg-muted/50" : "bg-background",
          error && "border-destructive"
        )}>
          <span className="text-xs flex-1 truncate">{value ? (value as File).name : "No file chosen"}</span>
          {!disabled && (
            <label className="cursor-pointer shrink-0">
              <span className="text-xs text-primary hover:underline">Browse</span>
              <input type="file" className="hidden" onChange={(e) => onChange(field.key, e.target.files?.[0] ?? null)} />
            </label>
          )}
        </div>
      );

    case "textarea":
      return (
        <textarea id={field.key} disabled={disabled}
          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
            disabledCls, error && "border-destructive"
          )}
          maxLength={field.validation?.max_length} rows={4}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)} />
      );

    default:
      return (
        <Input id={field.key} disabled={disabled}
          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
          className={cn(disabledCls, error && "border-destructive")}
          value={value ?? ""} maxLength={field.validation?.max_length}
          onChange={(e) => onChange(field.key, e.target.value)} />
      );
  }
}

// ─── Field wrapper (label + input + error) ────────────────────────────────────

function FormField({
  field, value, onChange, onAutoFill, onAction, onValidateAndGetPayload, errors, errPrefix = "",
}: {
  field: FieldDef; value: any;
  onChange: (key: string, val: any) => void;
  onAutoFill: (key: string, mapping: Record<string, string>) => void;
  onAction?: (action: string) => void;
  onValidateAndGetPayload: () => Record<string, any> | null;
  errors: Record<string, string>;
  errPrefix?: string;
}) {
  const errKey     = errPrefix ? `${errPrefix}.${field.key}` : field.key;
  const error      = errors[errKey];
  const isCheckbox = field.type === "checkbox" && !(field.options?.length);
  const isButton   = field.type === "button";

  // Buttons: no label wrapper, no error display
  if (isButton) {
    return (
      <FieldInput field={field} value={value} onChange={onChange}
        onAutoFill={onAutoFill} onAction={onAction}
        onValidateAndGetPayload={onValidateAndGetPayload} error={error} />
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Hide label for single boolean checkbox (rendered inline) */}
      {!isCheckbox && (
        <Label htmlFor={field.key} className="text-xs font-medium leading-none">
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <FieldInput field={field} value={value} onChange={onChange}
        onAutoFill={onAutoFill} onAction={onAction}
        onValidateAndGetPayload={onValidateAndGetPayload} error={error} />
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

// ─── Section (parent or sub-step) ────────────────────────────────────────────

function SectionForm({
  sectionKey, title, fields, sectionValues, errors,
  onSectionChange, onSectionAutoFill, onAction, onValidateAndGetPayload,
  showTitle = true, accordion = false,
}: {
  sectionKey: string; title: string; fields: FieldDef[];
  sectionValues: Record<string, any>; errors: Record<string, string>;
  onSectionChange: (section: string, key: string, val: any) => void;
  onSectionAutoFill: (section: string, key: string, mapping: Record<string, string>) => void;
  onAction?: (action: string) => void;
  onValidateAndGetPayload: () => Record<string, any> | null;
  showTitle?: boolean;
  accordion?: boolean;
}) {
  const [open, setOpen] = useState(!accordion); // accordion starts collapsed; normal starts open
  const hiddenByAction  = buildHiddenByAction(fields, sectionValues);
  // Button fields are pulled out of the normal flow and rendered once at the
  // bottom of the whole form (see FormRenderer) regardless of where they sit
  // in rendered_json — so they're excluded here entirely.
  const visible = fields.filter(
    (f) => f.type !== "button" && isFieldVisible(f, sectionValues, hiddenByAction)
  );

  // Count errors belonging to this section so the accordion header can warn when collapsed
  const sectionErrorCount = Object.keys(errors).filter((k) => k.startsWith(`${sectionKey}.`)).length;

  if (visible.length === 0 && !showTitle) return null;

  const header = (showTitle || accordion) && (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border",
        accordion && "cursor-pointer select-none hover:bg-muted/60 transition-colors"
      )}
      onClick={() => accordion && setOpen((o) => !o)}
      role={accordion ? "button" : undefined}
      aria-expanded={accordion ? open : undefined}
    >
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-semibold text-foreground">{title}</h4>
        {/* Show error badge on collapsed accordion so user knows fields need attention */}
        {accordion && !open && sectionErrorCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
            <AlertCircle className="size-2.5 shrink-0" />{sectionErrorCount}
          </span>
        )}
      </div>
      {accordion && (
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      )}
    </div>
  );

  const body = (
    <div className="p-5">
      {visible.length === 0
        ? <p className="text-xs text-muted-foreground/50 text-center py-4">No fields configured</p>
        : (
          <div className="grid grid-cols-12 gap-x-4 gap-y-5">
            {visible.map((field) => (
              <div key={field.key} className={colSpan(field)}>
                <FormField
                  field={field}
                  value={sectionValues[field.key]}
                  onChange={(key, val) => onSectionChange(sectionKey, key, val)}
                  onAutoFill={(key, mapping) => onSectionAutoFill(sectionKey, key, mapping)}
                  onAction={onAction}
                  onValidateAndGetPayload={onValidateAndGetPayload}
                  errors={errors}
                  errPrefix={sectionKey}
                />
              </div>
            ))}
          </div>
        )
      }
    </div>
  );

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {header}
      {/* Animate height when accordion; always visible when normal */}
      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          accordion && !open ? "max-h-0 overflow-hidden" : "max-h-[9999px]"
        )}
      >
        {body}
      </div>
    </div>
  );
}

// ─── Repeatable section (whole card duplicated) ───────────────────────────────
// repeatable: true duplicates the ENTIRE card — title "Name - N", full grid
// layout with labels above each field, a header "+ Add More" button, and a
// per-card "Remove" button (hidden on the first card).
// this duplicates the ENTIRE card — title "Name - N", full grid layout with
// labels above each field, a header "+ Add More" button, and a per-card
// "Remove" button (hidden on the first card).

function RepeatableCardSection({
  subStep, errors, onCardsChange, onAction, onValidateAndGetPayload, accordion = false,
}: {
  subStep: SubStep; errors: Record<string, string>;
  onCardsChange: (stepKey: string, cards: Record<string, any>[]) => void;
  onAction?: (action: string) => void;
  onValidateAndGetPayload: () => Record<string, any> | null;
  accordion?: boolean;
}) {
  const fields = subStep.rendered_json?.fields ?? [];
  const [cards, setCards] = useState<Record<string, any>[]>([{}]);
  const [open, setOpen]   = useState(!accordion); // accordion starts collapsed; normal starts open

  // Notify parent AFTER React has committed the new cards state, not during render.
  // Calling onCardsChange (which does setRepeatableCards in FormRenderer) inside
  // a setCards updater triggers "setState during render" warnings.
  useEffect(() => {
    onCardsChange(subStep.step_key, cards);
  }, [cards]);

  const addCard = () => setCards((prev) => [...prev, {}]);

  const removeCard = (idx: number) =>
    setCards((prev) => prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx));

  const handleChange = (cardIdx: number, key: string, val: any) =>
    setCards((prev) => prev.map((c, i) => (i === cardIdx ? { ...c, [key]: val } : c)));

  const handleAutoFill = (cardIdx: number, _key: string, mapping: Record<string, string>) =>
    setCards((prev) => prev.map((c, i) => (i === cardIdx ? { ...c, ...mapping } : c)));

  // Count errors across all cards so the collapsed accordion header can warn
  const totalErrorCount = Object.keys(errors).filter((k) => k.startsWith(`${subStep.step_key}[`)).length;

  const body = (
    <div className="space-y-4">
      {/* Header — title + Add More */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{subStep.step_name}</h3>
        <Button type="button" size="sm" onClick={addCard} className="gap-1.5">
          <span className="text-base leading-none">+</span> Add More
        </Button>
      </div>

      {cards.map((cardValues, cardIdx) => {
        const cardKey        = `${subStep.step_key}[${cardIdx}]`;
        const hiddenByAction = buildHiddenByAction(fields, cardValues);
        const visible = fields.filter(
          (f) => f.type !== "button" && isFieldVisible(f, cardValues, hiddenByAction)
        );

        return (
          <div key={cardIdx} className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border">
              <h4 className="text-sm font-medium text-primary">
                {subStep.step_name} - {cardIdx + 1}
              </h4>
              {cardIdx > 0 && (
                <Button type="button" variant="destructive" size="sm" onClick={() => removeCard(cardIdx)}>
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>

            <div className="p-5">
              {visible.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 text-center py-4">No fields configured</p>
              ) : (
                <div className="grid grid-cols-12 gap-x-4 gap-y-5">
                  {visible.map((field) => (
                    <div key={field.key} className={colSpan(field)}>
                      <FormField
                        field={field}
                        value={cardValues[field.key]}
                        onChange={(key, val) => handleChange(cardIdx, key, val)}
                        onAutoFill={(key, mapping) => handleAutoFill(cardIdx, key, mapping)}
                        onAction={onAction}
                        onValidateAndGetPayload={onValidateAndGetPayload}
                        errors={errors}
                        errPrefix={cardKey}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Plain (non-accordion) mode: render the repeatable structure as-is ──────
  if (!accordion) return body;

  // ── Accordion mode: wrap the entire repeatable structure (Add More + all
  //    cards) in a single collapsible shell, matching SectionForm's header style ──
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border cursor-pointer select-none hover:bg-muted/60 transition-colors"
        onClick={() => setOpen((o) => !o)}
        role="button"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
              open && "rotate-90"
            )}
          />
          <h4 className="text-xs font-semibold text-foreground">{subStep.step_name}</h4>
          <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-400">
            Repeatable
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
            Accordion
          </span>
          {!open && totalErrorCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
              <AlertCircle className="size-2.5 shrink-0" />{totalErrorCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </div>
      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          !open ? "max-h-0 overflow-hidden" : "max-h-[9999px]"
        )}
      >
        <div className="p-5 bg-muted/20">{body}</div>
      </div>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateFields(
  fields: FieldDef[],
  values: Record<string, any>,
  hiddenByAction: Set<string>
): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const field of fields) {
    if (!isFieldVisible(field, values, hiddenByAction)) continue;
    if (field.type === "button") continue; // buttons are not validated

    const raw = values[field.key];
    const v   = field.validation;

    const isEmpty =
      raw === null || raw === undefined || raw === "" ||
      (Array.isArray(raw) && raw.length === 0) ||
      (field.date_range && (!raw?.start || !raw?.end));

    if (field.required && isEmpty) {
      errs[field.key] = `${field.label} is required`;
      continue;
    }
    if (isEmpty || !v) continue;

    if (v.regex && typeof raw === "string") {
      if (!new RegExp(v.regex).test(raw)) {
        errs[field.key] = `${field.label} format is invalid`; continue;
      }
    }
    if (typeof raw === "string") {
      if (v.min_length !== undefined && raw.length < v.min_length) {
        errs[field.key] = `${field.label} must be at least ${v.min_length} characters`; continue;
      }
      if (v.max_length !== undefined && raw.length > v.max_length) {
        errs[field.key] = `${field.label} must be at most ${v.max_length} characters`; continue;
      }
    }
    if (field.type === "number" || field.type === "decimal") {
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        if (v.min_value !== undefined && num < v.min_value) {
          errs[field.key] = `${field.label} must be at least ${v.min_value}`; continue;
        }
        if (v.max_value !== undefined && num > v.max_value) {
          errs[field.key] = `${field.label} must be at most ${v.max_value}`; continue;
        }
      }
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
  const [fetchError, setFetchError] = useState("");
  const [sectionValues, setSectionValues] = useState<Record<string, Record<string, any>>>({});
  const [repeatableCards, setRepeatableCards] = useState<Record<string, Record<string, any>[]>>({});
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const load = async () => {
    setLoading(true); setFetchError("");
    try {
      const res = await fetch(`${BASE_URL}/formBuilder/getActiveSubSectionByStepkey`, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify(formId && stepKey ? { form_id: formId, step_key: stepKey } : STATIC_PAYLOAD),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load step");
      setStepData(json.data);
      // setStepData(dummyData as StepData); // Using dummy data for demonstration
    } catch (e: any) {
      setFetchError(e.message || "Failed to load form");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [formId, stepKey]);

  const handleChange = (section: string, key: string, val: any) => {
    setSectionValues((p) => ({ ...p, [section]: { ...(p[section] ?? {}), [key]: val } }));
    const errKey = `${section}.${key}`;
    if (errors[errKey]) setErrors((p) => { const n = { ...p }; delete n[errKey]; return n; });
  };

  const handleAutoFill = (section: string, _key: string, mapping: Record<string, string>) => {
    setSectionValues((p) => ({ ...p, [section]: { ...(p[section] ?? {}), ...mapping } }));
  };

  const handleCardsChange = (sk: string, cards: Record<string, any>[]) => {
    setRepeatableCards((p) => ({ ...p, [sk]: cards }));
  };

  // Runs validation across all sections; returns the full payload if valid, null if errors exist
  const validateAndGetPayload = useCallback((): Record<string, any> | null => {
    if (!stepData) return null;
    const allErrors: Record<string, string> = {};

    const parentFields = stepData.parent_step.rendered_json?.fields ?? [];
    const parentVals   = sectionValues["__parent__"] ?? {};
    const parentHidden = buildHiddenByAction(parentFields, parentVals);
    for (const [k, v] of Object.entries(validateFields(parentFields, parentVals, parentHidden)))
      allErrors[`__parent__.${k}`] = v;

    for (const sub of stepData.sub_steps ?? []) {
      if (Boolean(sub.repeatable)) {
        // Validate each duplicated card independently
        const subFields = sub.rendered_json?.fields ?? [];
        const cards     = repeatableCards[sub.step_key] ?? [{}];
        cards.forEach((cardVals, idx) => {
          const cardHidden = buildHiddenByAction(subFields, cardVals);
          for (const [k, v] of Object.entries(validateFields(subFields, cardVals, cardHidden)))
            allErrors[`${sub.step_key}[${idx}].${k}`] = v;
        });
      } else {
        const subFields = sub.rendered_json?.fields ?? [];
        const subVals   = sectionValues[sub.step_key] ?? {};
        const subHidden = buildHiddenByAction(subFields, subVals);
        for (const [k, v] of Object.entries(validateFields(subFields, subVals, subHidden)))
          allErrors[`${sub.step_key}.${k}`] = v;
      }
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return null;
    }

    return {
      form_id:              formId ?? STATIC_PAYLOAD.form_id,
      step_key:             stepData.parent_step.parent_step_key,
      sections:             sectionValues,
      repeatable_sections:  repeatableCards,
    };
  }, [stepData, sectionValues, repeatableCards, formId]);

  const handleSubmit = useCallback(() => {
    const payload = validateAndGetPayload();
    if (!payload) return;
    setSubmitted(true);
    console.log("[FormRenderer] Submit payload:", JSON.stringify(payload, null, 2));
  }, [validateAndGetPayload]);

  const handleAction = useCallback((action: string) => {
    if (action === "submit")         handleSubmit();
    else if (action === "submit_success") setSubmitted(true);
    else if (action === "reset") {
      setSectionValues({});
      setRepeatableCards({});
      setErrors({});
    }
  }, [handleSubmit]);

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      <span className="text-sm">Loading form…</span>
    </div>
  );

  if (fetchError) return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="size-4 shrink-0" />{fetchError}
      </div>
      <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
        <RefreshCw className="size-3.5" /> Retry
      </Button>
    </div>
  );

  if (!stepData) return null;

  const parentFields = stepData.parent_step.rendered_json?.fields ?? [];
  const subSteps     = stepData.sub_steps ?? [];
  const hasParent    = parentFields.length > 0;
  const hasSubSteps  = subSteps.length > 0;

  // Collect every button field defined anywhere in rendered_json — parent fields
  // and all sub-step fields — regardless of nesting or position. These are pulled
  // out of the normal field flow (SectionForm / RepeatableCardSection filter them
  // out) and rendered together here, at the bottom, in place of the fallback
  // Submit button.
  const allButtonFields: FieldDef[] = [
    ...parentFields,
    ...subSteps.flatMap((s) => s.rendered_json?.fields ?? []),
  ].filter((f) => f.type === "button");

  const hasInlineSubmit = allButtonFields.length > 0;

  if (submitted) return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-8 flex flex-col items-center gap-3 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
        <Check className="size-6 text-emerald-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Form submitted</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Check the console for the payload</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setSectionValues({}); setRepeatableCards({}); }}>
        Reset
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{stepData.parent_step.parent_step_name}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Please fill in all the required information</p>
          {/* <p className="text-xs text-muted-foreground font-mono mt-0.5">{stepData.parent_step.parent_step_key}</p> */}
        </div>
        <div className="flex items-center gap-1.5">
          {hasSubSteps && <Badge variant="outline" className="text-xs">{subSteps.length} sub-section{subSteps.length !== 1 ? "s" : ""}</Badge>}
          {hasParent && <Badge variant="secondary" className="text-xs">{parentFields.length} field{parentFields.length !== 1 ? "s" : ""}</Badge>}
        </div>
      </div>

      {/* Parent fields */}
      {hasParent && (
        <SectionForm
          sectionKey="__parent__"
          title={stepData.parent_step.parent_step_name}
          fields={parentFields}
          sectionValues={sectionValues["__parent__"] ?? {}}
          errors={errors}
          onSectionChange={handleChange}
          onSectionAutoFill={handleAutoFill}
          onAction={handleAction}
          onValidateAndGetPayload={validateAndGetPayload}
          showTitle={false}
        />
      )}

      {/* Sub-steps */}
      {hasSubSteps && (
        <div className="space-y-4">
          {subSteps.slice().sort((a, b) => a.step_order - b.step_order).map((sub) =>
            Boolean(sub.repeatable) ? (
              <RepeatableCardSection key={sub.step_key} subStep={sub} errors={errors}
                onCardsChange={handleCardsChange} onAction={handleAction}
                onValidateAndGetPayload={validateAndGetPayload}
                accordion={Boolean(sub.accordion)} />
            ) : (
              <SectionForm key={sub.step_key} sectionKey={sub.step_key} title={sub.step_name}
                fields={sub.rendered_json?.fields ?? []}
                sectionValues={sectionValues[sub.step_key] ?? {}}
                errors={errors} onSectionChange={handleChange} onSectionAutoFill={handleAutoFill}
                onAction={handleAction} onValidateAndGetPayload={validateAndGetPayload}
                showTitle accordion={Boolean(sub.accordion)} />
            )
          )}
        </div>
      )}

      {!hasParent && !hasSubSteps && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
          <p className="text-sm font-medium">No fields configured</p>
        </div>
      )}

      {/* Validation summary */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {Object.keys(errors).length} field{Object.keys(errors).length !== 1 ? "s" : ""} need attention
        </div>
      )}

      {/* Buttons — rendered here regardless of where they're defined in rendered_json.
          Falls back to a generic Submit button only when the form has no button fields. */}
      {hasInlineSubmit ? (
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          {allButtonFields.map((btnField) => {
            const editable = btnField.ui?.editable ?? true;
            return (
              <div key={btnField.key} className="min-w-[140px]">
                <ButtonField
                  field={btnField}
                  disabled={!editable}
                  onValidateAndGetPayload={validateAndGetPayload}
                  onAction={handleAction}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex justify-end pt-1">
          <Button onClick={handleSubmit} className="gap-2">
            <Send className="size-3.5" />Submit
          </Button>
        </div>
      )}
    </div>
  );
}