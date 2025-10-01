import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from './ui/icon-symbol';

WebBrowser.maybeCompleteAuthSession();

// Twitter OAuth 2.0 Configuration
const TWITTER_CLIENT_ID = 'TGpqWGNodzNZQkFoU1VQSW0wWVQ6MTpjaQ';
const TWITTER_CLIENT_SECRET = 'obbuP9DNMBHtSBvVNV-yjgwtCj44-HJDXHFopyij8BBjDf8Z54';

const TwitterAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // Redirect URI 
  const redirectUri = 'http://localhost:8000/api/v1/auth/twitter/callback';

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
      tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
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

      // Exchange code for access token
      const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: TWITTER_CLIENT_ID,
          redirect_uri: redirectUri,
          code_verifier: request.codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token exchange failed:', tokenResponse.status, errorText);
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('✅ Token received successfully');

      // Get user info from Twitter
      setLoadingStep('Getting user information...');
      const userResponse = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user information from Twitter');
      }

      const userData = await userResponse.json();
      console.log('✅ User data retrieved:', userData.data?.username);

      // Store authentication data
      await AsyncStorage.setItem('twitter_token', tokenData.access_token);
      await AsyncStorage.setItem('twitter_user', JSON.stringify(userData.data));

      // Success - navigate to main app
      setLoadingStep('Login successful!');
      setTimeout(() => {
        router.replace('/(tabs)' as any);
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
  }, [request, redirectUri, router]);

  // Handle OAuth response từ Twitter
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      console.log('✅ OAuth authorization successful');
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