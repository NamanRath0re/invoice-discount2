// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import {
//   LayoutGrid,
//   List,
//   Plus,
//   Pencil,
//   Trash2,
//   Eye,
//   FileText,
//   RefreshCw,
//   Search,
//   Tag,
//   CheckCircle2,
//   Clock,
//   AlertCircle,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Skeleton } from "@/components/ui/skeleton";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface Form {
//   id: number;
//   form_code: string;
//   form_name: string;
//   description: string;
//   category: string;
//   version: number;
//   status: "draft" | "published" | "archived";
//   is_active: number;
//   product_code: string | null;
//   scheme_code: string | null;
//   created_at: string;
//   updated_at: string;
// }

// // ─── API helpers ──────────────────────────────────────────────────────────────

// const API_BASE = "http://192.168.6.6/www8/2013-Backend/api/v1/formBuilder";
// const HEADERS: Record<string, string> = {
//   "Content-Type": "application/json",
//   "X-tenant-code": "demo",
// };

// async function fetchForms(): Promise<Form[]> {
//   const res = await fetch(`${API_BASE}/getFormList`, {
//     method: "POST",
//     headers: HEADERS,
//   });
//   const json = await res.json();
//   if (!json.success) throw new Error(json.message || "Failed to fetch forms");
//   return json.data as Form[];
// }

// async function insertForm(form_name: string): Promise<void> {
//   const res = await fetch(`${API_BASE}/insertForm`, {
//     method: "POST",
//     headers: HEADERS,
//     body: JSON.stringify({ form_name }),
//   });
//   const json = await res.json();
//   if (!json.success) throw new Error(json.message || "Failed to create form");
// }

// // ─── Status badge ─────────────────────────────────────────────────────────────

// function StatusBadge({ status }: { status: Form["status"] }) {
//   const map = {
//     published: {
//       label: "Published",
//       icon: CheckCircle2,
//       className:
//         "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
//     },
//     draft: {
//       label: "Draft",
//       icon: Clock,
//       className:
//         "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
//     },
//     archived: {
//       label: "Archived",
//       icon: AlertCircle,
//       className:
//         "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
//     },
//   };
//   const cfg = map[status] ?? map.draft;
//   const Icon = cfg.icon;
//   return (
//     <span
//       className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.className}`}
//     >
//       <Icon className="size-3" />
//       {cfg.label}
//     </span>
//   );
// }

// // ─── Add Form Modal ───────────────────────────────────────────────────────────

// function AddFormModal({
//   open,
//   onClose,
//   onSuccess,
// }: {
//   open: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }) {
//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async () => {
//     if (!name.trim()) {
//       setError("Form name is required.");
//       return;
//     }
//     setLoading(true);
//     setError("");
//     try {
//       await insertForm(name.trim());
//       setName("");
//       onSuccess();
//       onClose();
//     } catch (e: any) {
//       setError(e.message || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") handleSubmit();
//     if (e.key === "Escape") onClose();
//   };

//   if (!open) return null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="w-full max-w-md rounded-xl bg-card ring-1 ring-foreground/10 shadow-xl p-6 mx-4">
//         <div className="flex items-center gap-3 mb-5">
//           <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
//             <FileText className="size-4 text-primary" />
//           </div>
//           <div>
//             <h2 className="text-base font-semibold text-foreground">New Form</h2>
//             <p className="text-xs text-muted-foreground">Create a new form to get started</p>
//           </div>
//         </div>

//         <div className="space-y-1 mb-4">
//           <label className="text-xs font-medium text-foreground">Form Name</label>
//           <Input
//             autoFocus
//             placeholder="e.g. Customer Onboarding"
//             value={name}
//             onChange={(e) => {
//               setName(e.target.value);
//               setError("");
//             }}
//             onKeyDown={handleKeyDown}
//             className={error ? "border-destructive" : ""}
//           />
//           {error && <p className="text-xs text-destructive mt-1">{error}</p>}
//         </div>

