import { FormSchema, ActionSchema, ApiSchema } from '@/types/schema';
import { FormRuntimeState } from './state';
import { ApiExecutor } from './api-executor';

export class EffectsEngine {
  constructor(
    private schema: FormSchema,
    private state: FormRuntimeState,
    private apiExecutor: ApiExecutor
  ) {}
  
  async executeActions(actions: ActionSchema[], context?: any) {
    for (const action of actions) {
      await this.executeAction(action, context);
      
      if (action.delay) {
        await new Promise(resolve => setTimeout(resolve, action.delay));
      }
    }
  }
  
  private async executeAction(action: ActionSchema, context?: any) {
    switch (action.type) {
      case 'setValue':
        await this.executeSetValue(action);
        break;
      case 'clearValue':
        await this.executeClearValue(action);
        break;
      case 'toggleVisibility':
        await this.executeToggleVisibility(action);
        break;
      case 'resetForm':
        this.state.reset();
        break;
      case 'callApi':
        await this.executeApiCall(action);
        break;
    }
  }
  
  private async executeSetValue(action: ActionSchema) {
    if (!action.target || !action.payload) return;
    
    action.target.forEach(targetKey => {
      this.state.setValue(targetKey, action.payload);
    });
  }
  
  private async executeClearValue(action: ActionSchema) {
    if (!action.target) return;
    
    action.target.forEach(targetKey => {
      this.state.setValue(targetKey, '');
    });
  }
  
  private async executeToggleVisibility(action: ActionSchema) {
    if (!action.target) return;
    
    action.target.forEach(targetId => {
      const current = this.state.getComponentState(targetId);
      if (current) {
        this.state.setVisibility(targetId, !current.visible);
      }
    });
  }
  
  private async executeApiCall(action: ActionSchema) {
    if (!action.payload?.apiId) return;
    
    const api = this.schema.apis?.find(a => a.id === action.payload.apiId);
    if (!api) return;
    
    if (api.cache?.enabled) {
      const cached = this.state.getApiCache(api.id);
      if (cached) {
        this.processApiResponse(api, cached);
        return;
      }
    }
    
    try {
      const response = await this.apiExecutor.execute(api, this.state.getState().values);
      this.state.setApiCache(api.id, response);
      this.processApiResponse(api, response);
    } catch (error) {
      console.error('API execution failed:', error);
    }
  }
  
  private processApiResponse(api: ApiSchema, response: any) {
    if (!api.response?.mapping) return;
    
    Object.entries(api.response.mapping).forEach(([responsePath, componentKey]) => {
      const value = this.extractFromPath(response, responsePath);
      this.state.setValue(componentKey, value);
    });
  }
  
  private extractFromPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}