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

export interface AddStepPayload {
  form_id: number;
  step_key: string;
  step_name: string;
  step_order: number;
}

// Step editor types
export interface StepField {
  key: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  validation?: {
    regex?: string;
    max_length?: number;
  };
  ui?: {
    visible?: boolean;
    editable?: boolean;
    gridColumn?: number;
  };
  data_source?: {
    type: string;
    method?: string;
    endpoint?: string;
    response_mapping?: Record<string, string>;
  };
}

export interface RenderedStep {
  step_key: string;
  fields: StepField[];
}

export interface StepData {
  rendered_json: RenderedStep;
  hash_key: string;
  version: number;
}

// Component Library (from API)
export interface DataType {
  type: string;
}

export interface FieldKey {
  id: number;
  field_key: string;
  field_label: string;
  data_type: string;
  validation_regex: string | null;
  min_value: number | null;
  max_value: number | null;
  max_length: number | null;
  default_options: any;
  data_source_type: string;
  data_source_key: string | null;
  response_mapping: string | null;
  is_derived: number;
  depends_on_field_key: string | null;
  is_editable: number;
  is_required: number;
  placeholder: string | null;
  help_text: string | null;
  is_active: number;
}