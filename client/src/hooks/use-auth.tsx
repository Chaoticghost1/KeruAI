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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("accessToken"); // Changed from "token" to "accessToken"
      if (!token) return { message: "Already logged out" };

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      // Clear tokens regardless of response status
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      if (!response.ok && response.status !== 401) {
        throw new Error("Logout failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      // Cancel any ongoing queries
      queryClient.cancelQueries();

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      // Even if logout fails on server, clear local tokens and user data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      queryClient.cancelQueries();

      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
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