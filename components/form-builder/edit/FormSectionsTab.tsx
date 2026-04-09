// "use client";

// import {
//   Plus,
//   Pencil,
//   Eye,
//   GripVertical,
//   CheckCircle2,
//   SkipForward,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import type { FormStep } from "./types";

// interface Props {
//   steps: FormStep[];
//   loading: boolean;
// }

// export function FormSectionsTab({ steps, loading }: Props) {
//   if (loading) return <FormSectionsSkeleton />;

//   const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);

//   return (
//     <div className="mt-6 mx-auto max-w-2xl space-y-4">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-foreground">
//             {steps.length} Section{steps.length !== 1 ? "s" : ""}
//           </p>
//           <p className="text-xs text-muted-foreground">
//             Manage the steps of this form
//           </p>
//         </div>
//         <Button size="sm" disabled title="Coming soon">
//           <Plus className="size-3" />
//           Add Section
//         </Button>
//       </div>

//       {/* Empty state */}
//       {sorted.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
//           <GripVertical className="size-8 mb-2 opacity-30" />
//           <p className="text-sm font-medium">No sections yet</p>
//           <p className="text-xs mt-1">
//             Click "Add Section" to create the first step
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {sorted.map((step) => (
//             <StepCard key={step.step_key} step={step} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function StepCard({ step }: { step: FormStep }) {
//   return (
//     <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:shadow-sm transition-shadow">
//       {/* Order badge */}
//       <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
//         {step.step_order}
//       </div>

//       {/* Info */}
//       <div className="flex-1 min-w-0">
//         <p className="text-sm font-medium text-foreground truncate">
//           {step.step_name}
//         </p>
//         <p className="text-xs text-muted-foreground font-mono">
//           {step.step_key}
//         </p>
//       </div>

//       {/* Badges */}
//       <div className="hidden sm:flex items-center gap-1.5">
//         {step.is_mandatory === 1 && (
//           <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
//             <CheckCircle2 className="size-3" />
//             Mandatory
//           </span>
//         )}
//         {step.is_skippable === 1 && (
//           <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
//             <SkipForward className="size-3" />
//             Skippable
//           </span>
//         )}
//       </div>

//       {/* Actions */}
//       <div className="flex items-center gap-1 shrink-0">
//         <Button variant="ghost" size="icon-xs" title="Preview step" disabled>
//           <Eye className="size-3" />
//         </Button>
//         <Button variant="outline" size="xs" title="Edit step" disabled>
//           <Pencil className="size-3" />
//           Edit
//         </Button>
//       </div>
//     </div>
//   );
// }

// function FormSectionsSkeleton() {
//   return (
//     <div className="mt-4 space-y-4">
//       <div className="flex items-center justify-between">
//         <div className="space-y-1">
//           <Skeleton className="h-4 w-20" />
//           <Skeleton className="h-3 w-40" />
//         </div>
//         <Skeleton className="h-8 w-28" />
//       </div>
//       <div className="space-y-2">
//         {Array.from({ length: 3 }).map((_, i) => (
//           <Skeleton key={i} className="h-16 w-full rounded-xl" />
//         ))}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import {
  Plus, Pencil, Eye, GripVertical,
  CheckCircle2, SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddStepModal } from "./step-builder/AddStepModal";
import { StepBuilderModal } from "./step-builder/StepBuilderModal";
import type { FormStep } from "./types";

interface Props {
  formId: string;
  steps: FormStep[];
  loading: boolean;
  onStepsUpdated: () => void;
}

export function FormSectionsTab({ formId, steps, loading, onStepsUpdated }: Props) {
  const [addOpen, setAddOpen]       = useState(false);
  const [editStep, setEditStep]     = useState<FormStep | null>(null);

  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);

  if (loading) return <FormSectionsSkeleton />;

  return (
    <div className="mt-4 space-y-4">
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

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
          <GripVertical className="size-8 mb-2 opacity-30" />
          <p className="text-sm font-medium">No sections yet</p>
          <p className="text-xs mt-1">Click "Add Section" to create the first step</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(step => (
            <StepCard
              key={step.step_key}
              step={step}
              onEdit={() => setEditStep(step)}
            />
          ))}
        </div>
      )}

      {/* Add step modal */}
      <AddStepModal
        open={addOpen}
        formId={Number(formId)}
        existingSteps={steps}
        onClose={() => setAddOpen(false)}
        onSuccess={onStepsUpdated}
      />

      {/* Step builder full-screen modal */}
      {editStep && (
        <StepBuilderModal
          open={!!editStep}
          formId={formId}
          stepKey={editStep.step_key}
          stepName={editStep.step_name}
          onClose={() => setEditStep(null)}
        />
      )}
    </div>
  );
}

function StepCard({ step, onEdit }: { step: FormStep; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:shadow-sm transition-shadow">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
        {step.step_order}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{step.step_name}</p>
        <p className="text-xs text-muted-foreground font-mono">{step.step_key}</p>
      </div>
      <div className="hidden sm:flex items-center gap-1.5">
        {step.is_mandatory === 1 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle2 className="size-3" />Mandatory
          </span>
        )}
        {step.is_skippable === 1 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
            <SkipForward className="size-3" />Skippable
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon-xs" title="Preview step" disabled>
          <Eye className="size-3" />
        </Button>
        <Button variant="outline" size="xs" onClick={onEdit}>
          <Pencil className="size-3" />Edit
        </Button>
      </div>
    </div>
  );
}

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