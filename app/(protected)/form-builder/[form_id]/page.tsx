// "use client";

// import { use } from "react";
// import { useRouter } from "next/navigation";
// import { ArrowLeft, AlertCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Skeleton } from "@/components/ui/skeleton";
// import { FormDetailsTab } from "@/components/form-builder/edit/FormDetailsTab";
// import { FormSectionsTab } from "@/components/form-builder/edit/FormSectionsTab";
// import { useFormDetail } from "@/components/form-builder/edit/useFormDetail";
// import { FormPreviewTab } from "@/components/form-builder/edit/FormPreviewTab";

// interface Props {
//   params: Promise<{ form_id: string }>;
// }

// export default function FormEditPage({ params }: Props) {
//   const { form_id } = use(params);
//   const router = useRouter();
//   const { data, loading, error, reload } = useFormDetail(form_id);

//   return (
//     <div className="flex flex-col gap-5">
//       {/* Header */}
//       <div className="flex items-center gap-3">
//         <Button variant="outline" size="icon-sm" onClick={() => router.back()}>
//           <ArrowLeft className="size-4" />
//         </Button>
//         <div className="flex-1 min-w-0">
//           {loading ? (
//             <>
//               <Skeleton className="h-5 w-48 mb-1" />
//               <Skeleton className="h-3 w-32" />
//             </>
//           ) : (
//             <>
//               <h1 className="text-xl font-semibold text-foreground truncate">
//                 {data?.form_name ?? "Edit Form"}
//               </h1>
//               <p className="text-sm text-muted-foreground font-mono">
//                 {data?.form_code ?? `ID: ${form_id}`}
//               </p>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
//           <AlertCircle className="size-4 shrink-0" />
//           {error}
//           <Button
//             variant="link"
//             size="sm"
//             className="ml-auto text-destructive p-0 h-auto"
//             onClick={reload}
//           >
//             Retry
//           </Button>
//         </div>
//       )}

//        {/* Tabs */}
//     <Tabs defaultValue="details">
//     <TabsList className="w-full">
//   <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
//   <TabsTrigger value="sections" className="flex-1">
//     Sections
//     {!loading && data && data.steps.length > 0 && (
//       <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
//         {data.steps.length}
//       </span>
//     )}
//   </TabsTrigger>
//   <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
// </TabsList>
//     <div className="px-4">
//         <TabsContent value="details">
//         <FormDetailsTab formId={form_id} data={data} loading={loading} reload={reload} />
//         </TabsContent>

//         <TabsContent value="sections">
//             <FormSectionsTab
//                 formId={form_id}
//                 steps={data?.steps ?? []}
//                 loading={loading}
//                 onStepsUpdated={reload}
//             />
//         </TabsContent>

//         <TabsContent value="preview">
//         <FormPreviewTab />
//         </TabsContent>
//     </div>
//     </Tabs>
//     </div>
//   );
// }

"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FormDetailsTab } from "@/components/form-builder/edit/FormDetailsTab";
import { FormSectionsTab } from "@/components/form-builder/edit/FormSectionsTab";
import { useFormDetail } from "@/components/form-builder/edit/useFormDetail";
import { FormPreviewTab } from "@/components/form-builder/edit/FormPreviewTab";
import ComponentBuilder from "@/components/ComponentBuilder";

interface Props {
  params: Promise<{ form_id: string }>;
}

export default function FormEditPage({ params }: Props) {
  const { form_id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Component Builder view (driven by URL so refresh keeps state) ────────
  const stepKey  = searchParams.get("step_key")  ?? undefined;
  const stepName = searchParams.get("step_name") ?? undefined;

  if (stepKey) {
    return (
      <ComponentBuilder
        formId={Number(form_id)}
        stepKey={stepKey}
        stepName={stepName}
        onBack={() => {
          // Navigate back to the sections tab, clearing step params
          router.push(
            `/form-builder/${form_id}?tab=sections`
          );
        }}
      />
    );
  }

  // ── Normal form-edit view ────────────────────────────────────────────────
  return <FormEditView formId={form_id} />;
}

function FormEditView({ formId }: { formId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, loading, error, reload } = useFormDetail(formId);

  // Honour ?tab= so navigating back to sections tab works
  const defaultTab = searchParams.get("tab") ?? "details";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" onClick={() => router.push(`/form-builder`)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          {loading ? (
            <>
              <Skeleton className="h-5 w-48 mb-1" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-foreground truncate">
                {data?.form_name ?? "Edit Form"}
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                {data?.form_code ?? `ID: ${formId}`}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
          <Button
            variant="link"
            size="sm"
            className="ml-auto text-destructive p-0 h-auto"
            onClick={reload}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full">
          <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
          <TabsTrigger value="sections" className="flex-1">
            Sections
            {!loading && data && data.steps.length > 0 && (
              <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                {data.steps.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
        </TabsList>
        <div className="px-4">
          <TabsContent value="details">
            <FormDetailsTab formId={formId} data={data} loading={loading} reload={reload} />
          </TabsContent>

          <TabsContent value="sections">
            <FormSectionsTab
              formId={formId}
              steps={data?.steps ?? []}
              loading={loading}
              onStepsUpdated={reload}
            />
          </TabsContent>

          <TabsContent value="preview">
            <FormPreviewTab formId={formId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
