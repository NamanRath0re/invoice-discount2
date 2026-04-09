import type { FormDetail, UpdateFormPayload } from "./types";

const API_BASE = "http://192.168.6.6/www8/2013-Backend/api/v1/formBuilder";
const HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "X-tenant-code": "demo",
};

export async function getFormById(form_id: string): Promise<FormDetail> {
  const res = await fetch(`${API_BASE}/getFormById`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ form_id }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch form");
  return json.data as FormDetail;
}

export async function updateForm(payload: UpdateFormPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/updateForm`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to update form");
}