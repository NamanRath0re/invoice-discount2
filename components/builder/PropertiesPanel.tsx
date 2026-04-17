// "use client"

// import { useState, useEffect } from "react"
// import {
//   Eye,
//   Link,
//   Zap,
//   RefreshCw,
//   Settings,
//   Plus,
//   Trash2,
//   Copy,
//   AlertCircle,
//   X,
//   Database,
//   Globe,
// } from "lucide-react"
// import {
//   ComponentSchema,
//   ApiSchema,
//   RuleGroup,
//   Condition,
// } from "@/types/schema"
// import { APISource } from "@/hooks/useFormBuilderApis"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Separator } from "@/components/ui/separator"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// interface PropertiesPanelProps {
//   component: ComponentSchema
//   components: ComponentSchema[]
//   apis: ApiSchema[]
//   apiSources?: APISource[]
//   onUpdate: (componentId: string, updates: Partial<ComponentSchema>) => void
//   onDelete: (componentId: string) => void
// }

// export default function PropertiesPanel({
//   component,
//   components,
//   apis,
//   apiSources = [],
//   onUpdate,
//   onDelete,
// }: PropertiesPanelProps) {
//   const [activeTab, setActiveTab] = useState("basic")
//   const [newOptionKey, setNewOptionKey] = useState("")
//   const [newOptionLabel, setNewOptionLabel] = useState("")

//   // ── Option helpers ───────────────────────────────────────────────────────
//   const handleAddOption = () => {
//     if (!newOptionKey.trim() || !newOptionLabel.trim()) return
//     const currentOptions = component.options?.static || []
//     onUpdate(component.id, {
//       options: {
//         ...component.options,
//         static: [
//           ...currentOptions,
//           { key: newOptionKey.trim(), label: newOptionLabel.trim() },
//         ],
//       },
//     })
//     setNewOptionKey("")
//     setNewOptionLabel("")
//   }

//   const handleRemoveOption = (index: number) => {
//     const currentOptions = component.options?.static || []
//     onUpdate(component.id, {
//       options: {
//         ...component.options,
//         static: currentOptions.filter((_, i) => i !== index),
//       },
//     })
//   }

//   const handleUpdateOption = (index: number, key: string, label: string) => {
//     const currentOptions = component.options?.static || []
//     const updated = [...currentOptions]
//     updated[index] = { key, label }
//     onUpdate(component.id, {
//       options: { ...component.options, static: updated },
//     })
//   }

//   // ── Rule helpers ─────────────────────────────────────────────────────────
//   const handleAddRule = (ruleType: "visibility" | "enabled") => {
//     onUpdate(component.id, { [ruleType]: { operator: "AND", conditions: [] } })
//   }

//   const handleAddCondition = (ruleType: "visibility" | "enabled") => {
//     const ruleGroup = component[ruleType] || { operator: "AND", conditions: [] }
//     const newCondition: Condition = {
//       source: "component",
//       key: "",
//       operator: "eq",
//       value: "",
//     }
//     onUpdate(component.id, {
//       [ruleType]: {
//         ...ruleGroup,
//         conditions: [...ruleGroup.conditions, newCondition],
//       },
//     })
//   }

//   const handleUpdateCondition = (
//     ruleType: "visibility" | "enabled",
//     index: number,
//     updates: Partial<Condition>
//   ) => {
//     const ruleGroup = component[ruleType]
//     if (!ruleGroup) return
//     const newConditions = [...ruleGroup.conditions]
//     newConditions[index] = { ...newConditions[index], ...updates }
//     onUpdate(component.id, {
//       [ruleType]: { ...ruleGroup, conditions: newConditions },
//     })
//   }

//   const handleRemoveCondition = (
//     ruleType: "visibility" | "enabled",
//     index: number
//   ) => {
//     const ruleGroup = component[ruleType]
//     if (!ruleGroup) return
//     onUpdate(component.id, {
//       [ruleType]: {
//         ...ruleGroup,
//         conditions: ruleGroup.conditions.filter((_, i) => i !== index),
//       },
//     })
//   }

//   // ── Action helpers ───────────────────────────────────────────────────────
//   const handleAddAction = () => {
//     const currentActions = component.actions || []
//     onUpdate(component.id, {
//       actions: [
//         ...currentActions,
//         { trigger: "onClick" as const, type: "setValue" as const, payload: {} },
//       ],
//     })
//   }

//   const handleUpdateAction = (index: number, updates: any) => {
//     const currentActions = component.actions || []
//     const newActions = [...currentActions]
//     newActions[index] = { ...newActions[index], ...updates }
//     onUpdate(component.id, { actions: newActions })
//   }

//   const handleRemoveAction = (index: number) => {
//     onUpdate(component.id, {
//       actions: (component.actions || []).filter((_, i) => i !== index),
//     })
//   }

//   const duplicateComponent = () => {
//     console.log("Duplicate component:", {
//       ...component,
//       id: `${component.id}_copy_${Date.now()}`,
//       key: `${component.key}_copy`,
//       label: `${component.label} (Copy)`,
//     })
//   }

//   // ── Derived validation values ─────────────────────────────────────────────
//   const patternValue =
//     (component.ui as any).pattern ||
//     component.validation?.rules?.find((r: any) => r.type === "pattern")
//       ?.value ||
//     ""
//   const maxLengthValue =
//     (component.ui as any).maxLength ??
//     component.validation?.rules?.find((r: any) => r.type === "maxLength")
//       ?.value ??
//     ""

//   const updateValidationField = (field: "pattern" | "maxLength", val: any) => {
//     const ruleType = field === "pattern" ? "pattern" : "maxLength"
//     const rules = (component.validation?.rules || []).filter(
//       (r: any) => r.type !== ruleType
//     )
//     if (val) rules.push({ type: ruleType as any, value: val })
//     onUpdate(component.id, {
//       ui: { ...component.ui, [field]: val || undefined } as any,
//       validation: { ...component.validation, rules },
//     })
//   }

//   // ── dataSource shorthand ──────────────────────────────────────────────────
//   const dataSource = (component as any).dataSource as
//     | {
//         source_key?: string
//         type?: string
//         method?: string
//         endpoint?: string
//         trigger?: string
//         value_columns?: Record<string, string>
//       }
//     | undefined

//   const updateDataSource = (patch: Record<string, any>) => {
//     onUpdate(component.id, { dataSource: { ...dataSource, ...patch } } as any)
//   }

//   // ── formUi (visible / editable for the rendered form) ────────────────────
//   const formUiVisible = (component as any).formUi?.visible ?? true
//   const formUiEditable = (component as any).formUi?.editable ?? true

//   const updateFormUi = (patch: { visible?: boolean; editable?: boolean }) => {
//     onUpdate(component.id, {
//       formUi: { ...((component as any).formUi || {}), ...patch },
//     } as any)
//   }

//   // ── Response mapping rows ─────────────────────────────────────────────────
//   // We keep a local draft array so empty/in-progress rows survive while typing.
//   // Rows are persisted to dataSource.response_mapping only when both key+field are set.
//   const [mappingDraft, setMappingDraft] = useState<
//     Array<{ responseKey: string; fieldKey: string }>
//   >(() =>
//     Object.entries(dataSource?.value_columns || {}).map(([k, v]) => ({
//       responseKey: k,
//       fieldKey: v as string,
//     }))
//   )

