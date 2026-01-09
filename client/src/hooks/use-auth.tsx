import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
        const response = await apiRequest("GET", "/api/auth/me");
        if (response.status === 401) {
          return null;
        }
        return await response.json();
      } catch (error) {
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

  // Simple logout function that clears everything and redirects
  const performLogout = async () => {
    // 1. Clear tokens immediately
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 2. Clear ALL localStorage just to be safe
    localStorage.clear();
    
    // 3. Clear query cache
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
    
    // 4. Clear service worker cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // 5. Force reload from server (not from cache)
    window.location.replace('/');
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await performLogout();
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