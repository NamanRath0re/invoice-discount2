'use client';

import { useState } from 'react';
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
  X
} from 'lucide-react';
import { ComponentSchema,  ApiSchema, RuleGroup, Condition } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PropertiesPanelProps {
  component: ComponentSchema;
  components: ComponentSchema[];
  apis: ApiSchema[];
  onUpdate: (componentId: string, updates: Partial<ComponentSchema>) => void;
  onDelete: (componentId: string) => void;
}

export default function PropertiesPanel({
  component,
  components,
  apis,
  onUpdate,
  onDelete
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [newOptionKey, setNewOptionKey] = useState('');
  const [newOptionLabel, setNewOptionLabel] = useState('');
  
  const handleAddOption = () => {
    if (!newOptionKey.trim() || !newOptionLabel.trim()) return;
    
    const currentOptions = component.options?.static || [];
    onUpdate(component.id, {
      options: {
        ...component.options,
        static: [...currentOptions, { key: newOptionKey.trim(), label: newOptionLabel.trim() }]
      }
    });
    setNewOptionKey('');
    setNewOptionLabel('');
  };
  
  const handleRemoveOption = (index: number) => {
    const currentOptions = component.options?.static || [];
    onUpdate(component.id, {
      options: {
        ...component.options,
        static: currentOptions.filter((_, i) => i !== index)
      }
    });
  };

  const handleUpdateOption = (index: number, key: string, label: string) => {
    const currentOptions = component.options?.static || [];
    const updated = [...currentOptions];
    updated[index] = { key, label };
    onUpdate(component.id, {
      options: {
        ...component.options,
        static: updated
      }
    });
  };
  
  const handleAddRule = (ruleType: 'visibility' | 'enabled') => {
    const ruleGroup: RuleGroup = {
      operator: 'AND',
      conditions: []
    };
    
    onUpdate(component.id, {
      [ruleType]: ruleGroup
    });
  };
  
  const handleAddCondition = (ruleType: 'visibility' | 'enabled') => {
    const ruleGroup = component[ruleType] || { operator: 'AND', conditions: [] };
    const newCondition: Condition = {
      source: 'component',
      key: '',
      operator: 'eq',
      value: ''
    };
    
    onUpdate(component.id, {
      [ruleType]: {
        ...ruleGroup,
        conditions: [...ruleGroup.conditions, newCondition]
      }
    });
  };
  
  const handleUpdateCondition = (
    ruleType: 'visibility' | 'enabled',
    index: number,
    updates: Partial<Condition>
  ) => {
    const ruleGroup = component[ruleType];
    if (!ruleGroup) return;
    
    const newConditions = [...ruleGroup.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    
    onUpdate(component.id, {
      [ruleType]: {
        ...ruleGroup,
        conditions: newConditions
      }
    });
  };
  
  const handleRemoveCondition = (ruleType: 'visibility' | 'enabled', index: number) => {
    const ruleGroup = component[ruleType];
    if (!ruleGroup) return;
    
    const newConditions = ruleGroup.conditions.filter((_, i) => i !== index);
    
    onUpdate(component.id, {
      [ruleType]: {
        ...ruleGroup,
        conditions: newConditions
      }
    });
  };
  
  const handleAddAction = () => {
    const currentActions = component.actions || [];
    const newAction = {
      trigger: 'onClick' as const,
      type: 'setValue' as const,
      payload: {}
    };
    
    onUpdate(component.id, {
      actions: [...currentActions, newAction]
    });
  };
  
  const handleUpdateAction = (index: number, updates: any) => {
    const currentActions = component.actions || [];
    const newActions = [...currentActions];
    newActions[index] = { ...newActions[index], ...updates };
    
    onUpdate(component.id, {
      actions: newActions
    });
  };
  
  const handleRemoveAction = (index: number) => {
    const currentActions = component.actions || [];
    onUpdate(component.id, {
      actions: currentActions.filter((_, i) => i !== index)
    });
  };
  
  const duplicateComponent = () => {
    const newComponent = {
      ...component,
      id: `${component.id}_copy_${Date.now()}`,
      key: `${component.key}_copy`,
      label: `${component.label} (Copy)`
    };
    
    // This would trigger parent to add new component
    console.log('Duplicate component:', newComponent);
  };
  
  const renderValueSourceConfig = () => {
    if (component.type === 'button' || component.type === 'label') return null;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Default Value Source</Label>
          <Select
            value={component.value?.source || 'static'}
            onValueChange={(value: any) => onUpdate(component.id, {
              value: {
                ...component.value,
                source: value,
                ...(value === 'static' ? { apiId: undefined, componentId: undefined } : {}),
                ...(value === 'api' ? { componentId: undefined } : {}),
                ...(value === 'component' ? { apiId: undefined } : {})
              }
            })}
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
        
        {component.value?.source === 'static' && (
          <div className="space-y-2">
            <Label>Default Value</Label>
            <Input
              value={component.value?.default || ''}
              onChange={(e) => onUpdate(component.id, {
                value: {
                  ...component.value,
                  default: e.target.value
                }
              })}
              placeholder="Enter default value..."
            />
          </div>
        )}
        
        {component.value?.source === 'api' && (
          <>
            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Select
                value={component.value?.apiId || ''}
                onValueChange={(value) => onUpdate(component.id, {
                  value: {
                    ...component.value,
                    apiId: value
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select API..." />
                </SelectTrigger>
                <SelectContent>
                  {apis.map(api => (
                    <SelectItem key={api.id} value={api.id}>
                      {api.name} ({api.method})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Response Path</Label>
              <Input
                value={component.value?.responsePath || ''}
                onChange={(e) => onUpdate(component.id, {
                  value: {
                    ...component.value,
                    responsePath: e.target.value
                  }
                })}
                placeholder="data.items[0].value"
              />
              <p className="text-xs text-gray-500">
                JSON path to extract value from API response
              </p>
            </div>
          </>
        )}
        
        {component.value?.source === 'component' && (
          <div className="space-y-2">
            <Label>Source Field</Label>
            <Select
              value={component.value?.componentId || ''}
              onValueChange={(value) => onUpdate(component.id, {
                value: {
                  ...component.value,
                  componentId: value
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field..." />
              </SelectTrigger>
              <SelectContent>
                {components
                  .filter(c => c.id !== component.id && c.type !== 'button' && c.type !== 'label')
                  .map(comp => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.label} ({comp.key})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };
  
  const renderOptionsConfig = () => {
    if (!['select', 'radio'].includes(component.type)) return null;
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Options Source</Label>
          <Select
            value={component.options?.dynamic?.source ? 'dynamic' : 'static'}
            onValueChange={(value) => {
              if (value === 'static') {
                onUpdate(component.id, {
                  options: {
                    static: component.options?.static || [],
                    dynamic: undefined
                  }
                });
              } else {
                onUpdate(component.id, {
                  options: {
                    ...component.options,
                    dynamic: {
                      source: 'component',
                      dependsOn: '',
                      map: {}
                    }
                  }
                });
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
            <Label>Static Options</Label>
            <div className="space-y-2">
              {component.options?.static?.map((option, index) => (
                <div key={option.key || index} className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      value={option.key || ''}
                      onChange={(e) => handleUpdateOption(index, e.target.value, option.label)}
                      placeholder="Option key"
                      className="text-xs"
                    />
                    <Input
                      value={option.label || ''}
                      onChange={(e) => handleUpdateOption(index, option.key, e.target.value)}
                      placeholder="Display label"
                      className="text-xs"
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
              <div className="space-y-2 p-2 border rounded-lg bg-gray-50">
                <Input
                  value={newOptionKey}
                  onChange={(e) => setNewOptionKey(e.target.value)}
                  placeholder="New option key"
                  className="text-xs"
                />
                <Input
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  placeholder="Display label"
                  className="text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleAddOption}
                  disabled={!newOptionKey.trim() || !newOptionLabel.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dynamic Source</Label>
              <Select
                value={component.options.dynamic.source}
                onValueChange={(value: any) => onUpdate(component.id, {
                  options: {
                    ...component.options,
                    dynamic: {
                      ...component.options!.dynamic!,
                      source: value
                    }
                  }
                })}
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
            
            {component.options.dynamic.source === 'component' && (
              <>
                <div className="space-y-2">
                  <Label>Depends On Field</Label>
                  <Select
                    value={component.options.dynamic.dependsOn || ''}
                    onValueChange={(value) => onUpdate(component.id, {
                      options: {
                        ...component.options,
                        dynamic: {
                          ...component.options!.dynamic!,
                          dependsOn: value
                        }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {components
                        .filter(c => c.id !== component.id && ['select', 'radio'].includes(c.type))
                        .map(comp => (
                          <SelectItem key={comp.id} value={comp.key}>
                            {comp.label} ({comp.key})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {component.options.dynamic.dependsOn && (
                  <div className="space-y-2">
                    <Label>Options Mapping</Label>
                    <p className="text-sm text-gray-500">
                      Define options for each value of the source field
                    </p>
                    {components
                      .find(c => c.key === component.options!.dynamic!.dependsOn)
                      ?.options?.static?.map((sourceOption) => {
                        const sourceKey = sourceOption.key;
                        const existing = component.options?.dynamic?.map?.[sourceKey] || [];
                        const existingStr = existing
                          .map(o => o.key + (o.label && o.label !== o.key ? `:${o.label}` : ''))
                          .join(', ');

                        return (
                          <div key={sourceKey} className="p-3 border rounded space-y-2">
                            <Label className="text-sm font-medium">
                              When &quot;{sourceOption.label}&quot; is selected:
                            </Label>
                            <Input
                              placeholder="Options (comma separated, format: key or key:label)"
                              value={existingStr}
                              onChange={(e) => {
                                const parsed = e.target.value
                                  .split(',')
                                  .map(s => s.trim())
                                  .filter(Boolean)
                                  .map(item => {
                                    const [k, l] = item.split(':').map(p => p.trim());
                                    return { key: k, label: l || k };
                                  });

                                const newMap = {
                                  ...(component.options?.dynamic?.map || {}),
                                  [sourceKey]: parsed
                                };

                                onUpdate(component.id, {
                                  options: {
                                    ...component.options,
                                    dynamic: {
                                      ...component.options!.dynamic!,
                                      map: newMap
                                    }
                                  }
                                });
                              }}
                            />
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
            
            {component.options.dynamic.source === 'api' && (
              <>
                <div className="space-y-2">
                  <Label>API Endpoint</Label>
                  <Select
                    value={component.options.dynamic.apiId || ''}
                    onValueChange={(value) => onUpdate(component.id, {
                      options: {
                        ...component.options,
                        dynamic: {
                          ...component.options!.dynamic!,
                          apiId: value
                        }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select API..." />
                    </SelectTrigger>
                    <SelectContent>
                      {apis.map(api => (
                        <SelectItem key={api.id} value={api.id}>
                          {api.name} ({api.method})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Response Path</Label>
                  <Input
                    value={component.options.dynamic.responsePath || ''}
                    onChange={(e) => onUpdate(component.id, {
                      options: {
                        ...component.options,
                        dynamic: {
                          ...component.options!.dynamic!,
                          responsePath: e.target.value
                        }
                      }
                    })}
                    placeholder="data.items"
                  />
                  <p className="text-xs text-gray-500">
                    JSON path to extract array of options
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderRuleConfig = (ruleType: 'visibility' | 'enabled', title: string) => {
    const ruleGroup = component[ruleType];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{title}</span>
            {ruleGroup && (
              <Badge variant="outline" className="text-xs">
                {ruleGroup.conditions.length} condition{ruleGroup.conditions.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Switch
            checked={!!ruleGroup}
            onCheckedChange={(checked) => {
              if (checked) {
                handleAddRule(ruleType);
              } else {
                onUpdate(component.id, { [ruleType]: undefined });
              }
            }}
          />
        </div>
        
        {ruleGroup && (
          <div className="space-y-4 p-3 border rounded-lg bg-gray-50">
            <div className="space-y-2">
              <Label>Logic Operator</Label>
              <RadioGroup
                value={ruleGroup.operator}
                onValueChange={(value: 'AND' | 'OR') => {
                  onUpdate(component.id, {
                    [ruleType]: {
                      ...ruleGroup,
                      operator: value
                    }
                  });
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="AND" id={`${ruleType}-and`} />
                  <Label htmlFor={`${ruleType}-and`}>AND (all conditions must be true)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OR" id={`${ruleType}-or`} />
                  <Label htmlFor={`${ruleType}-or`}>OR (any condition must be true)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Conditions</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddCondition(ruleType)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Condition
                </Button>
              </div>
              
              {ruleGroup.conditions.length === 0 ? (
                <div className="text-center py-3 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No conditions configured</p>
                  <p className="text-sm">Add conditions to define when this rule applies</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ruleGroup.conditions.map((condition, index) => (
                    <div key={index} className="p-3 border rounded bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Condition {index + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCondition(ruleType, index)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Source Field</Label>
                          <Select
                            value={condition.key}
                            onValueChange={(value) => handleUpdateCondition(ruleType, index, { key: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select field..." />
                            </SelectTrigger>
                            <SelectContent>
                              {components
                                .filter(c => c.id !== component.id)
                                .map(comp => (
                                  <SelectItem key={comp.id} value={comp.key}>
                                    {comp.label} ({comp.key})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Operator</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value: any) => handleUpdateCondition(ruleType, index, { operator: value })}
                          >
                            <SelectTrigger>
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
                              <SelectItem value="gte">Greater Than or Equal</SelectItem>
                              <SelectItem value="lte">Less Than or Equal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {!['empty', 'notEmpty'].includes(condition.operator) && (
                        <div className="space-y-2">
                          <Label>Value to Compare</Label>
                          <Input
                            value={condition.value || ''}
                            onChange={(e) => handleUpdateCondition(ruleType, index, { value: e.target.value })}
                            placeholder="Enter comparison value..."
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderActionsConfig = () => {
    // if (component.type !== 'button') return null;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Actions</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddAction}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Action
          </Button>
        </div>
        
        {component.actions?.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No actions configured</p>
            <p className="text-sm">Add actions to define what happens when this button is clicked</p>
          </div>
        ) : (
          <div className="space-y-3">
            {component.actions?.map((action, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Action {index + 1}</span>
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trigger</Label>
                    <Select
                      value={action.trigger}
                      onValueChange={(value: any) => handleUpdateAction(index, { trigger: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onClick">On Click</SelectItem>
                        <SelectItem value="onChange">On Change</SelectItem>
                        <SelectItem value="onLoad">On Load</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Action Type</Label>
                    <Select
                      value={action.type}
                      onValueChange={(value: any) => handleUpdateAction(index, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="setValue">Set Value</SelectItem>
                        <SelectItem value="clearValue">Clear Value</SelectItem>
                        <SelectItem value="toggleVisibility">Toggle Visibility</SelectItem>
                        <SelectItem value="resetForm">Reset Form</SelectItem>
                        <SelectItem value="callApi">Call API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {action.type === 'callApi' && (
                  <div className="space-y-2">
                    <Label>API Endpoint</Label>
                    <Select
                      value={action.payload?.apiId || ''}
                      onValueChange={(value) => handleUpdateAction(index, {
                        payload: { ...action.payload, apiId: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select API..." />
                      </SelectTrigger>
                      <SelectContent>
                        {apis.map(api => (
                          <SelectItem key={api.id} value={api.id}>
                            {api.name} ({api.method})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {['setValue', 'clearValue', 'toggleVisibility'].includes(action.type) && (
                  <div className="space-y-2">
                    <Label>Target Components</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-3">
                      {components
                        .filter(c => c.id !== component.id)
                        .map(comp => (
                          <div key={comp.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`action-${index}-target-${comp.id}`}
                              checked={action.target?.includes(comp.id) || false}
                              onChange={(e) => {
                                const currentTargets = action.target || [];
                                const newTargets = e.target.checked
                                  ? [...currentTargets, comp.id]
                                  : currentTargets.filter(id => id !== comp.id);
                                handleUpdateAction(index, { target: newTargets });
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`action-${index}-target-${comp.id}`} className="text-sm">
                              {comp.label} ({comp.type})
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {action.type === 'setValue' && (
                  <div className="space-y-2">
                    <Label>Value to Set</Label>
                    <Input
                      value={action.payload?.value || ''}
                      onChange={(e) => handleUpdateAction(index, {
                        payload: { ...action.payload, value: e.target.value }
                      })}
                      placeholder="Enter value..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Component Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="capitalize">
            {component.type}
          </Badge>
          <div>
            <h3 className="font-bold">{component.label}</h3>
            <p className="text-sm text-gray-500">{component.key}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={duplicateComponent}
            title="Duplicate Component"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(component.id)}
            title="Delete Component"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        {/* Basic Tab */}
        <TabsContent value="basic" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="component-label">Label</Label>
              <Input
                id="component-label"
                value={component.label}
                onChange={(e) => onUpdate(component.id, { label: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="component-key">Field Key</Label>
              <Input
                id="component-key"
                value={component.key}
                onChange={(e) => onUpdate(component.id, { key: e.target.value })}
                placeholder="unique_field_name"
              />
              <p className="text-xs text-gray-500">
                Used for data binding and API mapping
              </p>
            </div>
            
            {component.type !== 'label' && (
              <div className="space-y-2">
                <Label htmlFor="component-placeholder">Placeholder</Label>
                <Input
                  id="component-placeholder"
                  value={component.ui.placeholder || ''}
                  onChange={(e) => onUpdate(component.id, {
                    ui: { ...component.ui, placeholder: e.target.value }
                  })}
                  placeholder="Enter placeholder text..."
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="component-help">Help Text</Label>
              <Input
                id="component-help"
                value={component.ui.helpText || ''}
                onChange={(e) => onUpdate(component.id, {
                  ui: { ...component.ui, helpText: e.target.value }
                })}
                placeholder="Helper text to guide users..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Grid Width</Label>
              <Select
                value={String(component.ui.gridColumn)}
                onValueChange={(value) => onUpdate(component.id, {
                  ui: { ...component.ui, gridColumn: parseInt(value) }
                })}
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
            
            {['input', 'textarea'].includes(component.type) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="component-minlength">Min Length</Label>
                    <Input
                      id="component-minlength"
                      type="number"
                      value={component.ui.minLength ?? ''}
                      onChange={(e) => onUpdate(component.id, {
                        ui: { ...component.ui, minLength: e.target.value ? parseInt(e.target.value) : undefined }
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="component-maxlength">Max Length</Label>
                    <Input
                      id="component-maxlength"
                      type="number"
                      value={component.ui.maxLength ?? ''}
                      onChange={(e) => onUpdate(component.id, {
                        ui: { ...component.ui, maxLength: e.target.value ? parseInt(e.target.value) : undefined }
                      })}
                      placeholder="100"
                    />
                  </div>
                </div>
                
                {component.type === 'input' && (
                  <div className="space-y-2">
                    <Label htmlFor="component-pattern">Pattern (Regex)</Label>
                    <Input
                      id="component-pattern"
                      value={component.ui.pattern || ''}
                      onChange={(e) => onUpdate(component.id, {
                        ui: { ...component.ui, pattern: e.target.value }
                      })}
                      placeholder="[A-Za-z0-9]+"
                    />
                  </div>
                )}
              </>
            )}
            
            {component.type === 'button' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Variant</Label>
                  <Select
                    value={component.ui.variant || 'default'}
                    onValueChange={(value: any) => onUpdate(component.id, {
                      ui: { ...component.ui, variant: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="destructive">Destructive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Button Size</Label>
                  <Select
                    value={component.ui.size || 'default'}
                    onValueChange={(value: any) => onUpdate(component.id, {
                      ui: { ...component.ui, size: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="icon">Icon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {renderValueSourceConfig()}
            {renderOptionsConfig()}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium">Field Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="required-toggle">Required Field</Label>
                <Switch
                  id="required-toggle"
                  checked={component.ui.required}
                  onCheckedChange={(checked) => onUpdate(component.id, {
                    ui: { ...component.ui, required: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="disabled-toggle">Disabled</Label>
                <Switch
                  id="disabled-toggle"
                  checked={component.ui.disabled}
                  onCheckedChange={(checked) => onUpdate(component.id, {
                    ui: { ...component.ui, disabled: checked }
                  })}
                />
              </div>
              {['input', 'textarea'].includes(component.type) && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="readonly-toggle">Read Only</Label>
                  <Switch
                    id="readonly-toggle"
                    checked={component.ui.readonly || false}
                    onCheckedChange={(checked) => onUpdate(component.id, {
                      ui: { ...component.ui, readonly: checked }
                    })}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visibility Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {renderRuleConfig('visibility', 'Show this field when...')}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enable/Disable Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {renderRuleConfig('enabled', 'Enable this field when...')}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Component Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {renderActionsConfig()}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Custom Validation</Label>
                    <p className="text-sm text-gray-500">
                      Add custom validation rules for this field
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Rule
                  </Button>
                </div>
                
                {component.validation?.rules && component.validation.rules.length > 0 ? (
                  <div className="space-y-2">
                    {component.validation.rules.map((rule, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{rule.type}</span>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                        {rule.value && (
                          <p className="text-sm text-gray-600 mt-1">Value: {rule.value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No validation rules configured</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Link className="h-4 w-4" />
                  <span>This component depends on:</span>
                </div>
                
                {component.value?.source === 'component' && (
                  <div className="p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Default Value</span>
                      <Badge variant="outline">From Field</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Value from: {components.find(c => c.id === component.value?.componentId)?.label || component.value.componentId}
                    </p>
                  </div>
                )}
                
                {component.options?.dynamic?.dependsOn && (
                  <div className="p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Dynamic Options</span>
                      <Badge variant="outline">From Field</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Options depend on: {components.find(c => c.key === component.options?.dynamic?.dependsOn)?.label || component.options.dynamic.dependsOn}
                    </p>
                  </div>
                )}
                
                {component.visibility && component.visibility.conditions.length > 0 && (
                  <div className="p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Visibility Rules</span>
                      <Badge variant="outline">
                        {component.visibility.conditions.length} condition{component.visibility.conditions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Depends on: {component.visibility.conditions.map(c => components.find(x => x.key === c.key)?.label || c.key).join(', ')}
                    </p>
                  </div>
                )}
                
                {component.enabled && component.enabled.conditions.length > 0 && (
                  <div className="p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Enable/Disable Rules</span>
                      <Badge variant="outline">
                        {component.enabled.conditions.length} condition{component.enabled.conditions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Depends on: {component.enabled.conditions.map(c => components.find(x => x.key === c.key)?.label || c.key).join(', ')}
                    </p>
                  </div>
                )}
                
                {(!component.value?.source && !component.options?.dynamic?.dependsOn && 
                  (!component.visibility || component.visibility.conditions.length === 0) &&
                  (!component.enabled || component.enabled.conditions.length === 0)) && (
                  <div className="text-center py-6 text-gray-500">
                    <Link className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No dependencies configured</p>
                    <p className="text-sm">This component works independently</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}