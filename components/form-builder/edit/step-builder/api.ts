import type { FieldKey, StepData } from "./types";

const FORM_API = "http://192.168.6.6/www8/2013-Backend/api/v1/formBuilder";
const KYC_API  = "https://192.168.6.6/www8/2013-Backend/api/v1/kyc";
const HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "X-tenant-code": "demo",
};

export async function getFormStep(form_id: string, step_key: string): Promise<StepData> {
  const res = await fetch(`${FORM_API}/getFormStep`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ form_id, step_key }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch step");
  return json.data.data as StepData;
}

export async function addFormStep(payload: {
  form_id: number;
  step_key: string;
  step_name: string;
  step_order: number;
}): Promise<void> {
  const res = await fetch(`${FORM_API}/addFormStep`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to add step");
}

export async function getDataTypes(): Promise<string[]> {
  const res = await fetch(`${KYC_API}/getDataTypes`, {
    method: "POST",
    headers: HEADERS,
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch data types");
  return json.data.data_types as string[];
}

export async function getFieldKeys(data_type: string): Promise<FieldKey[]> {
  const res = await fetch(`${KYC_API}/getFieldKey`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ data_type }),
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch field keys");
  return json.data.fields as FieldKey[];
}