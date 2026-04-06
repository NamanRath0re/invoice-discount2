// engine/rules-engine.ts - Rule evaluation
import { ComponentSchema, RuleGroup, Condition, FormSchema } from '@/types/schema';
import { FormState } from './state';

export class RulesEngine {
  constructor(private schema: FormSchema, private state: FormState) {}
  
  evaluateRuleGroup(ruleGroup?: RuleGroup): boolean {
    if (!ruleGroup || !ruleGroup.conditions.length) return true;
    
    const results = ruleGroup.conditions.map(condition => 
      this.evaluateCondition(condition)
    );
    
    if (ruleGroup.operator === 'AND') {
      return results.every(result => result);
    } else {
      return results.some(result => result);
    }
  }
  
  private evaluateCondition(condition: Condition): boolean {
    let value: any;
    
    if (condition.source === 'component') {
      const component = this.schema.components.find(c => c.key === condition.key);
      if (!component) return false;
      value = this.state.values[condition.key];
    } else {
      // form-level conditions can be added here
      return false;
    }
    
    switch (condition.operator) {
      case 'eq':
        return value === condition.value;
      case 'neq':
        return value !== condition.value;
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value);
      case 'empty':
        return !value || (typeof value === 'string' && value.trim() === '');
      case 'notEmpty':
        return !!value && (typeof value !== 'string' || value.trim() !== '');
      case 'gt':
        return Number(value) > Number(condition.value);
      case 'lt':
        return Number(value) < Number(condition.value);
      case 'gte':
        return Number(value) >= Number(condition.value);
      case 'lte':
        return Number(value) <= Number(condition.value);
      default:
        return false;
    }
  }
  
  evaluateComponentVisibility(component: ComponentSchema): boolean {
    return this.evaluateRuleGroup(component.visibility);
  }
  
  evaluateComponentEnabled(component: ComponentSchema): boolean {
    return !component.ui.disabled && this.evaluateRuleGroup(component.enabled);
  }
  
  getDynamicOptions(component: ComponentSchema): { key: string; label: string; }[] {
    if (!component.options?.dynamic) {
      return component.options?.static || [];
    }
    
    const { dynamic } = component.options;
    
    if (dynamic.source === 'component' && dynamic.dependsOn) {
      const sourceValue = this.state.values[dynamic.dependsOn];
      if (dynamic.map && sourceValue) {
        return dynamic.map[sourceValue] || [];
      }
    } else if (dynamic.source === 'api' && dynamic.apiId) {
      const cachedData = this.state.apiCache[dynamic.apiId];
      if (cachedData && dynamic.responsePath) {
        return this.extractFromPath(cachedData, dynamic.responsePath) || [];
      }
    }
    
    return component.options?.static || [];
  }
  
  private extractFromPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
  
  updateComponentStates() {
    this.schema.components.forEach(component => {
      const visible = this.evaluateComponentVisibility(component);
      const enabled = this.evaluateComponentEnabled(component);
      
      return { visible, enabled };
    });
  }
}