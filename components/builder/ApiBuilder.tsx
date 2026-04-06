'use client';

import { useState } from 'react';
import {
  Globe,
  Link,
  Cpu,
  Zap,
  Database,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { ApiSchema, ComponentSchema } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ApiBuilderProps {
  api: ApiSchema;
  components: ComponentSchema[];
  onUpdate: (apiId: string, updates: Partial<ApiSchema>) => void;
  onDelete: (apiId: string) => void;
}

export default function ApiBuilder({ api, components, onUpdate, onDelete }: ApiBuilderProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'body' | 'response' | 'triggers' | 'test'>('config');
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [selectedTriggerComponent, setSelectedTriggerComponent] = useState<string>('');

  const handleAddHeader = () => {
    if (!newHeaderKey.trim() || !newHeaderValue.trim()) return;

    const updatedHeaders = {
      ...api.headers,
      [newHeaderKey.trim()]: newHeaderValue.trim()
    };

    onUpdate(api.id, { headers: updatedHeaders });
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const handleRemoveHeader = (key: string) => {
    const updatedHeaders = { ...api.headers };
    delete updatedHeaders[key];
    onUpdate(api.id, { headers: updatedHeaders });
  };

  const handleAddBodyMapping = () => {
    const currentMappings = api.body?.mapping || {};
    const newMappings = {
      ...currentMappings,
      ['']: ''
    };

    onUpdate(api.id, {
      body: {
        type: 'form',
        mapping: newMappings,
        staticBody: api.body?.staticBody
      }
    });
  };

  const handleUpdateBodyMapping = (oldFormKey: string, newFormKey: string, apiField: string) => {
    const currentMappings = api.body?.mapping || {};
    const newMappings = { ...currentMappings };

    // Remove old key if it changed
    if (oldFormKey !== newFormKey) {
      delete newMappings[oldFormKey];
    }

    // Add/update new mapping
    newMappings[newFormKey] = apiField;

    onUpdate(api.id, {
      body: {
        ...api.body,
        type: 'form',
        mapping: newMappings
      }
    });
  };

  const handleRemoveBodyMapping = (formKey: string) => {
    const currentMappings = api.body?.mapping || {};
    const newMappings = { ...currentMappings };
    delete newMappings[formKey];

    onUpdate(api.id, {
      body: {
        ...api.body,
        type: api.body?.type ?? 'form',
        mapping: newMappings
      }
    });
  };

  const handleAddResponseMapping = () => {
    const currentMappings = api.response?.mapping || {};
    const newMappings = {
      ...currentMappings,
      ['']: ''
    };

    onUpdate(api.id, {
      response: {
        type: 'json',
        mapping: newMappings
      }
    });
  };

  const handleUpdateResponseMapping = (oldPath: string, newPath: string, componentKey: string) => {
    const currentMappings = api.response?.mapping || {};
    const newMappings = { ...currentMappings };

    if (oldPath !== newPath) {
      delete newMappings[oldPath];
    }

    newMappings[newPath] = componentKey;

    onUpdate(api.id, {
      response: {
        ...api.response,
        type: 'json',
        mapping: newMappings
      }
    });
  };

  const handleRemoveResponseMapping = (path: string) => {
    const currentMappings = api.response?.mapping || {};
    const newMappings = { ...currentMappings };
    delete newMappings[path];

    onUpdate(api.id, {
      response: {
        ...api.response,
        type: "json",
        mapping: newMappings
      }
    });
  };

  const handleAddTrigger = (componentKey: string) => {
    const comp = components.find(c => c.key === componentKey);
    if (!comp) return;

    const currentTriggers = api.triggers?.onFormChange || [];
    const triggerExists = currentTriggers.some((t: any) => 
      typeof t === 'string' ? t === componentKey : t.componentKey === componentKey
    );
    if (triggerExists) return;

    // Create trigger config based on component type
    let triggerConfig: any = { componentKey };
    
    if (comp.type === 'textarea') {
      triggerConfig.debounceMs = 500; // Default 500ms debounce
    } else if (comp.type === 'select') {
      triggerConfig.clearOnSelect = false; // Default: don't clear on select
    } else if (comp.type === 'input') {
      triggerConfig.debounceMs = 300;
    }

    onUpdate(api.id, {
      triggers: {
        ...api.triggers,
        onFormChange: [...currentTriggers, triggerConfig]
      }
    });
  };

  const handleRemoveTrigger = (componentKey: string) => {
    const currentTriggers = api.triggers?.onFormChange || [];
    onUpdate(api.id, {
      triggers: {
        ...api.triggers,
        onFormChange: currentTriggers.filter((t: any) => 
          typeof t === 'string' ? t !== componentKey : t.componentKey !== componentKey
        )
      }
    });
  };

  const handleUpdateTriggerConfig = (componentKey: string, config: any) => {
    const currentTriggers = api.triggers?.onFormChange || [];
    const updated = currentTriggers.map((t: any) => {
      const key = typeof t === 'string' ? t : t.componentKey;
      if (key === componentKey) {
        return typeof t === 'string' ? { componentKey, ...config } : { ...t, ...config };
      }
      return t;
    });

    onUpdate(api.id, {
      triggers: {
        ...api.triggers,
        onFormChange: updated
      }
    });
  };

  const testApi = async () => {
    setTestLoading(true);
    setTestError(null);
    setTestResponse(null);

    try {
      // Build test payload
      const payload: any = {};

      if (api.body?.type === 'form' && api.body.mapping) {
        Object.entries(api.body.mapping).forEach(([formKey]) => {
          payload[formKey] = `test_${formKey}`;
        });
      } else if (api.body?.type === 'static') {
        payload.body = api.body.staticBody;
      }

      // Build URL with test parameters
      let url = api.url;
      if (api.method === 'GET' && payload) {
        const params = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
          params.append(key, String(value));
        });
        url = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
      }

      const options: RequestInit = {
        method: api.method,
        headers: api.headers || {
          'Content-Type': 'application/json'
        }
      };

      if (['POST', 'PUT', 'PATCH'].includes(api.method) && payload) {
        options.body = JSON.stringify(payload, null, 2);
      }

      const response = await fetch(url, options);

      const responseData = await response.json();

      setTestResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      setTestError(error.message || 'Failed to test API');
    } finally {
      setTestLoading(false);
    }
  };

  const duplicateApi = () => {
    const newApi: ApiSchema = {
      ...api,
      id: `${api.id}_copy_${Date.now()}`,
      name: `${api.name} (Copy)`
    };

    // Trigger parent to add new API
    // This would need to be handled by parent component
    console.log('Duplicate API:', newApi);
  };

  const getApiStatusColor = () => {
    if (testResponse) {
      return testResponse.status >= 200 && testResponse.status < 300
        ? 'text-green-600'
        : 'text-red-600';
    }
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* API Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge
                variant={api.method === 'GET' ? 'default' :
                  api.method === 'POST' ? 'secondary' :
                    api.method === 'PUT' ? 'outline' : 'destructive'}
                className="px-2 py-0"
              >
                {api.method}
              </Badge>
              <h2 className="text-xl font-bold">{api.name}</h2>
              {api.triggers?.onLoad && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Auto-load
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate max-w-2xl">{api.url}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={duplicateApi}
            title="Duplicate API"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(api.id)}
            title="Delete API"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="body" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Request Body
          </TabsTrigger>
          <TabsTrigger value="response" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Response Mapping
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Test API
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-name">API Name</Label>
                <Input
                  id="api-name"
                  value={api.name}
                  onChange={(e) => onUpdate(api.id, { name: e.target.value })}
                  placeholder="e.g., Load Countries"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-url">Endpoint URL</Label>
                <Input
                  id="api-url"
                  value={api.url}
                  onChange={(e) => onUpdate(api.id, { url: e.target.value })}
                  placeholder="https://api.example.com/data"
                />
                <p className="text-xs text-gray-500">
                  Use :param for dynamic values (e.g., /users/:userId)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-method">HTTP Method</Label>
                  <Select
                    value={api.method}
                    onValueChange={(value: any) => onUpdate(api.id, { method: value })}
                  >
                    <SelectTrigger id="api-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-cache">Caching</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enable Cache</span>
                    <Switch
                      id="api-cache"
                      checked={api.cache?.enabled || false}
                      onCheckedChange={(checked) => onUpdate(api.id, {
                        cache: {
                          enabled: checked ?? false,
                          ttl: api.cache?.ttl || 300
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {api.cache?.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="cache-ttl">Cache Time-to-Live (seconds)</Label>
                  <Input
                    id="cache-ttl"
                    type="number"
                    value={api.cache?.ttl || 300}
                    onChange={(e) => onUpdate(api.id, {
                      cache: {
                        ...api.cache,
                        enabled: e.target.checked ?? false,
                        ttl: parseInt(e.target.value) || 300
                      }
                    })}
                    min="1"
                    placeholder="300"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Headers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="header-key">Header Key</Label>
                    <Input
                      id="header-key"
                      value={newHeaderKey}
                      onChange={(e) => setNewHeaderKey(e.target.value)}
                      placeholder="Authorization"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="header-value">Header Value</Label>
                    <Input
                      id="header-value"
                      value={newHeaderValue}
                      onChange={(e) => setNewHeaderValue(e.target.value)}
                      placeholder="Bearer token"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddHeader}
                  disabled={!newHeaderKey.trim() || !newHeaderValue.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Header
                </Button>

                {Object.keys(api.headers || {}).length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Header</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead className="w-25">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(api.headers || {}).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell className="font-mono text-sm">{key}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {key.toLowerCase().includes('authorization') || key.toLowerCase().includes('token')
                                ? '••••••••'
                                : String(value)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveHeader(key)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No headers configured</p>
                    <p className="text-sm">Headers like Authorization, Content-Type will be added automatically</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Execution Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Execute on Form Load</Label>
                    <p className="text-sm text-gray-500">
                      Automatically call this API when the form loads
                    </p>
                  </div>
                  <Switch
                    checked={api.triggers?.onLoad || false}
                    onCheckedChange={(checked) => onUpdate(api.id, {
                      triggers: {
                        ...api.triggers,
                        onLoad: checked
                      }
                    })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Reactive Execution</Label>
                      <p className="text-sm text-gray-500">
                        Call this API when specific form fields change
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedTriggerComponent}
                        onValueChange={(value) => {
                          if (value) {
                            handleAddTrigger(value);
                            setSelectedTriggerComponent('');
                          }
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select a field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {components
                            .filter(comp => comp.type !== 'button' && comp.type !== 'label')
                            .map(comp => (
                              <SelectItem key={comp.key} value={comp.key}>
                                {comp.label} ({comp.key})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (selectedTriggerComponent) {
                            handleAddTrigger(selectedTriggerComponent);
                            setSelectedTriggerComponent('');
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {api.triggers?.onFormChange && api.triggers.onFormChange.length > 0 ? (
                    <div className="space-y-3">
                      {api.triggers.onFormChange.map((trigger: any) => {
                        const key = typeof trigger === 'string' ? trigger : trigger.componentKey;
                        const config = typeof trigger === 'string' ? {} : trigger;
                        const component = components.find(c => c.key === key);
                        
                        return (
                          <div key={key} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-1 bg-gray-100 rounded">
                                  <Zap className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{component?.label || key}</p>
                                  <p className="text-sm text-gray-500">{key}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTrigger(key)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>

                            {/* Type-specific configuration */}
                            {(component?.type === 'textarea' || component?.type === 'input') && (
                              <div className="pl-10 space-y-2 border-t pt-3">
                                <Label>Debounce Delay (ms)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="5000"
                                  step="100"
                                  value={config.debounceMs || 300}
                                  onChange={(e) => handleUpdateTriggerConfig(key, { 
                                    debounceMs: parseInt(e.target.value) || 300 
                                  })}
                                  className="w-32"
                                />
                                <p className="text-xs text-gray-500">
                                  Wait this long after user stops typing before triggering API
                                </p>
                              </div>
                            )}

                            {component?.type === 'select' && (
                              <div className="pl-10 space-y-2 border-t pt-3">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={config.clearOnSelect || false}
                                    onCheckedChange={(checked) => handleUpdateTriggerConfig(key, { 
                                      clearOnSelect: checked 
                                    })}
                                  />
                                  <Label>Clear selection after API call</Label>
                                </div>
                                <p className="text-xs text-gray-500">
                                  Reset the selected value once the API completes
                                </p>
                              </div>
                            )}

                            {component?.type === 'radio' && (
                              <div className="pl-10 space-y-2 border-t pt-3">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={config.resetOnChange || false}
                                    onCheckedChange={(checked) => handleUpdateTriggerConfig(key, { 
                                      resetOnChange: checked 
                                    })}
                                  />
                                  <Label>Reset related fields</Label>
                                </div>
                                <p className="text-xs text-gray-500">
                                  Clear dependent fields when selection changes
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No reactive triggers configured</p>
                      <p className="text-sm">API will only execute when manually triggered</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Request Body Tab */}
        <TabsContent value="body" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Body Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Body Type</Label>
                <Select
                  value={api.body?.type || 'form'}
                  onValueChange={(value: 'static' | 'form') => onUpdate(api.id, {
                    body: {
                      type: value,
                      mapping: api.body?.mapping,
                      staticBody: api.body?.staticBody
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="form">Map Form Fields</SelectItem>
                    <SelectItem value="static">Static JSON Body</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {api.body?.type === 'static' ? (
                <div className="space-y-2">
                  <Label>Static JSON Body</Label>
                  <Textarea
                    value={JSON.stringify(api.body.staticBody || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        onUpdate(api.id, {
                          body: {
                            ...api.body,
                            type: 'static',
                            staticBody: parsed
                          }
                        });
                      } catch {
                        // Invalid JSON, keep as is
                      }
                    }}
                    placeholder='{"key": "value"}'
                    className="font-mono text-sm h-64"
                  />
                  <p className="text-xs text-gray-500">
                    Enter valid JSON that will be sent as the request body
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Form Field Mapping</Label>
                      <p className="text-sm text-gray-500">
                        Map form field values to API request body fields
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddBodyMapping}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Mapping
                    </Button>
                  </div>

                  {api.body?.mapping && Object.keys(api.body.mapping).length > 0 ? (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Form Field</TableHead>
                            <TableHead>API Field</TableHead>
                            <TableHead className="w-25">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(api.body.mapping || {}).map(([formKey, apiField]) => (
                            <TableRow key={formKey}>
                              <TableCell>
                                <Select
                                  value={formKey}
                                  onValueChange={(value) => handleUpdateBodyMapping(formKey, value, apiField)}
                                >
                                  <SelectTrigger className="border-0 p-0 h-auto">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {components
                                      .filter(c => c.type !== 'button' && c.type !== 'label')
                                      .map(comp => (
                                        <SelectItem key={comp.key} value={comp.key}>
                                          {comp.label} ({comp.key})
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={apiField}
                                  onChange={(e) => handleUpdateBodyMapping(formKey, formKey, e.target.value)}
                                  placeholder="apiFieldName"
                                  className="border-0"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveBodyMapping(formKey)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No field mappings configured</p>
                      <p className="text-sm">Add mappings to send form data to the API</p>
                    </div>
                  )}

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                      Preview Request Body
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                          {JSON.stringify(
                            api.body?.mapping
                              ? Object.keys(api.body.mapping).reduce((acc, key) => ({
                                ...acc,
                                [api.body!.mapping![key]]: `{{${key}}}`
                              }), {})
                              : {},
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Response Mapping Tab */}
        <TabsContent value="response" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response Mapping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Response Type</Label>
                <Select
                  value={api.response?.type || 'json'}
                  onValueChange={(value) => onUpdate(api.id, {
                    response: {
                      type: value as any,
                      mapping: api.response?.mapping
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Response Field Mapping</Label>
                    <p className="text-sm text-gray-500">
                      Map API response fields to form components
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddResponseMapping}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Mapping
                  </Button>
                </div>

                {api.response?.mapping && Object.keys(api.response.mapping).length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Response Path</TableHead>
                          <TableHead>Form Field</TableHead>
                          <TableHead className="w-25">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(api.response.mapping || {}).map(([responsePath, componentKey]) => (
                          <TableRow key={responsePath}>
                            <TableCell>
                              <Input
                                value={responsePath}
                                onChange={(e) => handleUpdateResponseMapping(responsePath, e.target.value, componentKey)}
                                placeholder="data.items[0].name"
                                className="border-0 font-mono text-sm"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={componentKey}
                                onValueChange={(value) => handleUpdateResponseMapping(responsePath, responsePath, value)}
                              >
                                <SelectTrigger className="border-0 p-0 h-auto">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {components
                                    .filter(c => c.type !== 'button' && c.type !== 'label')
                                    .map(comp => (
                                      <SelectItem key={comp.key} value={comp.key}>
                                        {comp.label} ({comp.key})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveResponseMapping(responsePath)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No response mappings configured</p>
                    <p className="text-sm">Add mappings to populate form fields from API responses</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Response Path Examples</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-3 border rounded bg-gray-50">
                      <p className="font-medium">Simple field</p>
                      <code className="text-xs text-gray-600">data.name</code>
                    </div>
                    <div className="p-3 border rounded bg-gray-50">
                      <p className="font-medium">Array item</p>
                      <code className="text-xs text-gray-600">items[0].id</code>
                    </div>
                    <div className="p-3 border rounded bg-gray-50">
                      <p className="font-medium">Nested object</p>
                      <code className="text-xs text-gray-600">user.profile.email</code>
                    </div>
                    <div className="p-3 border rounded bg-gray-50">
                      <p className="font-medium">Direct root</p>
                      <code className="text-xs text-gray-600">result</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggers Tab (covered in config) */}
        <TabsContent value="triggers" className="pt-4">
          <div className="text-center py-8 text-gray-500">
            <p>Trigger configuration is available in the Configuration tab</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setActiveTab('config')}
            >
              Go to Configuration
            </Button>
          </div>
        </TabsContent>

        {/* Test API Tab */}
        <TabsContent value="test" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test API Endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Test Configuration</Label>
                  <p className="text-sm text-gray-500">
                    Test the API with sample data to verify configuration
                  </p>
                </div>
                <Button
                  onClick={testApi}
                  disabled={testLoading}
                  className="flex items-center gap-2"
                >
                  {testLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Test API
                    </>
                  )}
                </Button>
              </div>

              {testError && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Test Failed</span>
                  </div>
                  <p className="text-sm text-red-600">{testError}</p>
                </div>
              )}

              {testResponse && (
                <div className="space-y-4">
                  <div className={cn("flex items-center gap-2", getApiStatusColor())}>
                    {testResponse.status >= 200 && testResponse.status < 300 ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">
                      {testResponse.status} {testResponse.statusText}
                    </span>
                    <Badge variant="outline">
                      {new Date(testResponse.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                      Response Headers
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                          {JSON.stringify(testResponse.headers, null, 2)}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="space-y-2">
                    <Label>Response Body</Label>
                    <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
                      <pre className="text-sm font-mono whitespace-pre-wrap">
                        {JSON.stringify(testResponse.data, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Mapping Preview</Label>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {api.response?.mapping && Object.keys(api.response.mapping).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(api.response.mapping).map(([path, field]) => {
                            const value = path.split('.').reduce((acc, part) => {
                              if (acc && typeof acc === 'object') {
                                return acc[part.replace(/\[(\d+)\]/g, '.$1')];
                              }
                              return undefined;
                            }, testResponse.data);

                            return (
                              <div key={path} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                  <span className="font-medium">{field}</span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    ← {path}
                                  </span>
                                </div>
                                <div className="font-mono text-sm bg-white px-2 py-1 rounded border">
                                  {value !== undefined ? (
                                    <span className="text-green-600">{JSON.stringify(value)}</span>
                                  ) : (
                                    <span className="text-red-500">Not found</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No response mappings configured
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!testResponse && !testError && (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No test results yet</p>
                  <p className="text-sm">Click &#34;Test API&#34; to execute a test request</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Show which components use this API */}
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Used by:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {components
                .filter(comp =>
                  comp.value?.apiId === api.id ||
                  comp.options?.dynamic?.apiId === api.id ||
                  comp.actions?.some(action =>
                    action.type === 'callApi' && action.payload?.apiId === api.id
                  )
                )
                .map(comp => (
                  <div key={comp.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {comp.type}
                      </Badge>
                      <span className="font-medium text-sm">{comp.label}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {comp.value?.apiId === api.id && 'Default value'}
                      {comp.options?.dynamic?.apiId === api.id && 'Dynamic options'}
                      {comp.actions?.some(a => a.payload?.apiId === api.id) && 'Button action'}
                    </div>
                  </div>
                ))}

              {components.filter(comp =>
                comp.value?.apiId === api.id ||
                comp.options?.dynamic?.apiId === api.id ||
                comp.actions?.some(action =>
                  action.type === 'callApi' && action.payload?.apiId === api.id
                )
              ).length === 0 && (
                  <div className="col-span-2 text-center py-4 text-gray-500">
                    <p>This API is not used by any components yet</p>
                    <p className="text-sm">Configure component properties to use this API</p>
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}