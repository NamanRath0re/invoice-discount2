import { useState, useCallback } from "react";
import { getFormStep, getDataTypes, getFieldKeys } from "./api";
import type { RenderedField, FieldKey } from "./types";

export function useStepBuilder(formId: string, stepKey: string) {
  const [fields, setFields]           = useState<RenderedField[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [hashKey, setHashKey]         = useState("");

  // Component library state
  const [dataTypes, setDataTypes]     = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [fieldKeys, setFieldKeys]     = useState<FieldKey[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingKeys, setLoadingKeys]   = useState(false);

  // Selected field in canvas
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);

  const loadStep = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getFormStep(formId, stepKey);
      setFields(data.rendered_json.fields.map(f => ({
        ...f,
        grid_column: f.grid_column ?? 12,
      })));
      setHashKey(data.hash_key);
    } catch (e: any) {
      setError(e.message || "Failed to load step");
    } finally {
      setLoading(false);
    }
  }, [formId, stepKey]);

  const loadDataTypes = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const types = await getDataTypes();
      setDataTypes(types);
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  const selectDataType = useCallback(async (type: string) => {
    setSelectedType(type);
    setLoadingKeys(true);
    try {
      const keys = await getFieldKeys(type);
      setFieldKeys(keys);
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  const addField = useCallback((fk: FieldKey) => {
    // Don't add duplicates
    if (fields.some(f => f.key === fk.field_key)) return;
    const newField: RenderedField = {
      key: fk.field_key,
      type: fk.data_type,
      label: fk.field_label,
      required: fk.is_required === 1,
      placeholder: fk.placeholder ?? "",
      help_text: fk.help_text ?? "",
      grid_column: 12,
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldKey(newField.key);
  }, [fields]);

  const updateField = useCallback((key: string, updates: Partial<RenderedField>) => {
    setFields(prev => prev.map(f => f.key === key ? { ...f, ...updates } : f));
  }, []);

  const removeField = useCallback((key: string) => {
    setFields(prev => prev.filter(f => f.key !== key));
    setSelectedFieldKey(prev => prev === key ? null : prev);
  }, []);

  const reorderFields = useCallback((reordered: RenderedField[]) => {
    setFields(reordered);
  }, []);

  const selectedField = fields.find(f => f.key === selectedFieldKey) ?? null;

  return {
    fields, loading, error, hashKey,
    loadStep,
    dataTypes, loadingTypes, loadDataTypes,
    selectedType, fieldKeys, loadingKeys, selectDataType,
    selectedFieldKey, setSelectedFieldKey, selectedField,
    addField, updateField, removeField, reorderFields,
  };
}