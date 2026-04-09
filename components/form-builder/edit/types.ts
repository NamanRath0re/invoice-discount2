export interface FormDetail {
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
  steps: FormStep[];
}

export interface FormStep {
  step_key: string;
  step_name: string;
  step_order: number;
  is_mandatory: number;
  is_skippable: number;
}

export interface UpdateFormPayload {
  form_id: number;
  form_name: string;
  description: string;
  category: string;
  product_code: string;
  scheme_code: string;
}