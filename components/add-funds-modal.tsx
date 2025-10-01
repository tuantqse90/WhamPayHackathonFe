import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';

type PaymentMethod = 'applePay' | 'creditCard' | 'onChain';

interface AddFundsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PaymentMethodButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  isRecommended?: boolean;
  onPress: () => void;
}

interface CalculatorButtonProps {
  text: string;
  onPress: () => void;
  isSecondary?: boolean;
}

const PaymentMethodButton: React.FC<PaymentMethodButtonProps> = ({
  icon,
  title,
  subtitle,
  isRecommended = false,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity style={styles.paymentMethodButton} onPress={onPress}>
      <LinearGradient
        colors={isDark ? ['#222', '#333'] : ['#FFF', '#F8F8F8']}
        style={styles.paymentMethodGradient}
      >
        {/* Icon */}
        <View style={[styles.paymentIcon, { backgroundColor: 'rgba(0, 123, 80, 0.1)' }]}>
          <IconSymbol name={icon as any} size={20} color="#007B50" />
        </View>

        {/* Content */}
        <View style={styles.paymentContent}>
          <View style={styles.paymentTitleRow}>
            <Text style={[styles.paymentTitle, { color: isDark ? '#FFF' : '#333' }]}>
              {title}
            </Text>
            {isRecommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
          </View>
          <Text style={[styles.paymentSubtitle, { color: isDark ? '#AAA' : '#666' }]}>
            {subtitle}
          </Text>
        </View>

        {/* Arrow */}
        <IconSymbol name="chevron.right" size={14} color={isDark ? '#AAA' : '#666'} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ text, onPress, isSecondary = false }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.calculatorButton,
        {
          backgroundColor: isSecondary 
            ? 'rgba(0, 123, 80, 0.1)'
            : (isDark ? '#333' : '#FFF'),
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
              ? '#007B50'
              : (isDark ? '#FFF' : '#333'),
          },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default function AddFundsModal({ visible, onClose }: AddFundsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('0');

  const paymentMethods = [
    {
      id: 'applePay' as PaymentMethod,
      icon: 'applelogo',
      title: 'Apple Pay',
      subtitle: 'Pay with Face ID or Touch ID',
      isRecommended: true,
    },
    {
      id: 'creditCard' as PaymentMethod,
      icon: 'creditcard.fill',
      title: 'Credit Card',
      subtitle: 'Visa, Mastercard, American Express',
    },
    {
      id: 'onChain' as PaymentMethod,
      icon: 'link',
      title: 'On Chain',
      subtitle: 'Connect your crypto wallet',
    },
  ];

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

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowCalculator(true);
  };

  const handleBackFromCalculator = () => {
    setShowCalculator(false);
    setSelectedPaymentMethod(null);
    setAmount('0');
  };

  const handlePayment = () => {
    if (amount === '0' || !amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const methodName = selectedPaymentMethod === 'applePay' 
      ? 'Apple Pay' 
      : selectedPaymentMethod === 'creditCard' 
      ? 'Credit Card' 
      : 'On Chain';
    
    Alert.alert(
      'Add Funds Confirmation',
      `Add $${formatAmount(amount)} using ${methodName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          style: 'default',
          onPress: () => {
            Alert.alert(
              'Funds Added Successfully',
              `Successfully added $${formatAmount(amount)} to your account`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    onClose();
                    setShowCalculator(false);
                    setSelectedPaymentMethod(null);
                    setAmount('0');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const getPaymentMethodIcon = () => {
    if (!selectedPaymentMethod) return 'creditcard.fill';
    return selectedPaymentMethod === 'applePay' ? 'applelogo' : 'creditcard.fill';
  };

  const isAmountValid = amount !== '0' && amount.length > 0;

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
          {showCalculator ? (
            <TouchableOpacity onPress={handleBackFromCalculator} style={styles.backButton}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>
                <IconSymbol name="chevron.left" size={16} color={isDark ? '#FFF' : '#333'} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
          
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
            {showCalculator ? 'Enter Amount' : 'Add Funds'}
          </Text>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>
              <IconSymbol name="xmark" size={16} color={isDark ? '#FFF' : '#333'} />
            </View>
          </TouchableOpacity>
        </View>

        {showCalculator ? (
          // Calculator View
          <View style={styles.calculatorContainer}>
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
            <View style={styles.calculator}>
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

            {/* Payment Button */}
            <TouchableOpacity
              style={[
                styles.payButton,
                !isAmountValid && styles.payButtonDisabled,
              ]}
              onPress={handlePayment}
              disabled={!isAmountValid}
            >
              <LinearGradient
                colors={['#007B50', 'rgba(0, 123, 80, 0.8)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.payGradient}
              >
                <IconSymbol name={getPaymentMethodIcon() as any} size={18} color="white" />
                <Text style={styles.payButtonText}>
                  Pay ${formatAmount(amount)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          // Payment Methods View
          <View style={styles.paymentMethodsContainer}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>
              Payment Method
            </Text>

            <View style={styles.paymentMethodsList}>
              {paymentMethods.map((method) => (
                <PaymentMethodButton
                  key={method.id}
                  icon={method.icon}
                  title={method.title}
                  subtitle={method.subtitle}
                  isRecommended={method.isRecommended}
                  onPress={() => {
                    if (method.id === 'onChain') {
                      Alert.alert('On Chain', 'On-chain funding will be implemented in a future update.');
                    } else {
                      handlePaymentMethodSelect(method.id);
                    }
                  }}
                />
              ))}
            </View>
          </View>
        )}
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
    paddingBottom: 30,
  },
  headerSpacer: {
    width: 32,
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
  paymentMethodsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentMethodsList: {
    gap: 16,
  },
  paymentMethodButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentMethodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  paymentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recommendedBadge: {
    backgroundColor: '#007B50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  recommendedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  paymentSubtitle: {
    fontSize: 14,
  },
  calculatorContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  amountSection: {
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
    gap: 8,
  },
  amountText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  currencyText: {
    fontSize: 18,
    fontWeight: '500',
  },
  calculator: {
    gap: 16,
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  calculatorButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  calculatorButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  payButton: {
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});