import { FormSchema } from '@/types/schema';

export class SchemaExporter {
  static exportToJson(schema: FormSchema): string {
    const cleanSchema: FormSchema = {
      ...schema,
      components: schema.components.map(comp => ({
        ...comp,
        value: comp.value ? { ...comp.value } : undefined,
        ui: { ...comp.ui },
        visibility: comp.visibility ? this.cloneRuleGroup(comp.visibility) : undefined,
        enabled: comp.enabled ? this.cloneRuleGroup(comp.enabled) : undefined,
        options: comp.options ? {
          ...comp.options,
          static: comp.options.static ? [...comp.options.static] : undefined,
          dynamic: comp.options.dynamic ? {
            ...comp.options.dynamic,
            map: comp.options.dynamic.map ? { ...comp.options.dynamic.map } : undefined
          } : undefined
        } : undefined,
        actions: comp.actions ? comp.actions.map(action => ({ ...action })) : undefined
      })),
      apis: schema.apis?.map(api => ({
        ...api,
        headers: api.headers ? { ...api.headers } : undefined,
        body: api.body ? { ...api.body } : undefined,
        response: api.response ? { ...api.response } : undefined,
        triggers: api.triggers ? { ...api.triggers } : undefined,
        cache: api.cache ? { ...api.cache } : undefined
      })) || []
    };
    
    return JSON.stringify(cleanSchema, null, 2);
  }
  
  static importFromJson(json: string): FormSchema {
    const schema = JSON.parse(json);
    
    return this.normalizeSchema(schema);
  }
  
  static normalizeSchema(schema: any): FormSchema {
    return {
      id: schema.id || `form-${Date.now()}`,
      name: schema.name || 'Imported Form',
      version: schema.version || '1.0.0',
      components: (schema.components || []).map((comp: any) => ({
        id: comp.id || `comp-${Date.now()}`,
        key: comp.key || comp.id,
        type: comp.type,
        label: comp.label || 'Unlabeled',
        ui: {
          placeholder: comp.ui?.placeholder || '',
          helpText: comp.ui?.helpText || '',
          gridColumn: comp.ui?.gridColumn || 12,
          required: comp.ui?.required || false,
          disabled: comp.ui?.disabled || false,
          readonly: comp.ui?.readonly || false,
          variant: comp.ui?.variant || 'default',
          size: comp.ui?.size || 'default',
          minLength: comp.ui?.minLength,
          maxLength: comp.ui?.maxLength,
          pattern: comp.ui?.pattern,
        },
        value: comp.value,
        visibility: comp.visibility,
        enabled: comp.enabled,
        options: comp.options,
        actions: comp.actions || [],
        validation: comp.validation,
      })),
      apis: schema.apis || [],
    };
  }
  
  static exportForMobile(schema: FormSchema): any {
    return {
    formId: schema.id,
      formName: schema.name,
      version: schema.version,
      fields: schema.components.map(comp => ({
        fieldId: comp.id,
        fieldKey: comp.key,
        type: comp.type,
        label: comp.label,
        config: comp.ui,
        rules: {
          visibility: comp.visibility,
          enabled: comp.enabled,
        },
        options: comp.options,
      })),
      endpoints: schema.apis?.map(api => ({
        endpointId: api.id,
        name: api.name,
        method: api.method,
        url: api.url,
        headers: api.headers,
        bodyMapping: api.body?.mapping,
        responseMapping: api.response?.mapping,
      })),
    };
  }
  
  static generateTypescriptInterface(schema: FormSchema): string {
    const interfaceName = `${schema.name.replace(/\s+/g, '')}FormData`;
    
    let ts = `interface ${interfaceName} {\n`;
    
    schema.components.forEach(comp => {
      if (comp.type !== 'button' && comp.type !== 'label') {
        let type = 'string';
        if (comp.type === 'switch') type = 'boolean';
        if (comp.type === 'radio') type = 'string';
        if (comp.type === 'select') type = 'string';
        
        ts += `  ${comp.key}?: ${type};\n`;
      }
    });
    
    ts += `}\n\n`;
    ts += `// Form Schema Version: ${schema.version}\n`;
    ts += `// Total Components: ${schema.components.length}\n`;
    ts += `// Total APIs: ${schema.apis?.length || 0}\n`;
    
    return ts;
  }
  
  private static cloneRuleGroup(ruleGroup: any): any {
    if (!ruleGroup) return undefined;
    return {
      ...ruleGroup,
      conditions: ruleGroup.conditions ? ruleGroup.conditions.map((c: any) => ({ ...c })) : []
    };
  }
}