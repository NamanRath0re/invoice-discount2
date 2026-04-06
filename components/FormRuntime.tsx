'use client';

import { useEffect, useState } from 'react';
import { FormRuntime } from '@/engine/form-runtime';
import { FormSchema } from '@/types/schema';
import FormComponentRenderer from './FormComponentRenderer';

interface FormRuntimeProps {
  schema: FormSchema;
  onDataChange?: (data: Record<string, any>) => void;
  onSubmit?: (data: Record<string, any>) => void;
}

export default function FormRuntimeComponent({ 
  schema, 
  onDataChange,
  onSubmit 
}: FormRuntimeProps) {
  const [runtime, setRuntime] = useState<FormRuntime | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const formRuntime = new FormRuntime(schema);
    setRuntime(formRuntime);
    
    formRuntime.initialize().then(() => {
      setLoading(false);
    });
    
    return () => {
      // Cleanup if needed
    };
  }, [schema]);
  
  useEffect(() => {
    if (!runtime || !onDataChange) return;
    
    onDataChange(runtime.exportData());
    
    return () => {
      // Cleanup if needed
    };
  }, [runtime, onDataChange]);
  
  const handleValueChange = async (componentKey: string, value: any) => {
    await runtime?.handleValueChange(componentKey, value);
  };
  
  const handleButtonClick = async (componentId: string) => {
    await runtime?.handleButtonClick(componentId);
    
    // Check if this is a submit button
    const component = schema.components.find(c => c.id === componentId);
    if (component?.type === 'button' && component.label.toLowerCase().includes('submit')) {
      onSubmit?.(runtime?.exportData() || {});
    }
  };
  
  if (loading || !runtime) {
    return <div>Loading form...</div>;
  }
  
  return (
    <FormComponentRenderer
      schema={schema}
      runtime={runtime}
      onValueChange={handleValueChange}
      onButtonClick={handleButtonClick}
    />
  );
}