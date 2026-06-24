"use client";

import { useState } from "react";
import { Layers, Plus, RefreshCw, X, Repeat2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSubStep } from "./api";
import type { SubStep } from "../types";

interface Props {
  open: boolean;
  formId: number;
  parentStepId: number;       // step's `id` field (e.g. 10) — sent as parent_step_id to API
  parentStepName: string;
  existingSubSteps: SubStep[];
  onClose: () => void;
  onSuccess: () => void;      // triggers getFormById re-fetch in parent
}

export function AddSubSectionModal({
  open,
  formId,
  parentStepId,
  parentStepName,
  existingSubSteps,
  onClose,
  onSuccess,
}: Props) {
  const [subName,    setSubName]    = useState("");
  const [subKey,     setSubKey]     = useState("");
  const [repeatable, setRepeatable] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState<{ name?: string; key?: string }>({});

  const nextOrder =
    existingSubSteps.length > 0
      ? Math.max(...existingSubSteps.map((s) => s.step_order)) + 1
      : 1;

  const handleNameChange = (v: string) => {
    setSubName(v);
    setSubKey(
      v.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
    );
    setErrors({});
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!subName.trim()) e.name = "Sub-section name is required.";
    if (!subKey.trim())  e.key  = "Sub-section key is required.";
    if (existingSubSteps.some((s) => s.step_key === subKey.trim()))
      e.key = "This key already exists in this section.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addSubStep({
        form_id:        formId,
        step_key:       subKey.trim(),
        step_name:      subName.trim(),
        step_order:     nextOrder,
        repeatable,                  // boolean — API accepts true/false
        parent_step_id: parentStepId, // step's id field
      });

      toast.success("Sub-section added", {
        description: `"${subName.trim()}" added under "${parentStepName}".`,
      });

      onSuccess(); // parent re-fetches getFormById — sub_steps come from API
    } catch (e: any) {
      toast.error("Failed to add sub-section", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubName("");
    setSubKey("");
    setRepeatable(false);
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-card ring-1 ring-foreground/10 shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Layers className="size-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Add Sub-Section</h2>
            <p className="text-xs text-muted-foreground truncate">
              Under: <span className="font-medium text-foreground">{parentStepName}</span>
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Sub-Section Name <span className="text-destructive">*</span>
            </Label>
            <Input
              autoFocus
              placeholder="e.g. Business Details"
              value={subName}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`h-8 text-sm ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Key */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Sub-Section Key <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. business_details"
              value={subKey}
              onChange={(e) => { setSubKey(e.target.value); setErrors({}); }}
              className={`h-8 text-sm font-mono ${errors.key ? "border-destructive" : ""}`}
            />
            {errors.key ? (
              <p className="text-xs text-destructive">{errors.key}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Auto-generated from name · must be unique within this section
              </p>
            )}
          </div>

          {/* Repeatable toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <Repeat2 className="size-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Repeatable</p>
                <p className="text-[10px] text-muted-foreground">Allow this sub-section to be repeated</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={repeatable}
              onClick={() => setRepeatable((v) => !v)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                repeatable ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                  repeatable ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Info row */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border px-3 py-2">
            <span className="text-xs text-muted-foreground">Order:</span>
            <span className="text-xs font-semibold text-foreground">{nextOrder}</span>
            <span className="text-xs text-muted-foreground mx-2">·</span>
            <span className="text-xs text-muted-foreground">Parent step ID:</span>
            <span className="text-xs font-semibold text-foreground">{parentStepId}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              ({existingSubSteps.length} existing)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 pb-5">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <><RefreshCw className="size-3 animate-spin" />Adding…</>
            ) : (
              <><Plus className="size-3" />Add Sub-Section</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}