//         <div className="flex justify-end gap-2">
//           <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
//             Cancel
//           </Button>
//           <Button size="sm" onClick={handleSubmit} disabled={loading}>
//             {loading ? (
//               <>
//                 <RefreshCw className="size-3 animate-spin" />
//                 Creating…
//               </>
//             ) : (
//               <>
//                 <Plus className="size-3" />
//                 Create Form
//               </>
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Delete Confirm Modal ─────────────────────────────────────────────────────

// function DeleteModal({
//   form,
//   onClose,
//   onConfirm,
// }: {
//   form: Form | null;
//   onClose: () => void;
//   onConfirm: (id: number) => void;
// }) {
//   if (!form) return null;
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="w-full max-w-sm rounded-xl bg-card ring-1 ring-foreground/10 shadow-xl p-6 mx-4">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
//             <Trash2 className="size-4 text-destructive" />
//           </div>
//           <div>
//             <h2 className="text-base font-semibold text-foreground">Delete Form</h2>
//             <p className="text-xs text-muted-foreground">This action cannot be undone</p>
//           </div>
//         </div>
//         <p className="text-sm text-muted-foreground mb-5">
//           Are you sure you want to delete{" "}
//           <span className="font-medium text-foreground">{form.form_name}</span>?
//         </p>
//         <div className="flex justify-end gap-2">
//           <Button variant="outline" size="sm" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button variant="destructive" size="sm" onClick={() => onConfirm(form.id)}>
//             Delete
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Card Skeleton ────────────────────────────────────────────────────────────

// function CardSkeleton() {
//   return (
//     <Card>
//       <CardHeader>
//         <Skeleton className="h-4 w-2/3" />
//         <Skeleton className="h-3 w-1/2 mt-1" />
//       </CardHeader>
//       <CardContent>
//         <Skeleton className="h-3 w-full mb-2" />
//         <Skeleton className="h-3 w-3/4" />
//       </CardContent>
//       <CardFooter>
//         <Skeleton className="h-7 w-16 mr-2" />
//         <Skeleton className="h-7 w-16 mr-2" />
//         <Skeleton className="h-7 w-16" />
//       </CardFooter>
//     </Card>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────

// export default function FormBuilderPage() {
//   const [forms, setForms] = useState<Form[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [view, setView] = useState<"card" | "table">("card");
//   const [search, setSearch] = useState("");
//   const [addOpen, setAddOpen] = useState(false);
//   const [deleteTarget, setDeleteTarget] = useState<Form | null>(null);

//   const loadForms = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const data = await fetchForms();
//       setForms(data);
//     } catch (e: any) {
//       setError(e.message || "Failed to load forms.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadForms();
//   }, [loadForms]);

//   const filtered = forms.filter(
//     (f) =>
//       f.form_name.toLowerCase().includes(search.toLowerCase()) ||
//       f.form_code.toLowerCase().includes(search.toLowerCase()) ||
//       (f.category ?? "").toLowerCase().includes(search.toLowerCase())
//   );

//   const handleDelete = (id: number) => {
//     setForms((prev) => prev.filter((f) => f.id !== id));
//     setDeleteTarget(null);
//   };

//   const formatDate = (d: string) =>
//     new Date(d).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });

//   return (
//     <div className="flex flex-col gap-5">
//       {/* ── Header ──────────────────────────────────────────────── */}
//       <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-xl font-semibold text-foreground">Form Builder</h1>
//           <p className="text-sm text-muted-foreground">
//             Manage and configure your forms
//           </p>
//         </div>
//         <Button size="sm" onClick={() => setAddOpen(true)} className="self-start sm:self-auto">
//           <Plus className="size-4" />
//           Add New Form
//         </Button>
//       </div>

//       {/* ── Toolbar ─────────────────────────────────────────────── */}
//       <div className="flex items-center gap-2">
//         <div className="relative flex-1 max-w-xs">
//           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
//           <Input
//             placeholder="Search forms…"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-8 h-8 text-sm"
//           />
//         </div>

