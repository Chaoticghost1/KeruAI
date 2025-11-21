import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { OfflineManager } from "./offline-storage";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Configure API base URL for web interface only (Telegram bot has separate config)
// In development, API requests go through the same server (Vite middleware mode)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  additionalHeaders?: Record<string, string>
): Promise<Response> {
  // Ensure URL is absolute
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // Honduras-first: Check for offline/data saver conditions
  const settings = await OfflineManager.getSettings();
  const dataSaverEnabled = settings?.dataSaverMode || false;
  
  // For GET requests, try cache first if offline or data saver enabled
  if (method === 'GET' && (!navigator.onLine || dataSaverEnabled)) {
    const cachedData = await OfflineManager.getCachedContent(fullUrl);
    if (cachedData) {
      console.log('Serving from cache (Honduras data saver/offline):', fullUrl);
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Get auth token from localStorage
  const token = localStorage.getItem('accessToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
  
  // Honduras-first: Add data saver headers for low-bandwidth optimization
  if (dataSaverEnabled) {
    headers['Save-Data'] = '1';
    // Note: Accept-Encoding is handled automatically by the browser
  }
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log('API Request:', { method, fullUrl, API_BASE_URL });
  
  let res: Response;
  try {
    res = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (fetchError: any) {
    console.error('API Request failed:', { error: fetchError, fullUrl, method });
    throw new Error(`Network error: ${fetchError?.message || 'Failed to connect to server'}`);
  }

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
    // Honduras-first: For GET requests, try serving from cache if network fails
    if (method === 'GET') {
      const cachedData = await OfflineManager.getCachedContent(fullUrl);
      if (cachedData) {
        console.log('Network failed, serving from cache:', fullUrl);
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  // Honduras-first: Cache successful GET responses for offline use
  if (method === 'GET' && res.ok) {
    try {
      const responseClone = res.clone();
      const data = await responseClone.json();
      const cacheHours = dataSaverEnabled ? 48 : 24; // Cache longer in data saver mode
      await OfflineManager.cacheContent(fullUrl, data, cacheHours);
    } catch (cacheError) {
      console.warn('Failed to cache response:', cacheError);
    }
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle both string URLs and hierarchical array keys
    // Array: ['/api/progress', 'profile', userId] → '/api/progress/profile/123'
    // String: '/api/users' → '/api/users'
    const url = Array.isArray(queryKey) && queryKey.length > 1
      ? queryKey.filter(segment => segment !== undefined && segment !== null).join('/')
      : queryKey[0] as string;
    
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
