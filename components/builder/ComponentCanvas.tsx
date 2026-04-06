'use client';

import { useState, useRef, DragEvent, useEffect } from 'react';
import {
  GripVertical,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  Eye,
  Settings,
  Zap,
  Link,
  Database,
  AlertCircle,
} from 'lucide-react';
import { ComponentSchema } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ComponentCanvasProps {
  schema: {
    components: ComponentSchema[];
  };
  selectedComponent: ComponentSchema | null;
  onSelectComponent: (component: ComponentSchema | null) => void;
  onUpdateComponent: (componentId: string, updates: Partial<ComponentSchema>) => void;
  onDeleteComponent: (componentId: string) => void;
  onReorderComponents?: (components: ComponentSchema[]) => void;
  onAddComponent?: (type: ComponentSchema['type']) => void;
}

export default function ComponentCanvas({
  schema,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onReorderComponents,
  onAddComponent
}: ComponentCanvasProps) {
  const [draggedComponent, setDraggedComponent] = useState<ComponentSchema | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const resizingIdRef = useRef<string | null>(null);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartSpanRef = useRef<number>(0);
  const onUpdateComponentRef = useRef(onUpdateComponent);
  
  const handleDragStart = (component: ComponentSchema, e: DragEvent) => {
    if (isResizingRef.current) {
      e.preventDefault();
      return;
    }

    setDraggedComponent(component);
    e.dataTransfer.setData('text/plain', component.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: DragEvent, index?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedComponent ? 'move' : 'copy';
    setDragOverIndex(index ?? null);
  };
  
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  
  const handleDrop = (e: DragEvent, dropIndex?: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    const componentType = e.dataTransfer.getData('componentType');
    if (componentType) {
      if (onAddComponent) {
        onAddComponent(componentType as ComponentSchema['type']);
      }
      setDraggedComponent(null);
      return;
    }
    
    if (draggedComponent) {
      const draggedIndex = schema.components.findIndex(c => c.id === draggedComponent.id);
      
      if (draggedIndex !== -1 && dropIndex !== undefined && draggedIndex !== dropIndex) {
        const newComponents = [...schema.components];
        const [removed] = newComponents.splice(draggedIndex, 1);
        const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        newComponents.splice(insertIndex, 0, removed);
        
        if (onReorderComponents) {
          onReorderComponents(newComponents);
        }
      }
    }
    
    setDraggedComponent(null);
  };

  const startResize = (componentId: string, clientX: number) => {
    const comp = schema.components.find(c => c.id === componentId);
    if (!comp) return;
    // setResizingId(componentId);
    // setResizeStartX(clientX);
    // setResizeStartSpan(comp.ui.gridColumn || 12);
    isResizingRef.current = true;
  
    resizingIdRef.current = componentId;
    resizeStartXRef.current = clientX;
    resizeStartSpanRef.current = comp.ui.gridColumn || 12;
  };
  onUpdateComponentRef.current = onUpdateComponent;

  useEffect(() => {
    const onMove = (ev: MouseEvent) => {
      if (!isResizingRef.current || !resizingIdRef.current) return;
      ev.preventDefault();
      const clientX = ev.clientX;
      const delta = clientX - resizeStartXRef.current;
      const deltaCols = Math.round(delta / 40);
      const compId = resizingIdRef.current!;
      const comp = schema.components.find(c => c.id === compId);
      if (!comp) return;
      const newSpan = Math.max(2, Math.min(12, resizeStartSpanRef.current + deltaCols));
      if (newSpan !== comp.ui.gridColumn) {
        onUpdateComponentRef.current(comp.id, { ui: { ...comp.ui, gridColumn: newSpan } });
      }
    };

    const onUp = () => {
      isResizingRef.current = false;
      // setResizingId(null);
      resizingIdRef.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isResizingRef.current || !resizingIdRef.current) return;
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      const clientX = t.clientX;
      const delta = clientX - resizeStartXRef.current;
      const deltaCols = Math.round(delta / 40);
      const compId = resizingIdRef.current!;
      const comp = schema.components.find(c => c.id === compId);
      if (!comp) return;
      const newSpan = Math.max(2, Math.min(12, resizeStartSpanRef.current + deltaCols));
      if (newSpan !== comp.ui.gridColumn) {
        onUpdateComponentRef.current(comp.id, { ui: { ...comp.ui, gridColumn: newSpan } });
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [schema.components]);
  
  const expandComponent = (componentId: string) => {
    const component = schema.components.find(c => c.id === componentId);
    if (component) {
      const currentSpan = component.ui.gridColumn;
      const newSpan = Math.min(currentSpan + 2, 12);
      onUpdateComponent(componentId, {
        ui: { ...component.ui, gridColumn: newSpan }
      });
    }
  };
  
  const shrinkComponent = (componentId: string) => {
    const component = schema.components.find(c => c.id === componentId);
    if (component) {
      const currentSpan = component.ui.gridColumn;
      const newSpan = Math.max(currentSpan - 2, 2);
      onUpdateComponent(componentId, {
        ui: { ...component.ui, gridColumn: newSpan }
      });
    }
  };
  
  const duplicateComponent = (component: ComponentSchema) => {
    const newComponent = {
      ...component,
      id: `${component.id}_copy_${Date.now()}`,
      key: `${component.key}_copy`,
      label: `${component.label} (Copy)`
    };
    
    // This would trigger parent to add new component
    console.log('Duplicate:', newComponent);
  };
  
  const renderComponentPreview = (component: ComponentSchema) => {
    const isSelected = selectedComponent?.id === component.id;
    const gridStyle = { gridColumn: `span ${component.ui.gridColumn || 12}` };
    
    const getComponentIcon = (type: string) => {
      switch (type) {
        case 'input': return '📝';
        case 'textarea': return '📄';
        case 'select': return '🔽';
        case 'radio': return '⭕';
        case 'button': return '🖱️';
        case 'switch': return '🔘';
        case 'label': return '🏷️';
        default: return '📦';
      }
    };
    
    return (
      <div
        key={component.id}
        style={gridStyle}
        className={cn(
          'transition-all',
          dragOverIndex === schema.components.indexOf(component) && 'border-2 border-blue-500'
        )}
        draggable
        onDragStart={(e) => handleDragStart(component, e)}
        onDragOver={(e) => handleDragOver(e, schema.components.indexOf(component))}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, schema.components.indexOf(component))}
      >
          <div
            className={cn(
              'relative border rounded-lg p-4 bg-white cursor-pointer hover:shadow-md transition-all h-full',
              isSelected
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'border-gray-200',
              component.ui.disabled && 'opacity-60'
            )}
            onClick={() => onSelectComponent(isSelected ? null : component)}
          >
            {/* Right resize handle */}
            <div
              className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-3 rounded-l bg-gray-100 cursor-ew-resize z-10"
              onMouseDown={(e) => {
                e.stopPropagation();
                startResize(component.id, e.clientX);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                if (e.touches && e.touches[0]) startResize(component.id, e.touches[0].clientX);
              }}
              onDragStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
            />
          {/* Component Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <GripVertical className="h-4 w-4 cursor-move" />
              <span className="font-medium capitalize">{component.type}</span>
              <Badge variant="outline" className="text-xs">
                {component.ui.gridColumn}/12
              </Badge>
            </div>
            <div className="flex gap-1">
              {component.ui.required && (
                <Badge variant="default" className="text-xs">Req</Badge>
              )}
              {component.value?.source === 'api' && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Database className="h-2 w-2" /> API
                </Badge>
              )}
              {component.visibility && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Eye className="h-2 w-2" /> Vis
                </Badge>
              )}
              {component.actions && component.actions.length > 0 && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Zap className="h-2 w-2" /> Act
                </Badge>
              )}
            </div>
          </div>
          
          {/* Component Actions */}
          <div className="flex gap-1 mb-3 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                shrinkComponent(component.id);
              }}
              disabled={component.ui.gridColumn <= 2}
              className="h-7 px-2"
              title="Shrink"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                expandComponent(component.id);
              }}
              disabled={component.ui.gridColumn >= 12}
              className="h-7 px-2"
              title="Expand"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                duplicateComponent(component);
              }}
              className="h-7 px-2"
              title="Duplicate"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteComponent(component.id);
              }}
              className="h-7 px-2"
              title="Delete"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
          
          {/* Component Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getComponentIcon(component.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{component.label}</p>
                {component.ui.helpText && (
                  <p className="text-xs text-gray-500 truncate">{component.ui.helpText}</p>
                )}
              </div>
            </div>
            
            {/* Preview based on component type */}
            {component.type === 'input' && (
              <div className="space-y-1">
                <div className="h-8 border rounded bg-gray-50 flex items-center px-2">
                  <span className="text-sm text-gray-400">
                    {component.ui.placeholder || 'Text input...'}
                  </span>
                </div>
                {component.ui.required && (
                  <p className="text-xs text-red-500">Required field</p>
                )}
              </div>
            )}
            
            {component.type === 'textarea' && (
              <div className="space-y-1">
                <div className="h-16 border rounded bg-gray-50 p-2">
                  <span className="text-sm text-gray-400">
                    {component.ui.placeholder || 'Multi-line text...'}
                  </span>
                </div>
              </div>
            )}
            
            {component.type === 'select' && (
              <div className="space-y-1">
                <div className="h-8 border rounded bg-gray-50 flex items-center justify-between px-2">
                  <span className="text-sm text-gray-400">
                    {component.ui.placeholder || 'Select option...'}
                  </span>
                  <span className="text-xs">▼</span>
                </div>
                {component.options?.static && component.options.static.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {component.options.static.length} option{component.options.static.length !== 1 ? 's' : ''}
                  </p>
                )}
                {component.options?.dynamic && (
                  <p className="text-xs text-blue-500">Dynamic options</p>
                )}
              </div>
            )}
            
            {component.type === 'radio' && (
              <div className="space-y-1">
                {component.options?.static?.slice(0, 2).map((option, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                    <span className="text-sm">{option.label || option.key}</span>
                  </div>
                ))}
                {component.options?.static && component.options.static.length > 2 && (
                  <p className="text-xs text-gray-500">
                    +{component.options.static.length - 2} more
                  </p>
                )}
                {component.options?.dynamic && (
                  <p className="text-xs text-blue-500">Dynamic options</p>
                )}
              </div>
            )}
            
            {component.type === 'button' && (
              <div className="space-y-1">
                <div className={cn(
                  'h-8 rounded flex items-center justify-center',
                  component.ui.variant === 'destructive' ? 'bg-red-500 text-white' :
                  component.ui.variant === 'outline' ? 'border border-gray-300' :
                  component.ui.variant === 'secondary' ? 'bg-gray-200' :
                  component.ui.variant === 'ghost' ? 'hover:bg-gray-100' :
                  component.ui.variant === 'link' ? 'text-blue-500 underline' :
                  'bg-blue-500 text-white'
                )}>
                  <span className="text-sm font-medium">{component.label}</span>
                </div>
                {component.actions && component.actions.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {component.actions.length} action{component.actions.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
            
            {component.type === 'switch' && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-10 rounded-full bg-gray-300 relative">
                    <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white"></div>
                  </div>
                  <span className="text-sm">{component.label}</span>
                </div>
              </div>
            )}
            
            {component.type === 'label' && (
              <div className="space-y-1">
                <p className="font-medium">{component.label}</p>
                {component.ui.helpText && (
                  <p className="text-sm text-gray-600">{component.ui.helpText}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderEmptyState = () => {
    return (
      <div 
        className="h-96 flex flex-col items-center justify-center text-gray-400"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDragOver(e);
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          handleDragLeave();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDrop(e);
        }}
      >
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <GripVertical className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium">No components yet</p>
        <p className="text-sm mb-4">Drag components from the left panel or create new ones</p>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 max-w-md">
          <div className="p-3 border rounded text-center">
            <div className="text-lg mb-1">📝</div>
            <p>Input Fields</p>
          </div>
          <div className="p-3 border rounded text-center">
            <div className="text-lg mb-1">🔽</div>
            <p>Dropdowns</p>
          </div>
          <div className="p-3 border rounded text-center">
            <div className="text-lg mb-1">🖱️</div>
            <p>Buttons</p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-600">
          {schema.components.length} component{schema.components.length !== 1 ? 's' : ''} •{' '}
          {schema.components.filter(c => c.ui.required).length} required •{' '}
          {schema.components.filter(c => c.value?.source === 'api').length} API-bound
        </div>
      </div>
      
      {/* Drag & Drop Canvas */}
      <div
        ref={canvasRef}
        className={cn(
          'min-h-125 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white',
          schema.components.length === 0 && 'flex items-center justify-center',
          dragOverIndex === null && draggedComponent && 'bg-blue-50 border-blue-400'
        )}
        onDragOver={(e) => handleDragOver(e)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e)}
      >
        {schema.components.length === 0 ? (
          renderEmptyState()
        ) : (
          <div 
            className="grid grid-cols-12 gap-4"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDragOver(e);
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              handleDragLeave();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDrop(e);
            }}
          >
            {schema.components.map((component) => renderComponentPreview(component))}
            
            {/* Drop zone indicator */}
            {dragOverIndex === null && draggedComponent && (
              <div className="col-span-12">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
                  <p className="text-blue-600">Drop component here to add to end</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Component Connections Visualization */}
      {selectedComponent && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Link className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium">Component Connections</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Dependencies */}
            <div className="p-3 border rounded bg-white">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Depends On</span>
              </div>
              <div className="space-y-1">
                {selectedComponent.value?.source === 'component' && (
                  <div className="text-xs p-1 bg-orange-50 rounded">
                    Value from: {selectedComponent.value.componentId}
                  </div>
                )}
                {selectedComponent.options?.dynamic?.dependsOn && (
                  <div className="text-xs p-1 bg-green-50 rounded">
                    Options from: {selectedComponent.options.dynamic.dependsOn}
                  </div>
                )}
                {selectedComponent.visibility?.conditions.map((cond, i) => (
                  <div key={i} className="text-xs p-1 bg-purple-50 rounded">
                    Visibility: {cond.key} {cond.operator} {cond.value}
                  </div>
                ))}
                {selectedComponent.enabled?.conditions.map((cond, i) => (
                  <div key={i} className="text-xs p-1 bg-blue-50 rounded">
                    Enable: {cond.key} {cond.operator} {cond.value}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dependents */}
            <div className="p-3 border rounded bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Affects</span>
              </div>
              <div className="space-y-1">
                {schema.components
                  .filter(c => 
                    c.value?.componentId === selectedComponent.id ||
                    c.options?.dynamic?.dependsOn === selectedComponent.key ||
                    c.visibility?.conditions.some(cond => cond.key === selectedComponent.key) ||
                    c.enabled?.conditions.some(cond => cond.key === selectedComponent.key)
                  )
                  .map(comp => (
                    <div key={comp.id} className="text-xs p-1 bg-green-50 rounded">
                      {comp.label} ({comp.type})
                    </div>
                  ))}
              </div>
            </div>
            
            {/* API Connections */}
            <div className="p-3 border rounded bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">API Connections</span>
              </div>
              <div className="space-y-1">
                {selectedComponent.value?.source === 'api' && (
                  <div className="text-xs p-1 bg-blue-50 rounded">
                    Value from API
                  </div>
                )}
                {selectedComponent.options?.dynamic?.apiId && (
                  <div className="text-xs p-1 bg-blue-50 rounded">
                    Options from API
                  </div>
                )}
                {selectedComponent.actions?.filter(a => a.type === 'callApi').map((action, i) => (
                  <div key={i} className="text-xs p-1 bg-blue-50 rounded">
                    Triggers API
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}