import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthenticationError } from '@/utils/ApiClient';
import {
  FriendshipApiClient,
  FriendshipDto,
  UserSummaryDto
} from '@/utils/FriendshipApiClient';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface FriendsModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'friends' | 'requests' | 'add';

export default function FriendsModal({ visible, onClose }: FriendsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<FriendshipDto[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendshipDto[]>([]);
  const [searchUsers, setSearchUsers] = useState<UserSummaryDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load friends list
  const loadFriends = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, skipping friends load');
        setFriends([]);
        return;
      }

      const result = await FriendshipApiClient.getFriends(
        { status: 'accepted', page: 1, size: 50 },
        { silent: true }
      );

      console.log("👥 Friends list:", result);
      
      if (result && result.data) {
        // Normalize API data to internal FriendshipDto shape
        const normalized = (result.data as any[]).map((f: any) => {
          // Case 1: API returns flat user summaries (id, username, name, ...)
          if (f && f.username && !f.requester && !f.addressee) {
            return {
              id: f.id || f._id || '',
              requester: {
                id: '',
                username: '',
                name: '',
                address: '',
              },
              addressee: {
                id: f.id || f._id || '',
                username: f.username,
                name: f.name || f.username,
                address: f.address || '',
              },
              status: 'accepted',
              createdAt: f.createdAt || '',
              updatedAt: f.updatedAt || '',
            } as FriendshipDto;
          }

          // Case 2: Friendship-like payload
          const id = f.id || f._id || '';
          const requesterUsername = f.requesterUsername || f.requester?.username || 'unknown';
          const responserUsername = f.responserUsername || f.addressee?.username || 'unknown';
          const requesterId = f.requesterId || f.requester?.id || '';
          const responserId = f.responserId || f.addressee?.id || '';
          return {
            id,
            requester: {
              id: requesterId,
              username: requesterUsername,
              name: f.requester?.name || requesterUsername,
              address: f.requester?.address || '',
            },
            addressee: {
              id: responserId,
              username: responserUsername,
              name: f.addressee?.name || responserUsername,
              address: f.addressee?.address || '',
            },
            status: f.status || 'accepted',
            message: f.message,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
          } as FriendshipDto;
        });
        setFriends(normalized);
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        console.log('🔒 Authentication required for friends - silently ignored');
        setFriends([]);
      } else {
        console.error('Error loading friends:', error);
        Alert.alert('Error', 'Failed to load friends');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  // Load friend requests
  const loadFriendRequests = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, skipping friend requests load');
        setFriendRequests([]);
        return;
      }

      const result = await FriendshipApiClient.getPendingRequests(1, 50, { silent: true });
      
      if (result && result.data) {
        // Normalize API data to internal FriendshipDto shape
        const normalized = (result.data as any[]).map((f: any) => {
          const id = f.id || f._id || '';
          const requesterUsername = f.requesterUsername || f.requester?.username || 'unknown';
          const responserUsername = f.responserUsername || f.addressee?.username || 'unknown';
          const requesterId = f.requesterId || f.requester?.id || '';
          const responserId = f.responserId || f.addressee?.id || '';
          return {
            id,
            requester: {
              id: requesterId,
              username: requesterUsername,
              name: f.requester?.name || requesterUsername,
              address: f.requester?.address || '',
            },
            addressee: {
              id: responserId,
              username: responserUsername,
              name: f.addressee?.name || responserUsername,
              address: f.addressee?.address || '',
            },
            status: f.status,
            message: f.message,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
          } as FriendshipDto;
        });
        setFriendRequests(normalized);
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        console.log('🔒 Authentication required for friend requests - silently ignored');
        setFriendRequests([]);
      } else {
        console.error('Error loading friend requests:', error);
        Alert.alert('Error', 'Failed to load friend requests');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  // Search users to add as friends
  const searchUsersToAdd = useCallback(async (query: string) => {
    try {
      setLoading(true);

      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, skipping user search');
        setSearchUsers([]);
        return;
      }

      const result = await FriendshipApiClient.getUsersNotInFriendList(
        query, 1, 20, { silent: true }
      );
      
      if (result && result.data) {
        setSearchUsers(result.data);
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        console.log('🔒 Authentication required for user search - silently ignored');
        setSearchUsers([]);
      } else {
        console.error('Error searching users:', error);
        Alert.alert('Error', 'Failed to search users');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Send friend request
  const sendFriendRequest = async (username: string) => {
    try {
      await FriendshipApiClient.sendFriendRequest({ username });
      Alert.alert('Success', 'Friend request sent!');
      // Refresh search results
      if (searchQuery) {
        searchUsersToAdd(searchQuery);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      await FriendshipApiClient.respondToFriendRequest({
        friendshipId,
        status: 'accepted'
      });
      Alert.alert('Success', 'Friend request accepted!');
      loadFriendRequests();
      loadFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      await FriendshipApiClient.respondToFriendRequest({
        friendshipId,
        status: 'rejected'
      });
      Alert.alert('Success', 'Friend request rejected');
      loadFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  // Remove friend
  const removeFriend = async (username: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${username} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await FriendshipApiClient.removeFriend(username);
              Alert.alert('Success', 'Friend removed');
              loadFriends();
            } catch (error) {
              console.error('Error removing friend:', error);
              Alert.alert('Error', 'Failed to remove friend');
            }
          }
        }
      ]
    );
  };

  // Load data when tab changes
  useEffect(() => {
    if (visible && isAuthenticated) {
      switch (activeTab) {
        case 'friends':
          loadFriends();
          break;
        case 'requests':
          loadFriendRequests();
          break;
        case 'add':
          setSearchUsers([]);
          break;
      }
    }
  }, [activeTab, visible, isAuthenticated, loadFriends, loadFriendRequests]);

  // Search users when query changes
  useEffect(() => {
    if (activeTab === 'add' && searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchUsersToAdd(searchQuery.trim());
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (activeTab === 'add' && !searchQuery.trim()) {
      setSearchUsers([]);
    }
  }, [searchQuery, activeTab, searchUsersToAdd]);

  const onRefresh = () => {
    switch (activeTab) {
      case 'friends':
        loadFriends(true);
        break;
      case 'requests':
        loadFriendRequests(true);
        break;
      case 'add':
        if (searchQuery.trim()) {
          searchUsersToAdd(searchQuery.trim());
        }
        break;
    }
  };

  // Tab Button Component
  const TabButton = ({ tab, title, icon }: { tab: TabType; title: string; icon: string }) => (
    <TouchableOpacity 
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton,
        { backgroundColor: activeTab === tab ? '#007B50' : (isDark ? '#333' : '#F0F0F0') }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <IconSymbol 
        name={icon as any} 
        size={16} 
        color={activeTab === tab ? 'white' : (isDark ? '#AAA' : '#666')} 
      />
      <Text style={[
        styles.tabButtonText,
        { color: activeTab === tab ? 'white' : (isDark ? '#AAA' : '#666') }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Friend Item Component
  const FriendItem = ({ item }: { item: FriendshipDto }) => {
    // Safely extract friend info with fallbacks
    // Prefer show the other party's info based on current user role in friendship
    const friend = item?.addressee || item?.requester || {
      id: 'unknown',
      name: 'Unknown User', 
      username: 'unknown',
      address: ''
    };

    return (
      <View style={[styles.listItem, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
        <Image 
          source={{ uri: `https://api.dicebear.com/7.x/initials/svg?seed=${friend.name}` }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: isDark ? '#FFF' : '#333' }]}>
            {friend.name}
          </Text>
          <Text style={[styles.userUsername, { color: isDark ? '#AAA' : '#666' }]}>
            @{friend.username}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => removeFriend(friend.username)}
          style={styles.removeButton}
        >
          <IconSymbol name="trash" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  // Friend Request Item Component
  const FriendRequestItem = ({ item }: { item: FriendshipDto }) => {
    // Safely extract requester info with fallback
    const requester = item?.requester || {
      id: 'unknown',
      name: 'Unknown User',
      username: 'unknown', 
      address: ''
    };

    return (
      <View style={[styles.listItem, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
        <Image 
          source={{ uri: `https://api.dicebear.com/7.x/initials/svg?seed=${requester.name}` }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: isDark ? '#FFF' : '#333' }]}>
            {requester.name}
          </Text>
          <Text style={[styles.userUsername, { color: isDark ? '#AAA' : '#666' }]}>
            @{requester.username}
          </Text>
          {item?.message && (
            <Text style={[styles.requestMessage, { color: isDark ? '#AAA' : '#666' }]}>
              &ldquo;{item.message}&rdquo;
            </Text>
          )}
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            onPress={() => acceptFriendRequest(item?.id || '')}
            style={styles.acceptButton}
          >
            <IconSymbol name="checkmark" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => rejectFriendRequest(item?.id || '')}
            style={styles.rejectButton}
          >
            <IconSymbol name="xmark" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Search User Item Component
  const SearchUserItem = ({ item }: { item: UserSummaryDto }) => (
    <View style={[styles.listItem, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
      <Image 
        source={{ uri: `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}` }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: isDark ? '#FFF' : '#333' }]}>
          {item.name}
        </Text>
        <Text style={[styles.userUsername, { color: isDark ? '#AAA' : '#666' }]}>
          @{item.username}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => sendFriendRequest(item.username)}
        style={styles.addButton}
      >
        <IconSymbol name="person.badge.plus" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={isDark ? ['#000', '#111'] : ['#F5F9F5', '#EDF5ED']}
        style={styles.container}
      >
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
            Friends
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>
              <IconSymbol name="xmark" size={16} color={isDark ? '#FFF' : '#333'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TabButton tab="friends" title="Friends" icon="person.2.fill" />
          <TabButton tab="requests" title="Requests" icon="bell.fill" />
          <TabButton tab="add" title="Add Friends" icon="person.badge.plus" />
        </View>

        {/* Search Bar (only for Add Friends tab) */}
        {activeTab === 'add' && (
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
              <IconSymbol name="magnifyingglass" size={16} color={isDark ? '#AAA' : '#666'} />
              <TextInput
                style={[styles.searchInput, { color: isDark ? '#FFF' : '#333' }]}
                placeholder="Search users by name or username..."
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007B50" />
              <Text style={[styles.loadingText, { color: isDark ? '#AAA' : '#666' }]}>
                Loading...
              </Text>
            </View>
          ) : activeTab === 'friends' ? (
            <FlatList
              data={friends}
              renderItem={({ item }) => <FriendItem item={item} />}
              keyExtractor={(item) => item?.id || Math.random().toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#007B50"
                />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <IconSymbol name="person.2" size={48} color={isDark ? '#666' : '#999'} />
                  <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#333' }]}>
                    No Friends Yet
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                    Start adding friends to see them here
                  </Text>
                </View>
              }
            />
          ) : activeTab === 'requests' ? (
            <FlatList
              data={friendRequests}
              renderItem={({ item }) => <FriendRequestItem item={item} />}
              keyExtractor={(item) => item?.id || Math.random().toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#007B50"
                />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <IconSymbol name="bell" size={48} color={isDark ? '#666' : '#999'} />
                  <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#333' }]}>
                    No Friend Requests
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                    No pending friend requests
                  </Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={searchUsers}
              renderItem={({ item }) => <SearchUserItem item={item} />}
              keyExtractor={(item) => item?.username || Math.random().toString()}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#007B50"
                />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <IconSymbol name="magnifyingglass" size={48} color={isDark ? '#666' : '#999'} />
                  <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#333' }]}>
                    {searchQuery ? 'No Users Found' : 'Search for Users'}
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                    {searchQuery ? 'Try a different search term' : 'Enter a name or username to search'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  handleBar: {
    width: 40,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#007B50',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
  },
  requestMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007B50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});