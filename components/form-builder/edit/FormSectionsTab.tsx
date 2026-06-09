"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus,
  Pencil,
  GripVertical,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddStepModal } from "./step-builder/AddStepModal";
import { AddSubSectionModal } from "./step-builder/AddSubSectionModal";
import type { FormStep, SubStep } from "./types";

interface Props {
  formId: string;
  steps: FormStep[];
  loading: boolean;
  onStepsUpdated: () => void;
}

export function FormSectionsTab({ formId, steps, loading, onStepsUpdated }: Props) {
  const [addOpen, setAddOpen] = useState(false);

  // Tracks which section's "Add Sub-section" modal is open
  const [subModalState, setSubModalState] = useState<{
    open: boolean;
    parentStep: FormStep | null;
  }>({ open: false, parentStep: null });

  const router   = useRouter();
  const pathname = usePathname();

  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);

  const handleEditSection = (step: FormStep) => {
    const params = new URLSearchParams({
      step_key:  step.step_key,
      step_name: step.step_name,
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleEditSubSection = (sub: SubStep) => {
    const params = new URLSearchParams({
      step_key:  sub.step_key,
      step_name: sub.step_name,
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const openSubModal  = (step: FormStep) => setSubModalState({ open: true,  parentStep: step });
  const closeSubModal = ()               => setSubModalState({ open: false, parentStep: null });

  if (loading) return <FormSectionsSkeleton />;

  return (
    <div className="mt-4 space-y-4">
      {/* Header */}   
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            {steps.length} Section{steps.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted-foreground">Manage the steps of this form</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-3" />
          Add Section
        </Button>
      </div>

      {/* Empty state */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
          <GripVertical className="size-8 mb-2 opacity-30" />
          <p className="text-sm font-medium">No sections yet</p>
          <p className="text-xs mt-1">Click &quot;Add Section&quot; to create the first step</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              onEdit={() => handleEditSection(step)}
              onAddSubSection={() => openSubModal(step)}
              onEditSubSection={handleEditSubSection}
            />
          ))}
        </div>
      )}

      {/* Add Section Modal */}
      <AddStepModal
        open={addOpen}
        formId={Number(formId)}
        existingSteps={steps}
        onClose={() => setAddOpen(false)}
        onSuccess={onStepsUpdated}
      />

      {/* Add Sub-Section Modal */}
      {subModalState.parentStep && (
        <AddSubSectionModal
          open={subModalState.open}
          formId={Number(formId)}
          parentStepId={subModalState.parentStep.id}
          parentStepName={subModalState.parentStep.step_name}
          existingSubSteps={subModalState.parentStep.sub_steps ?? []}
          onClose={closeSubModal}
          onSuccess={() => {
            closeSubModal();
            onStepsUpdated(); // re-fetch getFormById → sub_steps come back from API
          }}
        />
      )}
    </div>
  );
}

// ─── StepCard ─────────────────────────────────────────────────────────────────

interface StepCardProps {
  step: FormStep;
  onEdit: () => void;
  onAddSubSection: () => void;
  onEditSubSection: (sub: SubStep) => void;
}

function StepCard({ step, onEdit, onAddSubSection, onEditSubSection }: StepCardProps) {
  const [expanded, setExpanded] = useState(true);

  const subSteps       = step.sub_steps ?? [];
  const hasSubSteps    = subSteps.length > 0;
  const sortedSubSteps = [...subSteps].sort((a, b) => a.step_order - b.step_order);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm">
      {/* Section row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Expand/collapse chevron */}
        <button
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => hasSubSteps && setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse sub-sections" : "Expand sub-sections"}
        >
          {hasSubSteps ? (
            expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )
          ) : (
            <ChevronRight className="size-4 opacity-0 pointer-events-none" />
          )}
        </button>

        {/* Order badge */}
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
          {step.step_order}
        </div>

        {/* Names */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{step.step_name}</p>
          <p className="text-xs text-muted-foreground font-mono">{step.step_key}</p>
        </div>

        {/* Sub-step count badge */}
        {hasSubSteps && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Layers className="size-2.5" />
            {subSteps.length} sub
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="outline" size="xs" onClick={onAddSubSection}>
            <Plus className="size-3" />
            <span className="hidden sm:inline">Add Sub-section</span>
          </Button>
          <Button variant="outline" size="xs" onClick={onEdit}>
            <Pencil className="size-3" />
            Edit
          </Button>
        </div>
      </div>

      {/* Sub-steps list — populated from API response */}
      {hasSubSteps && expanded && (
        <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Sub-sections ({subSteps.length})
          </p>
          {sortedSubSteps.map((sub) => (
            <SubStepRow
              key={sub.id}
              sub={sub}
              onEdit={() => onEditSubSection(sub)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SubStepRow ───────────────────────────────────────────────────────────────

function SubStepRow({ sub, onEdit }: { sub: SubStep; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
      {/* Visual indent */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1">
        <div className="w-px h-4 bg-border rounded-full" />
        <Layers className="size-3 text-muted-foreground" />
      </div>

      {/* Order badge */}
      <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
        {sub.step_order}
      </div>

      {/* Names */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{sub.step_name}</p>
        <p className="text-[10px] text-muted-foreground font-mono">{sub.step_key}</p>
      </div>

      {/* Edit → opens ComponentBuilder */}
      <Button variant="outline" size="xs" onClick={onEdit}>
        <Pencil className="size-3" />
        Edit
      </Button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FormSectionsSkeleton() {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}