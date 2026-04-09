"use client";

import { Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RenderedField } from "./types";

interface Props {
  field: RenderedField | null;
  onUpdate: (key: string, updates: Partial<RenderedField>) => void;
}

export function FieldProperties({ field, onUpdate }: Props) {
  if (!field) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <Settings className="size-8 mb-2 opacity-20" />
        <p className="text-sm font-medium">No field selected</p>
        <p className="text-xs mt-1 text-center">Click a field on the canvas to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-3 border-b border-border bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Properties</p>
        <p className="text-xs font-mono text-foreground mt-0.5 truncate">{field.key}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Label — editable */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Label</Label>
          <Input
            value={field.label}
            onChange={e => onUpdate(field.key, { label: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        {/* Key — read only */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Field Key (read-only)</Label>
          <Input
            value={field.key}
            disabled
            className="h-8 text-sm font-mono bg-muted/50"
          />
          <p className="text-[10px] text-muted-foreground">Keys are system-defined and cannot be changed</p>
        </div>

        {/* Type — read only */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Type (read-only)</Label>
          <Input value={field.type} disabled className="h-8 text-sm font-mono bg-muted/50" />
        </div>

        {/* Placeholder */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Placeholder</Label>
          <Input
            value={field.placeholder ?? ""}
            onChange={e => onUpdate(field.key, { placeholder: e.target.value })}
            className="h-8 text-sm"
            placeholder="Enter placeholder…"
          />
        </div>

        {/* Help text */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Help Text</Label>
          <Input
            value={field.help_text ?? ""}
            onChange={e => onUpdate(field.key, { help_text: e.target.value })}
            className="h-8 text-sm"
            placeholder="Guidance for the user…"
          />
        </div>

        {/* Grid width */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Grid Width</Label>
          <Select
            value={String(field.grid_column ?? 12)}
            onValueChange={v => onUpdate(field.key, { grid_column: parseInt(v) })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2/12 — Tiny</SelectItem>
              <SelectItem value="3">3/12 — Small</SelectItem>
              <SelectItem value="4">4/12 — Third</SelectItem>
              <SelectItem value="6">6/12 — Half</SelectItem>
              <SelectItem value="8">8/12 — Large</SelectItem>
              <SelectItem value="12">12/12 — Full</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Required toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div>
            <p className="text-xs font-medium text-foreground">Required</p>
            <p className="text-[10px] text-muted-foreground">User must fill this field</p>
          </div>
          <Switch
            checked={field.required}
            onCheckedChange={v => onUpdate(field.key, { required: v })}
          />
        </div>
      </div>
    </div>
  );
}