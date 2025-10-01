import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ProfileHeaderProps {
  onProfilePress?: () => void;
  showPoints?: boolean;
  pointsValue?: string;
  pointsText?: string;
}

export default function ProfileHeader({ 
  onProfilePress, 
  showPoints = true, 
  pointsValue = "200",
  pointsText = "WP"
}: ProfileHeaderProps) {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/(tabs)/profile');
    }
  };

  return (
    <View style={styles.profileHeader}>
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: user?.twitterId
              ? `https://unavatar.io/twitter/${user.username}`
              : 'https://pbs.twimg.com/profile_images/1892414539762978816/GL7lmx5e_400x400.jpg'
          }}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <View style={styles.greetingContainer}>
        <Text style={[styles.greeting, { color: isDark ? '#FFF' : '#333' }]}>
          gm {user?.name || 'User'}
        </Text>
        <Text style={[styles.subGreeting, { color: isDark ? '#AAA' : '#666' }]}>
          @{user?.username || 'username'}
        </Text>
      </View>

      {showPoints && (
        <View style={styles.pointsDisplay}>
          <View style={[styles.pointsBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Text style={styles.pointsValue}>{pointsValue}</Text>
          </View>
          <Text style={[styles.pointsText, { color: Colors[colorScheme ?? 'light'].primary }]}>{pointsText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileButton: {
    marginRight: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#007B50',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  subGreeting: {
    fontSize: 12,
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
