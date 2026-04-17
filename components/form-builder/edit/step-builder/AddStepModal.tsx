"use client";

import { useState } from "react";
import { Layers, Plus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addFormStep } from "./api";
import type { FormStep } from "../types";

interface Props {
  open: boolean;
  formId: number;
  existingSteps: FormStep[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AddStepModal({ open, formId, existingSteps, onClose, onSuccess }: Props) {
  const [stepName, setStepName] = useState("");
  const [stepKey,  setStepKey]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ name?: string; key?: string }>({});

  const nextOrder = existingSteps.length > 0
    ? Math.max(...existingSteps.map(s => s.step_order)) + 1
    : 1;

  // Auto-generate key from name
  const handleNameChange = (v: string) => {
    setStepName(v);
    setStepKey(v.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
    setErrors({});
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!stepName.trim()) e.name = "Step name is required.";
    if (!stepKey.trim())  e.key  = "Step key is required.";
    if (existingSteps.some(s => s.step_key === stepKey.trim()))
      e.key = "This key already exists.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addFormStep({
        form_id:    formId,
        step_key:   stepKey.trim(),
        step_name:  stepName.trim(),
        step_order: nextOrder,
      });
      toast.success("Section added", { description: `"${stepName}" added as step ${nextOrder}.` });
      setStepName("");
      setStepKey("");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error("Failed to add section", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStepName(""); setStepKey(""); setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-card ring-1 ring-foreground/10 shadow-xl">
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Layers className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">Add Section</h2>
            <p className="text-xs text-muted-foreground">Will be added as step {nextOrder}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Section Name <span className="text-destructive">*</span>
            </Label>
            <Input
              autoFocus
              placeholder="e.g. Business Details"
              value={stepName}
              onChange={e => handleNameChange(e.target.value)}
              className={`h-8 text-sm ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Step Key <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. business_details"
              value={stepKey}
              onChange={e => { setStepKey(e.target.value); setErrors({}); }}
              className={`h-8 text-sm font-mono ${errors.key ? "border-destructive" : ""}`}
            />
            {errors.key
              ? <p className="text-xs text-destructive">{errors.key}</p>
              : <p className="text-[10px] text-muted-foreground">Auto-generated from name, must be unique</p>
            }
          </div>

          {/* Step order preview */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border px-3 py-2">
            <span className="text-xs text-muted-foreground">Step order:</span>
            <span className="text-xs font-semibold text-foreground">{nextOrder}</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              ({existingSteps.length} existing step{existingSteps.length !== 1 ? "s" : ""})
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <><RefreshCw className="size-3 animate-spin" />Adding…</>
            ) : (
              <><Plus className="size-3" />Add Section</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}