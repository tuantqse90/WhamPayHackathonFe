import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SelectTokenModal, { SelectableToken } from './select-token-modal';
import TransferAmountView from './transfer-amount';

type TransferMethod = 'social' | 'gift' | 'onchain';

interface TransferModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TransferModal({ visible, onClose }: TransferModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [selectedMethod, setSelectedMethod] = useState<TransferMethod>('social');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [giftUsername, setGiftUsername] = useState('');
  const [onChainAddress, setOnChainAddress] = useState('');
  const [showAmountView, setShowAmountView] = useState(false);
  const [showSelectToken, setShowSelectToken] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SelectableToken | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transferData, setTransferData] = useState<{
    method: TransferMethod;
    recipient: string;
  } | null>(null);

  const transferOptions = [
    {
      id: 'social' as TransferMethod,
      title: 'Social Transfer',
      subtitle: 'Send to friends by username',
      icon: 'person.2.fill',
      color: '#007B50',
      bgColor: 'rgba(0, 123, 80, 0.15)',
    },
    {
      id: 'gift' as TransferMethod,
      title: 'Send Gift',
      subtitle: 'Send a gift to friends by username',
      icon: 'gift.fill',
      color: '#007B50',
      bgColor: 'rgba(0, 123, 80, 0.15)',
    },
    {
      id: 'onchain' as TransferMethod,
      title: 'On-chain Address',
      subtitle: 'Send to any blockchain address',
      icon: 'link',
      color: '#007B50',
      bgColor: 'rgba(0, 123, 80, 0.15)',
    },
  ];

  const getRecipientData = () => {
    switch (selectedMethod) {
      case 'social':
        return {
          title: 'Recipient Username',
          placeholder: 'Enter username (e.g., @alice)',
          icon: 'at',
          value: recipientUsername,
          setValue: setRecipientUsername,
        };
      case 'gift':
        return {
          title: 'Gift Recipient Username',
          placeholder: 'Enter gift recipient username (e.g., @bob)',
          icon: 'gift',
          value: giftUsername,
          setValue: setGiftUsername,
        };
      case 'onchain':
        return {
          title: 'Blockchain Address',
          placeholder: 'Enter blockchain address',
          icon: 'link',
          value: onChainAddress,
          setValue: setOnChainAddress,
        };
    }
  };

  const handleNext = async () => {
    const recipient = getRecipientData();
    if (!recipient.value.trim()) {
      Alert.alert('Error', `Please enter ${recipient.title.toLowerCase()}`);
      return;
    }

    if (selectedMethod === 'gift') {
      // Navigate to Send Gift screen instead of showing alert
      onClose(); // Close the modal first
      router.push(`/(tabs)/send-gift/${recipient.value}`);
     
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate a brief loading for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set transfer data and open token selection first
      setTransferData({
        method: selectedMethod,
        recipient: recipient.value,
      });
      setShowSelectToken(true);
    } catch (error) {
      console.error('Error processing transfer:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountViewClose = () => {
    setShowAmountView(false);
    setTransferData(null);
    setSelectedToken(null);
  };

  const handleTokenSelected = (token: SelectableToken) => {
    setSelectedToken(token);
    setShowSelectToken(false);
    setShowAmountView(true);
  };

  const recipientData = getRecipientData();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>        
        <SelectTokenModal
          visible={showSelectToken}
          onClose={() => setShowSelectToken(false)}
          onSelect={handleTokenSelected}
        />
        {showAmountView && transferData && (
          <TransferAmountView
            visible={showAmountView}
            onClose={handleAmountViewClose}
            transferMethod={transferData.method}
            recipient={transferData.recipient}
            selectedToken={selectedToken}
            onComplete={() => {
              handleAmountViewClose();
              onClose();
            }}
          />
        )}
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
            Transfer
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>
              <IconSymbol name="xmark" size={16} color={isDark ? '#FFF' : '#333'} />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Transfer Method Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
              Transfer Method
            </Text>

            <View style={styles.optionsContainer}>
              {transferOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: selectedMethod === option.id
                        ? (isDark ? 'rgba(0, 123, 80, 0.1)' : 'rgba(0, 123, 80, 0.05)')
                        : (isDark ? '#222' : '#FFF'),
                      borderColor: selectedMethod === option.id
                        ? '#007B50'
                        : (isDark ? '#333' : '#E5E5E5'),
                      borderWidth: selectedMethod === option.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedMethod(option.id)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: option.bgColor }]}>
                    <IconSymbol name={option.icon as any} size={20} color={option.color} />
                  </View>
                  
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: isDark ? '#FFF' : '#333' }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                      {option.subtitle}
                    </Text>
                  </View>

                  <View style={styles.checkContainer}>
                    <IconSymbol
                      name={selectedMethod === option.id ? 'checkmark.circle.fill' : 'circle'}
                      size={24}
                      color={selectedMethod === option.id ? '#007B50' : (isDark ? '#666' : '#CCC')}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recipient Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
              {recipientData.title}
            </Text>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
              <IconSymbol name={recipientData.icon as any} size={16} color="#007B50" />
              <TextInput
                style={[styles.textInput, { color: isDark ? '#FFF' : '#333' }]}
                placeholder={recipientData.placeholder}
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={recipientData.value}
                onChangeText={recipientData.setValue}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Transfer Button */}
          <TouchableOpacity
            style={[
              styles.transferButton,
              (!recipientData.value.trim() || isLoading) && styles.transferButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!recipientData.value.trim() || isLoading}
          >
            <LinearGradient
              colors={['#007B50', 'rgba(0, 123, 80, 0.8)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.transferGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <IconSymbol name="arrow.right" size={16} color="white" />
              )}
              <Text style={styles.transferButtonText}>
                {isLoading ? 'Processing...' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
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
    paddingBottom: 24,
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
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  checkContainer: {
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  transferButton: {
    marginHorizontal: 20,
    marginBottom: 40,
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
  transferButtonDisabled: {
    opacity: 0.6,
  },
  transferGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  transferButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});