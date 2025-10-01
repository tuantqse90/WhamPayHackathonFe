import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiClient } from '@/utils/ApiClient';
import { ethers } from 'ethers';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type ChainConfig = {
  rpcUrl: string;
  chainId: number;
  name: string;
};

const PASSET_HUB: ChainConfig = {
  rpcUrl: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
  chainId: 420420422,
  name: 'PassetHub-Testnet',
};

const NFT_CONTRACT = '0x491D33b74f483b67523b215B5cd7B879B137ca51';

const ERC165 = [
  'function supportsInterface(bytes4 interfaceId) view returns (bool)'
];
const ERC721_MIN = [
  ...ERC165,
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
];
// const ERC1155_MIN = [
//   ...ERC165,
//   'function uri(uint256 id) view returns (string)'
// ];
// const ERC721_TRANSFER = ethers.id('Transfer(address,address,uint256)');

export interface GiftNFT {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  price?: number;
  category?: string;
}


const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Common':
      return '#9CA3AF';
    case 'Rare':
      return '#3B82F6';
    case 'Epic':
      return '#8B5CF6';
    case 'Legendary':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

export default function SendGiftScreen() {
  const { user } = useAuth(); // user reserved for future personalization
  const { recepient } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedGift, setSelectedGift] = useState<GiftNFT | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingNfts, setLoadingNfts] = useState(true);
  const [nfts, setNfts] = useState<GiftNFT[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [noNFTs, setNoNFTs] = useState(false);
  const loadingCompleteRef = useRef(false);

  const provider = useMemo(() => new ethers.JsonRpcProvider(PASSET_HUB.rpcUrl, {
    chainId: PASSET_HUB.chainId,
    name: PASSET_HUB.name,
  }), []);

  const loadNFTs = useCallback(async (isRefresh = false) => {
    let cancelled = false;
    const load = async () => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoadingNfts(true);
        }
        // Only reset states on initial load, not on refresh
        if (!isRefresh) {
          setNoNFTs(false);
          loadingCompleteRef.current = false;
        }
        console.log('🔍 Starting NFT load for contract:', NFT_CONTRACT);
        
        // Test provider connection first
        const network = await provider.getNetwork().catch(() => null);
        console.log('🌐 Network:', network?.name, network?.chainId);
        
        const base = new ethers.Contract(NFT_CONTRACT, ERC165, provider);
        const is721 = await base.supportsInterface('0x80ac58cd').catch((e) => {
          console.log('❌ ERC721 check failed:', e.message);
          return false;
        });
        
        console.log('✅ Is ERC721:', is721);

        const erc721 = new ethers.Contract(NFT_CONTRACT, ERC721_MIN, provider);
        
        // Get contract name and symbol
        const [name, symbol] = await Promise.all([
          erc721.name().catch(() => 'Unknown'),
          erc721.symbol().catch(() => 'UNK')
        ]);
        console.log('📝 Contract:', name, symbol);

        // Get user's wallet address first
        let userAddress = '';
        try {
          const walletResponse = await ApiClient.exportMainWallet();
          if (walletResponse.success && walletResponse.data) {
            userAddress = walletResponse.data.address;
            console.log('👤 User wallet address:', userAddress);
          }
        } catch (e) {
          console.log('⚠️ Failed to get user wallet address:', (e as Error).message);
        }

        let uniqueSorted: bigint[] = [];

        // Method 1: Use tokenOfOwnerByIndex to get user's tokens (most efficient)
        if (userAddress) {
          try {
            const balance = await erc721.balanceOf(userAddress);
            const tokenBalance = Number(balance);
            console.log(`💰 User owns ${tokenBalance} tokens`);
            
            if (tokenBalance > 0) {
              console.log('🎯 Using tokenOfOwnerByIndex method');
              const limit = Math.min(tokenBalance, 20); // Limit for performance
              
              for (let i = 0; i < limit; i++) {
                if (cancelled) break;
                try {
                  const tokenId = await erc721.tokenOfOwnerByIndex(userAddress, i);
                  uniqueSorted.push(tokenId);
                  console.log(`✅ Found user's token ${tokenId} at index ${i}`);
                } catch (e) {
                  console.log(`❌ Failed to get token at index ${i}:`, (e as Error).message);
                  break;
                }
              }
              console.log(`✅ Got ${uniqueSorted.length} user tokens via tokenOfOwnerByIndex`);
            }
          } catch (e) {
            console.log('⚠️ tokenOfOwnerByIndex method failed:', (e as Error).message);
          }
        }

        // Only show NFTs that the user actually owns
        // Remove fallback methods that show all tokens or common patterns
        console.log(`🎯 User owns ${uniqueSorted.length} tokens - only showing owned NFTs`);

        const out: GiftNFT[] = [];
        const limit = Math.min(20, uniqueSorted.length); // Reduce limit for faster loading
        
        for (let i = 0; i < limit; i++) {
          if (cancelled) break;
          
          const id = uniqueSorted[i];
          console.log(`🖼️ Loading token ${id} (${i + 1}/${limit})`);
          
          let tokenURI = '';
          try { 
            tokenURI = await erc721.tokenURI(id); 
            console.log(`📄 Token ${id} URI:`, tokenURI);
          } catch (e) {
            console.log(`❌ Failed to get URI for token ${id}:`, (e as Error).message);
          }
          
          let meta: any = {};
          try {
            if (tokenURI) {
              const url = tokenURI.startsWith('ipfs://') 
                ? tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/') 
                : tokenURI;
              const res = await fetch(url);
              if (res.ok) meta = await res.json();
            }
          } catch (e) {
            console.log(`❌ Failed to fetch metadata for token ${id}:`, (e as Error).message);
          }
          
          out.push({
            id: id.toString(),
            name: meta?.name || `${symbol} #${id.toString()}`,
            description: meta?.description || `Token #${id.toString()} from ${name}`,
            image: meta?.image?.startsWith('ipfs://') 
              ? meta.image.replace('ipfs://', 'https://ipfs.io/ipfs/') 
              : meta?.image,
          });
        }
        
        console.log(`✅ Loaded ${out.length} NFTs`);
        if (!cancelled) {
          setNfts(out);
          setNoNFTs(out.length === 0);
          loadingCompleteRef.current = true;
          // Clear timeout since loading completed successfully
          clearTimeout(timeout);
        }
      } catch (e) {
        console.log('❌ NFT loading failed:', (e as Error).message);
        if (!cancelled) {
          setNfts([]);
          setNoNFTs(true);
          loadingCompleteRef.current = true;
          // Clear timeout since loading completed (with error)
          clearTimeout(timeout);
        }
      } finally {
        if (!cancelled) {
          setLoadingNfts(false);
          setRefreshing(false);
        }
      }
    };
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!loadingCompleteRef.current) {
        console.log('⏰ NFT loading timeout, using fallback');
        setNfts([]);
        setNoNFTs(true);
        loadingCompleteRef.current = true;
        setLoadingNfts(false);
        setRefreshing(false);
      }
    }, 10000); // 10 second timeout
    
    load();
    
    return () => { 
      cancelled = true; 
      clearTimeout(timeout);
    };
  }, [provider]);

  useEffect(() => {
    // Only load NFTs once on mount
    if (!loadingCompleteRef.current) {
      loadNFTs();
    }
  }, [loadNFTs]);

  const handleBack = () => {
    router.back();
  };

  const handleGiftSelect = (gift: GiftNFT) => {
    setSelectedGift(gift);
  };

  const handleSendGift = async () => {
    if (!selectedGift) {
      Alert.alert('Error', 'Please select a gift first');
      return;
    }

    setLoading(true);
    
    try {
      // Get user's wallet address
      const walletResponse = await ApiClient.exportMainWallet();
      if (!walletResponse.success || !walletResponse.data) {
        Alert.alert('Error', 'Failed to get wallet address');
        return;
      }

      // Call backend to transfer NFT to username
      const username = typeof recepient === 'string' ? recepient : Array.isArray(recepient) ? recepient[0] : '';
      const result = await ApiClient.transferNft721({
        recipient:
          username && username.startsWith("@")
            ? username.slice(1)
            : username || "",
        address: walletResponse.data.address,
        nftAddress: NFT_CONTRACT,
        tokenId: parseInt(selectedGift.id),
        chainId: PASSET_HUB.chainId,
      });
      if (result?.success === false) {
        Alert.alert('NFT Transfer Failed', result?.message || 'Transfer failed');
      } else {
        // Clear selected gift and refresh NFT list
        setSelectedGift(null);
        
        Alert.alert(
          'Gift Sent! 🎁',
          `Successfully sent ${selectedGift.name} to ${(username || '').toString()}!`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Refresh NFTs to show updated ownership
                loadNFTs(true);
                router.back();
              }
            },
          ]
        );
      }
      } catch {
      Alert.alert('Error', 'Failed to send gift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderGiftCard = ({ item }: { item: GiftNFT }) => (
    <TouchableOpacity
      style={[
        styles.giftCard,
        { backgroundColor: isDark ? "#1A1A1A" : "#FFF" },
        selectedGift?.id === item.id && {
          borderColor: Colors[colorScheme ?? "light"].primary,
          borderWidth: 2,
        },
      ]}
      onPress={() => handleGiftSelect(item)}
      activeOpacity={0.8}
    >
      <View style={styles.giftImageContainer}>
        <View
          style={[
            styles.rarityBadge,
            { backgroundColor: getRarityColor(item.rarity || 'Common') },
          ]}
        >
          <Text style={styles.rarityText}>{item.rarity || 'Common'}</Text>
        </View>

        {/* Placeholder for NFT image - in real app, use actual NFT images */}
        <View
          style={[
            styles.giftImage,
            { backgroundColor: isDark ? "#333" : "#F0F0F0" },
          ]}
        >
          <IconSymbol
            name="bolt.fill"
            size={48}
            color={Colors[colorScheme ?? "light"].primary}
          />
        </View>
      </View>

      <View style={styles.giftInfo}>
        <Text style={[styles.giftName, { color: isDark ? "#FFF" : "#333" }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.giftDescription, { color: isDark ? "#AAA" : "#666" }]}
        >
          {item.description}
        </Text>

        <View style={styles.giftFooter}>
          <View style={styles.priceContainer}>
            <Text
              style={[styles.priceLabel, { color: isDark ? "#AAA" : "#666" }]}
            >
              Price:
            </Text>
            <Text
              style={[
                styles.priceValue,
                { color: Colors[colorScheme ?? "light"].primary },
              ]}
            >
              {item.price} ETH
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#F5F9F5" },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol
            name="chevron.left"
            size={24}
            color={isDark ? "#FFF" : "#333"}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? "#FFF" : "#333" }]}>
          Send Gift
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Selected Gift Preview */}
      {selectedGift && (
        <View
          style={[
            styles.selectedGiftContainer,
            { backgroundColor: isDark ? "#1A1A1A" : "#FFF" },
          ]}
        >
          <Text
            style={[
              styles.selectedGiftTitle,
              { color: isDark ? "#FFF" : "#333" },
            ]}
          >
            Selected Gift
          </Text>
          <View style={styles.selectedGiftInfo}>
            <View
              style={[
                styles.selectedGiftImage,
                { backgroundColor: isDark ? "#333" : "#F0F0F0" },
              ]}
            >
              <IconSymbol
                name="bolt.fill"
                size={32}
                color={Colors[colorScheme ?? "light"].primary}
              />
            </View>
            <View style={styles.selectedGiftDetails}>
              <Text
                style={[
                  styles.selectedGiftName,
                  { color: isDark ? "#FFF" : "#333" },
                ]}
              >
                {selectedGift.name}
              </Text>
              <Text
                style={[
                  styles.selectedGiftPrice,
                  { color: Colors[colorScheme ?? "light"].primary },
                ]}
              >
                {selectedGift.price} ETH
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Gifts Grid */}
      <View style={styles.giftsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#FFF" : "#333" }]}>Choose an NFT</Text>
          {refreshing && (
            <View style={styles.refreshIndicator}>
              <ActivityIndicator size="small" color={Colors[colorScheme ?? "light"].primary} />
              <Text style={[styles.refreshText, { color: isDark ? "#AAA" : "#666" }]}>Refreshing...</Text>
            </View>
          )}
        </View>

        {loadingNfts ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8, color: isDark ? '#AAA' : '#666' }}>Loading NFTs…</Text>
            <TouchableOpacity 
              style={{ marginTop: 16, padding: 12, backgroundColor: Colors[colorScheme ?? "light"].primary, borderRadius: 8 }}
              onPress={() => {
                console.log('🚀 User requested fallback NFTs');
                setNfts([]);
                setNoNFTs(true);
                setLoadingNfts(false);
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '600' }}>Use Demo NFTs</Text>
            </TouchableOpacity>
          </View>
        ) : noNFTs ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              name="photo"
              size={64}
              color={isDark ? '#666' : '#999'}
            />
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#333' }]}>
              No NFTs Found
            </Text>
            <Text style={[styles.emptyDescription, { color: isDark ? '#AAA' : '#666' }]}>
              You don&apos;t own any NFTs from this collection.{'\n'}
              Get some NFTs to send as gifts!
            </Text>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: Colors[colorScheme ?? "light"].primary }]}
              onPress={() => loadNFTs(true)}
            >
              <IconSymbol name="arrow.clockwise" size={16} color="#FFF" />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={nfts}
            renderItem={renderGiftCard}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.giftRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.giftsList}
            refreshing={refreshing}
            onRefresh={() => loadNFTs(true)}
          />
        )}
      </View>

      {/* Send Button */}
      {selectedGift && (
        <View style={styles.sendButtonContainer}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: Colors[colorScheme ?? "light"].primary },
              loading && styles.sendButtonDisabled,
            ]}
            onPress={handleSendGift}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <IconSymbol name="gift.fill" size={20} color="#FFF" />
                <Text style={styles.sendButtonText}>
                  Send {selectedGift.name}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  headerSpacer: {
    width: 40,
  },
  selectedGiftContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedGiftTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedGiftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedGiftImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedGiftDetails: {
    flex: 1,
  },
  selectedGiftName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedGiftPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  giftsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  giftsList: {
    paddingBottom: 100,
  },
  giftRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  giftCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  giftImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  giftImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftInfo: {
    flex: 1,
  },
  giftName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  giftDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  giftFooter: {
    marginTop: 'auto',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sendButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
