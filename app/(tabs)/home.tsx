import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import TransferModal from '@/components/transfer-modal';
import AddFundsModal from '@/components/add-funds-modal';
import ProfileModal from '@/components/profile-modal';
import QRScannerModal from '@/components/qr-scanner-modal';

// Mock data for friends
const friendsData = [
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

// Mock assets data
const assetsData = [
  {
    id: '1',
    name: 'DOT',
    price: '$0.344727',
    quantity: '23',
    totalValue: '$7.929',
    color: '#E91E63',
  },
  {
    id: '2',
    name: 'USDC',
    price: '$1.000178',
    quantity: '1368',
    totalValue: '$1368.24',
    color: '#2196F3',
  },
];

export default function HomeScreen() {
  const [selectedTab, setSelectedTab] = useState(0); // 0: Assets, 1: Contacts
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<typeof friendsData[0] | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const sortedFriends = friendsData.sort((a, b) => {
    const isOnlineA = a.status === 'Online';
    const isOnlineB = b.status === 'Online';
    
    if (isOnlineA && !isOnlineB) return -1;
    if (!isOnlineA && isOnlineB) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleTransfer = () => {
    setShowTransferModal(true);
  };

  const handleAddFunds = () => {
    setShowAddFundsModal(true);
  };

  const handleInviteFriends = () => {
    Alert.alert('Invite Friends', 'Invite friends functionality will be implemented');
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleProfile} style={styles.profileButton}>
            <Image
              source={{ uri: 'https://pbs.twimg.com/profile_images/1892414539762978816/GL7lmx5e_400x400.jpg' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: isDark ? '#FFF' : '#333' }]}>
              gm Tunad
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleInviteFriends} style={styles.inviteButton}>
              <Text style={styles.inviteButtonText}>Invite friends</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleQRScan} style={styles.qrButton}>
              <IconSymbol name="qrcode.viewfinder" size={16} color="#007B50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceAmount, { color: isDark ? '#FFF' : '#333' }]}>
              1,500
            </Text>
            <Text style={[styles.balanceCurrency, { color: isDark ? '#AAA' : '#666' }]}>
              USDC
            </Text>
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

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setSelectedTab(0)}
            style={styles.tabButton}
          >
            <Text
              style={[
                styles.tabText,
                { color: isDark ? '#FFF' : '#333' },
                selectedTab === 0 && styles.activeTabText,
              ]}
            >
              Assets
            </Text>
            {selectedTab === 0 && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab(1)}
            style={styles.tabButton}
          >
            <Text
              style={[
                styles.tabText,
                { color: isDark ? '#FFF' : '#333' },
                selectedTab === 1 && styles.activeTabText,
              ]}
            >
              Contacts
            </Text>
            {selectedTab === 1 && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Content based on selected tab */}
        {selectedTab === 0 ? (
          // Assets List
          <View style={styles.contentContainer}>
            {assetsData.map((asset, index) => (
              <View key={asset.id}>
                <View style={styles.assetRow}>
                  <View style={[styles.assetIcon, { backgroundColor: asset.color }]}>
                    <Text style={styles.assetIconText}>
                      {asset.name.charAt(0)}
                    </Text>
                  </View>
                  
                  <View style={styles.assetInfo}>
                    <Text style={[styles.assetName, { color: isDark ? '#FFF' : '#333' }]}>
                      {asset.name}
                    </Text>
                    <Text style={[styles.assetPrice, { color: isDark ? '#AAA' : '#666' }]}>
                      {asset.price}
                    </Text>
                  </View>

                  <View style={styles.assetValues}>
                    <Text style={[styles.assetQuantity, { color: isDark ? '#FFF' : '#333' }]}>
                      {asset.quantity}
                    </Text>
                    <Text style={[styles.assetTotal, { color: isDark ? '#AAA' : '#666' }]}>
                      {asset.totalValue}
                    </Text>
                  </View>
                </View>
                {index < assetsData.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />
                )}
              </View>
            ))}
          </View>
        ) : (
          // Contacts List
          <View style={styles.contentContainer}>
            {sortedFriends.map((friend, index) => (
              <View key={friend.id}>
                <TouchableOpacity 
                  style={styles.friendRow}
                  onPress={() => {
                    setSelectedFriend(friend);
                    setShowProfileModal(true);
                  }}
                >
                  <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                  
                  <View style={styles.friendInfo}>
                    <Text style={[styles.friendName, { color: isDark ? '#FFF' : '#333' }]}>
                      {friend.name}
                    </Text>
                    <Text style={[styles.friendStatus, { color: isDark ? '#AAA' : '#666' }]}>
                      {friend.status}
                    </Text>
                  </View>

                  {friend.status === 'Online' && (
                    <View style={styles.onlineIndicator} />
                  )}
                </TouchableOpacity>
                {index < sortedFriends.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />
                )}
              </View>
            ))}
          </View>
        )}
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
});