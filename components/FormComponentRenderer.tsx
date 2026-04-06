'use client';

import { FormSchema, ComponentSchema } from '@/types/schema';
import { FormRuntime } from '@/engine/form-runtime';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormComponentRendererProps {
  schema: FormSchema;
  runtime: FormRuntime;
  onValueChange: (key: string, value: any) => void;
  onButtonClick: (id: string) => void;
}

export default function FormComponentRenderer({
  schema,
  runtime,
  onValueChange,
  onButtonClick
}: FormComponentRendererProps) {
  // Sort components by some order property if available
  const sortedComponents = [...schema.components].sort((a, b) => 
    (a.ui.gridColumn || 12) - (b.ui.gridColumn || 12)
  );
  
  return (
    <div className="grid grid-cols-12 gap-4">
      {sortedComponents.map((component) => {
        const props = runtime.getComponentProps(component.id);
        if (!props || !props.visible) return null;
        
        const gridStyle = { gridColumn: `span ${props.gridColumn || 12}` };
        
        return (
          <div key={component.id} style={gridStyle} className={cn('space-y-2')}>
            {renderComponent(component, props, onValueChange, onButtonClick)}
          </div>
        );
      })}
    </div>
  );
}

function renderComponent(
  component: ComponentSchema,
  props: any,
  onValueChange: (key: string, value: any) => void,
  onButtonClick: (id: string) => void
) {
  const commonProps = {
    id: component.id,
    disabled: props.disabled || props.loading,
    'data-component-id': component.id,
    'data-component-key': component.key,
  };
  
  if (props.loading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }
  
  switch (component.type) {
    case 'input':
      return (
        <div className="space-y-2">
          <Label htmlFor={component.id}>
            {props.label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            {...commonProps}
            type="text"
            value={props.value || ''}
            onChange={(e) => onValueChange(component.key, e.target.value)}
            placeholder={props.placeholder}
            required={props.required}
            minLength={props.minLength}
            maxLength={props.maxLength}
            pattern={props.pattern}
            readOnly={props.readonly}
          />
          {props.helpText && (
            <p className="text-sm text-gray-500">{props.helpText}</p>
          )}
          {props.error && (
            <p className="text-sm text-red-500">{props.error}</p>
          )}
        </div>
      );
      
    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={component.id}>
            {props.label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            {...commonProps}
            value={props.value || ''}
            onChange={(e) => onValueChange(component.key, e.target.value)}
            placeholder={props.placeholder}
            required={props.required}
            minLength={props.minLength}
            maxLength={props.maxLength}
            readOnly={props.readonly}
          />
          {props.helpText && (
            <p className="text-sm text-gray-500">{props.helpText}</p>
          )}
        </div>
      );
      
    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={component.id}>
            {props.label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            disabled={props.disabled}
            value={props.value}
            onValueChange={(value) => onValueChange(component.key, value)}
          >
            <SelectTrigger {...commonProps}>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options?.map((option: any, index: number) => {
                const optionKey = typeof option === 'string' ? option : option.key;
                const optionLabel = typeof option === 'string' ? option : (option.label || option.key);
                return (
                  <SelectItem key={index} value={optionKey}>
                    {optionLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {props.helpText && (
            <p className="text-sm text-gray-500">{props.helpText}</p>
          )}
        </div>
      );
      
    case 'radio':
      return (
        <div className="space-y-2">
          <Label>
            {props.label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <RadioGroup
            value={props.value}
            onValueChange={(value) => onValueChange(component.key, value)}
            disabled={props.disabled}
          >
            {props.options?.map((option: any, index: number) => {
              const optionKey = typeof option === 'string' ? option : option.key;
              const optionLabel = typeof option === 'string' ? option : (option.label || option.key);
              return (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={optionKey}
                    id={`${component.id}-${index}`}
                  />
                  <Label htmlFor={`${component.id}-${index}`}>{optionLabel}</Label>
                </div>
              );
            })}
          </RadioGroup>
          {props.helpText && (
            <p className="text-sm text-gray-500">{props.helpText}</p>
          )}
        </div>
      );
      
    case 'button':
      return (
        <Button
          {...commonProps}
          variant={props.variant}
          size={props.size}
          onClick={() => onButtonClick(component.id)}
          className="w-full"
        >
          {props.label}
        </Button>
      );
      
    case 'switch':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            {...commonProps}
            checked={props.value === true || props.value === 'true'}
            onCheckedChange={(checked) => onValueChange(component.key, checked)}
          />
          <Label htmlFor={component.id}>
            {props.label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
      );
      
    case 'label':
      return (
        <div className="space-y-2">
          <Label className="text-base font-medium">{props.label}</Label>
          {props.helpText && (
            <p className="text-sm text-gray-500">{props.helpText}</p>
          )}
        </div>
      );
      
    default:
      return null;
  }
}