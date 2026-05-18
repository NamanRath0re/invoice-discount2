'use client';

import { useState, useRef, DragEvent, useEffect } from 'react';
import {
  GripVertical,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  Eye,
  Database,
  Zap,
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
    if (isResizingRef.current) { e.preventDefault(); return; }
    setDraggedComponent(component);
    e.dataTransfer.setData('text/plain', component.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent, index?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedComponent ? 'move' : 'copy';
    setDragOverIndex(index ?? null);
  };

  const handleDragLeave = () => { setDragOverIndex(null); };

  const handleDrop = (e: DragEvent, dropIndex?: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    const componentType = e.dataTransfer.getData('componentType');
    if (componentType) {
      onAddComponent?.(componentType as ComponentSchema['type']);
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
        onReorderComponents?.(newComponents);
      }
    }
    setDraggedComponent(null);
  };

  const startResize = (componentId: string, clientX: number) => {
    const comp = schema.components.find(c => c.id === componentId);
    if (!comp) return;
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
      const delta = ev.clientX - resizeStartXRef.current;
      const deltaCols = Math.round(delta / 40);
      const comp = schema.components.find(c => c.id === resizingIdRef.current!);
      if (!comp) return;
      const newSpan = Math.max(2, Math.min(12, resizeStartSpanRef.current + deltaCols));
      if (newSpan !== comp.ui.gridColumn) {
        onUpdateComponentRef.current(comp.id, { ui: { ...comp.ui, gridColumn: newSpan } });
      }
    };
    const onUp = () => { isResizingRef.current = false; resizingIdRef.current = null; };
    const onTouchMove = (e: TouchEvent) => {
      if (!isResizingRef.current || !resizingIdRef.current || !e.touches?.[0]) return;
      const delta = e.touches[0].clientX - resizeStartXRef.current;
      const deltaCols = Math.round(delta / 40);
      const comp = schema.components.find(c => c.id === resizingIdRef.current!);
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
      onUpdateComponent(componentId, { ui: { ...component.ui, gridColumn: Math.min(component.ui.gridColumn + 2, 12) } });
    }
  };

  const shrinkComponent = (componentId: string) => {
    const component = schema.components.find(c => c.id === componentId);
    if (component) {
      onUpdateComponent(componentId, { ui: { ...component.ui, gridColumn: Math.max(component.ui.gridColumn - 2, 2) } });
    }
  };

  const duplicateComponent = (component: ComponentSchema) => {
    console.log('Duplicate:', { ...component, id: `${component.id}_copy_${Date.now()}`, key: `${component.key}_copy` });
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'input':    return '📝';
      case 'textarea': return '📄';
      case 'select':   return '🔽';
      case 'radio':    return '⭕';
      case 'button':   return '🖱️';
      case 'switch':   return '🔘';
      case 'label':    return '🏷️';
      default:         return '📦';
    }
  };

  const renderComponentPreview = (component: ComponentSchema) => {
    const isSelected = selectedComponent?.id === component.id;
    const gridStyle = { gridColumn: `span ${component.ui.gridColumn || 12}` };

    return (
      <div
        key={component.id}
        style={gridStyle}
        className={cn(
          'transition-all',
          dragOverIndex === schema.components.indexOf(component) && 'border-2 border-primary'
        )}
        draggable
        onDragStart={(e) => handleDragStart(component, e)}
        onDragOver={(e) => handleDragOver(e, schema.components.indexOf(component))}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, schema.components.indexOf(component))}
      >
        <div
          className={cn(
            'relative border rounded-lg p-4 bg-card cursor-pointer hover:shadow-md transition-all h-full',
            isSelected
              ? 'ring-2 ring-primary border-primary'
              : 'border-border',
            component.ui.disabled && 'opacity-60'
          )}
          onClick={() => onSelectComponent(isSelected ? null : component)}
        >
          {/* Resize handle */}
          <div
            className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-3 rounded-l bg-muted cursor-ew-resize z-10"
            onMouseDown={(e) => { e.stopPropagation(); startResize(component.id, e.clientX); }}
            onTouchStart={(e) => { e.stopPropagation(); if (e.touches?.[0]) startResize(component.id, e.touches[0].clientX); }}
            onDragStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
          />

          {/* Component Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); shrinkComponent(component.id); }} disabled={component.ui.gridColumn <= 2} className="h-7 px-2" title="Shrink">
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); expandComponent(component.id); }} disabled={component.ui.gridColumn >= 12} className="h-7 px-2" title="Expand">
              <Maximize2 className="h-3 w-3" />
            </Button>
            {/* <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); duplicateComponent(component); }} className="h-7 px-2" title="Duplicate">
              <Copy className="h-3 w-3" />
            </Button> */}
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onDeleteComponent(component.id); }} className="h-7 px-2" title="Delete">
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>

          {/* Component Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getComponentIcon(component.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{component.label}</p>
                {component.ui.helpText && (
                  <p className="text-xs text-muted-foreground truncate">{component.ui.helpText}</p>
                )}
              </div>
            </div>

            {component.type === 'input' && (
              <div className="space-y-1">
                <div className="h-8 border border-border rounded bg-muted/40 flex items-center px-2">
                  <span className="text-sm text-muted-foreground">
                    {component.ui.placeholder || 'Text input...'}
                  </span>
                </div>
                {/* {component.ui.required && (
                  <p className="text-xs text-destructive">Required field</p>
                )} */}
              </div>
            )}

            {component.type === 'textarea' && (
              <div className="space-y-1">
                <div className="h-16 border border-border rounded bg-muted/40 p-2">
                  <span className="text-sm text-muted-foreground">
                    {component.ui.placeholder || 'Multi-line text...'}
                  </span>
                </div>
              </div>
            )}

            {component.type === 'select' && (
              <div className="space-y-1">
                <div className="h-8 border border-border rounded bg-muted/40 flex items-center justify-between px-2">
                  <span className="text-sm text-muted-foreground">
                    {component.ui.placeholder || 'Select option...'}
                  </span>
                  <span className="text-xs text-muted-foreground">▼</span>
                </div>
                {component.options?.static && component.options.static.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {component.options.static.length} option{component.options.static.length !== 1 ? 's' : ''}
                  </p>
                )}
                {component.options?.dynamic && (
                  <p className="text-xs text-primary">Dynamic options</p>
                )}
              </div>
            )}

            {component.type === 'radio' && (
              <div className="space-y-1">
                {component.options?.static?.slice(0, 2).map((option, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border border-border" />
                    <span className="text-sm">{option.label || option.key}</span>
                  </div>
                ))}
                {component.options?.static && component.options.static.length > 2 && (
                  <p className="text-xs text-muted-foreground">+{component.options.static.length - 2} more</p>
                )}
                {component.options?.dynamic && (
                  <p className="text-xs text-primary">Dynamic options</p>
                )}
              </div>
            )}

            {component.type === 'button' && (
              <div className="space-y-1">
                <div className={cn(
                  'h-8 rounded flex items-center justify-center',
                  component.ui.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' :
                  component.ui.variant === 'outline'     ? 'border border-border' :
                  component.ui.variant === 'secondary'   ? 'bg-secondary text-secondary-foreground' :
                  component.ui.variant === 'ghost'       ? 'hover:bg-accent' :
                  component.ui.variant === 'link'        ? 'text-primary underline' :
                  'bg-primary text-primary-foreground'
                )}>
                  <span className="text-sm font-medium">{component.label}</span>
                </div>
                {component.actions && component.actions.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {component.actions.length} action{component.actions.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {component.type === 'switch' && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-10 rounded-full bg-muted relative">
                    <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-background shadow-sm" />
                  </div>
                  <span className="text-sm">{component.label}</span>
                </div>
              </div>
            )}

            {component.type === 'label' && (
              <div className="space-y-1">
                <p className="font-medium">{component.label}</p>
                {component.ui.helpText && (
                  <p className="text-sm text-muted-foreground">{component.ui.helpText}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div
      className="h-96 flex flex-col items-center justify-center text-muted-foreground"
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e); }}
      onDragLeave={(e) => { e.stopPropagation(); handleDragLeave(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(e); }}
    >
      <div className="p-4 bg-muted rounded-full mb-4">
        <GripVertical className="h-8 w-8" />
      </div>
      <p className="text-lg font-medium">No components yet</p>
      <p className="text-sm mb-4">Drag components from the left panel or create new ones</p>
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground max-w-md">
        <div className="p-3 border border-border rounded text-center">
          <div className="text-lg mb-1">📝</div>
          <p>Input Fields</p>
        </div>
        <div className="p-3 border border-border rounded text-center">
          <div className="text-lg mb-1">🔽</div>
          <p>Dropdowns</p>
        </div>
        <div className="p-3 border border-border rounded text-center">
          <div className="text-lg mb-1">🖱️</div>
          <p>Buttons</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {schema.components.length} component{schema.components.length !== 1 ? 's' : ''} •{' '}
          {schema.components.filter(c => c.ui.required).length} required
        </div>
      </div>

      {/* Drag & Drop Canvas */}
      <div
        ref={canvasRef}
        className={cn(
          'min-h-125 border-2 border-dashed border-border rounded-lg p-6 bg-background',
          schema.components.length === 0 && 'flex items-center justify-center',
          dragOverIndex === null && draggedComponent && 'bg-primary/5 border-primary'
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
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); handleDragOver(e); }}
            onDragLeave={(e) => { e.stopPropagation(); handleDragLeave(); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(e); }}
          >
            {schema.components.map((component) => renderComponentPreview(component))}

            {/* Drop zone indicator */}
            {dragOverIndex === null && draggedComponent && (
              <div className="col-span-12">
                <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center bg-primary/5">
                  <p className="text-primary">Drop component here to add to end</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
