export type ComponentType = 'input' | 'textarea' | 'select' | 'radio' | 'button' | 'label' | 'switch';

export interface FormSchema {
  id: string;
  name: string;
  components: ComponentSchema[];
  apis?: ApiSchema[];
  version: string;
}

export interface ComponentSchema {
  id: string;
  key: string;
  type: ComponentType;
  label: string;
  
  ui: {
    placeholder?: string;
    helpText?: string;
    gridColumn: number;
    required: boolean;
    disabled: boolean;
    readonly?: boolean;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  
  value?: {
    default?: any;
    source?: 'static' | 'api' | 'component';
    apiId?: string;
    componentId?: string;
    responsePath?: string;
    transform?: 'string' | 'number' | 'boolean';
  };
  
  visibility?: RuleGroup;
  enabled?: RuleGroup;
  
  options?: {
    static?: Array<{ key: string; label: string }>;
    dynamic?: {
      source: 'component' | 'api';
      dependsOn?: string;
      apiId?: string;
      map?: Record<string, Array<{ key: string; label: string }>>;
      responsePath?: string;
      keyField?: string;
      labelField?: string;
    };
  };
  
  actions?: ActionSchema[];
  
  validation?: {
    rules: ValidationRule[];
    message?: string;
  };
}

export interface ApiSchema {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  
  body?: {
    type: 'static' | 'form';
    mapping?: Record<string, string>;
    staticBody?: any;
  };
  
  response?: {
    type: 'json';
    mapping?: Record<string, string>;
  };
  
  triggers?: {
    onLoad?: boolean;
    onFormChange?: string[]; // component keys that trigger this API
  };
  
  cache?: {
    enabled: boolean;
    ttl?: number; // in seconds
  };
}

export interface RuleGroup {
  operator: 'AND' | 'OR';
  conditions: Condition[];
}

export interface Condition {
  source: 'component' | 'form';
  key: string;
  operator: 'eq' | 'neq' | 'contains' | 'empty' | 'notEmpty' | 'gt' | 'lt' | 'gte' | 'lte';
  value?: any;
}

export interface ActionSchema {
  trigger: 'onClick' | 'onChange' | 'onLoad';
  type: 'setValue' | 'clearValue' | 'toggleVisibility' | 'resetForm' | 'callApi';
  target?: string[];
  payload?: any;
  delay?: number;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message?: string;
}