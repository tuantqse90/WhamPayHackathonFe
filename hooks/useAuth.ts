import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ApiClient } from '../utils/ApiClient';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  twitterId?: string;
  address: string;
  provider?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('whampay_access_token');
      const userData = await AsyncStorage.getItem('whampay_user');

      if (!token || !userData) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      try {
        const response = await ApiClient.getUserInfo();
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Token verification failed:', error);
        await logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend logout if authenticated
      if (isAuthenticated) {
        await ApiClient.post('/auth/logout', {});
      }
    } catch (error) {
      console.log('Logout API error:', error);
    } finally {
      // Clear local storage
      await AsyncStorage.multiRemove([
        'whampay_access_token',
        'whampay_refresh_token',
        'whampay_user',
        'twitter_token',
      ]);
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    AsyncStorage.setItem('whampay_user', JSON.stringify(updatedUser));
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    checkAuthStatus,
    logout,
    updateUser,
  };
};