//         <Button variant="outline" size="icon" onClick={loadForms} title="Refresh" className="size-8">
//           <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
//         </Button>

//         <div className="flex rounded-lg border border-border overflow-hidden">
//           <button
//             onClick={() => setView("card")}
//             title="Card view"
//             className={`flex items-center justify-center size-8 transition-colors ${
//               view === "card"
//                 ? "bg-primary text-primary-foreground"
//                 : "bg-background text-muted-foreground hover:bg-muted"
//             }`}
//           >
//             <LayoutGrid className="size-3.5" />
//           </button>
//           <button
//             onClick={() => setView("table")}
//             title="Table view"
//             className={`flex items-center justify-center size-8 transition-colors ${
//               view === "table"
//                 ? "bg-primary text-primary-foreground"
//                 : "bg-background text-muted-foreground hover:bg-muted"
//             }`}
//           >
//             <List className="size-3.5" />
//           </button>
//         </div>

//         {!loading && (
//           <span className="text-xs text-muted-foreground whitespace-nowrap">
//             {filtered.length} form{filtered.length !== 1 ? "s" : ""}
//           </span>
//         )}
//       </div>

//       {/* ── Error ───────────────────────────────────────────────── */}
//       {error && (
//         <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
//           <AlertCircle className="size-4 shrink-0" />
//           {error}
//           <Button variant="link" size="sm" className="ml-auto text-destructive p-0 h-auto" onClick={loadForms}>
//             Retry
//           </Button>
//         </div>
//       )}

//       {/* ── Card View ───────────────────────────────────────────── */}
//       {view === "card" && (
//         <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//           {loading
//             ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
//             : filtered.length === 0
//             ? (
//               <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
//                 <FileText className="size-10 mb-3 opacity-30" />
//                 <p className="text-sm font-medium">No forms found</p>
//                 <p className="text-xs mt-1">
//                   {search ? "Try a different search term" : 'Click "Add New Form" to create one'}
//                 </p>
//               </div>
//             )
//             : filtered.map((form) => (
//               <Card key={form.id} className="hover:shadow-md transition-shadow duration-200">
//                 <CardHeader className="pb-2">
//                   <div className="flex items-start justify-between gap-2">
//                     <CardTitle className="text-sm leading-tight line-clamp-1">
//                       {form.form_name}
//                     </CardTitle>
//                     <StatusBadge status={form.status} />
//                   </div>
//                   <CardDescription className="text-xs line-clamp-1 font-mono mt-0.5">
//                     {form.form_code}
//                   </CardDescription>
//                 </CardHeader>

//                 <CardContent className="pb-2 space-y-2">
//                   {form.description && (
//                     <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
//                       {form.description}
//                     </p>
//                   )}
//                   <div className="flex flex-wrap gap-1.5">
//                     {form.category && (
//                       <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
//                         <Tag className="size-2.5" />
//                         {form.category}
//                       </span>
//                     )}
//                     {form.product_code && (
//                       <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
//                         v{form.version} · {form.product_code}
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-[11px] text-muted-foreground/70">
//                     Created {formatDate(form.created_at)}
//                   </p>
//                 </CardContent>

//                 <CardFooter className="gap-1.5 pt-2">
//                   <Button variant="outline" size="xs" className="flex-1" title="Preview">
//                     <Eye className="size-3" />
//                     Preview
//                   </Button>
//                   <Button variant="outline" size="xs" className="flex-1" title="Edit">
//                     <Pencil className="size-3" />
//                     Edit
//                   </Button>
//                   <Button
//                     variant="destructive"
//                     size="icon-xs"
//                     title="Delete"
//                     onClick={() => setDeleteTarget(form)}
//                   >
//                     <Trash2 className="size-3" />
//                   </Button>
//                 </CardFooter>
//               </Card>
//             ))}
//         </div>
//       )}

