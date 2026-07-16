import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
// #region agent log (guarded by VITE_DEBUG_AGENT_INGEST; leave unset in production)
const _dbg = import.meta.env.VITE_DEBUG_AGENT_INGEST
  ? (m: string, d?: object) => fetch('http://127.0.0.1:7242/ingest/5a811126-3bcf-4744-9ff0-298a7797a469', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'client/use-auth.tsx', message: m, data: d || {}, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'H3' }) }).catch(() => {})
  : () => {};
// #endregion
import { User, InsertUser } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { OFFLINE_ENABLED } from "@/lib/offline-config";
import { OfflineManager } from "@/lib/offline-storage";

type AuthResponse = {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, InsertUser>;
  logout: () => void;
};

type LoginData = {
  identifier: string;
  password: string;
  loginMethod: 'username' | 'email' | 'phone';
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        _dbg('/me fetch starting', {});
        const response = await apiRequest("GET", "/api/auth/me");
        _dbg('/me response', { status: response.status });
        if (response.status === 401) {
          return null;
        }
        const data = await response.json();
        _dbg('/me parsed', { userId: data?.id });
        return data;
      } catch (error: any) {
        _dbg('/me error', { err: error?.message });
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
      return await response.json();
    },
    onSuccess: (data: { user: User; tokens: { accessToken: string; refreshToken: string } }) => {
      _dbg('login mutation success', { userId: data.user.id });
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      
      // Update user data in cache
      queryClient.setQueryData(["/api/auth/me"], data.user);
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.user.firstName} ${data.user.lastName}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const response = await apiRequest("POST", "/api/auth/register", credentials);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }
      return await response.json();
    },
    onSuccess: (data: { user: User; tokens: { accessToken: string; refreshToken: string } }) => {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      
      // Update user data in cache
      queryClient.setQueryData(["/api/auth/me"], data.user);
      
      toast({
        title: "Welcome to Keru.ai!",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout function that clears everything and redirects
  const performLogout = () => {
    // 1. Clear tokens immediately (synchronous)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 2. Clear ALL localStorage except app version
    const appVersion = localStorage.getItem('app_version');
    localStorage.clear();
    if (appVersion) localStorage.setItem('app_version', appVersion);
    
    // 3. Clear sessionStorage too
    sessionStorage.clear();
    
    // 4. Clear query cache (synchronous)
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
    
    // 5. Clear all browser caches (async, best-effort)
    (async () => {
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
      } catch (e) {
        console.warn('Failed to clear service worker caches:', e);
      }
    })();
    
    // 6. Force reload from server immediately (don't wait for async)
    window.location.href = '/';
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiRequest("POST", "/api/auth/logout");
      } catch {
        // Ignore: revoke on server best-effort; always clear local state
      }
      performLogout();
    },
    onSuccess: () => {
      // Already handled in mutationFn
    },
    onError: () => {
      // Still perform logout even if something fails
      performLogout();
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        logout: () => logoutMutation.mutate(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}