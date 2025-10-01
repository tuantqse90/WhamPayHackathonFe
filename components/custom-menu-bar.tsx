import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QRIcon } from './qr-icon';

interface MenuBarProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

export function CustomMenuBar({ activeTab, onTabPress }: MenuBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabs = [
    { id: 'scanner', label: '', isIcon: true },
    { id: 'wallet', label: 'WALLET' },
    { id: 'history', label: 'ACTIVITY' },
    { id: 'menu', label: 'MENU' },
  ];

  const getCurrentTab = () => {
    if (pathname.includes('/home')) return 'wallet'; // Home page shows wallet as active
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/scanner')) return 'scanner';
    if (pathname.includes('/menu')) return 'menu';
    if (pathname.includes('/settings')) return 'settings';
    return activeTab || 'wallet';
  };

  // Hide menu bar on certain screens
  const shouldHideMenuBar = () => {
    return pathname.includes('/request') || 
           pathname.includes('/wham-card') || 
           pathname.includes('/profile') || 
           pathname.includes('/send-gift');
  };

  if (shouldHideMenuBar()) {
    return null;
  }

  const handleTabPress = (tabId: string) => {
    console.log('Tab pressed:', tabId); // Debug log
    
    if (onTabPress) {
      onTabPress(tabId);
    } else {
      // Custom navigation logic
      try {
        if (tabId === 'wallet') {
          console.log('Navigating to home');
          router.push('/(tabs)/home');
        } else if (tabId === 'settings') {
          console.log('Navigating to settings');
          router.push('/(tabs)/settings');
        } else {
          console.log('Navigating to:', `/(tabs)/${tabId}`);
          router.push(`/(tabs)/${tabId}`);
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  };

  const currentTab = getCurrentTab();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      <View style={styles.menuBar}>
        {tabs.map((tab, index) => {
          const isActive = currentTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                isActive && [styles.activeTabButton, { backgroundColor: '#007B50' }],
                index === 0 && styles.qrTabButton
              ]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.8}
            >
              {tab.isIcon && (
                <QRIcon 
                  size={20} 
                  color={isActive ? '#FFFFFF' : '#9BA1A6'} 
                  isActive={isActive}
                />
              )}
              {!tab.isIcon && (
                <Text style={[
                  styles.tabText,
                  { color: isActive ? '#FFFFFF' : '#9BA1A6' },
                  isActive && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 85,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  menuBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 55,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 45,
  },
  activeTabButton: {
    borderRadius: 20,
    marginHorizontal: 4,
  },
  qrTabButton: {
    flex: 0.7,
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 3,
    textAlign: 'center',
    numberOfLines: 1,
  },
  activeTabText: {
    fontSize: 12,
  },
});
