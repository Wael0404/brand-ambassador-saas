'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse, RegisterData, LoginData } from '@/types';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
  updateBrandConfig: (brandId: string, configData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Registration successful!');
      return userData; // Return the user data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const updateBrandConfig = async (brandId: string, configData: any) => {
    try {
      const response = await apiClient.put(`/brands/${brandId}/app-config`, configData);
      if (!user) throw new Error('No user is logged in');
      const updatedUser = {
        ...user,
        brand: response.data,
        id: user.id ?? '',
        email: user.email ?? '',
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      };
      setUser(updatedUser as User);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Brand configuration updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update configuration');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    updateBrandConfig,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
