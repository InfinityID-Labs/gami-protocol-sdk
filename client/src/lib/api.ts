import { apiRequest } from './queryClient';

export async function apiKeyRequest(
  method: string,
  url: string,
  apiKey: string,
  data?: unknown | undefined
): Promise<Response> {
  const headers: HeadersInit = data 
    ? { 'Content-Type': 'application/json', 'X-API-Key': apiKey } 
    : { 'X-API-Key': apiKey };
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });
  
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}