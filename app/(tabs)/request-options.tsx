import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

interface RequestOptionsScreenProps {
  amount: string;
}

export default function RequestOptionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [note, setNote] = useState('');
  const params = useLocalSearchParams();
  const amount = params.amount as string || '0';

  const handleBack = () => {
    router.back();
  };

  const handleAddNote = () => {
    // Show note input modal or navigate to note screen
    Alert.alert('Add Note', 'Note functionality will be implemented here.');
  };

  const handleViaQR = () => {
    Alert.alert(
      'QR Code Generated',
      `QR code for $${amount} request has been generated.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to QR display or share
            console.log('Show QR code');
          },
        },
      ]
    );
  };

  const handleViaLink = () => {
    Alert.alert(
      'Link Generated',
      `Payment request link for $${amount} has been generated.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to link display or share
            console.log('Show payment link');
          },
        },
      ]
    );
  };

  const formatAmount = (value: string): string => {
    if (value === '0' || !value) return '0';
    
    const number = parseInt(value, 10);
    if (isNaN(number)) return value;
    
    return number.toLocaleString();
  };


  return (
    <RNSafeAreaView 
      style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? Colors.dark.text : Colors.light.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
          Request
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Circular Amount Display */}
        <View style={[styles.amountCircle, { borderColor: isDark ? Colors.dark.surfaceVariant : Colors.light.surfaceVariant }]}>
          <Text style={[styles.amountLabel, { color: isDark ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault }]}>
            Amount
          </Text>
          <View style={styles.amountContainer}>
            <Text style={[styles.dollarSign, { color: isDark ? Colors.dark.text : Colors.light.text }]}>$</Text>
            <Text style={[styles.amountValue, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
              {formatAmount(amount)}
            </Text>
          </View>
        </View>

        {/* Add Note */}
        <TouchableOpacity 
          style={styles.addNoteButton}
          onPress={handleAddNote}
        >
          <Text style={[styles.addNoteText, { color: isDark ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault }]}>
            Add a note
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Options */}
      <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
        <TouchableOpacity 
          style={styles.footerOption}
          onPress={handleViaQR}
        >
          <Text style={styles.footerOptionText}>VIA QR</Text>
          <IconSymbol name="qrcode" size={20} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.footerDivider} />

        <TouchableOpacity 
          style={styles.footerOption}
          onPress={handleViaLink}
        >
          <Text style={styles.footerOptionText}>VIA LINK</Text>
          <IconSymbol name="link" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Home Indicator */}
        <View style={styles.homeIndicator} />
      </View>
    </RNSafeAreaView>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  amountCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  amountLabel: {
    fontSize: 16,
    marginBottom: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dollarSign: {
    fontSize: 32,
    fontWeight: '400',
    marginRight: 4,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  addNoteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addNoteText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
  },
  footerOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  footerOptionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#FFF',
    opacity: 0.3,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#FFF',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
    opacity: 0.3,
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -67,
  },
});
