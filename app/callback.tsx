import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TwitterAuthCallback() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing Twitter OAuth callback in root route...');
        
        // Get parameters from deep link
        const code = Array.isArray(searchParams.code) ? searchParams.code[0] : searchParams.code;
        const state = Array.isArray(searchParams.state) ? searchParams.state[0] : searchParams.state;
        const error = Array.isArray(searchParams.error) ? searchParams.error[0] : searchParams.error;
        const error_description = Array.isArray(searchParams.error_description) ? searchParams.error_description[0] : searchParams.error_description;

        console.log('📋 Callback params:', { 
          code: code ? code.substring(0, 20) + '...' : 'none', 
          state, 
          error, 
          error_description 
        });

        if (error) {
          console.error('❌ OAuth error:', error, error_description);
          router.replace('/auth/login');
          return;
        }

        if (code) {
          console.log('✅ Authorization code received');
          
          // Store the code for TwitterAuth component to process
          await AsyncStorage.setItem('twitter_auth_code', code);
          await AsyncStorage.setItem('twitter_auth_state', state || '');
          
          console.log('💾 Stored auth code, navigating to login...');
          
          // Navigate back to login to complete token exchange
          router.replace('/auth/login');
        } else {
          console.error('❌ No authorization code received');
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('❌ Error processing Twitter callback:', error);
        router.replace('/auth/login');
      }
    };

    // Delay to ensure params are loaded
    const timer = setTimeout(handleCallback, 500);
    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1DA1F2" />
      <Text style={styles.text}>Processing Twitter login...</Text>
      <Text style={styles.subtext}>Please wait...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  subtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});