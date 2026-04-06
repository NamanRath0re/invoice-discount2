import { ApiSchema } from '@/types/schema';

export class ApiExecutor {
  async execute(api: ApiSchema, formValues: Record<string, any>): Promise<any> {
    const url = this.buildUrl(api.url, formValues);
    const headers = this.buildHeaders(api.headers);
    const body = this.buildBody(api.body, formValues);
    
    const options: RequestInit = {
      method: api.method,
      headers,
    };
    
    if (body && ['POST', 'PUT', 'DELETE'].includes(api.method)) {
      options.body = JSON.stringify(body);
    }
    console.log(url, options);
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API ${api.id} failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  private buildUrl(url: string, formValues: Record<string, any>): string {
    return url.replace(/:(\w+)/g, (_, key) => {
      return formValues[key] || '';
    });
  }
  
  private buildHeaders(apiHeaders?: Record<string, string>): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...apiHeaders
    });
    
    return headers;
  }
  
  private buildBody(
    bodyConfig?: ApiSchema['body'],
    formValues?: Record<string, any>
  ): any {
    if (!bodyConfig) return undefined;
    
    if (bodyConfig.type === 'static') {
      return bodyConfig.staticBody;
    }
    
    if (bodyConfig.type === 'form' && bodyConfig.mapping) {
      const mappedBody: Record<string, any> = {};
      
      Object.entries(bodyConfig.mapping).forEach(([formKey, apiField]) => {
        mappedBody[apiField] = formValues ? formValues[formKey] : undefined;
      });
      
      return mappedBody;
    }
    
    return undefined;
  }
}