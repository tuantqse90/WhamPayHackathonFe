import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '../config/api';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  twitterId?: string;
  address: string;
  provider?: string;
  status?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: { accessToken: string; refreshToken: string; user: AuthUser }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('🔍 Checking auth status...');
      
      // Debug: log all storage keys
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('📦 All storage keys:', allKeys);
      
      const [accessToken, userData] = await AsyncStorage.multiGet([
        'whampay_access_token',
        'whampay_user'
      ]);

      const token = accessToken[1];
      const userDataStr = userData[1];

      console.log('🔑 Token exists:', !!token);
      console.log('👤 User data exists:', !!userDataStr);

      if (!token || !userDataStr) {
        console.log('❌ No tokens found, user not authenticated');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Parse user data
      const parsedUser: AuthUser = JSON.parse(userDataStr);
      
      // Verify token is not expired (simplified - no auto-refresh to avoid circular dependency)
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (tokenPayload.exp < currentTime) {
          console.log('⏰ Token expired, please login again');
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('✅ User authenticated:', parsedUser.name);
      setUser(parsedUser);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out user...');
      
      // Clear all auth data
      await AsyncStorage.multiRemove([
        'whampay_access_token',
        'whampay_refresh_token',
        'whampay_user',
        'twitter_token',
      ]);
      
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout successful');
      
      // Navigate to login
      router.replace('/auth/login');
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 Attempting token refresh...');
      const refreshTokenValue = await AsyncStorage.getItem('whampay_refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data?.accessToken || !data.data?.refreshToken) {
        throw new Error('Invalid refresh response structure');
      }
      
      await AsyncStorage.multiSet([
        ['whampay_access_token', data.data.accessToken],
        ['whampay_refresh_token', data.data.refreshToken],
      ]);

      console.log('✅ Token refreshed successfully');
      
      // Update auth state after successful refresh
      const userData = await AsyncStorage.getItem('whampay_user');
      if (userData) {
        const parsedUser: AuthUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      await logout();
      return false;
    }
  }, [logout]);

  const login = useCallback(async (tokens: { accessToken: string; refreshToken: string; user: AuthUser }) => {
    try {
      console.log('🔐 Logging in user:', tokens.user.name);
      
      // Store tokens and user data
      await AsyncStorage.multiSet([
        ['whampay_access_token', tokens.accessToken],
        ['whampay_refresh_token', tokens.refreshToken],
        ['whampay_user', JSON.stringify(tokens.user)],
      ]);

      setUser(tokens.user);
      setIsAuthenticated(true);
      
      console.log('✅ Login successful, navigating to home');
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};