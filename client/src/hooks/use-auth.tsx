import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  isVerified: boolean;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginData {
  username?: string;
  email?: string;
  phoneNumber?: string;
  password: string;
}

interface RegisterData {
  username: string;
  email?: string;
  phoneNumber?: string;
  password: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  verificationToken?: string;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, RegisterData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Get current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        return await response.json();
      } catch (error: any) {
        if (error.status === 401 || error.status === 403) {
          // Clear any stored tokens if unauthorized
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<AuthResponse> => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (authResponse: AuthResponse) => {
      // Store tokens
      localStorage.setItem("accessToken", authResponse.tokens.accessToken);
      localStorage.setItem("refreshToken", authResponse.tokens.refreshToken);
      
      // Update user data in cache
      queryClient.setQueryData(["/api/auth/me"], authResponse.user);
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${authResponse.user.username}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData): Promise<AuthResponse> => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return await res.json();
    },
    onSuccess: (authResponse: AuthResponse) => {
      // Store tokens
      localStorage.setItem("accessToken", authResponse.tokens.accessToken);
      localStorage.setItem("refreshToken", authResponse.tokens.refreshToken);
      
      // Update user data in cache
      queryClient.setQueryData(["/api/auth/me"], authResponse.user);
      
      toast({
        title: "Account created!",
        description: `Welcome to Keru.ai, ${authResponse.user.firstName || authResponse.user.username}!`,
      });

      // Show verification notice if email verification is needed
      if (!authResponse.user.isVerified && authResponse.verificationToken) {
        toast({
          title: "Verify your email",
          description: "Please check your email to verify your account",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      // Clear tokens and user data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      queryClient.setQueryData(["/api/auth/me"], null);
      
      // Clear all cached data
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: any) => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "You have been logged out",
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