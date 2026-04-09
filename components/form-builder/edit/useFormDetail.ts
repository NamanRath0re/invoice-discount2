import { useState, useEffect, useCallback } from "react";
import { getFormById } from "./api";
import type { FormDetail } from "./types";

export function useFormDetail(formId: string) {
  const [data, setData] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getFormById(formId);
      setData(result);
    } catch (e: any) {
      setError(e.message || "Failed to load form");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}