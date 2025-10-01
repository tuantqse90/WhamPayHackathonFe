import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  twitterId?: string;
  avatar?: string;
  bio?: string;
  joinedDate?: string;
  totalTransactions?: number;
  totalAmount?: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API response
      const mockProfile: UserProfile = {
        id: user?.id || '1',
        name: user?.name || 'Tunad',
        username: user?.username || '0xtunad',
        email: user?.email || 'tunad@example.com',
        twitterId: user?.twitterId || 'tunad',
        avatar: user?.twitterId 
          ? `https://unavatar.io/twitter/${user.username}`
          : 'https://pbs.twimg.com/profile_images/1892414539762978816/GL7lmx5e_400x400.jpg',
        bio: 'Crypto enthusiast and Web3 developer. Building the future of decentralized finance.',
        joinedDate: 'January 2024',
        totalTransactions: 156,
        totalAmount: '$12,450.00'
      };
      
      setProfileData(mockProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Edit profile functionality will be implemented');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: isDark ? '#AAA' : '#666' }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFF' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
          My Profile
        </Text>
        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
          <IconSymbol name="pencil" size={20} color={Colors[colorScheme ?? 'light'].primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profileData?.avatar }}
              style={styles.avatar}
              defaultSource={{ uri: 'https://pbs.twimg.com/profile_images/1892414539762978816/GL7lmx5e_400x400.jpg' }}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <IconSymbol name="camera.fill" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: isDark ? '#FFF' : '#333' }]}>
              {profileData?.name}
            </Text>
            <Text style={[styles.profileUsername, { color: isDark ? '#AAA' : '#666' }]}>
              @{profileData?.username}
            </Text>
            {profileData?.bio && (
              <Text style={[styles.profileBio, { color: isDark ? '#AAA' : '#666' }]}>
                {profileData.bio}
              </Text>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
            <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].primary }]}>
              {profileData?.totalTransactions}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : '#666' }]}>
              Total Transactions
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
            <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].primary }]}>
              {profileData?.totalAmount}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#AAA' : '#666' }]}>
              Total Amount
            </Text>
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.detailsSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
            Account Details
          </Text>

          <View style={[styles.detailsCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: isDark ? '#AAA' : '#666' }]}>
                Email
              </Text>
              <Text style={[styles.detailValue, { color: isDark ? '#FFF' : '#333' }]}>
                {profileData?.email}
              </Text>
            </View>

            <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: isDark ? '#AAA' : '#666' }]}>
                Twitter
              </Text>
              <Text style={[styles.detailValue, { color: isDark ? '#FFF' : '#333' }]}>
                @{profileData?.twitterId}
              </Text>
            </View>

            <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: isDark ? '#AAA' : '#666' }]}>
                Joined
              </Text>
              <Text style={[styles.detailValue, { color: isDark ? '#FFF' : '#333' }]}>
                {profileData?.joinedDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={handleEditProfile}
          >
            <IconSymbol name="pencil" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton, { borderColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square" size={20} color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.actionButtonText, styles.logoutButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  profileSection: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#007B50',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007B50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    maxWidth: '100%',
  },
  profileUsername: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    maxWidth: '100%',
  },
  profileBio: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    maxWidth: '100%',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
    maxWidth: '50%',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    maxWidth: '50%',
  },
  separator: {
    height: 1,
    marginHorizontal: -20,
  },
  actionsSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  logoutButtonText: {
    color: '#007B50',
  },
});
