import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface Friend {
  id: string;
  name: string;
  username: string;
  status: string;
  avatar: string;
}

interface ProfileViewProps {
  friend: Friend;
  onBack?: () => void;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
}

interface PostCardProps {
  post: {
    id: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.statCard, { backgroundColor: isDark ? '#222' : 'rgba(0, 0, 0, 0.05)' }]}>
      <IconSymbol name={icon as any} size={20} color="#007B50" />
      <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#333' }]}>
        {value}
      </Text>
      <Text style={[styles.statTitle, { color: isDark ? '#AAA' : '#666' }]}>
        {title}
      </Text>
    </View>
  );
};

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.postCard, { backgroundColor: isDark ? '#222' : '#F5F9F5' }]}>
      <Text style={[styles.postContent, { color: isDark ? '#FFF' : '#333' }]}>
        {post.content}
      </Text>
      
      <View style={styles.postMeta}>
        <Text style={[styles.postTimestamp, { color: isDark ? '#AAA' : '#666' }]}>
          {post.timestamp}
        </Text>
        
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <IconSymbol name="heart" size={12} color="#FF6B6B" />
            <Text style={[styles.postStatText, { color: isDark ? '#AAA' : '#666' }]}>
              {post.likes}
            </Text>
          </View>
          
          <View style={styles.postStat}>
            <IconSymbol name="message" size={12} color="#007B50" />
            <Text style={[styles.postStatText, { color: isDark ? '#AAA' : '#666' }]}>
              {post.comments}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function ProfileView({ friend, onBack }: ProfileViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const samplePosts = [
    {
      id: '1',
      content: 'Just received my first DOT payment! 🚀 The future of finance is here.',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
    },
    {
      id: '2',
      content: 'Building amazing things on Polkadot ecosystem. The community is incredible! 💜',
      timestamp: '1 day ago',
      likes: 156,
      comments: 23,
    },
    {
      id: '3',
      content: 'WhamPay makes sending money so easy. Love this app! 💰',
      timestamp: '3 days ago',
      likes: 89,
      comments: 12,
    },
  ];

  const handleSendMoney = () => {
    Alert.alert(
      'Send Money',
      `Send money to ${friend.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => Alert.alert('Success', 'Money sent successfully!') 
        },
      ]
    );
  };

  const handleSendGift = () => {
    Alert.alert(
      'Send Gift',
      'Gift functionality will be implemented in a future update.'
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={isDark ? '#FFF' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
          Profile
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: friend.avatar }} style={styles.avatar} />
          
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: isDark ? '#FFF' : '#333' }]}>
              {friend.name}
            </Text>
            <Text style={[styles.username, { color: isDark ? '#AAA' : '#666' }]}>
              {friend.username}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: friend.status === 'Online' ? '#4CAF50' : '#999' }
            ]} />
            <Text style={[styles.statusText, { color: isDark ? '#AAA' : '#666' }]}>
              {friend.status}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleSendMoney} style={styles.sendMoneyButton}>
            <LinearGradient
              colors={['#007B50', 'rgba(0, 123, 80, 0.8)']}
              style={styles.actionButtonGradient}
            >
              <View style={styles.actionButtonContent}>
                <IconSymbol name="dollarsign.circle.fill" size={20} color="white" />
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>Send Money</Text>
                  <Text style={styles.actionButtonSubtitle}>Transfer funds instantly</Text>
                </View>
                <IconSymbol name="arrow.right" size={16} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSendGift} style={styles.sendGiftButton}>
            <LinearGradient
              colors={['#E91E63', 'rgba(233, 30, 99, 0.8)']}
              style={styles.actionButtonGradient}
            >
              <View style={styles.actionButtonContent}>
                <IconSymbol name="gift.fill" size={20} color="white" />
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>Send Gift</Text>
                  <Text style={styles.actionButtonSubtitle}>Send a special gift</Text>
                </View>
                <IconSymbol name="arrow.right" size={16} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Profile Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
            Profile Stats
          </Text>
          
          <View style={styles.statsContainer}>
            <StatCard title="Transactions" value="24" icon="arrow.up.arrow.down" />
            <StatCard title="Friends" value="156" icon="person.2" />
            <StatCard title="Rating" value="4.8" icon="star.fill" />
          </View>
        </View>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
            Recent Posts
          </Text>
          
          <View style={styles.postsContainer}>
            {samplePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 30,
  },
  sendMoneyButton: {
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
  sendGiftButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#E91E63',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonGradient: {
    padding: 20,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionButtonSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
  },
  postsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  postsContainer: {
    gap: 12,
  },
  postCard: {
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
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTimestamp: {
    fontSize: 12,
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 12,
  },
});