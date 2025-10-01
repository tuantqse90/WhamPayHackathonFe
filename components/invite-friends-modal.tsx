import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { inviteUtils } from '@/utils/inviteUtils';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface InviteFriendsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ShareOption {
  id: string;
  title: string;
  icon: string;
  action: () => void;
}

export default function InviteFriendsModal({ visible, onClose }: InviteFriendsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const [inviteLink, setInviteLink] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  
  const { width } = Dimensions.get('window');

  // Generate invite link based on user
  useEffect(() => {
    if (user?.username && user?.id) {
      const link = inviteUtils.generateInviteLink(user.username, user.id);
      setInviteLink(link);
    }
  }, [user]);

  const copyToClipboard = async () => {
    if (inviteLink) {
      await inviteUtils.copyInviteLink(inviteLink);
    }
  };

  const shareViaSystem = async () => {
    if (inviteLink) {
      await inviteUtils.shareInvite(inviteLink, user?.name);
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'copy',
      title: 'Copy Link',
      icon: 'doc.on.clipboard',
      action: copyToClipboard,
    },
    {
      id: 'share',
      title: 'Share',
      icon: 'square.and.arrow.up',
      action: shareViaSystem,
    },
    {
      id: 'qr',
      title: 'QR Code',
      icon: 'qrcode',
      action: () => setShowQRCode(!showQRCode),
    },
  ];

  const ShareOptionButton = ({ option }: { option: ShareOption }) => (
    <TouchableOpacity style={styles.shareOption} onPress={option.action}>
      <LinearGradient
        colors={isDark ? ['#222', '#333'] : ['#FFF', '#F8F8F8']}
        style={styles.shareOptionGradient}
      >
        <View style={[styles.shareIcon, { backgroundColor: 'rgba(0, 123, 80, 0.1)' }]}>
          <IconSymbol name={option.icon as any} size={24} color="#007B50" />
        </View>
        <Text style={[styles.shareOptionText, { color: isDark ? '#FFF' : '#333' }]}>
          {option.title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
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
            Rewards
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>
              <IconSymbol name="xmark" size={16} color={isDark ? '#FFF' : '#333'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Points Display */}
        <View style={styles.pointsSection}>
          <View style={styles.pointsContainer}>
            <Text style={[styles.pointsLabel, { color: isDark ? '#AAA' : '#666' }]}>
              Your Points
            </Text>
            <View style={styles.pointsDisplay}>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsValue}>0</Text>
              </View>
              <Text style={[styles.pointsText, { color: isDark ? '#FFF' : '#333' }]}>
                PTS
              </Text>
            </View>
          </View>
          
          <View style={styles.rewardsInfo}>
            <Text style={[styles.rewardsTitle, { color: isDark ? '#FFF' : '#333' }]}>
              Earn Points by Inviting Friends!
            </Text>
            <Text style={[styles.rewardsSubtitle, { color: isDark ? '#AAA' : '#666' }]}>
              Get 10 points for each friend who joins through your invite
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#007B50', '#005A3C']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconSymbol name="person.2.fill" size={48} color="white" />
              <Text style={styles.heroTitle}>Invite Friends to WhamPay</Text>
              <Text style={styles.heroSubtitle}>
                Share the future of instant crypto payments
              </Text>
            </LinearGradient>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
              Why invite friends?
            </Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <IconSymbol name="bolt.fill" size={16} color="#007B50" />
                </View>
                <Text style={[styles.benefitText, { color: isDark ? '#AAA' : '#666' }]}>
                  Send money instantly with zero fees
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <IconSymbol name="shield.fill" size={16} color="#007B50" />
                </View>
                <Text style={[styles.benefitText, { color: isDark ? '#AAA' : '#666' }]}>
                  Secure blockchain-powered transactions
                </Text>
              </View>
              
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <IconSymbol name="globe" size={16} color="#007B50" />
                </View>
                <Text style={[styles.benefitText, { color: isDark ? '#AAA' : '#666' }]}>
                  Send money anywhere in the world
                </Text>
              </View>
            </View>
          </View>

          {/* Invite Link */}
          <View style={styles.linkSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
              Your invite link
            </Text>
            
            <View style={[styles.linkContainer, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
              <Text style={[styles.linkText, { color: isDark ? '#AAA' : '#666' }]} numberOfLines={2}>
                {inviteLink}
              </Text>
            </View>
          </View>

          {/* Share Options */}
          <View style={styles.shareSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
              Share with friends
            </Text>
            
            <View style={styles.shareOptions}>
              {shareOptions.map((option) => (
                <ShareOptionButton key={option.id} option={option} />
              ))}
            </View>
          </View>

          {/* QR Code */}
          {showQRCode && (
            <View style={styles.qrSection}>
              <View style={[styles.qrCard, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
                <Text style={[styles.qrTitle, { color: isDark ? '#FFF' : '#333' }]}>
                  QR Code
                </Text>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={inviteLink}
                    size={width * 0.5}
                    backgroundColor="white"
                    color="black"
                  />
                </View>
                <Text style={[styles.qrSubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                  Scan to join WhamPay
                </Text>
              </View>
            </View>
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
  pointsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '600',
  },
  rewardsInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    marginBottom: 30,
  },
  heroGradient: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  heroTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  benefitsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 123, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  linkSection: {
    marginBottom: 30,
  },
  linkContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 80, 0.2)',
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  shareSection: {
    marginBottom: 20,
  },
  shareOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  shareOption: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareOptionGradient: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  qrSection: {
    marginTop: 20,
  },
  qrCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
  },
  qrSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});