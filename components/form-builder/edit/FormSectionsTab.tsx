// "use client";

// import { useState } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import {
//   Plus, Pencil, Eye, GripVertical,
//   CheckCircle2, SkipForward,
//   Layers,
//   X,
//   RefreshCw,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { AddStepModal } from "./step-builder/AddStepModal";
// import type { FormStep } from "./types";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";

// interface Props {
//   formId: string;
//   steps: FormStep[];
//   loading: boolean;
//   onStepsUpdated: () => void;
// }

// export function FormSectionsTab({ formId, steps, loading, onStepsUpdated }: Props) {
//   const [addOpen, setAddOpen] = useState(false);
//   const router   = useRouter();
//   const pathname = usePathname();
//   const [subOpen, setSubOpen] = useState(false);

//   const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);

//   // Open ComponentBuilder by pushing step_key into the URL.
//   // The [form_id]/page.tsx reads this param and renders ComponentBuilder
//   // inside the main layout — no overlay, survives refresh.
//   const handleEdit = (step: FormStep) => {
//     const params = new URLSearchParams({
//       step_key:  step.step_key,
//       step_name: step.step_name,
//     });
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   if (loading) return <FormSectionsSkeleton />;

//   return (
//     <div className="mt-4 space-y-4">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-foreground">
//             {steps.length} Section{steps.length !== 1 ? "s" : ""}
//           </p>
//           <p className="text-xs text-muted-foreground">Manage the steps of this form</p>
//         </div>
//         <Button size="sm" onClick={() => setAddOpen(true)}>
//           <Plus className="size-3" />
//           Add Section
//         </Button>
//       </div>

//       {sorted.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
//           <GripVertical className="size-8 mb-2 opacity-30" />
//           <p className="text-sm font-medium">No sections yet</p>
//           <p className="text-xs mt-1">Click &quot;Add Section&quot; to create the first step</p>
//         </div>
//       ) : (
//         <div className="space-y-2">
//           {sorted.map(step => (
//             <StepCard
//               key={step.step_key}
//               step={step}
//               onEdit={() => handleEdit(step)}
//               onAddSubSection={() => setSubOpen(true)}
//             />
//           ))}
//         </div>
//       )}

//       {/* Add step modal */}
//       <AddStepModal
//         open={addOpen}
//         formId={Number(formId)}
//         existingSteps={steps}
//         onClose={() => setAddOpen(false)}
//         onSuccess={onStepsUpdated}
//       />

//       {subOpen && (
//         <SubsectionModal onClose={() => setSubOpen(false)} />
//       )}
//     </div>
//   );
// }

// function StepCard({ step, onEdit, onAddSubSection }: { step: FormStep; onEdit: () => void; onAddSubSection: () => void }) {
//   return (
//     <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:shadow-sm transition-shadow">
//       <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
//         {step.step_order}
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-sm font-medium text-foreground truncate">{step.step_name}</p>
//         <p className="text-xs text-muted-foreground font-mono">{step.step_key}</p>
//       </div>
//       <div className="hidden sm:flex items-center gap-1.5">
//         {/* {step.is_mandatory === 1 && (
//           <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
//             <CheckCircle2 className="size-3" />Mandatory
//           </span>
//         )}
//         {step.is_skippable === 1 && (
//           <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
//             <SkipForward className="size-3" />Skippable
//           </span>
//         )} */}
//         <Button variant="outline" onClick={onAddSubSection} size="xs">
//           <Plus className="size-3" />
//           Add Sub-section
//         </Button>
//       </div>
//       <div className="flex items-center gap-1 shrink-0">
//         {/* <Button variant="ghost" size="icon-xs" title="Preview step" disabled>
//           <Eye className="size-3" />
//         </Button> */}
//         <Button variant="outline" size="xs" onClick={onEdit}>
//           <Pencil className="size-3" />Edit
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


// function SubsectionModal({
//   onClose,
// }: {
//   onClose: () => void;
// }) {
//   return (
//      <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm p-4"
//       onClick={e => e.target === e.currentTarget && onClose()}
//     >
//       <div className="w-full max-w-md rounded-xl bg-card ring-1 ring-foreground/10 shadow-xl">
//         <div className="flex items-center gap-3 p-5 border-b border-border">
//           <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
//             <Layers className="size-4 text-primary" />
//           </div>
//           <div className="flex-1">
//             <h2 className="text-sm font-semibold text-foreground">Add Sub-Section</h2>
//             {/* <p className="text-xs text-muted-foreground">Will be added as step {nextOrder}</p> */}
//           </div>
//           <Button variant="ghost" size="icon-sm" onClick={onClose}>
//             <X className="size-4" />
//           </Button>
//         </div>

//         <div className="p-5 space-y-4">
//           <div className="space-y-1.5">
//             <Label className="text-xs font-medium">
//               Sub-Section Name <span className="text-destructive">*</span>
//             </Label>
//             <Input
//               autoFocus
//               placeholder="e.g. Business Details"
//               // value={stepName}
//               // onChange={e => handleNameChange(e.target.value)}
//               // className={`h-8 text-sm ${errors.name ? "border-destructive" : ""}`}
//             />
//             {/* {errors.name && <p className="text-xs text-destructive">{errors.name}</p>} */}
//           </div>

