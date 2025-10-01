import { usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

interface SlideWrapperProps {
  children: React.ReactNode;
  routeName: string;
}

const { width: screenWidth } = Dimensions.get('window');

export function SlideWrapper({ children, routeName }: SlideWrapperProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pathname = usePathname();
  const isActive = pathname.includes(`/${routeName}`);

  useEffect(() => {
    if (isActive) {
      // Slide in from right
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out to left
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, slideAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.slideContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  slideContainer: {
    flex: 1,
    width: screenWidth,
  },
});
