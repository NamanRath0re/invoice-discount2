"use client"

import { useState, useEffect } from "react"
import {
  Eye,
  EyeOff,
  Link,
  Zap,
  RefreshCw,
  Settings,
  Plus,
  Trash2,
  Copy,
  AlertCircle,
  X,
  Database,
  Globe,
} from "lucide-react"
import {
  ComponentSchema,
  ApiSchema,
  RuleGroup,
  Condition,
} from "@/types/schema"
import { APISource } from "@/hooks/useFormBuilderApis"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface PropertiesPanelProps {
  component: ComponentSchema
  components: ComponentSchema[]
  apis: ApiSchema[]
  apiSources?: APISource[]
  onUpdate: (componentId: string, updates: Partial<ComponentSchema>) => void
  onDelete: (componentId: string) => void
}

export default function PropertiesPanel({
  component,
  components,
  apis,
  apiSources = [],
  onUpdate,
  onDelete,
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [newOptionKey, setNewOptionKey] = useState("")
  const [newOptionLabel, setNewOptionLabel] = useState("")

  // ── Local options draft — prevents focus loss on every keystroke ─────────
  // We keep a local copy and only push to parent onBlur / add / remove.
  const [optionsDraft, setOptionsDraft] = useState<Array<{ key: string; label: string }>>(
    () => component.options?.static ?? []
  )

  // Sync draft when the selected component changes (different field selected)
  useEffect(() => {
    setOptionsDraft(component.options?.static ?? [])
  }, [component.id])

  const persistOptions = (draft: Array<{ key: string; label: string }>) => {
    onUpdate(component.id, {
      options: { ...component.options, static: draft },
    })
  }

  // ── Option helpers ───────────────────────────────────────────────────────
  const handleAddOption = () => {
    if (!newOptionKey.trim() || !newOptionLabel.trim()) return
    const updated = [...optionsDraft, { key: newOptionKey.trim(), label: newOptionLabel.trim() }]
    setOptionsDraft(updated)
    persistOptions(updated)
    setNewOptionKey("")
    setNewOptionLabel("")
  }

  const handleRemoveOption = (index: number) => {
    const updated = optionsDraft.filter((_, i) => i !== index)
    setOptionsDraft(updated)
    persistOptions(updated)
  }

  // Update draft locally on every keystroke — no parent re-render
  const handleOptionDraftChange = (index: number, field: "key" | "label", value: string) => {
    setOptionsDraft((prev) => prev.map((o, i) => i === index ? { ...o, [field]: value } : o))
  }

  // Push to parent only on blur
  const handleOptionBlur = () => {
    persistOptions(optionsDraft)
  }

  // ── Rule helpers ─────────────────────────────────────────────────────────
  const handleAddRule = (ruleType: "visibility" | "enabled") => {
    onUpdate(component.id, { [ruleType]: { operator: "AND", conditions: [] } })
  }

  const handleAddCondition = (ruleType: "visibility" | "enabled") => {
    const ruleGroup = component[ruleType] || { operator: "AND", conditions: [] }
    const newCondition: Condition = {
      source: "component",
      key: "",
      operator: "eq",
      value: "",
    }
    onUpdate(component.id, {
      [ruleType]: {
        ...ruleGroup,
        conditions: [...ruleGroup.conditions, newCondition],
      },
    })
  }

  const handleUpdateCondition = (
    ruleType: "visibility" | "enabled",
    index: number,
    updates: Partial<Condition>
  ) => {
    const ruleGroup = component[ruleType]
    if (!ruleGroup) return
    const newConditions = [...ruleGroup.conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    onUpdate(component.id, {
      [ruleType]: { ...ruleGroup, conditions: newConditions },
    })
  }

  const handleRemoveCondition = (
    ruleType: "visibility" | "enabled",
    index: number
  ) => {
    const ruleGroup = component[ruleType]
    if (!ruleGroup) return
    onUpdate(component.id, {
      [ruleType]: {
        ...ruleGroup,
        conditions: ruleGroup.conditions.filter((_, i) => i !== index),
      },
    })
  }

  // ── Action helpers ───────────────────────────────────────────────────────
  const handleAddAction = () => {
    const currentActions = (component as any).actions || []
    onUpdate(component.id, {
      actions: [
        ...currentActions,
        { type: "always" },
      ],
    } as any)
  }

  const handleUpdateAction = (index: number, updates: any) => {
    const currentActions = (component as any).actions || []
    const newActions = [...currentActions]
    newActions[index] = { ...newActions[index], ...updates }
    onUpdate(component.id, { actions: newActions } as any)
  }

  const handleRemoveAction = (index: number) => {
    onUpdate(component.id, {
      actions: ((component as any).actions || []).filter((_: any, i: number) => i !== index),
    } as any)
  }

  const duplicateComponent = () => {
    console.log("Duplicate component:", {
      ...component,
      id: `${component.id}_copy_${Date.now()}`,
      key: `${component.key}_copy`,
      label: `${component.label} (Copy)`,
    })
  }

  const OPERATORS = [
    { value: "equals",        label: "Equals" },
    { value: "not_equals",    label: "Not Equals" },
    { value: "contains",      label: "Contains" },
    { value: "not_contains",  label: "Not Contains" },
    { value: "is_empty",      label: "Is Empty" },
    { value: "is_not_empty",  label: "Is Not Empty" },
    { value: "greater_than",  label: "Greater Than" },
    { value: "less_than",     label: "Less Than" },
  ]

  const renderActionsConfig = () => {
    const actions: any[] = (component as any).actions || []
    const otherFields = components.filter((c) => c.id !== component.id)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Visibility Actions</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control when this field is shown or hidden
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleAddAction}>
            <Plus className="mr-1 h-3 w-3" /> Add Action
          </Button>
        </div>

        {actions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground rounded-lg border border-dashed border-border">
            <EyeOff className="mx-auto mb-2 h-7 w-7 opacity-30" />
            <p className="text-sm font-medium">No actions yet</p>
            <p className="text-xs mt-1 text-muted-foreground">
              Add an action to control this field's visibility
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action: any, index: number) => {
              const isConditional = action.type === "conditional"
              const noValueOps = ["is_empty", "is_not_empty"]

              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-muted/20 overflow-hidden"
                >
                  {/* Action header */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-card">
                    <div className="flex items-center gap-2">
                      {isConditional
                        ? <Eye className="h-3.5 w-3.5 text-primary" />
                        : <Zap className="h-3.5 w-3.5 text-amber-500" />
                      }
                      <span className="text-xs font-semibold">Action {index + 1}</span>
                      <Badge
                        variant={isConditional ? "default" : "secondary"}
                        className="text-[10px] px-1.5 py-0 capitalize"
                      >
                        {action.type || "always"}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleRemoveAction(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>

                  <div className="p-3 space-y-3">
                    {/* Type toggle — Always / Conditional */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Visibility Type</Label>
                      <Select
                        value={action.type || "always"}
                        onValueChange={(v) => {
                          if (v === "always") {
                            handleUpdateAction(index, {
                              type: "always",
                              trigger: undefined,
                              field: undefined,
                              operator: undefined,
                              value: undefined,
                            })
                          } else {
                            handleUpdateAction(index, {
                              type: "conditional",
                              trigger: "onChange",
                              field: action.field || "",
                              operator: action.operator || "equals",
                              value: action.value || "",
                            })
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="always">
                            Always visible
                          </SelectItem>
                          <SelectItem value="conditional">
                            Conditional
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {!isConditional && (
                        <p className="text-[10px] text-muted-foreground">
                          This field is always shown regardless of other values
                        </p>
                      )}
                    </div>

                    {/* Conditional config */}
                    {isConditional && (
                      <>
                        {/* Trigger */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Trigger</Label>
                          <Select
                            value={action.trigger || "onChange"}
                            onValueChange={(v) =>
                              handleUpdateAction(index, { trigger: v })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="onChange">On Change</SelectItem>
                              <SelectItem value="onLoad">On Load</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Field selector */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Watch Field <span className="text-destructive">*</span>
                          </Label>
                          {otherFields.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground italic">
                              No other fields on canvas yet
                            </p>
                          ) : (
                            <Select
                              value={action.field || ""}
                              onValueChange={(v) =>
                                handleUpdateAction(index, { field: v })
                              }
                            >
                              <SelectTrigger
                                className={`h-8 text-xs ${!action.field ? "border-destructive" : ""}`}
                              >
                                <SelectValue placeholder="Select a field…" />
                              </SelectTrigger>
                              <SelectContent>
                                {otherFields.map((comp) => (
                                  <SelectItem key={comp.id} value={comp.key}>
                                    {comp.label}
                                    <span className="ml-1 text-[10px] text-muted-foreground">
                                      ({comp.key})
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {!action.field && (
                            <p className="text-[10px] text-destructive">
                              Field is required
                            </p>
                          )}
                        </div>

                        {/* Operator */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Operator</Label>
                          <Select
                            value={action.operator || "equals"}
                            onValueChange={(v) =>
                              handleUpdateAction(index, {
                                operator: v,
                                ...(noValueOps.includes(v) ? { value: undefined } : {}),
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATORS.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Value — hidden for is_empty / is_not_empty */}
                        {!noValueOps.includes(action.operator || "equals") && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Value <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              className={`h-8 text-xs ${!action.value?.toString().trim() ? "border-destructive" : ""}`}
                              placeholder="e.g. salaried, yes, true…"
                              value={action.value || ""}
                              onChange={(e) =>
                                handleUpdateAction(index, { value: e.target.value })
                              }
                            />
                            {!action.value?.toString().trim() && (
                              <p className="text-[10px] text-destructive">
                                Value is required
                              </p>
                            )}
                          </div>
                        )}

                        {/* Summary pill */}
                        {action.field && (action.value || noValueOps.includes(action.operator)) && (
                          <div className="rounded-md bg-primary/5 border border-primary/20 px-2.5 py-2">
                            <p className="text-[11px] text-primary font-medium leading-relaxed">
                              Show when{" "}
                              <span className="font-bold">{action.field}</span>{" "}
                              <span className="italic">
                                {OPERATORS.find((o) => o.value === action.operator)?.label?.toLowerCase() ?? action.operator}
                              </span>
                              {!noValueOps.includes(action.operator) && (
                                <> <span className="font-bold">"{action.value}"</span></>
                              )}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
  const patternValue =
    (component.ui as any).pattern ||
    component.validation?.rules?.find((r: any) => r.type === "pattern")
      ?.value ||
    ""
  const maxLengthValue =
    (component.ui as any).maxLength ??
    component.validation?.rules?.find((r: any) => r.type === "maxLength")
      ?.value ??
    ""
  const minLengthValue =
    (component.ui as any).minLength ??
    component.validation?.rules?.find((r: any) => r.type === "minLength")
      ?.value ??
    ""
  const minValue = (component.ui as any).minValue ?? ""
  const maxValue = (component.ui as any).maxValue ?? ""

  const updateValidationField = (field: "pattern" | "maxLength" | "minLength", val: any) => {
    const ruleType = field === "pattern" ? "pattern" : field === "maxLength" ? "maxLength" : "minLength"
    const rules = (component.validation?.rules || []).filter(
      (r: any) => r.type !== ruleType
    )
    if (val) rules.push({ type: ruleType as any, value: val })
    onUpdate(component.id, {
      ui: { ...component.ui, [field]: val || undefined } as any,
      validation: { ...component.validation, rules },
    })
  }

  const updateUiField = (key: string, val: any) => {
    onUpdate(component.id, {
      ui: { ...component.ui, [key]: val } as any,
    })
  }

  // ── dataSource shorthand ──────────────────────────────────────────────────
  const dataSource = (component as any).dataSource as
    | {
        source_key?: string
        type?: string
        method?: string
        endpoint?: string
        trigger?: string
        value_columns?: Record<string, string>
      }
    | undefined

  const updateDataSource = (patch: Record<string, any>) => {
    onUpdate(component.id, { dataSource: { ...dataSource, ...patch } } as any)
  }

  // ── formUi (visible / editable for the rendered form) ────────────────────
  const formUiVisible = (component as any).formUi?.visible ?? true
  const formUiEditable = (component as any).formUi?.editable ?? true

  const updateFormUi = (patch: { visible?: boolean; editable?: boolean }) => {
    onUpdate(component.id, {
      formUi: { ...((component as any).formUi || {}), ...patch },
    } as any)
  }

  // ── Response mapping rows ─────────────────────────────────────────────────
  // Rows are always persisted to dataSource.response_mapping — including
  // incomplete ones (fieldKey: "") — so the parent can validate them at save
  // time even if this panel has been unmounted (component deselected).
  const [mappingDraft, setMappingDraft] = useState<
    Array<{ responseKey: string; fieldKey: string }>
  >(() =>
    Object.entries((dataSource as any)?.response_mapping || {}).map(([k, v]) => ({
      responseKey: k,
      fieldKey: v as string,
    }))
  )

  // Sync draft when the selected component changes
  useEffect(() => {
    const draft = Object.entries(
      (component as any).dataSource?.response_mapping || {}
    ).map(([k, v]) => ({
      responseKey: k,
      fieldKey: v as string,
    }))
    setMappingDraft(draft)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component.id, dataSource?.source_key])

  const persistMapping = (
    rows: Array<{ responseKey: string; fieldKey: string }>
  ) => {
    // Persist ALL rows — even incomplete ones (fieldKey: "") — so that
    // handleSave in ComponentBuilder can detect missing target fields
    // regardless of whether this panel is currently mounted.
    const newMapping: Record<string, string> = {}
    rows.forEach((row) => {
      if (row.responseKey.trim()) {
        newMapping[row.responseKey.trim()] = row.fieldKey // may be ""
      }
    })
    updateDataSource({ response_mapping: newMapping })
  }

  const updateMappingRow = (
    index: number,
    responseKey: string,
    fieldKey: string
  ) => {
    const updated = mappingDraft.map((r, i) =>
      i === index ? { responseKey, fieldKey } : r
    )
    setMappingDraft(updated)
    persistMapping(updated)
  }

  const addMappingRow = () => {
    const updated = [...mappingDraft, { responseKey: "", fieldKey: "" }]
    setMappingDraft(updated)
    persistMapping(updated)
  }

  const removeMappingRow = (index: number) => {
    const updated = mappingDraft.filter((_, i) => i !== index)
    setMappingDraft(updated)
    persistMapping(updated)
  }

  const mappingEntries = mappingDraft

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderValueSourceConfig = () => {
    if (component.type === "button" || component.type === "label") return null
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Default Value Source</Label>
          <Select
            value={component.value?.source || "static"}
            onValueChange={(value: any) =>
              onUpdate(component.id, {
                value: {
                  ...component.value,
                  source: value,
                  ...(value === "static"
                    ? { apiId: undefined, componentId: undefined }
                    : {}),
                  ...(value === "api" ? { componentId: undefined } : {}),
                  ...(value === "component" ? { apiId: undefined } : {}),
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="static">Static Value</SelectItem>
              <SelectItem value="api">From API</SelectItem>
              <SelectItem value="component">From Another Field</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {component.value?.source === "static" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Default Value</Label>
            <Input
              value={component.value?.default || ""}
              onChange={(e) =>
                onUpdate(component.id, {
                  value: { ...component.value, default: e.target.value },
                })
              }
              placeholder="Enter default value..."
            />
          </div>
        )}

        {component.value?.source === "api" && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">API Endpoint</Label>
              <Select
                value={component.value?.apiId || ""}
                onValueChange={(value) =>
                  onUpdate(component.id, {
                    value: { ...component.value, apiId: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select API..." />
                </SelectTrigger>
                <SelectContent>
                  {apis.map((api) => (
                    <SelectItem key={api.id} value={api.id}>
                      {api.name} ({api.method})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Response Path</Label>
              <Input
                value={component.value?.responsePath || ""}
                onChange={(e) =>
                  onUpdate(component.id, {
                    value: { ...component.value, responsePath: e.target.value },
                  })
                }
                placeholder="data.items[0].value"
              />
              <p className="text-xs text-muted-foreground">
                JSON path to extract value from API response
              </p>
            </div>
          </>
        )}

        {component.value?.source === "component" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Source Field</Label>
            <Select
              value={component.value?.componentId || ""}
              onValueChange={(value) =>
                onUpdate(component.id, {
                  value: { ...component.value, componentId: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field..." />
              </SelectTrigger>
              <SelectContent>
                {components
                  .filter(
                    (c) =>
                      c.id !== component.id &&
                      c.type !== "button" &&
                      c.type !== "label"
                  )
                  .map((comp) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.label} ({comp.key})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    )
  }

  const renderOptionsConfig = () => {
    if (!["select", "radio"].includes(component.type)) return null
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Options Source</Label>
          <Select
            value={component.options?.dynamic?.source ? "dynamic" : "static"}
            onValueChange={(value) => {
              if (value === "static") {
                onUpdate(component.id, {
                  options: {
                    static: component.options?.static || [],
                    dynamic: undefined,
                  },
                })
              } else {
                onUpdate(component.id, {
                  options: {
                    ...component.options,
                    dynamic: { source: "component", dependsOn: "", map: {} },
                  },
                })
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="static">Static List</SelectItem>
              <SelectItem value="dynamic">Dynamic Options</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!component.options?.dynamic ? (
          <div className="space-y-2">
            <Label className="text-xs">Static Options</Label>
            <div className="space-y-2">
              {optionsDraft.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 space-y-1">
                    <Input
                      value={option.key}
                      onChange={(e) => handleOptionDraftChange(index, "key", e.target.value)}
                      onBlur={handleOptionBlur}
                      placeholder="Option key"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={option.label}
                      onChange={(e) => handleOptionDraftChange(index, "label", e.target.value)}
                      onBlur={handleOptionBlur}
                      placeholder="Display label"
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <div className="space-y-2 rounded-lg border bg-muted/40 p-2">
                <Input
                  value={newOptionKey}
                  onChange={(e) => setNewOptionKey(e.target.value)}
                  placeholder="New option key"
                  className="h-8 text-xs"
                />
                <Input
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddOption()
                    }
                  }}
                  placeholder="Display label"
                  className="h-8 text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleAddOption}
                  disabled={!newOptionKey.trim() || !newOptionLabel.trim()}
                  className="w-full"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Option
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Dynamic Source</Label>
              <Select
                value={component.options.dynamic.source}
                onValueChange={(value: any) =>
                  onUpdate(component.id, {
                    options: {
                      ...component.options,
                      dynamic: {
                        ...component.options!.dynamic!,
                        source: value,
                      },
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="component">From Another Field</SelectItem>
                  <SelectItem value="api">From API Response</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {component.options.dynamic.source === "component" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Depends On Field</Label>
                <Select
                  value={component.options.dynamic.dependsOn || ""}
                  onValueChange={(value) =>
                    onUpdate(component.id, {
                      options: {
                        ...component.options,
                        dynamic: {
                          ...component.options!.dynamic!,
                          dependsOn: value,
                        },
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {components
                      .filter(
                        (c) =>
                          c.id !== component.id &&
                          ["select", "radio"].includes(c.type)
                      )
                      .map((comp) => (
                        <SelectItem key={comp.id} value={comp.key}>
                          {comp.label} ({comp.key})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderRuleConfig = (
    ruleType: "visibility" | "enabled",
    title: string
  ) => {
    const ruleGroup = component[ruleType]
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{title}</span>
            {ruleGroup && (
              <Badge variant="outline" className="text-xs">
                {ruleGroup.conditions.length} cond
                {ruleGroup.conditions.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <Switch
            checked={!!ruleGroup}
            onCheckedChange={(checked) => {
              if (checked) handleAddRule(ruleType)
              else onUpdate(component.id, { [ruleType]: undefined })
            }}
          />
        </div>

        {ruleGroup && (
          <div className="space-y-4 rounded-lg border bg-muted/40 p-3">
            <div className="space-y-2">
              <Label className="text-xs">Logic Operator</Label>
              <RadioGroup
                value={ruleGroup.operator}
                onValueChange={(value: "AND" | "OR") =>
                  onUpdate(component.id, {
                    [ruleType]: { ...ruleGroup, operator: value },
                  })
                }
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="AND" id={`${ruleType}-and`} />
                  <Label
                    htmlFor={`${ruleType}-and`}
                    className="text-xs font-normal"
                  >
                    AND – all conditions true
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OR" id={`${ruleType}-or`} />
                  <Label
                    htmlFor={`${ruleType}-or`}
                    className="text-xs font-normal"
                  >
                    OR – any condition true
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Conditions</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddCondition(ruleType)}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>

              {ruleGroup.conditions.length === 0 ? (
                <div className="py-3 text-center text-xs text-muted-foreground">
                  <AlertCircle className="mx-auto mb-1 h-5 w-5 opacity-50" />
                  No conditions yet
                </div>
              ) : (
                ruleGroup.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded border bg-background p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Condition {index + 1}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveCondition(ruleType, index)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Source Field</Label>
                      <Select
                        value={condition.key}
                        onValueChange={(value) =>
                          handleUpdateCondition(ruleType, index, { key: value })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {components
                            .filter((c) => c.id !== component.id)
                            .map((comp) => (
                              <SelectItem key={comp.id} value={comp.key}>
                                {comp.label} ({comp.key})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Operator</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value: any) =>
                          handleUpdateCondition(ruleType, index, {
                            operator: value,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eq">Equals</SelectItem>
                          <SelectItem value="neq">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="empty">Is Empty</SelectItem>
                          <SelectItem value="notEmpty">Is Not Empty</SelectItem>
                          <SelectItem value="gt">Greater Than</SelectItem>
                          <SelectItem value="lt">Less Than</SelectItem>
                          <SelectItem value="gte">≥</SelectItem>
                          <SelectItem value="lte">≤</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {!["empty", "notEmpty"].includes(condition.operator) && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Compare Value</Label>
                        <Input
                          className="h-8 text-xs"
                          value={condition.value || ""}
                          onChange={(e) =>
                            handleUpdateCondition(ruleType, index, {
                              value: e.target.value,
                            })
                          }
                          placeholder="Enter value..."
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Badge variant="outline" className="shrink-0 capitalize">
            {component.type}
          </Badge>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold">{component.label}</h3>
            <p className="truncate text-xs text-muted-foreground">{component.key}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          {/* <Button variant="outline" size="sm" onClick={duplicateComponent} title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </Button> */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(component.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Tabs — 4 tabs, no Display */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="basic" className="py-1.5 text-xs">
            Basic
          </TabsTrigger>
          <TabsTrigger value="actions" className="py-1.5 text-xs">
            Actions
          </TabsTrigger>
          <TabsTrigger value="advanced" className="py-1.5 text-xs">
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* ─────────────────── BASIC TAB ─────────────────────────────── */}
        <TabsContent value="basic" className="space-y-4 pt-3">
          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="component-label" className="text-xs">
              Label
            </Label>
            <Input
              id="component-label"
              value={component.label}
              onChange={(e) =>
                onUpdate(component.id, { label: e.target.value })
              }
            />
          </div>

          {/* Field Key – read-only */}
          <div className="space-y-1.5">
            <Label htmlFor="component-key" className="text-xs">
              Field Key
            </Label>
            <Input
              id="component-key"
              value={component.key}
              readOnly
              disabled
              className="cursor-not-allowed bg-muted text-xs text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Key is fixed and cannot be changed
            </p>
          </div>

          {/* Placeholder */}
          {!["label", "button"].includes(component.type) && (
            <div className="space-y-1.5">
              <Label htmlFor="component-placeholder" className="text-xs">
                Placeholder
              </Label>
              <Input
                id="component-placeholder"
                value={component.ui.placeholder || ""}
                onChange={(e) =>
                  onUpdate(component.id, {
                    ui: { ...component.ui, placeholder: e.target.value },
                  })
                }
                placeholder="Enter placeholder text..."
              />
            </div>
          )}

          {/* Help Text */}
          {component.type !== "button" && (
          <div className="space-y-1.5">
            <Label htmlFor="component-help" className="text-xs">
              Help Text
            </Label>
            <Input
              id="component-help"
              value={component.ui.helpText || ""}
              onChange={(e) =>
                onUpdate(component.id, {
                  ui: { ...component.ui, helpText: e.target.value },
                })
              }
              placeholder="Helper text..."
            />
          </div>
          )}

          {/* Grid Width */}
          <div className="space-y-1.5">
            <Label className="text-xs">Grid Width</Label>
            <Select
              value={String(component.ui.gridColumn)}
              onValueChange={(value) =>
                onUpdate(component.id, {
                  ui: { ...component.ui, gridColumn: parseInt(value) },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2/12 (Tiny)</SelectItem>
                <SelectItem value="3">3/12 (Small)</SelectItem>
                <SelectItem value="4">4/12 (Third)</SelectItem>
                <SelectItem value="6">6/12 (Half)</SelectItem>
                <SelectItem value="8">8/12 (Large)</SelectItem>
                <SelectItem value="12">12/12 (Full)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Type-specific toggles — hidden for button ── */}
          {component.type !== "button" && (<>

          {/* Multi-select toggle — select only */}
          {component.type === "select" && (
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div>
                <Label className="text-sm">Multi-select</Label>
                <p className="text-xs text-muted-foreground">Allow selecting multiple options</p>
              </div>
              <Switch
                checked={(component.ui as any).multiSelect ?? false}
                onCheckedChange={(v) => updateUiField("multiSelect", v)}
              />
            </div>
          )}

          {/* Date range toggle — date only */}
          {component.type === "date" && (
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div>
                <Label className="text-sm">Date Range</Label>
                <p className="text-xs text-muted-foreground">Allow picking a start and end date</p>
              </div>
              <Switch
                checked={(component.ui as any).dateRange ?? false}
                onCheckedChange={(v) => updateUiField("dateRange", v)}
              />
            </div>
          )}

          {/* Multi-upload toggle — file only */}
          {component.type === "file" && (
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div>
                <Label className="text-sm">Multi-upload</Label>
                <p className="text-xs text-muted-foreground">Allow uploading multiple files</p>
              </div>
              <Switch
                checked={(component.ui as any).multiUpload ?? false}
                onCheckedChange={(v) => updateUiField("multiUpload", v)}
              />
            </div>
          )}

          {/* Min / Max value — number & decimal */}
          {["number", "decimal"].includes((component as any).dataType ?? "") && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="component-minval" className="text-xs">Min Value</Label>
                <Input
                  id="component-minval"
                  type="number"
                  placeholder="e.g. 18"
                  value={minValue}
                  onChange={(e) =>
                    updateUiField("minValue", e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="component-maxval" className="text-xs">Max Value</Label>
                <Input
                  id="component-maxval"
                  type="number"
                  placeholder="e.g. 60"
                  value={maxValue}
                  onChange={(e) =>
                    updateUiField("maxValue", e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </div>
            </div>
          )}

          {/* Validation – min-length, max-length + regex (input / textarea only) */}
          {["input", "textarea"].includes(component.type) && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="component-minlength" className="text-xs">
                    Min Length
                  </Label>
                  <Input
                    id="component-minlength"
                    type="number"
                    value={minLengthValue}
                    onChange={(e) =>
                      updateValidationField(
                        "minLength",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="component-maxlength" className="text-xs">
                    Max Length
                  </Label>
                  <Input
                    id="component-maxlength"
                    type="number"
                    value={maxLengthValue}
                    onChange={(e) =>
                      updateValidationField(
                        "maxLength",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="100"
                  />
                </div>
              </div>

              {component.type === "input" && (
                <div className="space-y-1.5">
                  <Label htmlFor="component-pattern" className="text-xs">
                    Pattern (Regex)
                  </Label>
                  <Input
                    id="component-pattern"
                    value={patternValue}
                    onChange={(e) =>
                      updateValidationField(
                        "pattern",
                        e.target.value || undefined
                      )
                    }
                    placeholder="^[A-Za-z0-9]+$"
                  />
                  {patternValue && (
                    <p className="text-xs text-green-600">✓ Regex active</p>
                  )}
                </div>
              )}
            </>
          )}

          </>)}

          {/* Button config */}
          {component.type === "button" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Variant</Label>
                <Select
                  value={(component.ui as any).variant || "default"}
                  onValueChange={(value: any) =>
                    onUpdate(component.id, {
                      ui: { ...component.ui, variant: value } as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="ghost">Ghost</SelectItem>
                    <SelectItem value="destructive">Destructive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Size</Label>
                <Select
                  value={(component.ui as any).size || "default"}
                  onValueChange={(value: any) =>
                    onUpdate(component.id, {
                      ui: { ...component.ui, size: value } as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {renderOptionsConfig()}

          {component.type !== "button" && (<>
          <Separator />

          {/* ── Field Settings ── */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Field Settings
            </h3>
            <div className="space-y-3">
              {/* Required */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="required-toggle" className="text-sm">
                    Required Field
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    User must fill this field
                  </p>
                </div>
                <Switch
                  id="required-toggle"
                  checked={component.ui.required}
                  onCheckedChange={(checked) =>
                    onUpdate(component.id, {
                      ui: { ...component.ui, required: checked },
                    })
                  }
                />
              </div>

              {/* Visible in rendered form */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="visible-toggle" className="text-sm">
                    Visible
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Field is shown to the user
                  </p>
                </div>
                <Switch
                  id="visible-toggle"
                  checked={formUiVisible}
                  onCheckedChange={(checked) =>
                    updateFormUi({ visible: checked })
                  }
                />
              </div>

              {/* Editable in rendered form */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="editable-toggle" className="text-sm">
                    Editable
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    User can interact with this field
                  </p>
                </div>
                <Switch
                  id="editable-toggle"
                  checked={formUiEditable}
                  onCheckedChange={(checked) =>
                    updateFormUi({ editable: checked })
                  }
                />
              </div>
            </div>
          </div>
          </>)}
        </TabsContent>

        {/* ─────────────────── ACTIONS TAB ───────────────────────────── */}
        <TabsContent value="actions" className="space-y-4 pt-3">
          {renderActionsConfig()}
        </TabsContent>

        {/* ─────────────────── ADVANCED TAB ──────────────────────────── */}
        <TabsContent value="advanced" className="space-y-4 pt-3">
          {/* Validation summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Validation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {component.validation?.rules &&
              component.validation.rules.length > 0 ? (
                <div className="space-y-2">
                  {component.validation.rules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded border p-2.5"
                    >
                      <div>
                        <span className="text-xs font-semibold text-foreground capitalize">
                          {rule.type}
                        </span>
                        {rule.value && (
                          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                            {String(rule.value)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const rules = (
                            component.validation?.rules || []
                          ).filter((_, i) => i !== index)
                          onUpdate(component.id, {
                            validation: { ...component.validation, rules },
                          })
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  <AlertCircle className="mx-auto mb-1 h-6 w-6 opacity-50" />
                  No validation rules — configure in Basic tab
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Data Source card ──────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4" /> Data Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enable toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Link to a Data Source</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Auto-fill via API or DB lookup
                  </p>
                </div>
                <Switch
                  checked={!!dataSource}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onUpdate(component.id, {
                        dataSource: {
                          type: "api",
                          method: "GET",
                          endpoint: "",
                          trigger: "onChange",
                          response_mapping: {},
                        },
                      } as any)
                    } else {
                      onUpdate(component.id, { dataSource: undefined } as any)
                    }
                  }}
                />
              </div>

              {dataSource && (() => {
                const sourceKeyMissing = !dataSource.source_key
                const mappingEmpty = mappingEntries.length === 0

                return (
                <div className="space-y-4 rounded-lg border bg-muted/40 p-3">
                  {/* Source selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Select Source <span className="text-destructive">*</span></Label>
                    <Select
                      value={dataSource.source_key || ""}
                      onValueChange={(sourceKey) => {
                        const src = apiSources.find(
                          (s) => s.source_key === sourceKey
                        )
                        if (!src) return
                        const prefilledMapping: Record<string, string> =
                          src.value_columns
                            ? Object.fromEntries(
                                Object.entries(src.value_columns).map(
                                  ([k, v]) => [v, k]
                                )
                              )
                            : {}
                        updateDataSource({
                          source_key: src.source_key,
                          type: src.source_type,
                          method: src.method || "GET",
                          endpoint: src.endpoint || "",
                          response_mapping: prefilledMapping,
                        })
                      }}
                    >
                      <SelectTrigger className={sourceKeyMissing ? "border-destructive ring-1 ring-destructive" : ""}>
                        <SelectValue placeholder="Choose a data source…" />
                      </SelectTrigger>
                      <SelectContent>
                        {apiSources.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            No sources available
                          </SelectItem>
                        ) : (
                          apiSources.map((src) => (
                            <SelectItem key={src.id} value={src.source_key}>
                              <span className="flex items-center gap-1.5">
                                {src.source_type === "api" ? (
                                  <Globe className="h-3 w-3 shrink-0 text-blue-500" />
                                ) : (
                                  <Database className="h-3 w-3 shrink-0 text-purple-500" />
                                )}
                                {src.source_name}
                              </span>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {sourceKeyMissing && (
                      <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> Source API is required
                      </p>
                    )}
                  </div>

                  {/* Endpoint (API type only) */}
                  {dataSource.type === "api" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Endpoint</Label>
                      <Input
                        value={dataSource.endpoint || ""}
                        onChange={(e) =>
                          updateDataSource({ endpoint: e.target.value })
                        }
                        placeholder="/api/master/pincode"
                      />
                    </div>
                  )}

                  {/* Method */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Method</Label>
                    <Select
                      value={dataSource.method || "GET"}
                      onValueChange={(value) =>
                        updateDataSource({ method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ── Trigger ─────────────────────────────────────── */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Trigger</Label>
                    <p className="text-xs text-muted-foreground">
                      When should this data source be called?
                    </p>
                    <Select
                      value={dataSource.trigger || "onChange"}
                      onValueChange={(value) =>
                        updateDataSource({ trigger: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onChange">
                          On Field Value Change
                        </SelectItem>
                        <SelectItem value="onLoad">On Page Load</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ── Response Mapping ──────────────────────────── */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs font-semibold">Response Mapping <span className="text-destructive">*</span></Label>
                        <p className="text-xs text-muted-foreground">
                          API response key → field to fill
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addMappingRow}
                        className="h-7 text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add
                      </Button>
                    </div>

                    {mappingEntries.length === 0 ? (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" /> At least one mapping is required
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                            Response Key
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                            Target Field
                          </span>
                          <span className="w-6" />
                        </div>
                        {mappingEntries.map((row, index) => {
                          const hasError = row.responseKey.trim() !== '' && !row.fieldKey;
                          return (
                            <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                              <Input
                                className="h-8 font-mono text-xs"
                                value={row.responseKey}
                                onChange={(e) => updateMappingRow(index, e.target.value, row.fieldKey)}
                                placeholder="e.g. city"
                              />
                              <Select
                                value={row.fieldKey || ""}
                                onValueChange={(value) => updateMappingRow(index, row.responseKey, value)}
                              >
                                <SelectTrigger className={`h-8 text-xs ${hasError ? 'border-destructive ring-1 ring-destructive' : ''}`}>
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {components.map((comp) => (
                                    <SelectItem key={comp.id} value={comp.key}>
                                      {comp.label}
                                      <span className="ml-1 text-[10px] text-muted-foreground">({comp.key})</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button size="sm" variant="ghost" className="h-8 w-8 shrink-0 p-0" onClick={() => removeMappingRow(index)}>
                                <X className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                              {hasError && (
                                <p className="col-span-3 -mt-1 text-[10px] text-destructive flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> Target field is required
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}