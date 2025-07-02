import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Configure API base URL for web interface only (Telegram bot has separate config)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  additionalHeaders?: Record<string, string>
): Promise<Response> {
  // Ensure URL is absolute
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // Get auth token from localStorage
  const token = localStorage.getItem('accessToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log('API Request:', { method, fullUrl, API_BASE_URL });
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle token expiration
  if (res.status === 401 && token) {
    // Try to refresh token if available
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        
        if (refreshRes.ok) {
          const { tokens } = await refreshRes.json();
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${tokens.accessToken}`;
          const retryRes = await fetch(fullUrl, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
          });
          
          if (!retryRes.ok) {
            const text = await retryRes.text();
            throw new Error(`${retryRes.status}: ${text}`);
          }
          
          return retryRes;
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    try {
      const res = await apiRequest('GET', url);
      return await res.json();
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error.message?.includes('401')) {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
