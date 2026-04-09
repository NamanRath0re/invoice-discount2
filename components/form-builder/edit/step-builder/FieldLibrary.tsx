"use client";

import { useEffect } from "react";
import { Plus, ChevronRight, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { FieldKey } from "./types";

interface Props {
  dataTypes: string[];
  loadingTypes: boolean;
  selectedType: string;
  fieldKeys: FieldKey[];
  loadingKeys: boolean;
  existingKeys: string[];
  onLoadTypes: () => void;
  onSelectType: (type: string) => void;
  onAddField: (fk: FieldKey) => void;
}

const TYPE_ICONS: Record<string, string> = {
  text: "Aa",
  number: "12",
  decimal: "1.2",
  date: "📅",
  boolean: "◉",
  select: "▾",
  file: "📎",
};

export function FieldLibrary({
  dataTypes, loadingTypes, selectedType,
  fieldKeys, loadingKeys, existingKeys,
  onLoadTypes, onSelectType, onAddField,
}: Props) {
  useEffect(() => { onLoadTypes(); }, []);

  return (
    <div className="flex flex-col h-full border-r border-border bg-muted/20">
      <div className="p-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Field Library
        </p>
      </div>

      {/* Data types list */}
      <div className="flex flex-col overflow-y-auto">
        {loadingTypes ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          dataTypes.map(type => (
            <button
              key={type}
              onClick={() => onSelectType(type)}
              className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 ${
                selectedType === type
                  ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                  : "text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex size-6 items-center justify-center rounded bg-muted text-[10px] font-mono font-bold">
                  {TYPE_ICONS[type] ?? type.slice(0, 2).toUpperCase()}
                </span>
                <span className="capitalize">{type}</span>
              </div>
              <ChevronRight className="size-3 opacity-40" />
            </button>
          ))
        )}
      </div>

      {/* Field keys for selected type */}
      {selectedType && (
        <div className="border-t border-border flex flex-col flex-1 min-h-0">
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {selectedType} fields
            </p>
          </div>
          <div className="overflow-y-auto flex-1">
            {loadingKeys ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : fieldKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Package className="size-6 mb-1 opacity-30" />
                <p className="text-xs">No fields available</p>
              </div>
            ) : (
              fieldKeys.map(fk => {
                const already = existingKeys.includes(fk.field_key);
                return (
                  <div
                    key={fk.id}
                    className={`flex items-start justify-between gap-2 px-3 py-2.5 border-b border-border/50 hover:bg-muted/40 transition-colors ${already ? "opacity-40" : ""}`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {fk.field_label}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {fk.field_key}
                      </p>
                      {fk.is_derived === 1 && (
                        <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-1">
                          derived
                        </span>
                      )}
                    </div>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      disabled={already}
                      onClick={() => onAddField(fk)}
                      title={already ? "Already added" : "Add to canvas"}
                      className="shrink-0 mt-0.5"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}