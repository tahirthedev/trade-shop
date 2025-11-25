const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (fetchOptions.headers) {
    Object.assign(headers, fetchOptions.headers);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    apiFetch<T>(endpoint, { method: 'GET', token }),
  
  post: <T>(endpoint: string, body?: any, token?: string) =>
    apiFetch<T>(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(body),
      token 
    }),
  
  put: <T>(endpoint: string, body?: any, token?: string) =>
    apiFetch<T>(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(body),
      token 
    }),
  
  delete: <T>(endpoint: string, token?: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE', token }),
};

// Also export as apiClient for compatibility
export const apiClient = api;
