/**
 * API module for Gami Protocol SDK
 * This module handles all API requests to the Gami Protocol server
 */

let apiUrl = '';
let apiKey = '';

/**
 * Configure the API module
 * @param baseUrl The base URL for API requests
 * @param key The API key for authentication
 */
export function configureApi(baseUrl: string, key: string): void {
  apiUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  apiKey = key;
}

/**
 * Make an API request
 * @param method HTTP method
 * @param endpoint API endpoint
 * @param body Request body (for POST, PUT, PATCH)
 * @returns Response object
 */
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: any
): Promise<Response> {
  if (!apiUrl || !apiKey) {
    throw new Error('API not configured. Call configureApi() first.');
  }

  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: HeadersInit = {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok && response.status !== 401) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }
  
  return response;
}