import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiClient } from '../utils/ApiClient';
import { SelectableToken } from './select-token-modal';

type TransferMethod = 'social' | 'onchain' | 'gift';

interface TransferAmountViewProps {
  visible: boolean;
  onClose: () => void;
  transferMethod: TransferMethod;
  recipient: string;
  onComplete: () => void;
  selectedToken?: SelectableToken | null;
}

interface CalculatorButtonProps {
  text: string;
  onPress: () => void;
  isSecondary?: boolean;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ text, onPress, isSecondary = false }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.calculatorButton,
        {
          backgroundColor: isSecondary 
            ? (isDark ? '#333' : '#E5E5E5')
            : (isDark ? '#444' : '#FFF'),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.calculatorButtonText,
          {
            color: isSecondary 
              ? (isDark ? '#FFF' : '#666')
              : (isDark ? '#FFF' : '#333'),
            fontWeight: isSecondary ? '500' : '600',
          },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default function TransferAmountView({
  visible,
  onClose,
  transferMethod,
  recipient,
  onComplete,
  selectedToken,
}: TransferAmountViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [amount, setAmount] = useState('0');

  const getRecipientIcon = () => {
    return transferMethod === 'social' ? 'at' : 'link';
  };

  const formatAmount = (value: string): string => {
    if (value === '0' || !value) return '0';
    
    const number = parseInt(value, 10);
    if (isNaN(number)) return value;
    
    return number.toLocaleString();
  };

  const addDigit = (digit: string) => {
    if (amount === '0') {
      setAmount(digit);
    } else {
      setAmount(prev => prev + digit);
    }
  };

  const clearAmount = () => {
    setAmount('0');
  };

  const backspace = () => {
    if (amount.length > 1) {
      setAmount(prev => prev.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const executeTransfer = async () => {
    try {
      const isNative = selectedToken?.isNative ?? true;
      const tokenAddress = isNative ? '' : (selectedToken?.address || '');
      // For social transfer, use transferToUser API
      if (transferMethod === 'social') {
        const result = await ApiClient.transfer({
          // recipient: recipient.replace("@", ""), // Remove @ symbol if present
          // amount: parseFloat(amount),
          // isNative: true, // Default to native token (ETH/PAS)
          // chainId: 8453,
          recipient: recipient,
          address: recipient,
          chainId: 8453,
          isNative,
          tokenAddress,
          amount: parseFloat(amount),
        });
        
        if (result.success) {
          Alert.alert(
            'Transfer Successful',
            `Successfully sent $${formatAmount(amount)} to ${recipient}`,
            [{ text: 'OK', onPress: onComplete }]
          );
        } else {
          Alert.alert('Transfer Failed', result.message || 'Transfer failed');
        }
      } else {
        // For onchain transfer, use multiSendTokens API with single address
        const result = await ApiClient.multiSendTokens({
          wallets: [recipient], // Single address for onchain
          amount: parseFloat(amount),
          isNative,
          chainId: 8453,
        });
        
        if (result.success) {
          Alert.alert(
            'Transfer Successful',
            `Successfully sent $${formatAmount(amount)} to ${recipient}`,
            [{ text: 'OK', onPress: onComplete }]
          );
        } else {
          Alert.alert('Transfer Failed', result.message || 'Transfer failed');
        }
      }
    } catch (error) {
      console.error('Transfer error:', error);
      Alert.alert('Transfer Failed', 'An error occurred during transfer');
    }
  };

  const handleTransfer = () => {
    if (amount === '0' || !amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const methodName = transferMethod === 'social' ? 'Social Transfer' : 'On-chain Transfer';
    
    Alert.alert(
      'Transfer Confirmation',
      `${methodName} $${formatAmount(amount)} to ${recipient}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm Transfer',
          style: 'default',
          onPress: executeTransfer,
        },
      ]
    );
  };

  const isAmountValid = amount !== '0' && amount.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>
              <IconSymbol name="chevron.left" size={16} color={isDark ? '#FFF' : '#333'} />
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>Transfer Amount</Text>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>
              <IconSymbol name="xmark" size={16} color={isDark ? '#FFF' : '#333'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recipient Info */}
        <View style={styles.recipientSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
            To
          </Text>
          
          <View style={[styles.recipientContainer, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
            <IconSymbol name={getRecipientIcon() as any} size={16} color="#007B50" />
            <Text style={[styles.recipientText, { color: isDark ? '#FFF' : '#333' }]}>
              {recipient}
            </Text>
          </View>
        </View>

        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
            Amount
          </Text>
          
          <View style={[styles.amountDisplay, { backgroundColor: isDark ? '#222' : '#FFF' }]}>
            <View style={styles.amountRow}>
              <Text style={[styles.amountText, { color: isDark ? '#FFF' : '#333' }]}>
                {formatAmount(amount)}
              </Text>
              <Text style={[styles.currencyText, { color: isDark ? '#AAA' : '#666' }]}>
                USD
              </Text>
            </View>
          </View>
        </View>

        {/* Calculator */}
        <View style={styles.calculatorContainer}>
          {/* Row 1 */}
          <View style={styles.calculatorRow}>
            <CalculatorButton text="1" onPress={() => addDigit('1')} />
            <CalculatorButton text="2" onPress={() => addDigit('2')} />
            <CalculatorButton text="3" onPress={() => addDigit('3')} />
          </View>
          
          {/* Row 2 */}
          <View style={styles.calculatorRow}>
            <CalculatorButton text="4" onPress={() => addDigit('4')} />
            <CalculatorButton text="5" onPress={() => addDigit('5')} />
            <CalculatorButton text="6" onPress={() => addDigit('6')} />
          </View>
          
          {/* Row 3 */}
          <View style={styles.calculatorRow}>
            <CalculatorButton text="7" onPress={() => addDigit('7')} />
            <CalculatorButton text="8" onPress={() => addDigit('8')} />
            <CalculatorButton text="9" onPress={() => addDigit('9')} />
          </View>
          
          {/* Row 4 */}
          <View style={styles.calculatorRow}>
            <CalculatorButton text="C" onPress={clearAmount} isSecondary />
            <CalculatorButton text="0" onPress={() => addDigit('0')} />
            <CalculatorButton text="⌫" onPress={backspace} isSecondary />
          </View>
        </View>

        <View style={styles.spacer} />

        {/* Transfer Button */}
        <TouchableOpacity
          style={[
            styles.transferButton,
            !isAmountValid && styles.transferButtonDisabled,
          ]}
          onPress={handleTransfer}
          disabled={!isAmountValid}
        >
          <LinearGradient
            colors={['#007B50', 'rgba(0, 123, 80, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.transferGradient}
          >
            <IconSymbol 
              name={transferMethod === 'social' ? 'arrow.up.right' : 'link'} 
              size={16} 
              color="white" 
            />
            <Text style={styles.transferButtonText}>
              Transfer ${formatAmount(amount)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
  backButton: {
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
  recipientSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    gap: 12,
  },
  recipientText: {
    fontSize: 16,
    fontWeight: '500',
  },
  amountSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  amountDisplay: {
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  amountText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  currencyText: {
    fontSize: 18,
    fontWeight: '500',
  },
  calculatorContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  calculatorButton: {
    flex: 1,
    // aspectRatio: 1,
    height: 80,
    width: 80,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calculatorButtonText: {
    fontSize: 24,
  },
  spacer: {
    flex: 1,
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