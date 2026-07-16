import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Configure API base URL - empty = same origin (Vite dev proxy)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  additionalHeaders?: Record<string, string>
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const token = localStorage.getItem('accessToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  // Token refresh on 401
  if (res.status === 401 && token) {
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
          headers['Authorization'] = `Bearer ${tokens.accessToken}`;
          res = await fetch(fullUrl, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            cache: 'no-store',
          });
        }
      } catch {
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
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't cache data
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
