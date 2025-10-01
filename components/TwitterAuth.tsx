import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from './ui/icon-symbol';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../config/api';

WebBrowser.maybeCompleteAuthSession();

// Twitter OAuth 2.0 Configuration
const TWITTER_CLIENT_ID = 'RTMtVlJEVFZ2cE0wTW9YYzlkcjM6MTpjaQ';
const TWITTER_CLIENT_SECRET = 'gG0ZQhw8BIgS9nydrOpTO2h7AizIhAINSSo7z0Wkk-lmcReRGr';

const TwitterAuth = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // Mobile deep link redirect URI pointing to callback route
  const redirectUri = 'whampay://callback';

  console.log('📱 Mobile redirect URI:', redirectUri);
  console.log('🔗 Copy this URL to Twitter Developer Console:', redirectUri);
  console.log('⚠️  Make sure this EXACT URL is in Twitter Developer Console!');
  console.log('📱 Deep link route: /auth/twitter/callback should handle the callback');

  // Twitter OAuth 2.0 request with PKCE
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: TWITTER_CLIENT_ID,
      scopes: ['tweet.read', 'users.read', 'offline.access'],
      redirectUri: redirectUri,
      responseType: 'code',
      usePKCE: true,
    },
    {
      authorizationEndpoint: 'https://x.com/i/oauth2/authorize',
      tokenEndpoint: 'https://api.x.com/2/oauth2/token',
    }
  );

  // Debug request setup
  useEffect(() => {
    if (request) {
      console.log('📋 OAuth Request Details:');
      console.log('  - URL:', request.url);
      console.log('  - Client ID:', TWITTER_CLIENT_ID);
      console.log('  - Redirect URI:', redirectUri);
      console.log('  - Scopes:', ['tweet.read', 'users.read']);
      console.log('  - Code Challenge:', request.codeChallenge);
      console.log('  - Code Challenge Method:', request.codeChallengeMethod);
      console.log('  - State:', request.state);
    }
  }, [request, redirectUri]);

  // Token exchange function với useCallback
  const handleTokenExchange = useCallback(async (code: string) => {
    if (!request?.codeVerifier) {
      Alert.alert('Error', 'Missing code verifier for PKCE');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Exchanging authorization code...');

    try {
      console.log('🔄 Starting token exchange...');
      console.log('📱 Code:', code.substring(0, 20) + '...');
      console.log('🔐 Code verifier length:', request.codeVerifier.length);
      console.log('📍 Redirect URI:', redirectUri);

      // Prepare token request body
      const tokenParams = {
        code,
        grant_type: 'authorization_code',
        client_id: TWITTER_CLIENT_ID,
        redirect_uri: redirectUri,
        code_verifier: request.codeVerifier,
      };

      console.log('📤 Token request params:', tokenParams);

      // Manual URL encoding to ensure compatibility
      const bodyString = Object.entries(tokenParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      console.log('📤 Request body string:', bodyString);

      // Exchange code for access token
      const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`)}`,
        },
        body: bodyString,
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token exchange failed:');
        console.error('Status:', tokenResponse.status);
        console.error('Response:', errorText);
        console.error('Request body:', new URLSearchParams(tokenParams).toString());
        
        // Parse error response
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Twitter API Error: ${errorData.error_description || errorData.error || 'Token exchange failed'}`);
        } catch {
          throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
        }
      }

      const tokenData = await tokenResponse.json();
      console.log('✅ Token received successfully');

      // Send Twitter token to backend for authentication
      setLoadingStep('Authenticating with WhamPay...');
      console.log('🔐 Twitter Access Token:', tokenData.access_token);
      const backendResponse = await fetch(`${BACKEND_URL}/auth/twitter/mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twitterAccessToken: tokenData.access_token,
          deviceInfo: 'Mobile App',
        }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.message || 'Backend authentication failed');
      }

      const backendData = await backendResponse.json();
      console.log('✅ Backend authentication successful');

      // Keep Twitter token for API calls
      await AsyncStorage.setItem('twitter_token', tokenData.access_token);

      // Use AuthContext to handle login and navigation
      await login({
        accessToken: backendData.data.accessToken,
        refreshToken: backendData.data.refreshToken,
        user: backendData.data.user,
      });

      // Success message
      setLoadingStep(backendData.data.isCreatedWallet ? 'Welcome to WhamPay!' : 'Welcome back!');
      console.log('🎉 WhamPay login completed! AuthContext will handle navigation...');
      
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 1000);

    } catch (error) {
      console.error('❌ Authentication failed:', error);
      Alert.alert(
        'Login Failed', 
        error instanceof Error ? error.message : 'An error occurred during login'
      );
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [request, redirectUri, router, login]);

  // Check for stored auth code from deep link callback
  useEffect(() => {
    const checkStoredAuthCode = async () => {
      try {
        const storedCode = await AsyncStorage.getItem('twitter_auth_code');
        if (storedCode) {
          console.log('🔍 Found stored Twitter auth code');
          // Clear stored code
          await AsyncStorage.removeItem('twitter_auth_code');
          await AsyncStorage.removeItem('twitter_auth_state');
          // Process the code
          handleTokenExchange(storedCode);
        }
      } catch (error) {
        console.error('Error checking stored auth code:', error);
      }
    };

    checkStoredAuthCode();
  }, [handleTokenExchange]);

  // Handle OAuth response từ Twitter (Expo Go fallback)
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      console.log('✅ OAuth authorization successful (Expo Go)');
      handleTokenExchange(code);
    } else if (response?.type === 'error') {
      console.error('❌ OAuth error:', response.error);
      setIsLoading(false);
      setLoadingStep('');
      Alert.alert(
        'Twitter Login Error', 
        response.error?.description || 'Authorization failed'
      );
    }
  }, [response, handleTokenExchange]);

  // Start Twitter login process
  const startTwitterLogin = async () => {
    if (!request) {
      Alert.alert('Please Wait', 'Twitter login is initializing...');
      return;
    }

    console.log('🚀 Starting Twitter OAuth flow...');
    console.log('📍 Redirect URI:', redirectUri);
    console.log('🔑 Client ID:', TWITTER_CLIENT_ID);
    
    // Log the Twitter authorization URL
    if (request.url) {
      console.log('🔗 Twitter Authorization URL:', request.url);
      console.log('🎯 You can copy this URL to test in browser:', request.url);
    }

    setIsLoading(true);
    setLoadingStep('Opening Twitter login...');

    try {
      const result = await promptAsync();
      console.log('📱 PromptAsync result:', result);
    } catch (error) {
      console.error('❌ Failed to open Twitter login:', error);
      setIsLoading(false);
      setLoadingStep('');
      Alert.alert('Error', 'Could not open Twitter login');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={startTwitterLogin}
        disabled={isLoading || !request}
      >
        <LinearGradient
          colors={['#1DA1F2', '#0d8bd9']}
          style={styles.gradient}
        >
          <IconSymbol name="xmark" size={20} color="white" />
          <Text style={styles.buttonText}>
            {isLoading ? 'Logging in...' : 'Continue with X'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="white" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>{loadingStep}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loadingSpinner: {
    marginBottom: 8,
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default TwitterAuth;