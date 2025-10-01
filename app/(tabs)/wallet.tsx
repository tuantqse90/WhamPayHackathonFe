import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,

  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import ApiClient from '../../utils/ApiClient';
import * as Clipboard from 'expo-clipboard';

interface WalletInfo {
  address: string;
  privateKey: string;
  mnemonic: string;
}

const { width } = Dimensions.get('window');

export default function WalletScreen() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      console.log('🚀 Starting to load wallet info...');
      setLoading(true);
      const response = await ApiClient.exportMainWallet();
      
      console.log('📦 Wallet API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Wallet info loaded successfully');
        setWalletInfo(response.data);
      } else {
        console.log('❌ Wallet API returned error:', response.message);
        Alert.alert('Error', response.message || 'Failed to load wallet information');
      }
    } catch (error) {
      console.error('❌ Error loading wallet info:', error);
      Alert.alert('Error', 'Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const InfoCard = ({ 
    title, 
    value, 
    isSecret = false, 
    showSecret = false, 
    onToggleSecret 
  }: {
    title: string;
    value: string;
    isSecret?: boolean;
    showSecret?: boolean;
    onToggleSecret?: () => void;
  }) => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {isSecret && (
          <TouchableOpacity onPress={onToggleSecret} style={styles.eyeButton}>
            <Ionicons 
              name={showSecret ? 'eye-off' : 'eye'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.cardValue, isSecret && !showSecret && styles.hiddenText]}>
          {isSecret && !showSecret ? '••••••••••••••••••••' : value}
        </Text>
        <TouchableOpacity 
          onPress={() => copyToClipboard(value, title)}
          style={styles.copyButton}
        >
          <Ionicons name="copy" size={18} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const QRCodeCard = ({ title, value }: { title: string; value: string }) => (
    <View style={styles.qrCard}>
      <Text style={styles.qrTitle}>{title}</Text>
      <View style={styles.qrContainer}>
        <QRCode
          value={value}
          size={width * 0.6}
          backgroundColor="white"
          color="black"
        />
      </View>
      <TouchableOpacity 
        onPress={() => copyToClipboard(value, title)} 
        style={styles.qrCopyButton}
      >
        <Ionicons name="copy" size={16} color="#007AFF" style={styles.copyIcon} />
        <Text style={styles.qrCopyText}>Copy {title}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading wallet information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!walletInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Failed to load wallet information</Text>
          <TouchableOpacity onPress={loadWalletInfo} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="wallet" size={32} color="#007AFF" />
          <Text style={styles.headerTitle}>Main Wallet</Text>
          <Text style={styles.headerSubtitle}>Your personal wallet information</Text>
        </View>

        <View style={styles.content}>
          {/* Wallet Address */}
          <InfoCard
            title="Wallet Address"
            value={walletInfo.address}
          />

          {/* Private Key */}
          <InfoCard
            title="Private Key"
            value={walletInfo.privateKey}
            isSecret={true}
            showSecret={showPrivateKey}
            onToggleSecret={() => setShowPrivateKey(!showPrivateKey)}
          />

          {/* Mnemonic Phrase */}
          <InfoCard
            title="Mnemonic Phrase"
            value={walletInfo.mnemonic}
            isSecret={true}
            showSecret={showMnemonic}
            onToggleSecret={() => setShowMnemonic(!showMnemonic)}
          />

          {/* QR Codes */}
          <QRCodeCard
            title="Address QR Code"
            value={walletInfo.address}
          />

          <QRCodeCard
            title="Private Key QR Code"
            value={walletInfo.privateKey}
          />

          {/* Security Warning */}
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color="#FF9500" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Security Warning</Text>
              <Text style={styles.warningText}>
                Never share your private key or mnemonic phrase with anyone. 
                Anyone with access to these can control your wallet and funds.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8e8e93',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  eyeButton: {
    padding: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardValue: {
    fontSize: 14,
    color: '#3c3c43',
    fontFamily: 'monospace',
    lineHeight: 20,
    flex: 1,
    paddingRight: 12,
  },
  hiddenText: {
    letterSpacing: 2,
    fontFamily: 'system',
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },
  qrCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e7',
    marginBottom: 20,
  },
  qrCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  copyIcon: {
    marginRight: 6,
  },
  qrCopyText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  warningCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#ef6c00',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});