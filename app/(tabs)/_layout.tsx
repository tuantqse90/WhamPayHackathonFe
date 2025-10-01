import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomMenuBar } from '@/components/custom-menu-bar';
import { HapticTab } from '@/components/haptic-tab';
import ProfileHeader from '@/components/profile-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, usePathname } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const isDark = colorScheme === 'dark';

  // Hide header on certain screens
  const shouldHideHeader = () => {
    return pathname.includes('/request') || 
           pathname.includes('/wham-card') || 
           pathname.includes('/profile') || 
           pathname.includes('/send-gift') ||
           pathname.includes('/settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      {!shouldHideHeader() && (
        <SafeAreaView edges={['top']} style={{ backgroundColor: isDark ? '#000' : '#F5F9F5' }}>
          <ProfileHeader 
            onProfilePress={() => {
              router.push('/profile');
            }}
            pointsValue="200"
            pointsText="WP"
          />
        </SafeAreaView>
      )}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007B50',
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            display: 'none', // Hide default tab bar
          },
        }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode.viewfinder" color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="line.3.horizontal" color={color} />,
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          title: 'Request',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="request-options"
        options={{
          title: 'Request Options',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode" color={color} />,
        }}
      />
              <Tabs.Screen
                name="settings"
                options={{
                  title: 'Settings',
                  tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
                }}
              />
              <Tabs.Screen
                name="wham-card"
                options={{
                  title: 'Wham Card',
                  tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard.fill" color={color} />,
                }}
              />
              <Tabs.Screen
                name="profile"
                options={{
                  title: 'Profile',
                  tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle.fill" color={color} />,
                }}
              />
              <Tabs.Screen
                name="send-gift"
                options={{
                  title: 'Send Gift',
                  tabBarIcon: ({ color }) => <IconSymbol size={28} name="gift.fill" color={color} />,
                }}
              />
      </Tabs>
      <CustomMenuBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
