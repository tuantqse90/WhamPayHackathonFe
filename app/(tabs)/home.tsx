import AddFundsModal from '@/components/add-funds-modal';
import FriendsModal from '@/components/friends-modal';
import ProfileModal from '@/components/profile-modal';
import SwipeNavigation from '@/components/swipe-navigation';
import TransferModal from '@/components/transfer-modal';
import Avatar from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiClient, AuthenticationError } from '@/utils/ApiClient';
import { fetchWalletBalance } from '@/utils/blockchainUtils';
import { calculateUSDValue, getMultipleTokenPrices } from '@/utils/priceUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Color mapping for tokens - using actual brand colors
  const getTokenColor = (symbol: string): string => {
    const colorMap: { [key: string]: string } = {
      'PAS': '#627EEA', // Ethereum blue for Paseo
      'USDT': '#26A17B', // Tether green
      'USDC': '#2775CA', // USD Coin blue
      'ETH': '#627EEA', // Ethereum blue
      'BTC': '#F7931A', // Bitcoin orange
      'DOT': '#E6007A', // Polkadot pink
      'BNB': '#F3BA2F', // Binance yellow
    };
    return colorMap[symbol.toUpperCase()] || '#627EEA';
  };

  // Local token logos for key tokens
  const getTokenLogoSource = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case 'ETH':
        return require('../../assets/images/token-nft/eth.png');
      case 'USDT':
        return require('../../assets/images/token-nft/usdt.png');
      default:
        return require('../../assets/images/token-nft/eth.png');
    }
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

  const handleSwipeLeft = () => {
    console.log('🔄 Swipe Left detected - navigating to Scanner');
    router.push('/(tabs)/scanner');
  };

  const handleSwipeRight = () => {
    console.log('🔄 Swipe Right detected - navigating to History');
    router.push('/(tabs)/history');
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      <SwipeNavigation 
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        threshold={100}
      >
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
        {/* Balance Display */}
        <TouchableOpacity style={styles.balanceContainer} onPress={toggleBalanceVisibility}>
          <View style={styles.balanceRow}>
            {loading ? (
              <ActivityIndicator size="large" color="#007B50" />
            ) : (
              <>
                <Text style={[styles.balanceAmount, { color: isDark ? '#FFF' : '#333' }]}>
                  {isBalanceHidden ? '****' : `$${totalBalanceUSD || '0.00'}`}
                </Text>
                <Text style={[styles.balanceCurrency, { color: isDark ? '#AAA' : '#666' }]}>
                  {isBalanceHidden ? '' : 'USD'}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleTransfer} style={styles.transferButton}>
            <View style={styles.transferButtonContent}>
              <Text style={[styles.transferButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>Transfer</Text>
              <IconSymbol name="arrow.up.right" size={24} color={Colors[colorScheme ?? 'light'].primary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAddFunds} style={styles.addFundsButton}>
            <LinearGradient
              colors={[Colors[colorScheme ?? 'light'].primary, Colors[colorScheme ?? 'light'].secondary]}
              style={styles.addFundsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.addFundsButtonText}>Add Funds</Text>
              <IconSymbol name="arrow.down.left" size={24} color="white" />
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
                      <View style={styles.assetIcon}>
                        <Image 
                          source={getTokenLogoSource(token.symbol)}
                          style={styles.assetLogo}
                        />
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
                          {isBalanceHidden ? '****' : parseFloat(token.balance || '0').toFixed(4)}
                        </Text>
                        <Text style={[styles.assetTotal, { color: isDark ? '#AAA' : '#666' }]}>
                          {isBalanceHidden ? '****' : `$${token.usdValue || '0.00'}`}
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
                        <Avatar name={friend.name} size={50} />
                        
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
      </SwipeNavigation>

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
    height: 80,
    backgroundColor: 'rgba(0, 123, 80, 0.1)',
    borderWidth: 1,
    borderColor: '#007B50',
    borderRadius: 16,
    justifyContent: 'center',
  },
  transferButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  transferButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  addFundsButton: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addFundsGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  addFundsButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 0,
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
    backgroundColor: 'transparent',
  },
  assetLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assetPrice: {
    fontSize: 14,
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetQuantity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assetTotal: {
    fontSize: 14,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 16,
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
  // Payy Card Banner
  payyCardBanner: {
    marginHorizontal: 20,
    marginBottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 140,
    shadowColor: '#007B50',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  payyCardLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  payyCardPreview: {
    width: 90,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  payyCardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  payyCardPreviewLogo: {
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  payyCardPreviewText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  payyCardPreviewChip: {
    flexDirection: 'row',
    gap: 2,
  },
  payyCardChipDot1: {
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
  },
  payyCardChipDot2: {
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
  },
  payyCardChipDot3: {
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
  },
  payyCardChipDot4: {
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  payyCardPreviewBody: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  payyCardPreviewShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  payyCardPreviewShape1: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 6,
    transform: [{ rotate: '45deg' }],
  },
  payyCardPreviewShape2: {
    position: 'absolute',
    top: 8,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    transform: [{ rotate: '-30deg' }],
  },
  payyCardPreviewShape3: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    transform: [{ rotate: '60deg' }],
  },
  payyCardPreviewNumber: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  payyCardPreviewNumberText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 1,
  },
  payyCardRight: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  payyCardHeader: {
    marginBottom: 8,
  },
  payyCardLogoContainer: {
    alignItems: 'flex-start',
  },
  payyCardMainText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  payyCardSubText: {
    fontSize: 12,
    fontWeight: '500',
  },
  payyCardCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payyCardCTAText: {
    color: '#007B50',
    fontSize: 16,
    fontWeight: '600',
  },
  payyCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007B50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});