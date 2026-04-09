export interface FieldKey {
  id: number;
  field_key: string;
  field_label: string;
  data_type: string;
  validation_regex: string | null;
  max_length: number | null;
  is_required: number;
  is_editable: number;
  placeholder: string | null;
  help_text: string | null;
  is_derived: number;
  depends_on_field_key: string | null;
  data_source_type: string;
  data_source_key: string | null;
}

export interface RenderedField {
  key: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  help_text?: string;
  grid_column?: number;
}

export interface StepSchema {
  step_key: string;
  fields: RenderedField[];
}

export interface StepData {
  rendered_json: StepSchema;
  hash_key: string;
  version: number;
}