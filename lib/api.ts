import { Constants } from "./constants";

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  url?: string;
}

export async function callApi(endpoint: string, options: ApiOptions) {
  try {
    const response = await fetch(options.url ? options.url : Constants.baseUrl + endpoint, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      return {
        status: false,
        message: response.statusText,
        data: {}
      }
    }

    const res = await response.json();

    return {
      status: true,
      message: '',
      data: res
    };
  } catch (error) {
    console.log(error);

    return {
      status: false,
      message: 'Something Went Wrong!',
      data: {}
    }
  }
}