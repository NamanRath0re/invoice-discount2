'use client';

import { useState, useEffect } from 'react';
import {
  GripVertical,
  Type,
  CheckSquare,
  Radio,
  ChevronDown,
  Globe,
  Zap,
  Link
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FormSchema, ComponentSchema, ApiSchema } from '@/types/schema';
import ComponentCanvas from './builder/ComponentCanvas';
import PropertiesPanel from './builder/PropertiesPanel';
import FormRuntimeComponent from './FormRuntime';
import ApiBuilder from './builder/ApiBuilder';

const defaultSchema: FormSchema = {
  id: `form-${Date.now()}`,
  name: 'New Form',
  components: [],
  apis: [],
  version: '1.0.0'
};

export default function EnhancedComponentBuilder() {
  const [schema, setSchema] = useState<FormSchema>(defaultSchema);
  const [selectedComponent, setSelectedComponent] = useState<ComponentSchema | null>(null);
  const [selectedApi, setSelectedApi] = useState<ApiSchema | null>(null);
  const [activeTab, setActiveTab] = useState<'components' | 'apis'>('components');

  // Initialize with sample data
  useEffect(() => {
    // Load from localStorage or API
    const saved = localStorage.getItem('form-builder-schema');
    if (saved) {
      try {
        setSchema(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved schema', e);
      }
    }
  }, []);

  // Save on changes
  useEffect(() => {
    localStorage.setItem('form-builder-schema', JSON.stringify(schema));
  }, [schema]);

  const handleAddComponent = (type: ComponentSchema['type']) => {
    const date = Date.now();
    const rmd = Math.random().toString(36).substr(2, 9);
    const newComponent: ComponentSchema = {
      id: `comp-${date}-${rmd}`,
      key: `${type}_${schema.components.length + 1}`,
      type: type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      ui: {
        gridColumn: 12,
        required: false,
        disabled: false,
        placeholder: '',
        helpText: '',
      },
    };

    setSchema(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));

    setSelectedComponent(newComponent);
  };

  const handleAddApi = () => {
    const newApi: ApiSchema = {
      id: `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'New API Endpoint',
      method: 'GET',
      url: 'https://api.example.com/data',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: {
        enabled: false
      }
    };

    setSchema(prev => ({
      ...prev,
      apis: [...(prev.apis || []), newApi]
    }));

    setSelectedApi(newApi);
    setActiveTab('apis');
  };

  const handleUpdateComponent = (componentId: string, updates: Partial<ComponentSchema>) => {
    setSchema(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      )
    }));

    if (selectedComponent?.id === componentId) {
      setSelectedComponent(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleUpdateApi = (apiId: string, updates: Partial<ApiSchema>) => {
    setSchema(prev => ({
      ...prev,
      apis: (prev.apis || []).map(api =>
        api.id === apiId ? { ...api, ...updates } : api
      )
    }));

    if (selectedApi?.id === apiId) {
      setSelectedApi(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteComponent = (componentId: string) => {
    setSchema(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== componentId)
    }));

    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  };

  const handleDeleteApi = (apiId: string) => {
    setSchema(prev => ({
      ...prev,
      apis: (prev.apis || []).filter(api => api.id !== apiId)
    }));

    if (selectedApi?.id === apiId) {
      setSelectedApi(null);
    }
  };

  const handleReorderComponents = (reorderedComponents: ComponentSchema[]) => {
    setSchema(prev => ({
      ...prev,
      components: reorderedComponents
    }));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(schema, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `form-schema-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Form Runtime Engine</h1>
            <p className="text-gray-600">Declarative UI + Rules + Effects engine</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleExport}>
              Export JSON Schema
            </Button>
            <Button onClick={() => {/* Save to server */ }}>
              Publish Form
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Components & APIs */}
        {/* <div className="lg:col-span-3 space-y-6 sticky top-6 self-start flex flex-col max-h-[calc(100vh-120px)]"> */}
        <div className="lg:col-span-3 space-y-6 sticky top-6 self-start flex flex-col max-h-screen">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GripVertical className="h-5 w-5" />
                Component Library
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: 'input', label: 'Text Input', icon: <Type className="h-4 w-4" /> },
                { type: 'textarea', label: 'Text Area', icon: <Type className="h-4 w-4" /> },
                { type: 'select', label: 'Dropdown', icon: <ChevronDown className="h-4 w-4" /> },
                { type: 'radio', label: 'Radio Group', icon: <Radio className="h-4 w-4" /> },
                { type: 'button', label: 'Button', icon: <CheckSquare className="h-4 w-4" /> },
                { type: 'switch', label: 'Toggle Switch', icon: <CheckSquare className="h-4 w-4" /> },
                { type: 'label', label: 'Label', icon: <Type className="h-4 w-4" /> },
              ].map((comp) => (
                <Button
                  key={comp.type}
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('componentType', comp.type);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => handleAddComponent(comp.type as ComponentSchema['type'])}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      {comp.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{comp.label}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="min-h-56 overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1 min-h-0">
              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={handleAddApi}
              >
                <Link className="h-4 w-4 mr-2" />
                Add API Endpoint
              </Button>

              <div className="space-y-2">
                {schema.apis?.map((api) => (
                  <div
                    key={api.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedApi?.id === api.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    onClick={() => {
                      setSelectedApi(api);
                      setActiveTab('apis');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${api.method === 'GET' ? 'bg-green-100 text-green-800' :
                          api.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          <span className="text-xs font-bold">{api.method}</span>
                        </div>
                        <span className="text-sm font-medium truncate">{api.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {api.triggers?.onLoad ? 'Auto' : 'Manual'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{api.url}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Canvas */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <CardHeader>
                <TabsList>
                  <TabsTrigger value="components" className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4" />
                    Form Canvas
                    <Badge variant="secondary" className="ml-2">
                      {schema.components.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="apis" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    API Playground
                    <Badge variant="secondary" className="ml-2">
                      {schema.apis?.length || 0}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Live Preview
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="components" className="mt-0">
                  <ComponentCanvas
                    schema={schema}
                    selectedComponent={selectedComponent}
                    onSelectComponent={setSelectedComponent}
                    onUpdateComponent={handleUpdateComponent}
                    onDeleteComponent={handleDeleteComponent}
                    onReorderComponents={handleReorderComponents}
                    onAddComponent={handleAddComponent}
                  />
                </TabsContent>

                <TabsContent value="apis" className="mt-0">
                  {selectedApi ? (
                    <ApiBuilder
                      api={selectedApi}
                      components={schema.components}
                      onUpdate={handleUpdateApi}
                      onDelete={handleDeleteApi}
                    />
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                      <Globe className="h-12 w-12 mb-4" />
                      <p className="text-lg font-medium">No API selected</p>
                      <p className="text-sm">Select an API from the left panel or create a new one</p>
                      <Button className="mt-4" onClick={handleAddApi}>
                        Create New API
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <div className="border rounded-lg p-6 bg-white">
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

        {/* Right Panel - Properties */}
        <div className="lg:col-span-3 sticky top-6 self-start">
          <Card className="h-fit max-h-[calc(100vh-120px)] flex flex-col">
            <CardHeader>
              <CardTitle>
                {selectedComponent ? 'Component Properties' :
                  selectedApi ? 'API Configuration' :
                    'Properties'}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {selectedComponent ? `Editing: ${selectedComponent.type}` :
                  selectedApi ? `Editing: ${selectedApi.name}` :
                    'Select a component or API to edit'}
              </p>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1 min-h-0">
              {selectedComponent ? (
                <PropertiesPanel
                  component={selectedComponent}
                  components={schema.components}
                  apis={schema.apis || []}
                  onUpdate={handleUpdateComponent}
                  onDelete={handleDeleteComponent}
                />
              ) : selectedApi ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Switch to API tab to edit API configuration</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('apis')}
                  >
                    Go to API Tab
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GripVertical className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Nothing selected</p>
                  <p className="text-sm">Select a component or API to edit its properties</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}