//       {/* ── Table View ──────────────────────────────────────────── */}
//       {view === "table" && (
//         <div className="rounded-xl border border-border overflow-hidden">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-muted/40">
//                 <TableHead className="text-xs font-semibold">Form Name</TableHead>
//                 <TableHead className="text-xs font-semibold">Code</TableHead>
//                 <TableHead className="text-xs font-semibold">Category</TableHead>
//                 <TableHead className="text-xs font-semibold">Status</TableHead>
//                 <TableHead className="text-xs font-semibold">Version</TableHead>
//                 <TableHead className="text-xs font-semibold">Created</TableHead>
//                 <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {loading ? (
//                 Array.from({ length: 5 }).map((_, i) => (
//                   <TableRow key={i}>
//                     {Array.from({ length: 7 }).map((_, j) => (
//                       <TableCell key={j}>
//                         <Skeleton className="h-4 w-full max-w-[120px]" />
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : filtered.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
//                     <FileText className="size-8 mx-auto mb-2 opacity-30" />
//                     <p className="text-sm">No forms found</p>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filtered.map((form) => (
//                   <TableRow key={form.id} className="hover:bg-muted/30 transition-colors">
//                     <TableCell className="font-medium text-sm">{form.form_name}</TableCell>
//                     <TableCell className="font-mono text-xs text-muted-foreground">
//                       {form.form_code}
//                     </TableCell>
//                     <TableCell className="text-xs">
//                       {form.category ? (
//                         <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
//                           {form.category}
//                         </span>
//                       ) : (
//                         <span className="text-muted-foreground/50">—</span>
//                       )}
//                     </TableCell>
//                     <TableCell>
//                       <StatusBadge status={form.status} />
//                     </TableCell>
//                     <TableCell className="text-xs text-muted-foreground">
//                       v{form.version}
//                     </TableCell>
//                     <TableCell className="text-xs text-muted-foreground">
//                       {formatDate(form.created_at)}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex items-center justify-end gap-1">
//                         <Button variant="ghost" size="icon-xs" title="Preview">
//                           <Eye className="size-3" />
//                         </Button>
//                         <Button variant="ghost" size="icon-xs" title="Edit">
//                           <Pencil className="size-3" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon-xs"
//                           title="Delete"
//                           className="text-destructive hover:text-destructive hover:bg-destructive/10"
//                           onClick={() => setDeleteTarget(form)}
//                         >
//                           <Trash2 className="size-3" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       {/* ── Modals ──────────────────────────────────────────────── */}
//       <AddFormModal
//         open={addOpen}
//         onClose={() => setAddOpen(false)}
//         onSuccess={loadForms}
//       />
//       <DeleteModal
//         form={deleteTarget}
//         onClose={() => setDeleteTarget(null)}
//         onConfirm={handleDelete}
//       />
//     </div>
//   );
// }



"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  LayoutGrid,
  List,
  Plus,
  Pencil,
  Trash2,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Form {
  id: number;
  form_code: string;
  form_name: string;
  description: string;
  category: string;
  version: number;
  status: "draft" | "published" | "archived";
  is_active: number;
  product_code: string | null;
  scheme_code: string | null;
  created_at: string;
  updated_at: string;
}

interface AddFormPayload {
  form_name: string;
  form_code: string;
  description: string;
  category: string;
  product_code: string;
  scheme_code: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const API_BASE = "http://192.168.6.6/www8/2013-Backend/api/v1/formBuilder";
const HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "X-tenant-code": "demo",
};

