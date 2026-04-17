'use client';

import { useState, useEffect, useCallback } from 'react';

const BASE_URL = 'http://192.168.6.6/www8/2013-Backend/api/v1';
const HEADERS = {
  'Content-Type': 'application/json',
  'X-tenant-code': 'demo',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FieldKeyItem {
  id: number;
  field_key: string;
  field_label: string;
  data_type: string;
  validation_regex: string | null;
  min_value: number | null;
  max_value: number | null;
  max_length: number | null;
  default_options: any;
  data_source_type: 'static' | 'api' | 'database';
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

export interface APISource {
  id: number;
  source_key: string;
  source_name: string;
  source_type: 'api' | 'database';
  endpoint: string | null;
  method: string;
  input_param: string | null;
  table_name: string | null;
  key_column: string | null;
  value_columns: Record<string, string> | null;
  cache_enabled: number;
  cache_ttl: number;
  headers: any;
  auth_type: string;
  auth_config: any;
}

export interface StepField {
  key: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  conditions?: Array<{ value: string; operator: string; depends_on: string }>;
  validation?: { regex?: string; max_length?: number };
  data_source?: {
    type: string;
    method?: string;
    endpoint?: string;
    source_key?: string;
    response_mapping?: Record<string, string>;
  };
  /** Controls visibility/editability in the rendered form */
  ui?: {
    visible?: boolean;
    editable?: boolean;
  };
}

export interface FormStepData {
  // rendered_json: {
  //   fields: StepField[];
  //   step_key: string;
  //   step_name?: string;
  // };
  rendered_json: StepField[]; 
  hash_key: string;
  version: number;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function post<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'API error');
  return json.data;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Fetch existing step fields for a form step */
export function useFormStep(formId: number | null, stepKey: string | null) {
  const [data, setData] = useState<FormStepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId || !stepKey) return;
    setLoading(true);
    setError(null);
    post<{ status: boolean; data: FormStepData }>('/formBuilder/getFormStep', {
      form_id: formId,
      step_key: stepKey,
    })
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [formId, stepKey]);

  return { data, loading, error };
}

/** Fetch available data types */
export function useDataTypes() {
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    post<{ data_types: string[] }>('/kyc/getDataTypes')
      .then((res) => setDataTypes(res.data_types))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { dataTypes, loading, error };
}

/** Fetch field keys for a given data type */
export function useFieldKeys(dataType: string | null) {
  const [fields, setFields] = useState<FieldKeyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback((dt: string) => {
    setLoading(true);
    setError(null);
    post<{ data_type: string; fields: FieldKeyItem[] }>('/kyc/getFieldKey', { data_type: dt })
      .then((res) => setFields(res.fields))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!dataType) { setFields([]); return; }
    fetchFields(dataType);
  }, [dataType, fetchFields]);

  return { fields, loading, error, refetch: fetchFields };
}

/** Fetch all registered API / DB data sources (formBuilder/getAPISources) */
export function useAPISources() {
  const [sources, setSources] = useState<APISource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // The response is the array directly under data
    post<APISource[]>('/formBuilder/getAPISources')
      .then((res) => setSources(Array.isArray(res) ? res : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { sources, loading, error };
}