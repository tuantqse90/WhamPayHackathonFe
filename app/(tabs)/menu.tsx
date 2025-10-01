import FriendsModal from '@/components/friends-modal';
import InviteFriendsModal from '@/components/invite-friends-modal';
import SwipeNavigation from '@/components/swipe-navigation';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function MenuScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showInviteFriendsModal, setShowInviteFriendsModal] = useState(false);

  const handleSwipeRight = () => {
    router.push('/(tabs)/history');
  };

  const handleWhamCard = () => {
    router.push('/(tabs)/wham-card');
  };

  const handleRequest = () => {
    router.push('/(tabs)/request'); // Navigate to Request screen
  };

  const handleRewards = () => {
    setShowInviteFriendsModal(true);
  };

  const handleSetting = () => {
    router.push('/(tabs)/settings');
  };

  const handleSocial = () => {
    setShowFriendsModal(true);
  };

  const MenuItem = ({ 
    title, 
    icon, 
    onPress 
  }: {
    title: string;
    icon: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].primary }]}>
          {title}
        </Text>
        <IconSymbol name={icon as any} size={36} color={Colors[colorScheme ?? 'light'].primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      <SwipeNavigation 
        onSwipeRight={handleSwipeRight}
        threshold={100}
      >
      {/* Menu Items - Fixed Position */}
      <View style={styles.menuContainer}>
                <MenuItem
                  title="Wham Card"
                  icon="creditcard.fill"
                  onPress={handleWhamCard}
                />
                
                <MenuItem
                  title="Request"
                  icon="plus"
                  onPress={handleRequest}
                />
                
                <MenuItem
                  title="Rewards"
                  icon="asterisk"
                  onPress={handleRewards}
                />
                
                <MenuItem
                  title="Social"
                  icon="person.2.fill"
                  onPress={handleSocial}
                />
                
                <MenuItem
                  title="Setting"
                  icon="gearshape.fill"
                  onPress={handleSetting}
        />
        </View>
      </SwipeNavigation>

      {/* Friends Modal */}
      <FriendsModal
        visible={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
      />

      {/* Invite Friends Modal */}
      <InviteFriendsModal
        visible={showInviteFriendsModal}
        onClose={() => setShowInviteFriendsModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  profileButton: {
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
  },
  subGreeting: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  pointsBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    alignItems: 'flex-start',
  },
  menuItem: {
    marginBottom: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    gap: 16,
  },
  menuItemText: {
    fontSize: 48,
    fontWeight: '600',
  },
});
