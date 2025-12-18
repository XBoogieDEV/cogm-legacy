"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "viewer";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "cogm_admin_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);
  const sessionData = useQuery(
    api.auth.validateSession,
    token ? { token } : "skip"
  );

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
    setIsInitialized(true);
  }, []);

  const isLoading = !isInitialized || (token !== null && sessionData === undefined);
  const user = sessionData?.user as User | null ?? null;
  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await loginMutation({ email, password });
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutMutation({ token });
      } catch {
        // Ignore logout errors
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  // If session is invalid, clear token
  useEffect(() => {
    if (isInitialized && token && sessionData === null) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
  }, [isInitialized, token, sessionData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
