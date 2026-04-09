"use client";

import { useState, useRef, DragEvent } from "react";
import {
  GripVertical, Trash2, Maximize2, Minimize2,
  LayoutGrid, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RenderedField } from "./types";

interface Props {
  fields: RenderedField[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  onUpdate: (key: string, updates: Partial<RenderedField>) => void;
  onRemove: (key: string) => void;
  onReorder: (fields: RenderedField[]) => void;
}

const TYPE_ICON: Record<string, string> = {
  text: "Aa", number: "12", decimal: "1.2",
  date: "📅", boolean: "◉", select: "▾", file: "📎",
};

export function FieldCanvas({ fields, selectedKey, onSelect, onUpdate, onRemove, onReorder }: Props) {
  const [draggedKey, setDraggedKey]   = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent, key: string) => {
    setDraggedKey(key);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) return;
    const from = fields.findIndex(f => f.key === draggedKey);
    const to   = fields.findIndex(f => f.key === targetKey);
    const next = [...fields];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
    setDraggedKey(null);
    setDragOverKey(null);
  };

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-64 text-muted-foreground border-2 border-dashed border-border rounded-xl m-4">
        <LayoutGrid className="size-10 mb-3 opacity-20" />
        <p className="text-sm font-medium">No fields yet</p>
        <p className="text-xs mt-1">Select a field type from the library and click + to add</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 overflow-y-auto h-full">
      <div className="grid grid-cols-12 gap-2">
        {fields.map(field => {
          const isSelected = selectedKey === field.key;
          const isDragging = draggedKey === field.key;
          const isDragOver = dragOverKey === field.key;

          return (
            <div
              key={field.key}
              style={{ gridColumn: `span ${field.grid_column ?? 12}` }}
              draggable
              onDragStart={e => handleDragStart(e, field.key)}
              onDragOver={e => { e.preventDefault(); setDragOverKey(field.key); }}
              onDragLeave={() => setDragOverKey(null)}
              onDrop={e => handleDrop(e, field.key)}
              className={cn(
                "transition-all duration-150",
                isDragging && "opacity-40",
                isDragOver && "ring-2 ring-primary rounded-xl"
              )}
            >
              <div
                onClick={() => onSelect(isSelected ? null : field.key)}
                className={cn(
                  "relative rounded-xl border bg-card p-3 cursor-pointer hover:shadow-sm transition-all",
                  isSelected ? "ring-2 ring-primary border-primary" : "border-border"
                )}
              >
                {/* Drag handle */}
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 cursor-grab">
                  <GripVertical className="size-4" />
                </div>

                <div className="pl-5">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="inline-flex size-5 items-center justify-center rounded bg-muted text-[9px] font-mono font-bold shrink-0">
                        {TYPE_ICON[field.type] ?? field.type.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="text-xs font-medium text-foreground truncate">
                        {field.label}
                        {field.required && <span className="text-destructive ml-0.5">*</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost" size="icon-xs"
                        title="Shrink"
                        onClick={e => { e.stopPropagation(); onUpdate(field.key, { grid_column: Math.max(2, (field.grid_column ?? 12) - 2) }); }}
                        disabled={(field.grid_column ?? 12) <= 2}
                      >
                        <Minimize2 className="size-2.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon-xs"
                        title="Expand"
                        onClick={e => { e.stopPropagation(); onUpdate(field.key, { grid_column: Math.min(12, (field.grid_column ?? 12) + 2) }); }}
                        disabled={(field.grid_column ?? 12) >= 12}
                      >
                        <Maximize2 className="size-2.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon-xs"
                        title="Remove"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={e => { e.stopPropagation(); onRemove(field.key); }}
                      >
                        <Trash2 className="size-2.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Field preview */}
                  <div className="h-7 rounded-md border border-border bg-muted/30 flex items-center px-2">
                    <span className="text-[11px] text-muted-foreground truncate">
                      {field.placeholder || field.key}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] text-muted-foreground font-mono">{field.key}</span>
                    <span className="text-[9px] text-muted-foreground">{field.grid_column ?? 12}/12</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}