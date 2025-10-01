import AddFundsModal from '@/components/add-funds-modal';
import SwipeNavigation from '@/components/swipe-navigation';
import TransferModal from '@/components/transfer-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiClient } from '@/utils/ApiClient';
import { fetchWalletBalance } from '@/utils/blockchainUtils';
import { calculateUSDValue, getMultipleTokenPrices } from '@/utils/priceUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function WalletScreen() {
  const { user, isAuthenticated } = useAuth();
  const [allTokens, setAllTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState('0');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
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

  // Load wallet data
  const loadWalletData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!isAuthenticated) {
        console.log('🔒 User not authenticated, skipping wallet data load');
        setTotalBalanceUSD('0');
        setAllTokens([]);
        return;
      }

      // Get wallet address
      const walletResponse = await ApiClient.exportMainWallet({ silent: true });
      if (!walletResponse.success || !walletResponse.data) {
        return;
      }

      // Get tokens
      const tokensResponse = await ApiClient.getTokens({ page: 1, size: 50 }, { silent: true });
      if (tokensResponse && Array.isArray(tokensResponse)) {
        const tokenSymbols = tokensResponse.map(token => token.symbol);
        const tokenPrices = await getMultipleTokenPrices(tokenSymbols);
        
        const tokensWithBalance = await Promise.all(
          tokensResponse.map(async (token) => {
            let balance = '0';
            try {
              if (token.address === '0x0000000000000000000000000000000000000000') {
                const { provider } = await import('@/utils/blockchainUtils');
                const ethBalance = await provider.getBalance(walletResponse.data.address);
                const { ethers } = await import('ethers');
                balance = ethers.formatUnits(ethBalance, token.decimals);
              } else {
                balance = await fetchWalletBalance(walletResponse.data.address, token.address);
              }
            } catch (error) {
              console.error(`Error fetching balance for ${token.symbol}:`, error);
              balance = '0';
            }

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
        
        // Calculate total balance
        const total = tokensWithBalance.reduce((sum, token) => {
          return sum + parseFloat(token.usdValue || '0');
        }, 0);
        setTotalBalanceUSD(total.toFixed(2));
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const onRefresh = () => {
    loadWalletData(true);
  };

  const handleTransfer = () => {
    setShowTransferModal(true);
  };

  const handleAddFunds = () => {
    setShowAddFundsModal(true);
  };

  const handleSwipeLeft = () => {
    router.push('/(tabs)/history');
  };

  const handleSwipeRight = () => {
    router.push('/(tabs)/scanner');
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {/* Total Balance */}
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
              <IconSymbol name="arrow.up.right" size={20} color="#007B50" />
              <Text style={styles.transferButtonText}>Send</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAddFunds} style={styles.addFundsButton}>
            <LinearGradient
              colors={['#007B50', '#005A3C']}
              style={styles.addFundsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconSymbol name="arrow.down.left" size={20} color="white" />
              <Text style={styles.addFundsButtonText}>Receive</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Assets List */}
        <View style={styles.assetsSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
            Your Assets
          </Text>
          
          {loading && allTokens.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={[styles.loadingText, { color: isDark ? '#AAA' : '#666' }]}>
                Loading assets...
              </Text>
            </View>
          ) : allTokens.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="creditcard" size={48} color={isDark ? '#666' : '#999'} />
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#333' }]}>
                No Assets Found
              </Text>
              <Text style={[styles.emptySubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                Your wallet appears to be empty
              </Text>
            </View>
          ) : (
            allTokens.map((token, index) => (
              <View key={token.id}>
                <TouchableOpacity style={styles.assetRow}>
                  <View style={[styles.assetIcon, { backgroundColor: token.color }]}>
                    {token.symbol.toLowerCase() === 'paseo' ? (
                      <Image 
                        source={{ uri: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png' }}
                        style={styles.tokenIcon}
                        resizeMode="contain"
                      />
                    ) : token.symbol.toLowerCase() === 'usdt' ? (
                      <Image 
                        source={require('../../assets/images/token-nft/usdt.png')}
                        style={styles.tokenIcon}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.assetIconText}>
                        {token.symbol.charAt(0)}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.assetInfo}>
                    <Text style={[styles.assetName, { color: isDark ? '#FFF' : '#333' }]}>
                      {token.name}
                    </Text>
                    <Text style={[styles.assetSymbol, { color: isDark ? '#AAA' : '#666' }]}>
                      {token.symbol}
                    </Text>
                  </View>

                  <View style={styles.assetValues}>
                    <Text style={[styles.assetBalance, { color: isDark ? '#FFF' : '#333' }]}>
                      {parseFloat(token.balance || '0').toFixed(4)}
                    </Text>
                    <Text style={[styles.assetValue, { color: isDark ? '#AAA' : '#666' }]}>
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
  scrollContent: {
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  balanceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,
    paddingTop: 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 8,
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
    justifyContent: 'center',
    gap: 8,
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
    justifyContent: 'center',
    gap: 8,
  },
  addFundsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  assetsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  assetIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  assetSymbol: {
    fontSize: 14,
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetBalance: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  assetValue: {
    fontSize: 14,
  },
  separator: {
    height: 1,
    marginLeft: 64,
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
});
