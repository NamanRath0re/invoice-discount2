"use client";

import { useEffect } from "react";
import { X, Save, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldLibrary } from "./FieldLibrary";
import { FieldCanvas } from "./FieldCanvas";
import { FieldProperties } from "./FieldProperties";
import { useStepBuilder } from "./useStepBuilder";

interface Props {
  open: boolean;
  formId: string;
  stepKey: string;
  stepName: string;
  onClose: () => void;
}

export function StepBuilderModal({ open, formId, stepKey, stepName, onClose }: Props) {
  const sb = useStepBuilder(formId, stepKey);

  useEffect(() => {
    if (open) sb.loadStep();
  }, [open, stepKey]);

  const handleSave = async () => {
    // TODO: wire up save/update step fields API when available
    toast.success("Step saved", { description: `${sb.fields.length} field(s) saved.` });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{stepName}</h2>
            <p className="text-xs text-muted-foreground font-mono">{stepKey}</p>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={sb.loading}>
          {sb.loading
            ? <><RefreshCw className="size-3 animate-spin" />Loading…</>
            : <><Save className="size-3" />Save Step</>
          }
        </Button>
      </div>

      {/* Error */}
      {sb.error && (
        <div className="flex items-center gap-2 mx-4 mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive shrink-0">
          <AlertCircle className="size-4 shrink-0" />
          {sb.error}
          <Button variant="link" size="sm" className="ml-auto text-destructive p-0 h-auto" onClick={sb.loadStep}>
            Retry
          </Button>
        </div>
      )}

      {/* Three-column layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Field library */}
        <div className="w-56 shrink-0 overflow-hidden flex flex-col">
          <FieldLibrary
            dataTypes={sb.dataTypes}
            loadingTypes={sb.loadingTypes}
            selectedType={sb.selectedType}
            fieldKeys={sb.fieldKeys}
            loadingKeys={sb.loadingKeys}
            existingKeys={sb.fields.map(f => f.key)}
            onLoadTypes={sb.loadDataTypes}
            onSelectType={sb.selectDataType}
            onAddField={sb.addField}
          />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 border-l border-r border-border overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-border bg-muted/20 shrink-0">
            <span className="text-xs text-muted-foreground">
              {sb.fields.length} field{sb.fields.length !== 1 ? "s" : ""} · drag to reorder · click to select
            </span>
          </div>
          <FieldCanvas
            fields={sb.fields}
            selectedKey={sb.selectedFieldKey}
            onSelect={sb.setSelectedFieldKey}
            onUpdate={sb.updateField}
            onRemove={sb.removeField}
            onReorder={sb.reorderFields}
          />
        </div>

        {/* Right: Properties */}
        <div className="w-60 shrink-0 overflow-hidden flex flex-col">
          <FieldProperties
            field={sb.selectedField}
            onUpdate={sb.updateField}
          />
        </div>
      </div>
    </div>
  );
}