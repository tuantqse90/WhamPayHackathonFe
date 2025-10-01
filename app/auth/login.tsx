import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [animatedValue] = useState(new Animated.Value(0));
  const [logoScale] = useState(new Animated.Value(0.8));
  const [logoOpacity] = useState(new Animated.Value(0));
  const [buttonPress, setButtonPress] = useState(false);

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, [animatedValue, logoOpacity, logoScale]);

  const handleXLogin = () => {
    setButtonPress(true);
    
    // Mock login process
    setTimeout(() => {
      setButtonPress(false);
      Alert.alert(
        'Login Mock', 
        'X login integration will be implemented later. Proceeding to app...',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/home'),
          }
        ]
      );
    }, 300);
  };

  const pulseScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const glowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0D1B2A', '#1B263B', '#2E4057', '#1B263B']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Background Elements */}
      <Animated.View
        style={[
          styles.glowCircle,
          styles.glowCircle1,
          {
            opacity: glowOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.glowCircle,
          styles.glowCircle2,
          {
            opacity: glowOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />

      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Main Logo Circle */}
          <Animated.View
            style={[
              styles.logoCircle,
              {
                transform: [{ scale: pulseScale }],
              },
            ]}
          >
            <LinearGradient
              colors={['#00CCFF', '#007B50', '#0099CC']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoText}>W</Text>
            </LinearGradient>
          </Animated.View>

          {/* App Name */}
          <View style={styles.titleContainer}>
            <Text style={styles.appTitle}>Wham Pay</Text>
            <Text style={styles.appSubtitle}>Smart Payment Solution</Text>
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        {/* Login Section */}
        <View style={styles.loginContainer}>
          {/* X Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              buttonPress && styles.loginButtonPressed,
            ]}
            onPress={handleXLogin}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.xLogoContainer}>
                <Text style={styles.xLogo}>𝕏</Text>
              </View>
              <Text style={styles.buttonText}>Continue with X</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Terms and Privacy */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  glowCircle: {
    position: 'absolute',
    borderRadius: 150,
    width: 300,
    height: 300,
  },
  glowCircle1: {
    backgroundColor: 'rgba(0, 123, 80, 0.3)',
    top: -50,
    right: -50,
  },
  glowCircle2: {
    backgroundColor: 'rgba(0, 128, 255, 0.2)',
    bottom: -50,
    left: -50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 30,
    shadowColor: '#00CCFF',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 204, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  loginContainer: {
    width: '100%',
    paddingBottom: 50,
  },
  loginButton: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00CCFF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  loginButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  xLogoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#00CCFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  xLogo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  termsContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#00CCFF',
    fontWeight: '500',
  },
});