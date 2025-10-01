import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RequestScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [amount, setAmount] = useState('0');
  const [loading, setLoading] = useState(false);

  // Hide bottom menu bar when this screen is focused
  useEffect(() => {
    // This will be handled by the parent component
    return () => {
      // Show menu bar when leaving this screen
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  const formatAmount = (value: string): string => {
    if (value === '0' || !value) return '0';
    
    const number = parseInt(value, 10);
    if (isNaN(number)) return value;
    
    return number.toLocaleString();
  };

  const handleRequest = () => {
    if (amount === '0') {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    // Navigate to request options screen with amount
    router.push({
      pathname: '/(tabs)/request-options',
      params: { amount }
    });
  };

  const addDigit = (digit: string) => {
    if (amount === '0') {
      setAmount(digit);
    } else {
      setAmount(prev => prev + digit);
    }
  };

  const backspace = () => {
    if (amount.length > 1) {
      setAmount(prev => prev.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const clearAmount = () => {
    setAmount('0');
  };

  const isAmountValid = amount !== '0' && amount.length > 0;

  const CalculatorButton = ({ 
    text, 
    onPress, 
    isSecondary = false 
  }: { 
    text: string; 
    onPress: () => void; 
    isSecondary?: boolean;
  }) => (
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

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFF' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
          Request
        </Text>
        <View style={styles.headerSpacer} />
      </View>


      {/* Amount Section */}
      <View style={styles.amountSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Amount
        </Text>
        <View style={[styles.amountDisplay, { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface }]}>
          <View style={styles.amountRow}>
            <Text style={[styles.currencyText, { color: isDark ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault }]}>$</Text>
            <Text style={[styles.amountText, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {formatAmount(amount)}
            </Text>
          </View>
        </View>
      </View>

      {/* Request Button */}
      <TouchableOpacity
        style={[
          styles.requestButton,
          !isAmountValid && styles.requestButtonDisabled,
        ]}
        onPress={handleRequest}
        disabled={!isAmountValid || loading}
      >
        <LinearGradient
          colors={['#007B50', 'rgba(0, 123, 80, 0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.requestGradient}
        >
          <IconSymbol name="arrow.up.right" size={16} color="white" />
          <Text style={styles.requestButtonText}>
            Request ${formatAmount(amount)}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
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
  requestButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  requestButtonDisabled: {
    opacity: 0.5,
  },
  requestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
});
