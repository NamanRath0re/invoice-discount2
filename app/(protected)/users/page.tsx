"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2, Check, Search, AlertCircle, RefreshCw, ChevronRight, Send, X, CalendarRange,
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
const STATIC_PAYLOAD = { form_id: 25, step_key: "Seocnd" };

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
        "radio" | "checkbox" | "file" | string;
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
  multi_select?: boolean;
  multi_upload?: boolean;
  date_range?: boolean;
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

// ─── Multi-Select ─────────────────────────────────────────────────────────────
// value is string[] for multi, string for single

function MultiSelectField({
  field, value, onChange, disabled, error,
}: {
  field: FieldDef;
  value: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected: string[] = Array.isArray(value) ? value : [];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v];
    onChange(next);
  };

  const removeItem = (v: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== v));
  };

  const labelFor = (v: string) =>
    field.options?.find((o) => optVal(o) === v)?.label ?? v;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); !disabled && setOpen((o) => !o); } }}
        className={cn(
          "min-h-9 w-full flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm cursor-pointer select-none",
          disabled && "bg-muted/50 cursor-not-allowed opacity-60",
          error && "border-destructive",
          open && "ring-2 ring-ring ring-offset-2"
        )}
      >
        {selected.length === 0 ? (
          <span className="text-muted-foreground text-sm">
            {field.placeholder ?? `Select ${field.label.toLowerCase()}…`}
          </span>
        ) : (
          selected.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md bg-secondary text-secondary-foreground px-1.5 py-0.5 text-xs font-medium"
            >
              {labelFor(v)}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => removeItem(v, e)}
                  className="rounded-sm hover:bg-destructive/20 transition-colors p-0.5"
                  tabIndex={-1}
                >
                  <X className="size-2.5" />
                </button>
              )}
            </span>
          ))
        )}
        <span className="ml-auto pl-1 text-muted-foreground/60 text-xs">▾</span>
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
            {field.options?.length ? (
              field.options.map((opt) => {
                const v = optVal(opt);
                const checked = selected.includes(v);
                return (
                  <div
                    key={v}
                    role="option"
                    aria-selected={checked}
                    onClick={() => toggle(v)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                      checked && "bg-accent/50"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-4 h-4 rounded border border-input shrink-0 transition-colors",
                      checked && "bg-primary border-primary"
                    )}>
                      {checked && <Check className="size-2.5 text-primary-foreground" />}
                    </div>
                    <span>{opt.label}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-muted-foreground">No options available</div>
            )}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-border px-3 py-1.5">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Date Range Field ─────────────────────────────────────────────────────────
// value is { start?: string; end?: string }

function DateRangeField({
  field, value, onChange, disabled, error,
}: {
  field: FieldDef;
  value: { start?: string; end?: string } | undefined;
  onChange: (v: { start?: string; end?: string }) => void;
  disabled: boolean;
  error?: string;
}) {
  const current = value ?? {};

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <Input
          type="date"
          disabled={disabled}
          value={current.start ?? ""}
          max={current.end || undefined}
          onChange={(e) => onChange({ ...current, start: e.target.value })}
          className={cn(error && "border-destructive")}
          placeholder="Start date"
        />
      </div>
      <div className="flex items-center justify-center w-6 shrink-0">
        <CalendarRange className="size-3.5 text-muted-foreground/50" />
      </div>
      <div className="flex-1">
        <Input
          type="date"
          disabled={disabled}
          value={current.end ?? ""}
          min={current.start || undefined}
          onChange={(e) => onChange({ ...current, end: e.target.value })}
          className={cn(error && "border-destructive")}
          placeholder="End date"
        />
      </div>
    </div>
  );
}

// ─── Multi-Upload Field ───────────────────────────────────────────────────────
// value is File[] for multi, File | null for single

function MultiUploadField({
  field, value, onChange, disabled, error,
}: {
  field: FieldDef;
  value: File[];
  onChange: (v: File[]) => void;
  disabled: boolean;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    onChange([...value, ...incoming]);
  };

  const removeFile = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center gap-2 h-9 px-3 border rounded-md text-sm text-muted-foreground",
          disabled ? "bg-muted/50" : "bg-background cursor-pointer hover:bg-accent/30 transition-colors",
          error && "border-destructive"
        )}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <span className="text-xs flex-1 truncate text-muted-foreground/70">
          {value.length === 0
            ? "No files chosen"
            : `${value.length} file${value.length !== 1 ? "s" : ""} selected`}
        </span>
        {!disabled && (
          <span className="text-xs text-primary hover:underline shrink-0">Browse</span>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          // Reset input so same file can be re-added after removal
          onClick={(e) => ((e.target as HTMLInputElement).value = "")}
        />
      </div>

      {/* File chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((file, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground"
            >
              <span className="max-w-[140px] truncate">{file.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="rounded-sm text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                >
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
    if (!readyToFetch(val)) { setFilled(false); setFetchErr(""); return; }
    setFetching(true); setFetchErr("");
    try {
      const res = await fetch(`${BASE_URL}/${ds.endpoint}`, {
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
        result[tgt] = String(data.data[0]?.[src] ?? ""); 
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
          maxLength={field.validation?.max_length}
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
  onAutoFill: (key: string, mapping: Record<string, string>) => void;
  error?: string;
}) {
  const editable = field.ui?.editable ?? true;
  const disabled = !editable;
  const disabledCls = disabled ? "bg-muted/50 cursor-not-allowed" : "";

  if (field.data_source && editable) {
    return (
      <DataSourceField
        field={field}
        value={value ?? ""}
        onChange={(v) => onChange(field.key, v)}
        onAutoFill={(mapping) => onAutoFill(field.key, mapping)}
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
                  name={field.key}
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
      // ── FIXED: branch on multi_select ──────────────────────────────────
      if (field.multi_select) {
        return (
          <MultiSelectField
            field={field}
            value={Array.isArray(value) ? value : value ? [value] : []}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
            error={error}
          />
        );
      }
      return (
        <Select
          value={value || ""}
          onValueChange={(v) => onChange(field.key, v)}
          disabled={disabled}
        >
          <SelectTrigger className={cn("w-full", disabledCls, error && "border-destructive")}>
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
          // ── FIXED: wire min/max from validation ───────────────────────
          min={field.validation?.min_value}
          max={field.validation?.max_value}
          className={cn(disabledCls, error && "border-destructive")}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "date":
      // ── FIXED: branch on date_range ────────────────────────────────────
      if (field.date_range) {
        return (
          <DateRangeField
            field={field}
            value={value}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
            error={error}
          />
        );
      }
      return (
        <Input
          type="date"
          id={field.key}
          disabled={disabled}
          className={cn(disabledCls, error && "border-destructive")}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "file":
      // ── FIXED: branch on multi_upload ─────────────────────────────────
      if (field.multi_upload) {
        return (
          <MultiUploadField
            field={field}
            value={Array.isArray(value) ? value : value ? [value] : []}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
            error={error}
          />
        );
      }
      return (
        <div className={cn(
          "flex items-center gap-2 h-9 px-3 border rounded-md text-sm text-muted-foreground",
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

    case "textarea":
      return (
        <textarea
          id={field.key}
          disabled={disabled}
          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
            disabledCls,
            error && "border-destructive"
          )}
          maxLength={field.validation?.max_length}
          rows={4}
          value={value ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    default:
      return (
        <Input
          id={field.key}
          disabled={disabled}
          placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
          className={cn(disabledCls, error && "border-destructive")}
          value={value ?? ""}
          maxLength={field.validation?.max_length}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );
  }
}

// ─── Field wrapper (label + input + validation) ───────────────────────────────

function FormField({
  field, value, onChange, onAutoFill, errors, errPrefix = "",
}: {
  field: FieldDef; value: any;
  onChange: (key: string, val: any) => void;
  onAutoFill: (key: string, mapping: Record<string, string>) => void;
  errors: Record<string, string>;
  errPrefix?: string;
}) {
  const error     = errors[errPrefix ? `${errPrefix}.${field.key}` : field.key];
  const isCheckbox = field.type === "checkbox";

  return (
    <div className="space-y-1.5">
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
  sectionKey, title, fields, sectionValues, errors, onSectionChange, onSectionAutoFill, showTitle = true,
}: {
  sectionKey: string;
  title: string; fields: FieldDef[];
  sectionValues: Record<string, any>; errors: Record<string, string>;
  onSectionChange: (section: string, key: string, val: any) => void;
  onSectionAutoFill: (section: string, key: string, mapping: Record<string, string>) => void;
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
              <div key={field.key} className={colSpan(field)}>
                <FormField
                  field={field}
                  value={sectionValues[field.key]}
                  onChange={(key, val) => onSectionChange(sectionKey, key, val)}
                  onAutoFill={(key, mapping) => onSectionAutoFill(sectionKey, key, mapping)}
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

// ─── Repeatable sub-step form ─────────────────────────────────────────────────

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

  const handleAutoFill = (rowIdx: number, _key: string, mapping: Record<string, string>) =>
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
                onAutoFill={(key, mapping) => handleAutoFill(rowIdx, key, mapping)}
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

// ─── Validation ───────────────────────────────────────────────────────────────

function validateFields(
  fields: FieldDef[],
  values: Record<string, any>,
  hiddenByAction: Set<string>
): Record<string, string> {
  const errs: Record<string, string> = {};

  for (const field of fields) {
    if (!isFieldVisible(field, values, hiddenByAction)) continue;

    const raw = values[field.key];
    const v = field.validation;

    // ── Required ──────────────────────────────────────────────────────────
    const isEmpty =
      raw === null || raw === undefined || raw === "" ||
      (Array.isArray(raw) && raw.length === 0) ||
      (field.date_range && (!raw?.start || !raw?.end));

    if (field.required && isEmpty) {
      errs[field.key] = `${field.label} is required`;
      continue;
    }

    if (isEmpty || !v) continue; // nothing more to validate

    // ── Regex ─────────────────────────────────────────────────────────────
    if (v.regex && typeof raw === "string") {
      if (!new RegExp(v.regex).test(raw)) {
        errs[field.key] = `${field.label} format is invalid`;
        continue;
      }
    }

    // ── String length (text / textarea) ───────────────────────────────────
    if (typeof raw === "string") {
      if (v.min_length !== undefined && raw.length < v.min_length) {
        errs[field.key] = `${field.label} must be at least ${v.min_length} characters`;
        continue;
      }
      if (v.max_length !== undefined && raw.length > v.max_length) {
        errs[field.key] = `${field.label} must be at most ${v.max_length} characters`;
        continue;
      }
    }

    // ── Numeric range (number / decimal) ──────────────────────────────────
    if (field.type === "number" || field.type === "decimal") {
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        if (v.min_value !== undefined && num < v.min_value) {
          errs[field.key] = `${field.label} must be at least ${v.min_value}`;
          continue;
        }
        if (v.max_value !== undefined && num > v.max_value) {
          errs[field.key] = `${field.label} must be at most ${v.max_value}`;
          continue;
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

  const handleAutoFill = (section: string, _key: string, mapping: Record<string, string>) => {
    setSectionValues((p) => ({ ...p, [section]: { ...(p[section] ?? {}), ...mapping } }));
  };

  const handleRowsChange = (stepKey: string, rows: Record<string, any>[]) => {
    setRepeatableRows((p) => ({ ...p, [stepKey]: rows }));
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

  const parentFields  = stepData.parent_step.rendered_json?.fields ?? [];
  const subSteps      = stepData.sub_steps ?? [];
  const hasParent     = parentFields.length > 0;
  const hasSubSteps   = subSteps.length > 0;

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