//   // Sync draft when the selected component changes
//   useEffect(() => {
//     let draft = Object.entries(
//       (component as any).dataSource?.response_mapping || {}
//     ).map(([k, v]) => ({
//       responseKey: k,
//       fieldKey: v as string,
//     }))

//     console.log(dataSource)
//         console.log(draft)

//     setMappingDraft(draft)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [component.id, dataSource?.source_key])

//   const persistMapping = (
//     rows: Array<{ responseKey: string; fieldKey: string }>
//   ) => {
//     const newMapping: Record<string, string> = {}
//     rows.forEach((row) => {
//       if (row.responseKey.trim() && row.fieldKey) {
//         newMapping[row.responseKey.trim()] = row.fieldKey
//       }
//     })
//     updateDataSource({ response_mapping: newMapping })
//   }

//   const updateMappingRow = (
//     index: number,
//     responseKey: string,
//     fieldKey: string
//   ) => {
//     const updated = mappingDraft.map((r, i) =>
//       i === index ? { responseKey, fieldKey } : r
//     )
//     setMappingDraft(updated)
//     persistMapping(updated)
//   }

//   const addMappingRow = () => {
//     // Add a blank row — no key pre-filled
//     setMappingDraft((prev) => [...prev, { responseKey: "", fieldKey: "" }])
//     // Don't persist yet — nothing to save until user fills it
//   }

//   const removeMappingRow = (index: number) => {
//     const updated = mappingDraft.filter((_, i) => i !== index)
//     setMappingDraft(updated)
//     persistMapping(updated)
//   }

//   const mappingEntries = mappingDraft

//   // ── Render helpers ───────────────────────────────────────────────────────

//   const renderValueSourceConfig = () => {
//     if (component.type === "button" || component.type === "label") return null
//     return (
//       <div className="space-y-4">
//         <div className="space-y-1.5">
//           <Label className="text-xs">Default Value Source</Label>
//           <Select
//             value={component.value?.source || "static"}
//             onValueChange={(value: any) =>
//               onUpdate(component.id, {
//                 value: {
//                   ...component.value,
//                   source: value,
//                   ...(value === "static"
//                     ? { apiId: undefined, componentId: undefined }
//                     : {}),
//                   ...(value === "api" ? { componentId: undefined } : {}),
//                   ...(value === "component" ? { apiId: undefined } : {}),
//                 },
//               })
//             }
//           >
//             <SelectTrigger>
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="static">Static Value</SelectItem>
//               <SelectItem value="api">From API</SelectItem>
//               <SelectItem value="component">From Another Field</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {component.value?.source === "static" && (
//           <div className="space-y-1.5">
//             <Label className="text-xs">Default Value</Label>
//             <Input
//               value={component.value?.default || ""}
//               onChange={(e) =>
//                 onUpdate(component.id, {
//                   value: { ...component.value, default: e.target.value },
//                 })
//               }
//               placeholder="Enter default value..."
//             />
//           </div>
//         )}

