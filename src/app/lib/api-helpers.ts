import { createClient } from '@/app/lib/supabase-server';

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.access_token && {
      'Authorization': `Bearer ${session.access_token}`,
    }),
    ...init?.headers,
  };
  
  return fetch(input, {
    ...init,
    headers,
  });
}

export async function handleApiError(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response;
}

export async function safeJsonParse(response: Response) {
  try {
    return await response.json();
  } catch (error) {
    throw new Error('Invalid JSON response');
  }
}

export function createApiClient(baseUrl: string = '') {
  return {
    get: async (endpoint: string, options?: RequestInit) => {
      const response = await fetchWithAuth(`${baseUrl}${endpoint}`, {
        method: 'GET',
        ...options,
      });
      await handleApiError(response);
      return safeJsonParse(response);
    },
    
    post: async (endpoint: string, data?: any, options?: RequestInit) => {
      const response = await fetchWithAuth(`${baseUrl}${endpoint}`, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
      await handleApiError(response);
      return safeJsonParse(response);
    },
    
    put: async (endpoint: string, data?: any, options?: RequestInit) => {
      const response = await fetchWithAuth(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
      await handleApiError(response);
      return safeJsonParse(response);
    },
    
    delete: async (endpoint: string, options?: RequestInit) => {
      const response = await fetchWithAuth(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        ...options,
      });
      await handleApiError(response);
      return safeJsonParse(response);
    },
  };
}