async function fetchForms(): Promise<Form[]> {
  const res = await fetch(`${API_BASE}/getFormList`, {
    method: "POST",
    headers: HEADERS,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch forms");
  return json.data as Form[];
}

async function insertForm(payload: AddFormPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/insertForm`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to create form");
}

async function deleteFormById(form_id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/deleteForm`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ form_id }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to delete form");
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Form["status"] }) {
  const map = {
    published: {
      label: "Published",
      icon: CheckCircle2,
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    },
    draft: {
      label: "Draft",
      icon: Clock,
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    },
    archived: {
      label: "Archived",
      icon: AlertCircle,
      className:
        "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    },
  };
  const cfg = map[status] ?? map.draft;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

// ─── Add Form Modal ───────────────────────────────────────────────────────────

const EMPTY_PAYLOAD: AddFormPayload = {
  form_name: "",
  form_code: "",
  description: "",
  category: "",
  product_code: "",
  scheme_code: "",
};

function AddFormModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [payload, setPayload] = useState<AddFormPayload>(EMPTY_PAYLOAD);
  const [errors, setErrors] = useState<Partial<Record<keyof AddFormPayload, string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof AddFormPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPayload((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!payload.form_name.trim()) next.form_name = "Form name is required.";
    if (!payload.form_code.trim()) next.form_code = "Form code is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await insertForm(payload);
      toast.success("Form created successfully", {
        description: `"${payload.form_name}" has been added.`,
      });
      setPayload(EMPTY_PAYLOAD);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error("Failed to create form", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPayload(EMPTY_PAYLOAD);
    setErrors({});
    onClose();
  };

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-lg rounded-xl bg-card ring-1 ring-foreground/10 shadow-xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 pb-4 border-b border-border">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <FileText className="size-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground">New Form</h2>
            <p className="text-xs text-muted-foreground">Fill in the details to create a new form</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} className="shrink-0">
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4">
          {/* Row 1: form_name + form_code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Form Name <span className="text-destructive">*</span>
              </Label>
              <Input
                autoFocus
                placeholder="e.g. Customer Onboarding"
                value={payload.form_name}
                onChange={set("form_name")}
                className={`h-8 text-sm ${errors.form_name ? "border-destructive" : ""}`}
              />
              {errors.form_name && (
                <p className="text-xs text-destructive">{errors.form_name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Form Code <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. CUST_ONBOARD"
                value={payload.form_code}
                onChange={set("form_code")}
                className={`h-8 text-sm font-mono ${errors.form_code ? "border-destructive" : ""}`}
              />
              {errors.form_code && (
                <p className="text-xs text-destructive">{errors.form_code}</p>
              )}
            </div>
          </div>

          {/* Row 2: description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              placeholder="Brief description of what this form is for"
              value={payload.description}
              onChange={set("description")}
              className="text-sm resize-none min-h-[72px]"
            />
          </div>

          {/* Row 3: category + product_code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category</Label>
              <Input
                placeholder="e.g. KYC, Onboarding"
                value={payload.category}
                onChange={set("category")}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Product Code</Label>
              <Input
                placeholder="e.g. SCF"
                value={payload.product_code}
                onChange={set("product_code")}
                className="h-8 text-sm font-mono"
              />
            </div>
          </div>

          {/* Row 4: scheme_code */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Scheme Code</Label>
            <Input
              placeholder="e.g. DEFAULT"
              value={payload.scheme_code}
              onChange={set("scheme_code")}
              className="h-8 text-sm font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 pt-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="size-3 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus className="size-3" />
                Create Form
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  form,
  onClose,
  onSuccess,
}: {
  form: Form | null;
  onClose: () => void;
  onSuccess: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!form) return;
    setLoading(true);
    try {
      await deleteFormById(form.id);
      toast.success("Form deleted", {
        description: `"${form.form_name}" has been removed.`,
      });
      onSuccess(form.id);
      onClose();
    } catch (e: any) {
      toast.error("Failed to delete form", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (!form) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div className="w-full max-w-sm rounded-xl bg-card ring-1 ring-foreground/10 shadow-xl p-6 mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
            <Trash2 className="size-4 text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Delete Form</h2>
            <p className="text-xs text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{form.form_name}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="size-3 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Card Skeleton ────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-7 w-16 mr-2" />
        <Skeleton className="h-7 w-16 mr-2" />
        <Skeleton className="size-7" />
      </CardFooter>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FormBuilderPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"card" | "table">("card");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Form | null>(null);
  const router = useRouter();

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchForms();
      setForms(data);
    } catch (e: any) {
      setError(e.message || "Failed to load forms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const filtered = forms.filter(
    (f) =>
      f.form_name.toLowerCase().includes(search.toLowerCase()) ||
      f.form_code.toLowerCase().includes(search.toLowerCase()) ||
      (f.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteSuccess = (id: number) => {
    setForms((prev) => prev.filter((f) => f.id !== id));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Form Builder</h1>
          <p className="text-sm text-muted-foreground">
            Manage and configure your forms
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)} className="self-start sm:self-auto">
          <Plus className="size-4" />
          Add New Form
        </Button>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search forms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Button variant="outline" size="icon" onClick={loadForms} title="Refresh" className="size-8" disabled={loading}>
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>

        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setView("card")}
            title="Card view"
            className={`flex items-center justify-center size-8 transition-colors ${
              view === "card"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            onClick={() => setView("table")}
            title="Table view"
            className={`flex items-center justify-center size-8 transition-colors ${
              view === "table"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <List className="size-3.5" />
          </button>
        </div>

        {!loading && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {filtered.length} form{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
          <Button variant="link" size="sm" className="ml-auto text-destructive p-0 h-auto" onClick={loadForms}>
            Retry
          </Button>
        </div>
      )}

      {/* ── Card View ───────────────────────────────────────────── */}
      {view === "card" && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : filtered.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileText className="size-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No forms found</p>
                <p className="text-xs mt-1">
                  {search ? "Try a different search term" : 'Click "Add New Form" to create one'}
                </p>
              </div>
            )
            : filtered.map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow duration-200 flex flex-col">
                    <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm leading-tight line-clamp-1">
                        {form.form_name}
                        </CardTitle>
                        <StatusBadge status={form.status} />
                    </div>
                    <CardDescription className="text-xs line-clamp-1 font-mono mt-0.5">
                        {form.form_code}
                    </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-2 space-y-2 flex-1">
                    {form.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {form.description}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                        {form.category && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            <Tag className="size-2.5" />
                            {form.category}
                        </span>
                        )}
                        {form.product_code && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            v{form.version} · {form.product_code}
                        </span>
                        )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/70">
                        Created {formatDate(form.created_at)}
                    </p>
                    </CardContent>

                    <CardFooter className="gap-1.5 pt-2">
                    <Button variant="outline" size="xs" className="flex-1" title="Preview">
                        <Eye className="size-3" />
                        Preview
                    </Button>
                    <Button
                        variant="outline"
                        size="xs"
                        className="flex-1"
                        title="Edit"
                        onClick={() => router.push(`/form_builder/${form.id}`)}
                    >
                        <Pencil className="size-3" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon-xs"
                        title="Delete"
                        onClick={() => setDeleteTarget(form)}
                    >
                        <Trash2 className="size-3" />
                    </Button>
                    </CardFooter>
                </Card>
))}
        </div>
      )}

      {/* ── Table View ──────────────────────────────────────────── */}
      {view === "table" && (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-semibold">Form Name</TableHead>
                <TableHead className="text-xs font-semibold">Code</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Version</TableHead>
                <TableHead className="text-xs font-semibold">Created</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <FileText className="size-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No forms found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((form) => (
                  <TableRow key={form.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-sm">{form.form_name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {form.form_code}
                    </TableCell>
                    <TableCell className="text-xs">
                      {form.category ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
                          {form.category}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={form.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      v{form.version}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(form.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-xs" title="Preview">
                          <Eye className="size-3" />
                        </Button>
                        <Button variant="ghost" size="icon-xs" title="Edit"
                            onClick={() => router.push(`/form_builder/${form.id}`)}>
                                <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Delete"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(form)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────── */}
      <AddFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={loadForms}
      />
      <DeleteModal
        form={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
