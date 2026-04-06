import { FormSchema } from '@/types/schema';
import { FormRuntimeState } from './state';
import { RulesEngine } from './rules-engine';
import { EffectsEngine } from './effects-engine';
import { ApiExecutor } from './api-executor';

export class FormRuntime {
  private state: FormRuntimeState;
  private rulesEngine: RulesEngine;
  private effectsEngine: EffectsEngine;
  private apiExecutor: ApiExecutor;
  private initialized = false;
  
  constructor(private schema: FormSchema) {
    this.state = new FormRuntimeState(schema);
    this.apiExecutor = new ApiExecutor();
    this.rulesEngine = new RulesEngine(schema, this.state.getState());
    this.effectsEngine = new EffectsEngine(schema, this.state, this.apiExecutor);
    
    // Subscribe to state changes to re-evaluate rules
    this.state.subscribe(() => {
      this.rulesEngine = new RulesEngine(schema, this.state.getState());
      this.updateComponentStates();
    });
  }
  
  async initialize() {
    if (this.initialized) return;
    
    // Execute onLoad actions
    const onLoadActions = this.schema.components.flatMap(component =>
      component.actions?.filter(action => action.trigger === 'onLoad') || []
    );
    
    await this.effectsEngine.executeActions(onLoadActions);
    
    // Execute onLoad APIs
    const onLoadApis = this.schema.apis?.filter(api => api.triggers?.onLoad) || [];
    for (const api of onLoadApis) {
      const action: any = {
        trigger: 'onLoad',
        type: 'callApi',
        payload: { apiId: api.id }
      };
      await this.effectsEngine.executeActions([action]);
    }
    
    this.initialized = true;
  }
  
  private updateComponentStates() {
    this.schema.components.forEach(component => {
      const visible = this.rulesEngine.evaluateComponentVisibility(component);
      // const enabled = this.rulesEngine.evaluateComponentEnabled(component);
      
      if (this.state.getComponentState(component.id)?.visible !== visible) {
        this.state.setVisibility(component.id, visible);
      }
      
      // Note: We don't directly set enabled here as it's derived from rules + UI config
    });
  }
  
  async handleValueChange(componentKey: string, value: any) {
    // Update value
    this.state.setValue(componentKey, value);
    
    // Find component
    const component = this.schema.components.find(c => c.key === componentKey);
    if (!component) return;
    
    // Execute onChange actions for this component
    const onChangeActions = component.actions?.filter(a => a.trigger === 'onChange') || [];
    await this.effectsEngine.executeActions(onChangeActions, { componentKey, value });
    
    // Trigger reactive APIs
    const reactiveApis = this.schema.apis?.filter(api => 
      api.triggers?.onFormChange?.includes(componentKey)
    ) || [];
    
    for (const api of reactiveApis) {
      const action: any = {
        trigger: 'onChange',
        type: 'callApi',
        payload: { apiId: api.id }
      };
      await this.effectsEngine.executeActions([action], { componentKey, value });
    }
  }
  
  async handleButtonClick(componentId: string) {
    const component = this.schema.components.find(c => c.id === componentId);
    if (!component) return;
    
    const onClickActions = component.actions?.filter(a => a.trigger === 'onClick') || [];
    await this.effectsEngine.executeActions(onClickActions);
  }
  
  getComponentProps(componentId: string) {
    const component = this.schema.components.find(c => c.id === componentId);
    if (!component) return null;
    
    const componentState = this.state.getComponentState(componentId);
    const options = this.rulesEngine.getDynamicOptions(component);
    
    return {
      ...component.ui,
      id: componentId,
      key: component.key,
      label: component.label,
      value: componentState?.value,
      visible: componentState?.visible,
      enabled: componentState?.enabled,
      loading: componentState?.loading,
      error: componentState?.error,
      options,
      placeholder: component.ui.placeholder,
      helpText: component.ui.helpText,
      required: component.ui.required,
      disabled: component.ui.disabled || !componentState?.enabled,
      readonly: component.ui.readonly,
    };
  }
  
  getState() {
    return this.state.getState();
  }
  
  reset() {
    this.state.reset();
  }
  
  exportData() {
    return this.state.getState().values;
  }
  
  exportSchema(): FormSchema {
    return JSON.parse(JSON.stringify(this.schema));
  }
}