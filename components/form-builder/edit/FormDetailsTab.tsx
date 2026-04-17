"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { updateForm } from "./api";
import type { FormDetail, UpdateFormPayload } from "./types";

interface Props {
  formId: string;
  data: FormDetail | null;
  loading: boolean;
  reload: () => void;
}

type EditableFields = Omit<UpdateFormPayload, "form_id">;

export function FormDetailsTab({ formId, data, loading, reload }: Props) {
  const [fields, setFields] = useState<EditableFields>({
    form_name: "",
    description: "",
    category: "",
    product_code: "",
    scheme_code: "",
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<EditableFields>>({});

  useEffect(() => {
    if (data) {
      setFields({
        form_name: data.form_name ?? "",
        description: data.description ?? "",
        category: data.category ?? "",
        product_code: data.product_code ?? "",
        scheme_code: data.scheme_code ?? "",
      });
    }
  }, [data]);

  const set =
    (key: keyof EditableFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    };

  const validate = () => {
    const errs: Partial<EditableFields> = {};
    if (!fields.form_name.trim()) errs.form_name = "Form name is required.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      console.log({ payload: { form_id: Number(formId), ...fields } });
      await updateForm({ form_id: Number(formId), ...fields });
      toast.success("Form updated successfully");
      reload();
    } catch (e: any) {
      toast.error("Failed to update form", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FormDetailsSkeleton />;

  return (
    <div className="mt-6 mx-auto space-y-5">
      {/* Read-only meta chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetaChip label="Form Code" value={data?.form_code} mono />
        <MetaChip label="Version" value={`v${data?.version}`} />
        <MetaChip label="Status" value={data?.status} />
      </div>

      {/* Editable card */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Form Details</h2>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            Form Name <span className="text-destructive">*</span>
          </Label>
          <Input
            value={fields.form_name}
            onChange={set("form_name")}
            className={`h-8 text-sm ${fieldErrors.form_name ? "border-destructive" : ""}`}
          />
          {fieldErrors.form_name && (
            <p className="text-xs text-destructive">{fieldErrors.form_name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Description</Label>
          <Textarea
            value={fields.description}
            onChange={set("description")}
            className="text-sm resize-none min-h-[72px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Category</Label>
            <Input
              value={fields.category}
              onChange={set("category")}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Product Code</Label>
            <Input
              value={fields.product_code}
              onChange={set("product_code")}
              className="h-8 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Scheme Code</Label>
          <Input
            value={fields.scheme_code}
            onChange={set("scheme_code")}
            className="h-8 text-sm font-mono"
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="size-3 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-3" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetaChip({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
      <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-xs font-medium text-foreground truncate ${mono ? "font-mono" : ""}`}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

function FormDetailsSkeleton() {
  return (
    <div className="mt-6 mx-auto max-w-2xl space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[72px] w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
        <Skeleton className="h-8 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}