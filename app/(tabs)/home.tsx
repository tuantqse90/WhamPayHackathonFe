import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import TransferModal from '@/components/transfer-modal';
import AddFundsModal from '@/components/add-funds-modal';
import ProfileModal from '@/components/profile-modal';
import QRScannerModal from '@/components/qr-scanner-modal';
import InviteFriendsModal from '@/components/invite-friends-modal';
import FriendsModal from '@/components/friends-modal';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClient, AuthenticationError } from '@/utils/ApiClient';
import { fetchWalletBalance } from '@/utils/blockchainUtils';
import { getMultipleTokenPrices, calculateUSDValue } from '@/utils/priceUtils';

interface FriendData {
  id: string;
  name: string;
  username: string;
  status: string;
  avatar: string;
}

// Mock friends data
const friendsData: FriendData[] = [
  {
    id: '1',
    name: 'Alice',
    username: '@alice',
    status: 'Online',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'Bob',
    username: '@bob',
    status: 'Last seen 2h ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Charlie',
    username: '@charlie',
    status: 'Online',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
];

interface TokenData {
  id: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  balance?: string;
  usdValue?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomeScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'assets' | 'contacts'>('assets');
  const [allTokens, setAllTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState('0');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showInviteFriendsModal, setShowInviteFriendsModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Color mapping for tokens
  const getTokenColor = (symbol: string): string => {
    const colorMap: { [key: string]: string } = {
      'PAS': '#E91E63',
      'USDT': '#26A17B',
      'USDC': '#2196F3',
      'ETH': '#627EEA',
      'BTC': '#F7931A',
      'DOT': '#E6007A',
      'BNB': '#F3BA2F',
    };
    return colorMap[symbol.toUpperCase()] || '#9C27B0';
  };

  // Load native balance only for Balance Display
  const loadAssetData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Check authentication before making API calls
      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, skipping asset data load');
        setTotalBalanceUSD('0');
        return;
      }

      // Load wallet data
      const walletResponse = await ApiClient.exportMainWallet({ silent: true });
      if (walletResponse.success && walletResponse.data) {
        try {
          // Get native ETH balance only
          const { provider } = await import('@/utils/blockchainUtils');
          const ethBalance = await provider.getBalance(walletResponse.data.address);
          const { ethers } = await import('ethers');
          const nativeBalance = ethers.formatUnits(ethBalance, 18);
          
          // Get ETH price and calculate USD value
          const tokenPrices = await getMultipleTokenPrices(['ETH']);
          const ethPrice = tokenPrices['ETH'] || 0;
          const usdValue = calculateUSDValue(nativeBalance, ethPrice);
          
          // Set USD balance only
          setTotalBalanceUSD(usdValue);
        } catch (error) {
          console.error('Error fetching native balance:', error);
          setTotalBalanceUSD('0');
        }
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        console.log('🔒 Authentication required for asset data - silently ignored');
        setTotalBalanceUSD('0');
      } else {
        console.error('Error loading asset data:', error);
        Alert.alert('Error', 'Failed to load asset data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  // Load all available tokens from API with real balances
  const loadAllTokens = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setTokensLoading(true);
      }

      // Check authentication before making API calls
      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, skipping tokens load');
        setAllTokens([]);
        return;
      }

      // Get wallet address first
      const walletResponse = await ApiClient.exportMainWallet({ silent: true });
      if (!walletResponse.success || !walletResponse.data) {
        return;
      }

      const tokensResponse = await ApiClient.getTokens({ page: 1, size: 50 }, { silent: true });
      if (tokensResponse && Array.isArray(tokensResponse)) {
        // Get all token symbols for price fetching
        const tokenSymbols = tokensResponse.map(token => token.symbol);
        
        // Fetch real prices for all tokens
        const tokenPrices = await getMultipleTokenPrices(tokenSymbols);
        
        // Load real balances for each token
        const tokensWithBalance = await Promise.all(
          tokensResponse.map(async (token) => {
            let balance = '0';
            try {
              if (token.address === '0x0000000000000000000000000000000000000000') {
                // Native token balance - use provider.getBalance directly
                const { provider } = await import('@/utils/blockchainUtils');
                const ethBalance = await provider.getBalance(walletResponse.data.address);
                const { ethers } = await import('ethers');
                balance = ethers.formatUnits(ethBalance, token.decimals);
              } else {
                // ERC20 token balance - use fetchWalletBalance
                balance = await fetchWalletBalance(walletResponse.data.address, token.address);
              }
            } catch (error) {
              console.error(`Error fetching balance for ${token.symbol}:`, error);
              balance = '0';
            }

            // Calculate real USD value using fetched price
            const tokenPrice = tokenPrices[token.symbol.toUpperCase()] || 0;
            const usdValue = calculateUSDValue(balance, tokenPrice);

            return {
              ...token,
              color: getTokenColor(token.symbol),
              balance: balance,
              usdValue: usdValue,
            };
          })
        );

        setAllTokens(tokensWithBalance);
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        console.log('🔒 Authentication required for tokens - silently ignored');
        setAllTokens([]);
      } else {
        console.error('Error loading all tokens:', error);
      }
    } finally {
      setTokensLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadAssetData();
    loadAllTokens();
  }, [loadAssetData, loadAllTokens]);

  const onRefresh = () => {
    loadAssetData(true);
    loadAllTokens(true);
  };

  const handleTransfer = () => {
    setShowTransferModal(true);
  };

  const handleAddFunds = () => {
    setShowAddFundsModal(true);
  };

  const handleInviteFriends = () => {
    setShowInviteFriendsModal(true);
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleProfile} style={styles.profileButton}>
            <Image
              source={{ 
                uri: user?.twitterId 
                  ? `https://api.twitter.com/1.1/users/profile_image?user_id=${user.twitterId}&size=bigger`
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

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleInviteFriends} style={styles.inviteButton}>
              <Text style={styles.inviteButtonText}>Invite friends</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleQRScan} style={styles.qrButton}>
              <IconSymbol name="qrcode.viewfinder" size={16} color="#007B50" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceRow}>
            {loading ? (
              <ActivityIndicator size="large" color="#007B50" />
            ) : (
              <>
                <Text style={[styles.balanceAmount, { color: isDark ? '#FFF' : '#333' }]}>
                  ${totalBalanceUSD || '0.00'}
                </Text>
                <Text style={[styles.balanceCurrency, { color: isDark ? '#AAA' : '#666' }]}>
                  USD
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleTransfer} style={styles.transferButton}>
            <View style={styles.transferButtonContent}>
              <Text style={styles.transferButtonText}>Transfer</Text>
              <IconSymbol name="arrow.up.right" size={20} color="#007B50" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAddFunds} style={styles.addFundsButton}>
            <LinearGradient
              colors={['#007B50', '#005A3C']}
              style={styles.addFundsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.addFundsButtonText}>Add Funds</Text>
              <IconSymbol name="arrow.down.left" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tab Container */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={styles.tabButton} 
            onPress={() => setActiveTab('assets')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'assets' ? styles.activeTabText : { color: isDark ? '#666' : '#999' }
            ]}>
              Assets
            </Text>
            {activeTab === 'assets' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tabButton} 
            onPress={() => setActiveTab('contacts')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'contacts' ? styles.activeTabText : { color: isDark ? '#666' : '#999' }
            ]}>
              Contacts
            </Text>
            {activeTab === 'contacts' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {activeTab === 'assets' ? (
            // Assets Tab Content
            <>
              {tokensLoading && allTokens.length === 0 ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={[styles.loadingText, { color: isDark ? '#AAA' : '#666' }]}>
                    Loading tokens...
                  </Text>
                </View>
              ) : allTokens.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <IconSymbol name="creditcard" size={48} color={isDark ? '#666' : '#999'} />
                  <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#333' }]}>
                    No Tokens Available
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                    No tokens found in the system
                  </Text>
                </View>
              ) : (
                allTokens.map((token, index) => (
                  <View key={token.id}>
                    <TouchableOpacity style={styles.assetRow}>
                      <View style={[styles.assetIcon, { backgroundColor: token.color }]}>
                        <Text style={styles.assetIconText}>
                          {token.symbol.charAt(0)}
                        </Text>
                      </View>
                      
                      <View style={styles.assetInfo}>
                        <Text style={[styles.assetName, { color: isDark ? '#FFF' : '#333' }]}>
                          {token.name}
                        </Text>
                        <Text style={[styles.assetPrice, { color: isDark ? '#AAA' : '#666' }]}>
                          {token.symbol} • {token.decimals} decimals
                        </Text>
                      </View>

                      <View style={styles.assetValues}>
                        <Text style={[styles.assetQuantity, { color: isDark ? '#FFF' : '#333' }]}>
                          {parseFloat(token.balance || '0').toFixed(4)}
                        </Text>
                        <Text style={[styles.assetTotal, { color: isDark ? '#AAA' : '#666' }]}>
                          ${token.usdValue || '0.00'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {index < allTokens.length - 1 && (
                      <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />
                    )}
                  </View>
                ))
              )}
            </>
          ) : (
            // Contacts Tab Content - Shows Friends Management
            <View style={styles.contactsTabContent}>
              <TouchableOpacity 
                style={styles.manageFriendsButton}
                onPress={() => setShowFriendsModal(true)}
              >
                <View style={styles.manageFriendsContent}>
                  <View style={styles.manageFriendsLeft}>
                    <View style={styles.manageFriendsIcon}>
                      <IconSymbol name="person.2.fill" size={24} color="#007B50" />
                    </View>
                    <View style={styles.manageFriendsText}>
                      <Text style={[styles.manageFriendsTitle, { color: isDark ? '#FFF' : '#333' }]}>
                        Manage Friends
                      </Text>
                      <Text style={[styles.manageFriendsSubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                        View friends, send requests, and manage your network
                      </Text>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={isDark ? '#666' : '#999'} />
                </View>
              </TouchableOpacity>

              {friendsData.length > 0 && (
                <>
                  <Text style={[styles.recentFriendsTitle, { color: isDark ? '#FFF' : '#333' }]}>
                    Recent Friends
                  </Text>
                  {friendsData.slice(0, 3).map((friend, index) => (
                    <View key={friend.id}>
                      <TouchableOpacity 
                        style={styles.friendRow}
                        onPress={() => setSelectedFriend(friend)}
                      >
                        <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                        
                        <View style={styles.friendInfo}>
                          <Text style={[styles.friendName, { color: isDark ? '#FFF' : '#333' }]}>
                            {friend.name}
                          </Text>
                          <Text style={[styles.friendStatus, { 
                            color: friend.status === 'Online' ? '#4CAF50' : (isDark ? '#AAA' : '#666') 
                          }]}>
                            {friend.status}
                          </Text>
                        </View>

                        {friend.status === 'Online' && (
                          <View style={styles.onlineIndicator} />
                        )}
                      </TouchableOpacity>
                      {index < Math.min(friendsData.length, 3) - 1 && (
                        <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />
                      )}
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Transfer Modal */}
      <TransferModal
        visible={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />

      {/* Add Funds Modal */}
      <AddFundsModal
        visible={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        visible={showQRScanner}
        onClose={() => setShowQRScanner(false)}
      />

      {/* Invite Friends Modal */}
      <InviteFriendsModal
        visible={showInviteFriendsModal}
        onClose={() => setShowInviteFriendsModal(false)}
      />

      {/* Friends Management Modal */}
      <FriendsModal
        visible={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        visible={showProfileModal}
        friend={selectedFriend}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedFriend(null);
        }}
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
    gap: 8,
  },
  inviteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#007B50',
    borderRadius: 16,
  },
  inviteButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#007B50',
  },
  qrButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#007B50',
    borderRadius: 16,
  },
  logoutButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 16,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  balanceCurrency: {
    fontSize: 20,
  },
  balanceUSD: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 30,
  },
  transferButton: {
    flex: 1,
    height: 60,
    backgroundColor: 'rgba(0, 123, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#007B50',
    borderRadius: 12,
    justifyContent: 'center',
  },
  transferButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  transferButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007B50',
  },
  addFundsButton: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addFundsGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  addFundsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 24,
  },
  tabButton: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activeTabText: {
    color: '#007B50',
  },
  tabIndicator: {
    width: 20,
    height: 2,
    backgroundColor: '#007B50',
    borderRadius: 1,
  },
  contentContainer: {
    paddingTop: 20,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  assetIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assetPrice: {
    fontSize: 12,
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assetTotal: {
    fontSize: 12,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 12,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
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
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  contactsTabContent: {
    paddingHorizontal: 20,
  },
  manageFriendsButton: {
    backgroundColor: 'rgba(0, 123, 80, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 80, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  manageFriendsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  manageFriendsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  manageFriendsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 123, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  manageFriendsText: {
    flex: 1,
  },
  manageFriendsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  manageFriendsSubtitle: {
    fontSize: 12,
  },
  recentFriendsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
});