//           <div className="space-y-1.5">
//             <Label className="text-xs font-medium">
//               Sub-Section Key <span className="text-destructive">*</span>
//             </Label>
//             <Input
//               placeholder="e.g. business_details"
//               // value={stepKey}
//               // onChange={e => { setStepKey(e.target.value); setErrors({}); }}
//               // className={`h-8 text-sm font-mono ${errors.key ? "border-destructive" : ""}`}
//             />
//             {/* {errors.key
//               ? <p className="text-xs text-destructive">{errors.key}</p>
//               : <p className="text-[10px] text-muted-foreground">Auto-generated from name, must be unique</p>
//             } */}
//           </div>
//         </div>

//         <div className="flex justify-end gap-2 px-5 pb-5">
//           <Button variant="outline" size="sm" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button size="sm">
//               <><Plus className="size-3" />Add Sub-Section</>
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

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
import type { FormStep, SubSection } from "./types";

interface Props {
  formId: string;
  steps: FormStep[];
  loading: boolean;
  onStepsUpdated: () => void;
}

export function FormSectionsTab({ formId, steps, loading, onStepsUpdated }: Props) {
  const [addOpen, setAddOpen] = useState(false);

  // Sub-section modal state — tracks which section we're adding to
  const [subModalState, setSubModalState] = useState<{
    open: boolean;
    parentStep: FormStep | null;
  }>({ open: false, parentStep: null });

  // Local sub-sections map: parentStepKey -> SubSection[]
  // Since there's no API yet, we manage added sub-sections in local state
  const [subSectionsMap, setSubSectionsMap] = useState<Record<string, SubSection[]>>({});

  const router   = useRouter();
  const pathname = usePathname();

  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);

  // Navigate to ComponentBuilder for a section
  const handleEditSection = (step: FormStep) => {
    const params = new URLSearchParams({
      step_key:  step.step_key,
      step_name: step.step_name,
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Navigate to ComponentBuilder for a sub-section
  const handleEditSubSection = (sub: SubSection) => {
    const params = new URLSearchParams({
      step_key:        sub.sub_section_key,
      step_name:       sub.sub_section_name,
      parent_step_key: sub.parent_step_key,
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const openSubModal = (step: FormStep) => {
    setSubModalState({ open: true, parentStep: step });
  };

  const closeSubModal = () => {
    setSubModalState({ open: false, parentStep: null });
  };

  const handleSubSectionAdded = (newSub: SubSection) => {
    setSubSectionsMap((prev) => ({
      ...prev,
      [newSub.parent_step_key]: [
        ...(prev[newSub.parent_step_key] ?? []),
        newSub,
      ],
    }));
  };

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
              key={step.step_key}
              step={step}
              subSections={subSectionsMap[step.step_key] ?? []}
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

      {/* Add Sub-Section Modal — rendered per active parent */}
      {subModalState.parentStep && (
        <AddSubSectionModal
          open={subModalState.open}
          formId={Number(formId)}
          parentStepKey={subModalState.parentStep.step_key}
          parentStepName={subModalState.parentStep.step_name}
          existingSubSections={subSectionsMap[subModalState.parentStep.step_key] ?? []}
          onClose={closeSubModal}
          onSuccess={handleSubSectionAdded}
        />
      )}
    </div>
  );
}

// ─── StepCard ─────────────────────────────────────────────────────────────────

interface StepCardProps {
  step: FormStep;
  subSections: SubSection[];
  onEdit: () => void;
  onAddSubSection: () => void;
  onEditSubSection: (sub: SubSection) => void;
}

function StepCard({
  step,
  subSections,
  onEdit,
  onAddSubSection,
  onEditSubSection,
}: StepCardProps) {
  const [expanded, setExpanded] = useState(true);
  const hasSubSections = subSections.length > 0;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-sm">
      {/* Section row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Expand/collapse chevron */}
        <button
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => hasSubSections && setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse sub-sections" : "Expand sub-sections"}
        >
          {hasSubSections ? (
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

        {/* Sub-section count badge */}
        {hasSubSections && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Layers className="size-2.5" />
            {subSections.length} sub
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

      {/* Sub-sections list */}
      {hasSubSections && expanded && (
        <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Sub-sections ({subSections.length})
          </p>
          {[...subSections]
            .sort((a, b) => a.sub_section_order - b.sub_section_order)
            .map((sub) => (
              <SubSectionRow
                key={sub.sub_section_key}
                sub={sub}
                onEdit={() => onEditSubSection(sub)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// ─── SubSectionRow ────────────────────────────────────────────────────────────

function SubSectionRow({
  sub,
  onEdit,
}: {
  sub: SubSection;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
      {/* Visual indent */}
      <div className="flex items-center gap-1.5 shrink-0 pl-1">
        <div className="w-px h-4 bg-border rounded-full" />
        <Layers className="size-3 text-muted-foreground" />
      </div>

      {/* Order badge */}
      <div className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
        {sub.sub_section_order}
      </div>

      {/* Names */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{sub.sub_section_name}</p>
        <p className="text-[10px] text-muted-foreground font-mono">{sub.sub_section_key}</p>
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