//         {component.value?.source === "api" && (
//           <>
//             <div className="space-y-1.5">
//               <Label className="text-xs">API Endpoint</Label>
//               <Select
//                 value={component.value?.apiId || ""}
//                 onValueChange={(value) =>
//                   onUpdate(component.id, {
//                     value: { ...component.value, apiId: value },
//                   })
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select API..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {apis.map((api) => (
//                     <SelectItem key={api.id} value={api.id}>
//                       {api.name} ({api.method})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-1.5">
//               <Label className="text-xs">Response Path</Label>
//               <Input
//                 value={component.value?.responsePath || ""}
//                 onChange={(e) =>
//                   onUpdate(component.id, {
//                     value: { ...component.value, responsePath: e.target.value },
//                   })
//                 }
//                 placeholder="data.items[0].value"
//               />
//               <p className="text-xs text-gray-400">
//                 JSON path to extract value from API response
//               </p>
//             </div>
//           </>
//         )}

//         {component.value?.source === "component" && (
//           <div className="space-y-1.5">
//             <Label className="text-xs">Source Field</Label>
//             <Select
//               value={component.value?.componentId || ""}
//               onValueChange={(value) =>
//                 onUpdate(component.id, {
//                   value: { ...component.value, componentId: value },
//                 })
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select field..." />
//               </SelectTrigger>
//               <SelectContent>
//                 {components
//                   .filter(
//                     (c) =>
//                       c.id !== component.id &&
//                       c.type !== "button" &&
//                       c.type !== "label"
//                   )
//                   .map((comp) => (
//                     <SelectItem key={comp.id} value={comp.id}>
//                       {comp.label} ({comp.key})
//                     </SelectItem>
//                   ))}
//               </SelectContent>
//             </Select>
//           </div>
//         )}
//       </div>
//     )
//   }

//   const renderOptionsConfig = () => {
//     if (!["select", "radio"].includes(component.type)) return null
//     return (
//       <div className="space-y-4">
//         <div className="space-y-1.5">
//           <Label className="text-xs">Options Source</Label>
//           <Select
//             value={component.options?.dynamic?.source ? "dynamic" : "static"}
//             onValueChange={(value) => {
//               if (value === "static") {
//                 onUpdate(component.id, {
//                   options: {
//                     static: component.options?.static || [],
//                     dynamic: undefined,
//                   },
//                 })
//               } else {
//                 onUpdate(component.id, {
//                   options: {
//                     ...component.options,
//                     dynamic: { source: "component", dependsOn: "", map: {} },
//                   },
//                 })
//               }
//             }}
//           >
//             <SelectTrigger>
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="static">Static List</SelectItem>
//               <SelectItem value="dynamic">Dynamic Options</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {!component.options?.dynamic ? (
//           <div className="space-y-2">
//             <Label className="text-xs">Static Options</Label>
//             <div className="space-y-2">
//               {component.options?.static?.map((option, index) => (
//                 <div
//                   key={option.key || index}
//                   className="flex items-center gap-2"
//                 >
//                   <div className="flex-1 space-y-1">
//                     <Input
//                       value={option.key || ""}
//                       onChange={(e) =>
//                         handleUpdateOption(index, e.target.value, option.label)
//                       }
//                       placeholder="Option key"
//                       className="h-8 text-xs"
//                     />
//                     <Input
//                       value={option.label || ""}
//                       onChange={(e) =>
//                         handleUpdateOption(index, option.key, e.target.value)
//                       }
//                       placeholder="Display label"
//                       className="h-8 text-xs"
//                     />
//                   </div>
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={() => handleRemoveOption(index)}
//                   >
//                     <X className="h-4 w-4 text-red-500" />
//                   </Button>
//                 </div>
//               ))}
//               <div className="space-y-2 rounded-lg border bg-gray-50 p-2">
//                 <Input
//                   value={newOptionKey}
//                   onChange={(e) => setNewOptionKey(e.target.value)}
//                   placeholder="New option key"
//                   className="h-8 text-xs"
//                 />
//                 <Input
//                   value={newOptionLabel}
//                   onChange={(e) => setNewOptionLabel(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault()
//                       handleAddOption()
//                     }
//                   }}
//                   placeholder="Display label"
//                   className="h-8 text-xs"
//                 />
//                 <Button
//                   size="sm"
//                   onClick={handleAddOption}
//                   disabled={!newOptionKey.trim() || !newOptionLabel.trim()}
//                   className="w-full"
//                 >
//                   <Plus className="mr-1 h-4 w-4" /> Add Option
//                 </Button>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             <div className="space-y-1.5">
//               <Label className="text-xs">Dynamic Source</Label>
//               <Select
//                 value={component.options.dynamic.source}
//                 onValueChange={(value: any) =>
//                   onUpdate(component.id, {
//                     options: {
//                       ...component.options,
//                       dynamic: {
//                         ...component.options!.dynamic!,
//                         source: value,
//                       },
//                     },
//                   })
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="component">From Another Field</SelectItem>
//                   <SelectItem value="api">From API Response</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             {component.options.dynamic.source === "component" && (
//               <div className="space-y-1.5">
//                 <Label className="text-xs">Depends On Field</Label>
//                 <Select
//                   value={component.options.dynamic.dependsOn || ""}
//                   onValueChange={(value) =>
//                     onUpdate(component.id, {
//                       options: {
//                         ...component.options,
//                         dynamic: {
//                           ...component.options!.dynamic!,
//                           dependsOn: value,
//                         },
//                       },
//                     })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select field..." />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {components
//                       .filter(
//                         (c) =>
//                           c.id !== component.id &&
//                           ["select", "radio"].includes(c.type)
//                       )
//                       .map((comp) => (
//                         <SelectItem key={comp.id} value={comp.key}>
//                           {comp.label} ({comp.key})
//                         </SelectItem>
//                       ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     )
//   }

//   const renderRuleConfig = (
//     ruleType: "visibility" | "enabled",
//     title: string
//   ) => {
//     const ruleGroup = component[ruleType]
//     return (
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <span className="text-sm font-medium">{title}</span>
//             {ruleGroup && (
//               <Badge variant="outline" className="text-xs">
//                 {ruleGroup.conditions.length} cond
//                 {ruleGroup.conditions.length !== 1 ? "s" : ""}
//               </Badge>
//             )}
//           </div>
//           <Switch
//             checked={!!ruleGroup}
//             onCheckedChange={(checked) => {
//               if (checked) handleAddRule(ruleType)
//               else onUpdate(component.id, { [ruleType]: undefined })
//             }}
//           />
//         </div>

//         {ruleGroup && (
//           <div className="space-y-4 rounded-lg border bg-gray-50 p-3">
//             <div className="space-y-2">
//               <Label className="text-xs">Logic Operator</Label>
//               <RadioGroup
//                 value={ruleGroup.operator}
//                 onValueChange={(value: "AND" | "OR") =>
//                   onUpdate(component.id, {
//                     [ruleType]: { ...ruleGroup, operator: value },
//                   })
//                 }
//                 className="flex flex-col gap-2"
//               >
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="AND" id={`${ruleType}-and`} />
//                   <Label
//                     htmlFor={`${ruleType}-and`}
//                     className="text-xs font-normal"
//                   >
//                     AND – all conditions true
//                   </Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="OR" id={`${ruleType}-or`} />
//                   <Label
//                     htmlFor={`${ruleType}-or`}
//                     className="text-xs font-normal"
//                   >
//                     OR – any condition true
//                   </Label>
//                 </div>
//               </RadioGroup>
//             </div>

//             <Separator />

//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <Label className="text-xs">Conditions</Label>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => handleAddCondition(ruleType)}
//                 >
//                   <Plus className="mr-1 h-3 w-3" /> Add
//                 </Button>
//               </div>

//               {ruleGroup.conditions.length === 0 ? (
//                 <div className="py-3 text-center text-xs text-gray-400">
//                   <AlertCircle className="mx-auto mb-1 h-5 w-5 opacity-50" />
//                   No conditions yet
//                 </div>
//               ) : (
//                 ruleGroup.conditions.map((condition, index) => (
//                   <div
//                     key={index}
//                     className="space-y-2 rounded border bg-white p-3"
//                   >
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs font-medium text-gray-600">
//                         Condition {index + 1}
//                       </span>
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         onClick={() => handleRemoveCondition(ruleType, index)}
//                       >
//                         <Trash2 className="h-3 w-3 text-red-500" />
//                       </Button>
//                     </div>
//                     <div className="space-y-1.5">
//                       <Label className="text-xs">Source Field</Label>
//                       <Select
//                         value={condition.key}
//                         onValueChange={(value) =>
//                           handleUpdateCondition(ruleType, index, { key: value })
//                         }
//                       >
//                         <SelectTrigger className="h-8 text-xs">
//                           <SelectValue placeholder="Select field..." />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {components
//                             .filter((c) => c.id !== component.id)
//                             .map((comp) => (
//                               <SelectItem key={comp.id} value={comp.key}>
//                                 {comp.label} ({comp.key})
//                               </SelectItem>
//                             ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-1.5">
//                       <Label className="text-xs">Operator</Label>
//                       <Select
//                         value={condition.operator}
//                         onValueChange={(value: any) =>
//                           handleUpdateCondition(ruleType, index, {
//                             operator: value,
//                           })
//                         }
//                       >
//                         <SelectTrigger className="h-8 text-xs">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="eq">Equals</SelectItem>
//                           <SelectItem value="neq">Not Equals</SelectItem>
//                           <SelectItem value="contains">Contains</SelectItem>
//                           <SelectItem value="empty">Is Empty</SelectItem>
//                           <SelectItem value="notEmpty">Is Not Empty</SelectItem>
//                           <SelectItem value="gt">Greater Than</SelectItem>
//                           <SelectItem value="lt">Less Than</SelectItem>
//                           <SelectItem value="gte">≥</SelectItem>
//                           <SelectItem value="lte">≤</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     {!["empty", "notEmpty"].includes(condition.operator) && (
//                       <div className="space-y-1.5">
//                         <Label className="text-xs">Compare Value</Label>
//                         <Input
//                           className="h-8 text-xs"
//                           value={condition.value || ""}
//                           onChange={(e) =>
//                             handleUpdateCondition(ruleType, index, {
//                               value: e.target.value,
//                             })
//                           }
//                           placeholder="Enter value..."
//                         />
//                       </div>
//                     )}
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     )
//   }

//   const renderActionsConfig = () => (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <Label>Actions</Label>
//         <Button size="sm" variant="outline" onClick={handleAddAction}>
//           <Plus className="mr-1 h-3 w-3" /> Add Action
//         </Button>
//       </div>

//       {!component.actions?.length ? (
//         <div className="py-6 text-center text-gray-400">
//           <Zap className="mx-auto mb-2 h-8 w-8 opacity-50" />
//           <p className="text-sm">No actions configured</p>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {component.actions.map((action, index) => (
//             <div key={index} className="space-y-3 rounded-lg border p-3">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Zap className="h-4 w-4 text-blue-500" />
//                   <span className="text-sm font-medium">
//                     Action {index + 1}
//                   </span>
//                   <Badge variant="outline" className="text-xs">
//                     {action.trigger}
//                   </Badge>
//                 </div>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => handleRemoveAction(index)}
//                 >
//                   <Trash2 className="h-3 w-3 text-red-500" />
//                 </Button>
//               </div>

//               <div className="space-y-1.5">
//                 <Label className="text-xs">Trigger</Label>
//                 <Select
//                   value={action.trigger}
//                   onValueChange={(value: any) =>
//                     handleUpdateAction(index, { trigger: value })
//                   }
//                 >
//                   <SelectTrigger className="h-8 text-xs">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="onClick">On Click</SelectItem>
//                     <SelectItem value="onChange">On Change</SelectItem>
//                     <SelectItem value="onLoad">On Load</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-1.5">
//                 <Label className="text-xs">Action Type</Label>
//                 <Select
//                   value={action.type}
//                   onValueChange={(value: any) =>
//                     handleUpdateAction(index, { type: value })
//                   }
//                 >
//                   <SelectTrigger className="h-8 text-xs">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="setValue">Set Value</SelectItem>
//                     <SelectItem value="clearValue">Clear Value</SelectItem>
//                     <SelectItem value="toggleVisibility">
//                       Toggle Visibility
//                     </SelectItem>
//                     <SelectItem value="resetForm">Reset Form</SelectItem>
//                     <SelectItem value="callApi">Call API</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {action.type === "callApi" && (
//                 <div className="space-y-1.5">
//                   <Label className="text-xs">API Endpoint</Label>
//                   <Select
//                     value={action.payload?.apiId || ""}
//                     onValueChange={(value) =>
//                       handleUpdateAction(index, {
//                         payload: { ...action.payload, apiId: value },
//                       })
//                     }
//                   >
//                     <SelectTrigger className="h-8 text-xs">
//                       <SelectValue placeholder="Select API..." />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {apis.map((api) => (
//                         <SelectItem key={api.id} value={api.id}>
//                           {api.name} ({api.method})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )}

//               {["setValue", "clearValue", "toggleVisibility"].includes(
//                 action.type
//               ) && (
//                 <div className="space-y-1.5">
//                   <Label className="text-xs">Target Components</Label>
//                   <div className="max-h-28 space-y-1 overflow-y-auto rounded border p-2">
//                     {components
//                       .filter((c) => c.id !== component.id)
//                       .map((comp) => (
//                         <label
//                           key={comp.id}
//                           className="flex cursor-pointer items-center gap-2 text-xs"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={action.target?.includes(comp.id) || false}
//                             onChange={(e) => {
//                               const currentTargets = action.target || []
//                               const newTargets = e.target.checked
//                                 ? [...currentTargets, comp.id]
//                                 : currentTargets.filter((id) => id !== comp.id)
//                               handleUpdateAction(index, { target: newTargets })
//                             }}
//                             className="rounded"
//                           />
//                           {comp.label} ({comp.type})
//                         </label>
//                       ))}
//                   </div>
//                 </div>
//               )}

//               {action.type === "setValue" && (
//                 <div className="space-y-1.5">
//                   <Label className="text-xs">Value to Set</Label>
//                   <Input
//                     className="h-8 text-xs"
//                     value={action.payload?.value || ""}
//                     onChange={(e) =>
//                       handleUpdateAction(index, {
//                         payload: { ...action.payload, value: e.target.value },
//                       })
//                     }
//                     placeholder="Enter value..."
//                   />
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )

//   // ── Main render ──────────────────────────────────────────────────────────
//   return (
//     <div className="space-y-4">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-2">
//         <div className="flex min-w-0 items-center gap-2">
//           <Badge variant="outline" className="shrink-0 capitalize">
//             {component.type}
//           </Badge>
//           <div className="min-w-0">
//             <h3 className="truncate text-sm font-bold">{component.label}</h3>
//             <p className="truncate text-xs text-gray-500">{component.key}</p>
//           </div>
//         </div>
//         <div className="flex shrink-0 gap-1">
//           {/* <Button variant="outline" size="sm" onClick={duplicateComponent} title="Duplicate">
//             <Copy className="h-3.5 w-3.5" />
//           </Button> */}
//           <Button
//             variant="destructive"
//             size="sm"
//             onClick={() => onDelete(component.id)}
//             title="Delete"
//           >
//             <Trash2 className="h-3.5 w-3.5" />
//           </Button>
//         </div>
//       </div>

//       <Separator />

//       {/* Tabs — 4 tabs, no Display */}
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid h-auto w-full grid-cols-2">
//           <TabsTrigger value="basic" className="py-1.5 text-xs">
//             Basic
//           </TabsTrigger>
//           {/* <TabsTrigger value="rules"    className="text-xs py-1.5">Rules</TabsTrigger>
//           <TabsTrigger value="actions"  className="text-xs py-1.5">Actions</TabsTrigger> */}
//           <TabsTrigger value="advanced" className="py-1.5 text-xs">
//             Advanced
//           </TabsTrigger>
//         </TabsList>

//         {/* ─────────────────── BASIC TAB ─────────────────────────────── */}
//         <TabsContent value="basic" className="space-y-4 pt-3">
//           {/* Label */}
//           <div className="space-y-1.5">
//             <Label htmlFor="component-label" className="text-xs">
//               Label
//             </Label>
//             <Input
//               id="component-label"
//               value={component.label}
//               onChange={(e) =>
//                 onUpdate(component.id, { label: e.target.value })
//               }
//             />
//           </div>

//           {/* Field Key – read-only */}
//           <div className="space-y-1.5">
//             <Label htmlFor="component-key" className="text-xs">
//               Field Key
//             </Label>
//             <Input
//               id="component-key"
//               value={component.key}
//               readOnly
//               disabled
//               className="cursor-not-allowed bg-gray-50 text-xs text-gray-500"
//             />
//             <p className="text-xs text-gray-400">
//               Key is fixed and cannot be changed
//             </p>
//           </div>

//           {/* Placeholder */}
//           {component.type !== "label" && (
//             <div className="space-y-1.5">
//               <Label htmlFor="component-placeholder" className="text-xs">
//                 Placeholder
//               </Label>
//               <Input
//                 id="component-placeholder"
//                 value={component.ui.placeholder || ""}
//                 onChange={(e) =>
//                   onUpdate(component.id, {
//                     ui: { ...component.ui, placeholder: e.target.value },
//                   })
//                 }
//                 placeholder="Enter placeholder text..."
//               />
//             </div>
//           )}

//           {/* Help Text */}
//           <div className="space-y-1.5">
//             <Label htmlFor="component-help" className="text-xs">
//               Help Text
//             </Label>
//             <Input
//               id="component-help"
//               value={component.ui.helpText || ""}
//               onChange={(e) =>
//                 onUpdate(component.id, {
//                   ui: { ...component.ui, helpText: e.target.value },
//                 })
//               }
//               placeholder="Helper text..."
//             />
//           </div>

//           {/* Grid Width */}
//           <div className="space-y-1.5">
//             <Label className="text-xs">Grid Width</Label>
//             <Select
//               value={String(component.ui.gridColumn)}
//               onValueChange={(value) =>
//                 onUpdate(component.id, {
//                   ui: { ...component.ui, gridColumn: parseInt(value) },
//                 })
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="2">2/12 (Tiny)</SelectItem>
//                 <SelectItem value="3">3/12 (Small)</SelectItem>
//                 <SelectItem value="4">4/12 (Third)</SelectItem>
//                 <SelectItem value="6">6/12 (Half)</SelectItem>
//                 <SelectItem value="8">8/12 (Large)</SelectItem>
//                 <SelectItem value="12">12/12 (Full)</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Validation – max-length + regex (input / textarea only) */}
//           {["input", "textarea"].includes(component.type) && (
//             <>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="component-minlength" className="text-xs">
//                     Min Length
//                   </Label>
//                   <Input
//                     id="component-minlength"
//                     type="number"
//                     value={(component.ui as any).minLength ?? ""}
//                     onChange={(e) =>
//                       onUpdate(component.id, {
//                         ui: {
//                           ...component.ui,
//                           minLength: e.target.value
//                             ? parseInt(e.target.value)
//                             : undefined,
//                         } as any,
//                       })
//                     }
//                     placeholder="0"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label htmlFor="component-maxlength" className="text-xs">
//                     Max Length
//                   </Label>
//                   <Input
//                     id="component-maxlength"
//                     type="number"
//                     value={maxLengthValue}
//                     onChange={(e) =>
//                       updateValidationField(
//                         "maxLength",
//                         e.target.value ? parseInt(e.target.value) : undefined
//                       )
//                     }
//                     placeholder="100"
//                   />
//                 </div>
//               </div>

//               {component.type === "input" && (
//                 <div className="space-y-1.5">
//                   <Label htmlFor="component-pattern" className="text-xs">
//                     Pattern (Regex)
//                   </Label>
//                   <Input
//                     id="component-pattern"
//                     value={patternValue}
//                     onChange={(e) =>
//                       updateValidationField(
//                         "pattern",
//                         e.target.value || undefined
//                       )
//                     }
//                     placeholder="^[A-Za-z0-9]+$"
//                   />
//                   {patternValue && (
//                     <p className="text-xs text-green-600">✓ Regex active</p>
//                   )}
//                 </div>
//               )}
//             </>
//           )}

//           {/* Button config */}
//           {component.type === "button" && (
//             <div className="grid grid-cols-2 gap-3">
//               <div className="space-y-1.5">
//                 <Label className="text-xs">Variant</Label>
//                 <Select
//                   value={(component.ui as any).variant || "default"}
//                   onValueChange={(value: any) =>
//                     onUpdate(component.id, {
//                       ui: { ...component.ui, variant: value } as any,
//                     })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="default">Default</SelectItem>
//                     <SelectItem value="outline">Outline</SelectItem>
//                     <SelectItem value="secondary">Secondary</SelectItem>
//                     <SelectItem value="ghost">Ghost</SelectItem>
//                     <SelectItem value="destructive">Destructive</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-1.5">
//                 <Label className="text-xs">Size</Label>
//                 <Select
//                   value={(component.ui as any).size || "default"}
//                   onValueChange={(value: any) =>
//                     onUpdate(component.id, {
//                       ui: { ...component.ui, size: value } as any,
//                     })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="default">Default</SelectItem>
//                     <SelectItem value="sm">Small</SelectItem>
//                     <SelectItem value="lg">Large</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           )}

//           {renderOptionsConfig()}

//           <Separator />

//           {/* ── Field Settings ── */}
//           <div className="space-y-3">
//             <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
//               Field Settings
//             </h3>
//             <div className="space-y-3">
//               {/* Required */}
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Label htmlFor="required-toggle" className="text-sm">
//                     Required Field
//                   </Label>
//                   <p className="text-xs text-gray-400">
//                     User must fill this field
//                   </p>
//                 </div>
//                 <Switch
//                   id="required-toggle"
//                   checked={component.ui.required}
//                   onCheckedChange={(checked) =>
//                     onUpdate(component.id, {
//                       ui: { ...component.ui, required: checked },
//                     })
//                   }
//                 />
//               </div>

//               {/* Visible in rendered form */}
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Label htmlFor="visible-toggle" className="text-sm">
//                     Visible
//                   </Label>
//                   <p className="text-xs text-gray-400">
//                     Field is shown to the user
//                   </p>
//                 </div>
//                 <Switch
//                   id="visible-toggle"
//                   checked={formUiVisible}
//                   onCheckedChange={(checked) =>
//                     updateFormUi({ visible: checked })
//                   }
//                 />
//               </div>

//               {/* Editable in rendered form */}
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Label htmlFor="editable-toggle" className="text-sm">
//                     Editable
//                   </Label>
//                   <p className="text-xs text-gray-400">
//                     User can interact with this field
//                   </p>
//                 </div>
//                 <Switch
//                   id="editable-toggle"
//                   checked={formUiEditable}
//                   onCheckedChange={(checked) =>
//                     updateFormUi({ editable: checked })
//                   }
//                 />
//               </div>
//             </div>
//           </div>
//         </TabsContent>

//         {/* ─────────────────── ADVANCED TAB ──────────────────────────── */}
//         <TabsContent value="advanced" className="space-y-4 pt-3">
//           {/* Validation summary */}
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm">Validation Rules</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {component.validation?.rules &&
//               component.validation.rules.length > 0 ? (
//                 <div className="space-y-2">
//                   {component.validation.rules.map((rule, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between rounded border p-2.5"
//                     >
//                       <div>
//                         <span className="text-xs font-semibold text-gray-700 capitalize">
//                           {rule.type}
//                         </span>
//                         {rule.value && (
//                           <p className="mt-0.5 font-mono text-xs text-gray-500">
//                             {String(rule.value)}
//                           </p>
//                         )}
//                       </div>
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         onClick={() => {
//                           const rules = (
//                             component.validation?.rules || []
//                           ).filter((_, i) => i !== index)
//                           onUpdate(component.id, {
//                             validation: { ...component.validation, rules },
//                           })
//                         }}
//                       >
//                         <Trash2 className="h-3 w-3 text-red-500" />
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="py-4 text-center text-xs text-gray-400">
//                   <AlertCircle className="mx-auto mb-1 h-6 w-6 opacity-50" />
//                   No validation rules — configure in Basic tab
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* ── Data Source card ──────────────────────────────────────── */}
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="flex items-center gap-2 text-sm">
//                 <Database className="h-4 w-4" /> Data Source
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {/* Enable toggle */}
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Label className="text-sm">Link to a Data Source</Label>
//                   <p className="mt-0.5 text-xs text-gray-400">
//                     Auto-fill via API or DB lookup
//                   </p>
//                 </div>
//                 <Switch
//                   checked={!!dataSource}
//                   onCheckedChange={(checked) => {
//                     if (checked) {
//                       onUpdate(component.id, {
//                         dataSource: {
//                           type: "api",
//                           method: "GET",
//                           endpoint: "",
//                           trigger: "onChange",
//                           response_mapping: {},
//                         },
//                       } as any)
//                     } else {
//                       onUpdate(component.id, { dataSource: undefined } as any)
//                     }
//                   }}
//                 />
//               </div>

//               {dataSource && (
//                 <div className="space-y-4 rounded-lg border bg-gray-50 p-3">
//                   {/* Source selector */}
//                   <div className="space-y-1.5">
//                     <Label className="text-xs">Select Source</Label>
//                     <Select
//                       value={dataSource.source_key || ""}
//                       onValueChange={(sourceKey) => {
//                         const src = apiSources.find(
//                           (s) => s.source_key === sourceKey
//                         )
//                         if (!src) return
//                         const prefilledMapping: Record<string, string> =
//                           src.value_columns
//                             ? Object.fromEntries(
//                                 Object.entries(src.value_columns).map(
//                                   ([k, v]) => [v, k]
//                                 )
//                               )
//                             : {}
//                         updateDataSource({
//                           source_key: src.source_key,
//                           type: src.source_type,
//                           method: src.method || "GET",
//                           endpoint: src.endpoint || "",
//                           response_mapping: prefilledMapping,
//                         })
//                       }}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Choose a data source…" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {apiSources.length === 0 ? (
//                           <SelectItem value="__none" disabled>
//                             No sources available
//                           </SelectItem>
//                         ) : (
//                           apiSources.map((src) => (
//                             <SelectItem key={src.id} value={src.source_key}>
//                               <span className="flex items-center gap-1.5">
//                                 {src.source_type === "api" ? (
//                                   <Globe className="h-3 w-3 shrink-0 text-blue-500" />
//                                 ) : (
//                                   <Database className="h-3 w-3 shrink-0 text-purple-500" />
//                                 )}
//                                 {src.source_name}
//                               </span>
//                             </SelectItem>
//                           ))
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Endpoint (API type only) */}
//                   {dataSource.type === "api" && (
//                     <div className="space-y-1.5">
//                       <Label className="text-xs">Endpoint</Label>
//                       <Input
//                         value={dataSource.endpoint || ""}
//                         onChange={(e) =>
//                           updateDataSource({ endpoint: e.target.value })
//                         }
//                         placeholder="/api/master/pincode"
//                       />
//                     </div>
//                   )}

//                   {/* Method */}
//                   <div className="space-y-1.5">
//                     <Label className="text-xs">Method</Label>
//                     <Select
//                       value={dataSource.method || "GET"}
//                       onValueChange={(value) =>
//                         updateDataSource({ method: value })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="GET">GET</SelectItem>
//                         <SelectItem value="POST">POST</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* ── Trigger ─────────────────────────────────────── */}
//                   <div className="space-y-1.5">
//                     <Label className="text-xs font-semibold">Trigger</Label>
//                     <p className="text-xs text-gray-400">
//                       When should this data source be called?
//                     </p>
//                     <Select
//                       value={dataSource.trigger || "onChange"}
//                       onValueChange={(value) =>
//                         updateDataSource({ trigger: value })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="onChange">
//                           On Field Value Change
//                         </SelectItem>
//                         <SelectItem value="onLoad">On Page Load</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* ── Response Mapping ──────────────────────────── */}
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <Label className="text-xs font-semibold">
//                           Response Mapping
//                         </Label>
//                         <p className="text-xs text-gray-400">
//                           API response key → field to fill
//                         </p>
//                       </div>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={addMappingRow}
//                         className="h-7 text-xs"
//                       >
//                         <Plus className="mr-1 h-3 w-3" /> Add
//                       </Button>
//                     </div>

//                     {mappingEntries.length === 0 ? (
//                       <p className="rounded border bg-white py-2 text-center text-xs text-gray-400">
//                         No mappings — click Add to create one
//                       </p>
//                     ) : (
//                       <div className="space-y-2">
//                         {/* Header */}
//                         <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
//                           <span className="text-[10px] font-semibold text-gray-500 uppercase">
//                             Response Key
//                           </span>
//                           <span className="text-[10px] font-semibold text-gray-500 uppercase">
//                             Target Field
//                           </span>
//                           <span className="w-6" />
//                         </div>
//                         {mappingEntries.map((row, index) => {
//                           const hasError = row.responseKey.trim() !== '' && !row.fieldKey;
//                           return (
//                             <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
//                               <Input
//                                 className="h-8 font-mono text-xs"
//                                 value={row.responseKey}
//                                 onChange={(e) => updateMappingRow(index, e.target.value, row.fieldKey)}
//                                 placeholder="e.g. city"
//                               />
//                               <Select
//                                 value={row.fieldKey || ""}
//                                 onValueChange={(value) => updateMappingRow(index, row.responseKey, value)}
//                               >
//                                 <SelectTrigger className={`h-8 text-xs ${hasError ? 'border-destructive ring-1 ring-destructive' : ''}`}>
//                                   <SelectValue placeholder="Select field" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   {components.map((comp) => (
//                                     <SelectItem key={comp.id} value={comp.key}>
//                                       {comp.label}
//                                       <span className="ml-1 text-[10px] text-muted-foreground">({comp.key})</span>
//                                     </SelectItem>
//                                   ))}
//                                 </SelectContent>
//                               </Select>
//                               <Button size="sm" variant="ghost" className="h-8 w-8 shrink-0 p-0" onClick={() => removeMappingRow(index)}>
//                                 <X className="h-3.5 w-3.5 text-red-500" />
//                               </Button>
//                               {hasError && (
//                                 <p className="col-span-3 -mt-1 text-[10px] text-destructive flex items-center gap-1">
//                                   <AlertCircle className="h-3 w-3" /> Target field is required
//                                 </p>
//                               )}
//                             </div>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>

//                   {/* Source meta info */}
//                   {dataSource.source_key &&
//                     (() => {
//                       const src = apiSources.find(
//                         (s) => s.source_key === dataSource.source_key
//                       )
//                       if (!src) return null
//                       return (
//                         <div className="space-y-1 rounded border bg-white p-2 text-xs text-gray-500">
//                           {src.table_name && (
//                             <div>
//                               <span className="font-medium">Table:</span>{" "}
//                               {src.table_name}
//                             </div>
//                           )}
//                           {src.key_column && (
//                             <div>
//                               <span className="font-medium">Key col:</span>{" "}
//                               {src.key_column}
//                             </div>
//                           )}
//                           {src.input_param && (
//                             <div>
//                               <span className="font-medium">Input param:</span>{" "}
//                               {src.input_param}
//                             </div>
//                           )}
//                           {src.cache_enabled === 1 && (
//                             <div>
//                               <span className="font-medium">Cache TTL:</span>{" "}
//                               {src.cache_ttl}s
//                             </div>
//                           )}
//                         </div>
//                       )
//                     })()}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Dependencies */}
//           {/* <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-sm flex items-center gap-2">
//                 <Link className="h-4 w-4" /> Dependencies
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-2">
//                 {component.value?.source === 'component' && (
//                   <div className="p-2.5 border rounded text-xs">
//                     <div className="flex items-center gap-2 font-medium">
//                       <RefreshCw className="h-3.5 w-3.5 text-blue-500" /> Default Value
//                       <Badge variant="outline">From Field</Badge>
//                     </div>
//                     <p className="text-gray-500 mt-1">
//                       {components.find((c) => c.id === component.value?.componentId)?.label || component.value.componentId}
//                     </p>
//                   </div>
//                 )}
//                 {component.visibility && component.visibility.conditions.length > 0 && (
//                   <div className="p-2.5 border rounded text-xs">
//                     <div className="flex items-center gap-2 font-medium">
//                       <Eye className="h-3.5 w-3.5 text-purple-500" /> Visibility
//                       <Badge variant="outline">{component.visibility.conditions.length} cond{component.visibility.conditions.length !== 1 ? 's' : ''}</Badge>
//                     </div>
//                     <p className="text-gray-500 mt-1">
//                       {component.visibility.conditions.map((c) => components.find((x) => x.key === c.key)?.label || c.key).join(', ')}
//                     </p>
//                   </div>
//                 )}
//                 {component.enabled && component.enabled.conditions.length > 0 && (
//                   <div className="p-2.5 border rounded text-xs">
//                     <div className="flex items-center gap-2 font-medium">
//                       <Settings className="h-3.5 w-3.5 text-orange-500" /> Enable/Disable
//                       <Badge variant="outline">{component.enabled.conditions.length} cond{component.enabled.conditions.length !== 1 ? 's' : ''}</Badge>
//                     </div>
//                     <p className="text-gray-500 mt-1">
//                       {component.enabled.conditions.map((c) => components.find((x) => x.key === c.key)?.label || c.key).join(', ')}
//                     </p>
//                   </div>
//                 )}
//                 {!component.value?.source &&
//                   (!component.visibility || component.visibility.conditions.length === 0) &&
//                   (!component.enabled   || component.enabled.conditions.length === 0) && (
//                   <div className="text-center py-4 text-gray-400 text-xs">
//                     <Link className="h-6 w-6 mx-auto mb-1 opacity-40" />
//                     No dependencies — works independently
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card> */}
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import {
  Eye,
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
  onMappingDraftHasErrors?: (hasErrors: boolean) => void
}

