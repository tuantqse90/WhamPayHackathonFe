import Avatar from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface TabProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface GiftCardProps {
  gift: {
    id: string;
    name: string;
    sender: string;
    date: string;
    imageUrl: string;
  };
}

interface NFTCardProps {
  nft: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    imageUrl: string;
  };
}

const Tab: React.FC<TabProps> = ({ title, isActive, onPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity onPress={onPress} style={styles.tab}>
      <Text style={[
        styles.tabTitle,
        {
          color: isActive ? '#007B50' : (isDark ? '#AAA' : '#666'),
          fontWeight: isActive ? '600' : '400',
        }
      ]}>
        {title}
      </Text>
      {isActive && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.statCard, { backgroundColor: isDark ? '#222' : 'rgba(0, 0, 0, 0.05)' }]}>
      <IconSymbol name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#333' }]}>
        {value}
      </Text>
      <Text style={[styles.statTitle, { color: isDark ? '#AAA' : '#666' }]}>
        {title}
      </Text>
    </View>
  );
};

const GiftCard: React.FC<GiftCardProps> = ({ gift }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity style={[styles.giftCard, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
      <Image source={{ uri: gift.imageUrl }} style={styles.giftImage} />
      <View style={styles.giftInfo}>
        <Text style={[styles.giftName, { color: isDark ? '#FFF' : '#333' }]}>
          {gift.name}
        </Text>
        <Text style={[styles.giftSender, { color: isDark ? '#AAA' : '#666' }]}>
          From {gift.sender}
        </Text>
        <Text style={[styles.giftDate, { color: isDark ? '#777' : '#999' }]}>
          {gift.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9C27B0';
      case 'rare': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  return (
    <TouchableOpacity style={[styles.nftCard, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
      <Image source={{ uri: nft.imageUrl }} style={styles.nftImage} />
      <View style={styles.nftInfo}>
        <Text style={[styles.nftName, { color: isDark ? '#FFF' : '#333' }]}>
          {nft.name}
        </Text>
        <Text style={[styles.nftType, { color: isDark ? '#AAA' : '#666' }]}>
          {nft.type}
        </Text>
        <View style={[
          styles.rarityBadge,
          { backgroundColor: getRarityColor(nft.rarity) }
        ]}>
          <Text style={styles.rarityText}>{nft.rarity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function SelfProfileView() {
  const [activeTab, setActiveTab] = useState('Profile');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const userProfile = {
    name: 'Marcus Johnson',
    username: '@marcus.wham',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    balance: '1,500 USDC',
    joinDate: 'Member since Nov 2023',
  };

  const sampleGifts = [
    {
      id: '1',
      name: 'Birthday Cake',
      sender: 'Sarah Chen',
      date: '2 days ago',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop',
    },
    {
      id: '2',
      name: 'Coffee Cup',
      sender: 'Alex Rivera',
      date: '1 week ago',
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop',
    },
    {
      id: '3',
      name: 'Flower Bouquet',
      sender: 'Emma Wilson',
      date: '2 weeks ago',
      imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=100&h=100&fit=crop',
    },
  ];

  const sampleNFTs = [
    {
      id: '1',
      name: 'Robot Head #42',
      type: 'Head Component',
      rarity: 'Legendary',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop',
    },
    {
      id: '2',
      name: 'Cyber Arms V2',
      type: 'Arm Component',
      rarity: 'Epic',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop',
    },
    {
      id: '3',
      name: 'Power Core',
      type: 'Body Component',
      rarity: 'Rare',
      imageUrl: 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=100&h=100&fit=crop',
    },
  ];

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing will be implemented in a future update.'
    );
  };

  const handleSettings = () => {
    router.push('/(tabs)/settings');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => router.replace('/auth/login'),
        },
      ]
    );
  };

  const renderProfileTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Profile Stats */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
          Your Stats
        </Text>
        
        <View style={styles.statsContainer}>
          <StatCard title="Sent" value="142" icon="arrow.up" color="#007B50" />
          <StatCard title="Received" value="89" icon="arrow.down" color="#2196F3" />
          <StatCard title="Rating" value="4.9" icon="star.fill" color="#FFD700" />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
          Recent Activity
        </Text>
        
        <View style={styles.activityList}>
          <View style={[styles.activityItem, { backgroundColor: isDark ? '#222' : '#F5F9F5' }]}>
            <View style={[styles.activityIcon, { backgroundColor: '#007B50' }]}>
              <IconSymbol name="arrow.up" size={12} color="white" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityTitle, { color: isDark ? '#FFF' : '#333' }]}>
                Sent 50 USDC
              </Text>
              <Text style={[styles.activitySubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                To Sarah Chen • 2 hours ago
              </Text>
            </View>
            <Text style={[styles.activityAmount, { color: '#007B50' }]}>
              -$50.00
            </Text>
          </View>

          <View style={[styles.activityItem, { backgroundColor: isDark ? '#222' : '#F5F9F5' }]}>
            <View style={[styles.activityIcon, { backgroundColor: '#2196F3' }]}>
              <IconSymbol name="arrow.down" size={12} color="white" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityTitle, { color: isDark ? '#FFF' : '#333' }]}>
                Received 25 DOT
              </Text>
              <Text style={[styles.activitySubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                From Alex Rivera • 1 day ago
              </Text>
            </View>
            <Text style={[styles.activityAmount, { color: '#2196F3' }]}>
              +$125.50
            </Text>
          </View>

          <View style={[styles.activityItem, { backgroundColor: isDark ? '#222' : '#F5F9F5' }]}>
            <View style={[styles.activityIcon, { backgroundColor: '#E91E63' }]}>
              <IconSymbol name="gift.fill" size={12} color="white" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityTitle, { color: isDark ? '#FFF' : '#333' }]}>
                Received Gift
              </Text>
              <Text style={[styles.activitySubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                Birthday Cake from Emma • 2 days ago
              </Text>
            </View>
            <IconSymbol name="heart.fill" size={16} color="#E91E63" />
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderGiftsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.giftsSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
          Received Gifts ({sampleGifts.length})
        </Text>
        
        <View style={styles.giftsGrid}>
          {sampleGifts.map((gift) => (
            <GiftCard key={gift.id} gift={gift} />
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderNFTsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.nftsSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
          Robot Parts Collection ({sampleNFTs.length})
        </Text>
        
        <View style={styles.nftsGrid}>
          {sampleNFTs.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSettings} style={styles.headerButton}>
          <IconSymbol name="gearshape" size={20} color={isDark ? '#FFF' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
          My Profile
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
          <IconSymbol name="power" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Avatar name={userProfile.name} size={100} />
        
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: isDark ? '#FFF' : '#333' }]}>
            {userProfile.name}
          </Text>
          <Text style={[styles.username, { color: isDark ? '#AAA' : '#666' }]}>
            {userProfile.username}
          </Text>
          <Text style={[styles.joinDate, { color: isDark ? '#777' : '#999' }]}>
            {userProfile.joinDate}
          </Text>
        </View>

        <View style={styles.balanceContainer}>
          <LinearGradient
            colors={['#007B50', 'rgba(0, 123, 80, 0.8)']}
            style={styles.balanceGradient}
          >
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>{userProfile.balance}</Text>
          </LinearGradient>
        </View>

        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
          <IconSymbol name="pencil" size={16} color="#007B50" />
          <Text style={[styles.editButtonText, { color: '#007B50' }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Tab
          title="Profile"
          isActive={activeTab === 'Profile'}
          onPress={() => setActiveTab('Profile')}
        />
        <Tab
          title="Gifts"
          isActive={activeTab === 'Gifts'}
          onPress={() => setActiveTab('Gifts')}
        />
        <Tab
          title="NFTs"
          isActive={activeTab === 'NFTs'}
          onPress={() => setActiveTab('NFTs')}
        />
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'Profile' && renderProfileTab()}
        {activeTab === 'Gifts' && renderGiftsTab()}
        {activeTab === 'NFTs' && renderNFTsTab()}
      </View>
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
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
  },
  balanceContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#007B50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#007B50',
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 30,
    height: 2,
    backgroundColor: '#007B50',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
  },
  activitySection: {
    marginBottom: 30,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  giftsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  giftsGrid: {
    gap: 16,
  },
  giftCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  giftImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  giftInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  giftName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  giftSender: {
    fontSize: 12,
    marginBottom: 2,
  },
  giftDate: {
    fontSize: 11,
  },
  nftsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  nftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  nftCard: {
    width: (width - 60) / 2,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nftImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  nftInfo: {
    alignItems: 'center',
  },
  nftName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  nftType: {
    fontSize: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});