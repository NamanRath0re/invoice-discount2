'use client';

import { useState, useEffect } from 'react';
import {
  GripVertical,
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  FileText,
  ChevronDown,
  Globe,
  Zap,
  Loader2,
  AlertCircle,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FormSchema, ComponentSchema, ApiSchema } from '@/types/schema';
import ComponentCanvas from './builder/ComponentCanvas';
import PropertiesPanel from './builder/PropertiesPanel';
import FormRuntimeComponent from './FormRuntime';
import ApiBuilder from './builder/ApiBuilder';
import {
  useFormStep,
  useDataTypes,
  useFieldKeys,
  useAPISources,
  FieldKeyItem,
  StepField,
} from '@/hooks/useFormBuilderApis';
import { Input } from './ui/input';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const DATA_TYPE_ICONS: Record<string, React.ReactNode> = {
  text:    <Type className="h-4 w-4" />,
  number:  <Hash className="h-4 w-4" />,
  decimal: <Hash className="h-4 w-4" />,
  date:    <Calendar className="h-4 w-4" />,
  boolean: <ToggleLeft className="h-4 w-4" />,
  select:  <ChevronDown className="h-4 w-4" />,
  file:    <FileText className="h-4 w-4" />,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapDataTypeToComponentType(dt: string): ComponentSchema['type'] {
  switch (dt) {
    case 'boolean': return 'switch';
    case 'select':  return 'select';
    default:        return 'input';
  }
}

/** Convert a StepField (from getFormStep API) → ComponentSchema */
function stepFieldToComponentSchema(field: StepField): ComponentSchema {
  const validationRules: any[] = [];
  if (field.validation?.regex)      validationRules.push({ type: 'pattern',   value: field.validation.regex });
  if (field.validation?.max_length) validationRules.push({ type: 'maxLength', value: field.validation.max_length });

  return {
    id:    `comp-${field.key}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    key:   field.key,
    type:  mapDataTypeToComponentType(field.type),
    label: field.label,
    ui: {
      gridColumn:  12,
      required:    field.required ?? false,
      disabled:    field.ui?.editable === false,
      placeholder: field.placeholder || '',
      helpText:    '',
      ...(field.validation?.max_length ? { maxLength: field.validation.max_length } : {}),
      ...(field.validation?.regex      ? { pattern:   field.validation.regex }      : {}),
    },
    formUi: {
      visible:  field.ui?.visible  ?? true,
      editable: field.ui?.editable ?? true,
    },
    ...(validationRules.length > 0 ? { validation: { rules: validationRules } } : {}),
    ...(field.options ? {
      options: { static: field.options.map((o) => ({ key: o.value, label: o.label })) },
    } : {}),
    ...(field.data_source ? { dataSource: field.data_source } : {}),
  } as ComponentSchema;
}

/** Convert a FieldKeyItem (from getFieldKey API) → ComponentSchema */
function fieldKeyToComponentSchema(item: FieldKeyItem): ComponentSchema {
  const validationRules: any[] = [];
  if (item.validation_regex) validationRules.push({ type: 'pattern',   value: item.validation_regex });
  if (item.max_length)       validationRules.push({ type: 'maxLength', value: item.max_length });

  const base: ComponentSchema = {
    id:    `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    key:   item.field_key,
    type:  mapDataTypeToComponentType(item.data_type),
    label: item.field_label,
    ui: {
      gridColumn:  12,
      required:    item.is_required === 1,
      disabled:    item.is_editable === 0,
      placeholder: item.placeholder || '',
      helpText:    item.help_text   || '',
      ...(item.max_length       ? { maxLength: item.max_length }       : {}),
      ...(item.validation_regex ? { pattern:   item.validation_regex } : {}),
    },
    formUi: { visible: true, editable: true },
    ...(validationRules.length > 0 ? { validation: { rules: validationRules } } : {}),
  } as ComponentSchema;

  if (item.data_source_type !== 'static' && item.data_source_key) {
    (base as any).dataSource = {
      type:             item.data_source_type,
      source_key:       item.data_source_key,
      response_mapping: item.response_mapping ? JSON.parse(item.response_mapping) : undefined,
      depends_on:       item.depends_on_field_key || undefined,
    };
  }

  return base;
}

function buildUpdatePayload(
  components: ComponentSchema[],
  formId: number,
  stepKey: string,
  hashKey: string,
  version: number
) {
  const fields = components.map((c: any) => {
    const field: any = {
      key:   c.key,
      type:  c.type === 'input' ? 'text' : c.type === 'switch' ? 'boolean' : c.type,
      label: c.label,
      grid_width: c.ui?.gridColumn ?? 12,
    };

    if (c.ui?.required)    field.required    = true;
    if (c.ui?.placeholder) field.placeholder = c.ui.placeholder;

    const formUiVisible  = c.formUi?.visible  ?? true;
    const formUiEditable = c.formUi?.editable ?? true;
    if (!formUiVisible || !formUiEditable) {
      field.ui = { visible: formUiVisible, editable: formUiEditable };
    }

    const regex     = c.ui?.pattern   || c.validation?.rules?.find((r: any) => r.type === 'pattern')?.value;
    const maxLength = c.ui?.maxLength  || c.validation?.rules?.find((r: any) => r.type === 'maxLength')?.value;
    if (regex || maxLength) {
      field.validation = {
        ...(regex     ? { regex }               : {}),
        ...(maxLength ? { max_length: maxLength } : {}),
      };
    }

    if (c.options?.static?.length) {
      field.options = c.options.static.map((o: any) => ({ label: o.label, value: o.key }));
    }

    if (c.dataSource) {
      const ds = c.dataSource;
      field.data_source = {
        ...(ds.type       ? { type: ds.type }             : {}),
        ...(ds.method     ? { method: ds.method }         : {}),
        ...(ds.endpoint   ? { endpoint: ds.endpoint }     : {}),
        ...(ds.source_key ? { source_key: ds.source_key } : {}),
        trigger: ds.trigger || 'onChange',
        ...(ds.response_mapping ? { response_mapping: ds.response_mapping } : {}),
      };
    }

    return field;
  });

  return {
    form_id:       formId,
    step_key:      stepKey,
    rendered_json: fields,
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ComponentBuilderProps {
  formId?:   number;
  stepKey?:  string;
  stepName?: string;
  onBack?:   () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EnhancedComponentBuilder({ formId, stepKey, stepName, onBack }: ComponentBuilderProps) {
  const [selectedDataType, setSelectedDataType] = useState<string | null>(null);
  const [fieldSearch, setFieldSearch] = useState<string>('');
  // Track draft mapping errors reported by PropertiesPanel
  const [mappingDraftErrors, setMappingDraftErrors] = useState<boolean>(false);

  const { dataTypes, loading: dtLoading, error: dtError } = useDataTypes();
  const { fields: fieldKeys, loading: fkLoading, error: fkError } = useFieldKeys(selectedDataType);
  const { data: stepData, loading: stepLoading, error: stepError } = useFormStep(formId ?? null, stepKey ?? null);
  const { sources: apiSources } = useAPISources();

  const [stepMeta, setStepMeta]   = useState<{ hashKey: string; version: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [schema, setSchema] = useState<FormSchema>({
    id:         `form-${Date.now()}`,
    name:       stepKey || 'New Form',
    components: [],
    apis:       [],
    version:    '1.0.0',
  });
  const [selectedComponent, setSelectedComponent] = useState<ComponentSchema | null>(null);
  const [selectedApi,       setSelectedApi]       = useState<ApiSchema | null>(null);
  const [activeTab, setActiveTab] = useState<'components' | 'apis' | 'preview'>('components');

  useEffect(() => {
    if (!stepData) return;
    const components = (stepData.rendered_json ?? []).map(stepFieldToComponentSchema);
    setStepMeta({ hashKey: stepData.hash_key, version: stepData.version });
    setSchema((prev) => ({
      ...prev,
      // name: stepData.rendered_json.step_name || stepKey || prev.name,
      name: stepKey || prev.name,
      components,
    }));
  }, [stepData]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddFromFieldKey = (item: FieldKeyItem) => {
    if (schema.components.some((c) => c.key === item.field_key)) return;
    const newComp = fieldKeyToComponentSchema(item);
    setSchema((prev) => ({ ...prev, components: [...prev.components, newComp] }));
    setSelectedComponent(newComp);
    // setSelectedDataType(null);
  };

  const handleAddApi = () => {
    const newApi: ApiSchema = {
      id:      `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name:    'New API Endpoint',
      method:  'GET',
      url:     'https://api.example.com/data',
      headers: { 'Content-Type': 'application/json' },
      cache:   { enabled: false },
    };
    setSchema((prev) => ({ ...prev, apis: [...(prev.apis || []), newApi] }));
    setSelectedApi(newApi);
    setActiveTab('apis');
  };

  const handleUpdateComponent = (componentId: string, updates: Partial<ComponentSchema>) => {
    setSchema((prev) => ({
      ...prev,
      components: prev.components.map((c) => c.id === componentId ? { ...c, ...updates } : c),
    }));
    if (selectedComponent?.id === componentId) {
      setSelectedComponent((prev) => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleUpdateApi = (apiId: string, updates: Partial<ApiSchema>) => {
    setSchema((prev) => ({
      ...prev,
      apis: (prev.apis || []).map((a) => a.id === apiId ? { ...a, ...updates } : a),
    }));
    if (selectedApi?.id === apiId) {
      setSelectedApi((prev) => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteComponent = (componentId: string) => {
    setSchema((prev) => ({ ...prev, components: prev.components.filter((c) => c.id !== componentId) }));
    if (selectedComponent?.id === componentId) setSelectedComponent(null);
  };

  const handleDeleteApi = (apiId: string) => {
    setSchema((prev) => ({ ...prev, apis: (prev.apis || []).filter((a) => a.id !== apiId) }));
    if (selectedApi?.id === apiId) setSelectedApi(null);
  };

  const handleReorderComponents = (reordered: ComponentSchema[]) => {
    setSchema((prev) => ({ ...prev, components: reordered }));
  };

  const handleSave = async () => {
    if (!formId || !stepKey) {
      toast.error('Missing formId or stepKey – cannot save.');
      return;
    }
    // Check 1: persisted mapping rows where key exists but target is empty
    const incompleteMappings = schema.components.some((c: any) => {
      const mapping = c.dataSource?.response_mapping;
      if (!mapping) return false;
      return Object.entries(mapping).some(([k, v]) => !k.trim() || !v);
    });

    // Check 2: draft rows currently shown in PropertiesPanel that have a
    // responseKey filled but no fieldKey selected — these are intentionally
    // excluded from response_mapping by persistMapping, so check 1 misses them.
    if (incompleteMappings || mappingDraftErrors) {
      toast.error('Please set a Target Field for every Response Mapping row before saving.');
      return;
    }
    
    setSaveStatus('saving');
    try {
      const payload = buildUpdatePayload(
        schema.components,
        formId,
        stepKey,
        stepMeta?.hashKey ?? '',
        stepMeta?.version ?? 1
      );
      const res = await fetch(
        'http://192.168.6.6/www8/2013-Backend/api/v1/formBuilder/updateFormStep',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'X-tenant-code': 'demo' },
          body:    JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Update failed');

      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        onBack?.();
      }, 800);
    } catch (e: any) {
      console.error('[FormBuilder] Save error', e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // ── Component Library ─────────────────────────────────────────────────────

  const renderComponentLibrary = () => {
    if (dtLoading) {
      return (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm">Loading types…</span>
        </div>
      );
    }
    if (dtError) {
      return (
        <div className="flex flex-col items-center py-6 text-destructive text-sm gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load data types</span>
        </div>
      );
    }

    if (selectedDataType) {
      return (
        <div className="space-y-2">
          <button
            onClick={() => { setSelectedDataType(null); setFieldSearch(''); }}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← Back to types
          </button>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {selectedDataType} fields
          </p>
          {/* Search box — shown once fields are loaded */}
          {!fkLoading && !fkError && fieldKeys.length > 0 && (
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <Input
                value={fieldSearch}
                onChange={(e) => setFieldSearch(e.target.value)}
                placeholder="Search fields…"
                className="h-8 pl-8 text-xs"
              />
            </div>
          )}
          {fkLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-xs">Loading fields…</span>
            </div>
          ) : fkError ? (
            <div className="flex flex-col items-center py-4 text-destructive text-xs gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to load fields</span>
            </div>
          ) : fieldKeys.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No fields available</p>
          ) : (
            (() => {
              const q = fieldSearch.trim().toLowerCase();
              const filtered = q
                ? fieldKeys.filter(
                    (item) =>
                      item.field_label.toLowerCase().includes(q) ||
                      item.field_key.toLowerCase().includes(q)
                  )
                : fieldKeys;
              return filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  {q ? `No fields matching "${fieldSearch}"` : 'No fields available'}
                </p>
              ) : (
                filtered.map((item) => {
                  const alreadyAdded = schema.components.some((c) => c.key === item.field_key);
                  return (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-2 px-3 text-left"
                      disabled={alreadyAdded}
                      onClick={() => handleAddFromFieldKey(item)}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">{item.field_label}</span>
                        <span className="text-xs text-muted-foreground truncate">{item.field_key}</span>
                        {item.is_derived === 1 && item.depends_on_field_key && (
                          <span className="text-xs text-primary truncate">
                            derived from: {item.depends_on_field_key}
                          </span>
                        )}
                      </div>
                      {alreadyAdded && (
                        <Badge variant="secondary" className="ml-auto text-xs shrink-0">Added</Badge>
                      )}
                    </Button>
                  );
                })
              );
            })()
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {dataTypes.map((dt) => (
          <Button
            key={dt}
            variant="outline"
            className="w-full justify-start h-auto py-2.5"
            onClick={() => setSelectedDataType(dt)}
          >
            <div className="flex items-center gap-2 w-full">
              <div className="p-1.5 bg-muted rounded shrink-0">
                {DATA_TYPE_ICONS[dt] ?? <Type className="h-4 w-4" />}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-medium text-sm capitalize">{dt}</div>
                <div className="text-xs text-muted-foreground">Browse fields →</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    );
  };

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    // No min-h-screen / bg wrapper — the protected layout already provides that.
    // Use flex-col gap so it slots cleanly into the layout's <div className="flex flex-1 flex-col p-4 pb-14">
    <div className="flex flex-col gap-5">

      {/* ── Page header — matches the form-edit page style ──────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onBack}
              title="Back to sections"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground truncate">
              {stepName || stepKey || 'Component Builder'}
            </h1>
            <p className="text-sm text-muted-foreground font-mono truncate">
              {stepKey}
              {formId && <span className="ml-2 not-italic">· form #{formId}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {saveStatus === 'saved' && (
            <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded font-medium">
              ✓ Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-destructive bg-destructive/5 border border-destructive/20 px-2 py-1 rounded font-medium">
              ✗ Save failed
            </span>
          )}
          <Button size="sm" onClick={handleSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving'
              ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              : <Save className="h-4 w-4 mr-1.5" />
            }
            {saveStatus === 'saving' ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Step loading / error banners */}
      {stepLoading && (
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 border border-primary/20 px-3 py-2 rounded-lg w-fit">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading step fields…
        </div>
      )}
      {stepError && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg w-fit">
          <AlertCircle className="h-3 w-3" /> Could not load step: {stepError}
        </div>
      )}

      {/* ── 3-column layout ──────────────────────────────────────────────── */}
      {/*
        Using a bg-muted/30 background so Card borders (bg-card + border) are
        clearly visible against it. Previously bg-gray-50 ≈ card bg which made
        borders invisible.
      */}
      <div className="rounded-xl bg-muted/30 p-3 sm:p-4">
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-5 items-start">

          {/* ── LEFT — Component Library ─────────────────────────────── */}
          <div className="w-full xl:w-72 2xl:w-80 shrink-0 flex flex-col gap-4
                          xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <GripVertical className="h-4 w-4" /> Component Library
                  </span>
                  {selectedDataType && (
                    <Badge variant="secondary" className="capitalize text-xs">{selectedDataType}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {renderComponentLibrary()}
              </CardContent>
            </Card>
          </div>

          {/* ── CENTER — Canvas / Preview ────────────────────────────── */}
          <div className="w-full min-w-0 flex-1">
            <Card className="border shadow-sm">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <CardHeader className="pb-0 pt-3 px-4">
                  <TabsList className="flex flex-wrap h-auto gap-1 w-full">
                    <TabsTrigger value="components" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1">
                      <GripVertical className="h-3.5 w-3.5" />
                      Canvas
                      <Badge variant="secondary" className="ml-1 text-xs">{schema.components.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1">
                      <Zap className="h-3.5 w-3.5" /> Preview
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-4 px-4 pb-4">
                  <TabsContent value="components" className="mt-0">
                    <ComponentCanvas
                      schema={schema}
                      selectedComponent={selectedComponent}
                      onSelectComponent={setSelectedComponent}
                      onUpdateComponent={handleUpdateComponent}
                      onDeleteComponent={handleDeleteComponent}
                      onReorderComponents={handleReorderComponents}
                      onAddComponent={() => {}}
                    />
                  </TabsContent>
                  {/* <TabsContent value="apis" className="mt-0">
                    {selectedApi ? (
                      <ApiBuilder
                        api={selectedApi}
                        components={schema.components}
                        onUpdate={handleUpdateApi}
                        onDelete={handleDeleteApi}
                      />
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                        <Globe className="h-10 w-10 mb-3" />
                        <p className="font-medium">No API selected</p>
                        <p className="text-sm mt-1">Select from the left or create one</p>
                        <Button className="mt-4" size="sm" onClick={handleAddApi}>Create New API</Button>
                      </div>
                    )}
                  </TabsContent> */}
                  <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-lg p-4 bg-card">
                      <FormRuntimeComponent
                        schema={schema}
                        onDataChange={(data) => console.log('Form data:', data)}
                      />
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* ── RIGHT — Properties Panel ─────────────────────────────── */}
          <div className="w-full xl:w-96 2xl:w-[420px] shrink-0
                          xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">
                  {selectedComponent ? 'Component Properties' :
                   selectedApi       ? 'API Configuration'    : 'Properties'}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedComponent ? `Editing: ${selectedComponent.type} — ${selectedComponent.key}` :
                   selectedApi       ? `Editing: ${selectedApi.name}` :
                   'Select a component or API to edit'}
                </p>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                {selectedComponent ? (
                  <PropertiesPanel
                    component={selectedComponent}
                    components={schema.components}
                    apis={schema.apis || []}
                    apiSources={apiSources}
                    onUpdate={handleUpdateComponent}
                    onDelete={handleDeleteComponent}
                    onMappingDraftHasErrors={setMappingDraftErrors}
                  />
                ) : selectedApi ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Switch to API tab to edit configuration</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setActiveTab('apis')}>
                      Go to API Tab
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <GripVertical className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-sm">Nothing selected</p>
                    <p className="text-xs mt-1">Click any component on the canvas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}