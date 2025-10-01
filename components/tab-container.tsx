import { usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

interface TabContainerProps {
  children: React.ReactNode;
}

const { width: screenWidth } = Dimensions.get('window');

export function TabContainer({ children }: TabContainerProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const currentTab = getTabIndex(pathname);
    const previousTab = getTabIndex(previousPathname.current);

    if (currentTab !== previousTab) {
      // Determine slide direction based on tab order
      const slideDirection = currentTab > previousTab ? 1 : -1;
      
      // Slide out current content
      Animated.timing(slideAnim, {
        toValue: -slideDirection * screenWidth,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Slide in new content
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });

      previousPathname.current = pathname;
    }
  }, [pathname, slideAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
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

function getTabIndex(pathname: string): number {
  if (pathname.includes('/home')) return 0;
  if (pathname.includes('/scanner')) return 1;
  if (pathname.includes('/history')) return 2;
  if (pathname.includes('/wallet')) return 3;
  if (pathname.includes('/settings')) return 4;
  return 0;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    width: screenWidth,
  },
});
