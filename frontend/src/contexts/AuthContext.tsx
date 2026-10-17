'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';
import { AuthResponse } from '@/types/auth';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (authClient.isAuthenticated()) {
      try {
        const userData = await authClient.getCurrentUser();
        setUser(userData as AuthResponse['user']);
      } catch (error) {
        authClient.logout();
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authClient.login({ email, password });
      setUser(response.user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error; // Re-throw to let the calling component handle it
    }
  };

  const register = async (email: string, password: string, full_name: string) => {
    try {
      const response = await authClient.register({ email, password, full_name });
      setUser(response.user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error; // Re-throw to let the calling component handle it
    }
  };

  const logout = () => {
    authClient.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authClient.getCurrentUser();
      setUser(userData as AuthResponse['user']);
    } catch (error) {
      authClient.logout();
      setUser(null);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await authClient.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