export default function PropertiesPanel({
  component,
  components,
  apis,
  apiSources = [],
  onUpdate,
  onDelete,
  onMappingDraftHasErrors,
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [newOptionKey, setNewOptionKey] = useState("")
  const [newOptionLabel, setNewOptionLabel] = useState("")

  // ── Option helpers ───────────────────────────────────────────────────────
  const handleAddOption = () => {
    if (!newOptionKey.trim() || !newOptionLabel.trim()) return
    const currentOptions = component.options?.static || []
    onUpdate(component.id, {
      options: {
        ...component.options,
        static: [
          ...currentOptions,
          { key: newOptionKey.trim(), label: newOptionLabel.trim() },
        ],
      },
    })
    setNewOptionKey("")
    setNewOptionLabel("")
  }

  const handleRemoveOption = (index: number) => {
    const currentOptions = component.options?.static || []
    onUpdate(component.id, {
      options: {
        ...component.options,
        static: currentOptions.filter((_, i) => i !== index),
      },
    })
  }

  const handleUpdateOption = (index: number, key: string, label: string) => {
    const currentOptions = component.options?.static || []
    const updated = [...currentOptions]
    updated[index] = { key, label }
    onUpdate(component.id, {
      options: { ...component.options, static: updated },
    })
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
    const currentActions = component.actions || []
    onUpdate(component.id, {
      actions: [
        ...currentActions,
        { trigger: "onClick" as const, type: "setValue" as const, payload: {} },
      ],
    })
  }

  const handleUpdateAction = (index: number, updates: any) => {
    const currentActions = component.actions || []
    const newActions = [...currentActions]
    newActions[index] = { ...newActions[index], ...updates }
    onUpdate(component.id, { actions: newActions })
  }

  const handleRemoveAction = (index: number) => {
    onUpdate(component.id, {
      actions: (component.actions || []).filter((_, i) => i !== index),
    })
  }

  const duplicateComponent = () => {
    console.log("Duplicate component:", {
      ...component,
      id: `${component.id}_copy_${Date.now()}`,
      key: `${component.key}_copy`,
      label: `${component.label} (Copy)`,
    })
  }

  // ── Derived validation values ─────────────────────────────────────────────
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

  const updateValidationField = (field: "pattern" | "maxLength", val: any) => {
    const ruleType = field === "pattern" ? "pattern" : "maxLength"
    const rules = (component.validation?.rules || []).filter(
      (r: any) => r.type !== ruleType
    )
    if (val) rules.push({ type: ruleType as any, value: val })
    onUpdate(component.id, {
      ui: { ...component.ui, [field]: val || undefined } as any,
      validation: { ...component.validation, rules },
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
  // We keep a local draft array so empty/in-progress rows survive while typing.
  // Rows are persisted to dataSource.response_mapping only when both key+field are set.
  const [mappingDraft, setMappingDraft] = useState<
    Array<{ responseKey: string; fieldKey: string }>
  >(() =>
    Object.entries(dataSource?.value_columns || {}).map(([k, v]) => ({
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

  // Report draft-level errors to parent so handleSave can block when a row has
  // a responseKey but no fieldKey selected (those rows are intentionally omitted
  // from response_mapping by persistMapping, so the parent's own check misses them).
  useEffect(() => {
    const hasErrors = mappingDraft.some(
      (row) => row.responseKey.trim() !== "" && !row.fieldKey
    )
    onMappingDraftHasErrors?.(hasErrors)
  }, [mappingDraft, onMappingDraftHasErrors])

  // Clear the error flag when this panel unmounts (component deselected)
  useEffect(() => {
    return () => { onMappingDraftHasErrors?.(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persistMapping = (
    rows: Array<{ responseKey: string; fieldKey: string }>
  ) => {
    const newMapping: Record<string, string> = {}
    rows.forEach((row) => {
      if (row.responseKey.trim() && row.fieldKey) {
        newMapping[row.responseKey.trim()] = row.fieldKey
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
    // Add a blank row — no key pre-filled
    setMappingDraft((prev) => [...prev, { responseKey: "", fieldKey: "" }])
    // Don't persist yet — nothing to save until user fills it
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
              <p className="text-xs text-gray-400">
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
              {component.options?.static?.map((option, index) => (
                <div
                  key={option.key || index}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 space-y-1">
                    <Input
                      value={option.key || ""}
                      onChange={(e) =>
                        handleUpdateOption(index, e.target.value, option.label)
                      }
                      placeholder="Option key"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={option.label || ""}
                      onChange={(e) =>
                        handleUpdateOption(index, option.key, e.target.value)
                      }
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
              <div className="space-y-2 rounded-lg border bg-gray-50 p-2">
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
          <div className="space-y-4 rounded-lg border bg-gray-50 p-3">
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
                <div className="py-3 text-center text-xs text-gray-400">
                  <AlertCircle className="mx-auto mb-1 h-5 w-5 opacity-50" />
                  No conditions yet
                </div>
              ) : (
                ruleGroup.conditions.map((condition, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded border bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
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

  const renderActionsConfig = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Actions</Label>
        <Button size="sm" variant="outline" onClick={handleAddAction}>
          <Plus className="mr-1 h-3 w-3" /> Add Action
        </Button>
      </div>

      {!component.actions?.length ? (
        <div className="py-6 text-center text-gray-400">
          <Zap className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">No actions configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {component.actions.map((action, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    Action {index + 1}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {action.trigger}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveAction(index)}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Trigger</Label>
                <Select
                  value={action.trigger}
                  onValueChange={(value: any) =>
                    handleUpdateAction(index, { trigger: value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onClick">On Click</SelectItem>
                    <SelectItem value="onChange">On Change</SelectItem>
                    <SelectItem value="onLoad">On Load</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Action Type</Label>
                <Select
                  value={action.type}
                  onValueChange={(value: any) =>
                    handleUpdateAction(index, { type: value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="setValue">Set Value</SelectItem>
                    <SelectItem value="clearValue">Clear Value</SelectItem>
                    <SelectItem value="toggleVisibility">
                      Toggle Visibility
                    </SelectItem>
                    <SelectItem value="resetForm">Reset Form</SelectItem>
                    <SelectItem value="callApi">Call API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {action.type === "callApi" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">API Endpoint</Label>
                  <Select
                    value={action.payload?.apiId || ""}
                    onValueChange={(value) =>
                      handleUpdateAction(index, {
                        payload: { ...action.payload, apiId: value },
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
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
              )}

              {["setValue", "clearValue", "toggleVisibility"].includes(
                action.type
              ) && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Target Components</Label>
                  <div className="max-h-28 space-y-1 overflow-y-auto rounded border p-2">
                    {components
                      .filter((c) => c.id !== component.id)
                      .map((comp) => (
                        <label
                          key={comp.id}
                          className="flex cursor-pointer items-center gap-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={action.target?.includes(comp.id) || false}
                            onChange={(e) => {
                              const currentTargets = action.target || []
                              const newTargets = e.target.checked
                                ? [...currentTargets, comp.id]
                                : currentTargets.filter((id) => id !== comp.id)
                              handleUpdateAction(index, { target: newTargets })
                            }}
                            className="rounded"
                          />
                          {comp.label} ({comp.type})
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {action.type === "setValue" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Value to Set</Label>
                  <Input
                    className="h-8 text-xs"
                    value={action.payload?.value || ""}
                    onChange={(e) =>
                      handleUpdateAction(index, {
                        payload: { ...action.payload, value: e.target.value },
                      })
                    }
                    placeholder="Enter value..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

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
            <p className="truncate text-xs text-gray-500">{component.key}</p>
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
        <TabsList className="grid h-auto w-full grid-cols-2">
          <TabsTrigger value="basic" className="py-1.5 text-xs">
            Basic
          </TabsTrigger>
          {/* <TabsTrigger value="rules"    className="text-xs py-1.5">Rules</TabsTrigger>
          <TabsTrigger value="actions"  className="text-xs py-1.5">Actions</TabsTrigger> */}
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
              className="cursor-not-allowed bg-gray-50 text-xs text-gray-500"
            />
            <p className="text-xs text-gray-400">
              Key is fixed and cannot be changed
            </p>
          </div>

          {/* Placeholder */}
          {component.type !== "label" && (
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

          {/* Validation – max-length + regex (input / textarea only) */}
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
                    value={(component.ui as any).minLength ?? ""}
                    onChange={(e) =>
                      onUpdate(component.id, {
                        ui: {
                          ...component.ui,
                          minLength: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        } as any,
                      })
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

          <Separator />

          {/* ── Field Settings ── */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
              Field Settings
            </h3>
            <div className="space-y-3">
              {/* Required */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="required-toggle" className="text-sm">
                    Required Field
                  </Label>
                  <p className="text-xs text-gray-400">
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
                  <p className="text-xs text-gray-400">
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
                  <p className="text-xs text-gray-400">
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
                        <span className="text-xs font-semibold text-gray-700 capitalize">
                          {rule.type}
                        </span>
                        {rule.value && (
                          <p className="mt-0.5 font-mono text-xs text-gray-500">
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
                <div className="py-4 text-center text-xs text-gray-400">
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
                  <p className="mt-0.5 text-xs text-gray-400">
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

              {dataSource && (
                <div className="space-y-4 rounded-lg border bg-gray-50 p-3">
                  {/* Source selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Select Source</Label>
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
                      <SelectTrigger>
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
                    <p className="text-xs text-gray-400">
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
                        <Label className="text-xs font-semibold">
                          Response Mapping
                        </Label>
                        <p className="text-xs text-gray-400">
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
                      <p className="rounded border bg-white py-2 text-center text-xs text-gray-400">
                        No mappings — click Add to create one
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase">
                            Response Key
                          </span>
                          <span className="text-[10px] font-semibold text-gray-500 uppercase">
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

                  {/* Source meta info */}
                  {dataSource.source_key &&
                    (() => {
                      const src = apiSources.find(
                        (s) => s.source_key === dataSource.source_key
                      )
                      if (!src) return null
                      return (
                        <div className="space-y-1 rounded border bg-white p-2 text-xs text-gray-500">
                          {src.table_name && (
                            <div>
                              <span className="font-medium">Table:</span>{" "}
                              {src.table_name}
                            </div>
                          )}
                          {src.key_column && (
                            <div>
                              <span className="font-medium">Key col:</span>{" "}
                              {src.key_column}
                            </div>
                          )}
                          {src.input_param && (
                            <div>
                              <span className="font-medium">Input param:</span>{" "}
                              {src.input_param}
                            </div>
                          )}
                          {src.cache_enabled === 1 && (
                            <div>
                              <span className="font-medium">Cache TTL:</span>{" "}
                              {src.cache_ttl}s
                            </div>
                          )}
                        </div>
                      )
                    })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dependencies */}
          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Link className="h-4 w-4" /> Dependencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {component.value?.source === 'component' && (
                  <div className="p-2.5 border rounded text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <RefreshCw className="h-3.5 w-3.5 text-blue-500" /> Default Value
                      <Badge variant="outline">From Field</Badge>
                    </div>
                    <p className="text-gray-500 mt-1">
                      {components.find((c) => c.id === component.value?.componentId)?.label || component.value.componentId}
                    </p>
                  </div>
                )}
                {component.visibility && component.visibility.conditions.length > 0 && (
                  <div className="p-2.5 border rounded text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <Eye className="h-3.5 w-3.5 text-purple-500" /> Visibility
                      <Badge variant="outline">{component.visibility.conditions.length} cond{component.visibility.conditions.length !== 1 ? 's' : ''}</Badge>
                    </div>
                    <p className="text-gray-500 mt-1">
                      {component.visibility.conditions.map((c) => components.find((x) => x.key === c.key)?.label || c.key).join(', ')}
                    </p>
                  </div>
                )}
                {component.enabled && component.enabled.conditions.length > 0 && (
                  <div className="p-2.5 border rounded text-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <Settings className="h-3.5 w-3.5 text-orange-500" /> Enable/Disable
                      <Badge variant="outline">{component.enabled.conditions.length} cond{component.enabled.conditions.length !== 1 ? 's' : ''}</Badge>
                    </div>
                    <p className="text-gray-500 mt-1">
                      {component.enabled.conditions.map((c) => components.find((x) => x.key === c.key)?.label || c.key).join(', ')}
                    </p>
                  </div>
                )}
                {!component.value?.source &&
                  (!component.visibility || component.visibility.conditions.length === 0) &&
                  (!component.enabled   || component.enabled.conditions.length === 0) && (
                  <div className="text-center py-4 text-gray-400 text-xs">
                    <Link className="h-6 w-6 mx-auto mb-1 opacity-40" />
                    No dependencies — works independently
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}
        </TabsContent>
      </Tabs>
    </div>
  )
}