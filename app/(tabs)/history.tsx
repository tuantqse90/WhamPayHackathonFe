import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Mock transaction data
const transactionData = [
  {
    id: '1',
    type: 'sent',
    amount: '-$150.00',
    recipient: 'Alice Johnson',
    date: 'Today, 2:30 PM',
    status: 'completed',
  },
  {
    id: '2',
    type: 'received',
    amount: '+$500.00',
    sender: 'Bob Smith',
    date: 'Yesterday, 10:15 AM',
    status: 'completed',
  },
  {
    id: '3',
    type: 'sent',
    amount: '-$75.50',
    recipient: 'Charlie Brown',
    date: 'Dec 22, 4:45 PM',
    status: 'completed',
  },
  {
    id: '4',
    type: 'received',
    amount: '+$200.00',
    sender: 'Diana Prince',
    date: 'Dec 21, 9:20 AM',
    status: 'completed',
  },
  {
    id: '5',
    type: 'deposit',
    amount: '+$1,000.00',
    source: 'Bank Transfer',
    date: 'Dec 20, 3:00 PM',
    status: 'completed',
  },
];

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return 'arrow.up.right';
      case 'received':
        return 'arrow.down.left';
      case 'deposit':
        return 'plus.circle.fill';
      default:
        return 'arrow.left.arrow.right';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sent':
        return '#FF6B6B';
      case 'received':
        return '#4ECDC4';
      case 'deposit':
        return '#45B7D1';
      default:
        return '#999';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
          Transaction History
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {transactionData.map((transaction, index) => (
          <View key={transaction.id}>
            <TouchableOpacity style={styles.transactionRow}>
              <View 
                style={[
                  styles.transactionIcon, 
                  { backgroundColor: getTransactionColor(transaction.type) + '20' }
                ]}
              >
                <IconSymbol 
                  name={getTransactionIcon(transaction.type)} 
                  size={20} 
                  color={getTransactionColor(transaction.type)} 
                />
              </View>

              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionTitle, { color: isDark ? '#FFF' : '#333' }]}>
                  {transaction.type === 'sent' 
                    ? `To ${transaction.recipient}` 
                    : transaction.type === 'received' 
                    ? `From ${transaction.sender}`
                    : `${transaction.source}`
                  }
                </Text>
                <Text style={[styles.transactionDate, { color: isDark ? '#AAA' : '#666' }]}>
                  {transaction.date}
                </Text>
              </View>

              <View style={styles.transactionAmount}>
                <Text 
                  style={[
                    styles.amountText, 
                    { 
                      color: transaction.amount.startsWith('+') 
                        ? '#4ECDC4' 
                        : transaction.amount.startsWith('-') 
                        ? '#FF6B6B' 
                        : isDark ? '#FFF' : '#333'
                    }
                  ]}
                >
                  {transaction.amount}
                </Text>
                <Text style={[styles.statusText, { color: isDark ? '#AAA' : '#666' }]}>
                  {transaction.status}
                </Text>
              </View>
            </TouchableOpacity>
            
            {index < transactionData.length - 1 && (
              <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
});