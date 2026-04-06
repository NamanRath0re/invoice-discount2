import { FormSchema } from '@/types/schema';

export interface FormState {
  values: Record<string, any>;
  visibility: Record<string, boolean>;
  enabled: Record<string, boolean>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
  apiCache: Record<string, any>;
  lastUpdated: Record<string, number>;
}

export class FormRuntimeState {
  private state: FormState;
  private schema: FormSchema;
  private listeners: Set<() => void> = new Set();
  
  constructor(schema: FormSchema) {
    this.schema = schema;
    this.state = this.initializeState(schema);
  }
  
  private initializeState(schema: FormSchema): FormState {
    const values: Record<string, any> = {};
    const visibility: Record<string, boolean> = {};
    const enabled: Record<string, boolean> = {};
    
    schema.components.forEach(component => {
      values[component.key] = component.value?.default;
      visibility[component.id] = true;
      enabled[component.id] = !component.ui.disabled;
    });
    
    return {
      values,
      visibility,
      enabled,
      loading: {},
      errors: {},
      apiCache: {},
      lastUpdated: {}
    };
  }
  
  getState(): FormState {
    return { ...this.state };
  }
  
  getComponentState(componentId: string) {
    const component = this.schema.components.find(c => c.id === componentId);
    if (!component) return null;
    
    return {
      value: this.state.values[component.key],
      visible: this.state.visibility[component.id],
      enabled: this.state.enabled[component.id],
      loading: this.state.loading[component.id],
      error: this.state.errors[component.key]
    };
  }
  
  setValue(componentKey: string, value: any) {
    this.state.values[componentKey] = value;
    this.state.lastUpdated[componentKey] = Date.now();
    this.notifyListeners();
  }
  
  setLoading(componentId: string, loading: boolean) {
    this.state.loading[componentId] = loading;
    this.notifyListeners();
  }
  
  setError(componentKey: string, error: string) {
    this.state.errors[componentKey] = error;
    this.notifyListeners();
  }
  
  setVisibility(componentId: string, visible: boolean) {
    this.state.visibility[componentId] = visible;
    this.notifyListeners();
  }
  
  setApiCache(apiId: string, data: any) {
    this.state.apiCache[apiId] = {
      data,
      timestamp: Date.now()
    };
    this.notifyListeners();
  }
  
  getApiCache(apiId: string): any {
    const cache = this.state.apiCache[apiId];
    if (!cache) return null;
    
    const api = this.schema.apis?.find(a => a.id === apiId);
    if (api?.cache?.enabled && api.cache.ttl) {
      const age = Date.now() - cache.timestamp;
      if (age > api.cache.ttl * 1000) {
        delete this.state.apiCache[apiId];
        return null;
      }
    }
    
    return cache.data;
  }
  
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
  
  reset() {
    this.state = this.initializeState(this.schema);
    this.notifyListeners();
  }
}