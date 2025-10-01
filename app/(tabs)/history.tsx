import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiClient } from '@/utils/ApiClient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  recipient: string;
  time: string;
  status: string;
  direction: 'sent' | 'received' | 'transfer';
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showingFilters, setShowingFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const isDark = colorScheme === 'dark';

  const filterOptions = ['All', 'Add Fund', 'Transfer', 'Donate', 'Send Gift'];

  // Utility function to truncate long addresses
  const truncateAddress = (address: string, maxLength: number = 20): string => {
    if (!address || address.length <= maxLength) return address;
    
    // If it looks like a crypto address (starts with 0x), show first 6 and last 4
    if (address.startsWith('0x') && address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    // For other long strings, truncate in the middle
    if (address.length > maxLength) {
      const start = Math.floor((maxLength - 3) / 2);
      const end = Math.ceil((maxLength - 3) / 2);
      return `${address.slice(0, start)}...${address.slice(-end)}`;
    }
    
    return address;
  };

  // Mock data matching Swift UI for demonstration
  const mockHistoryData: Transaction[] = [
    { id: '1', type: 'Add Fund', amount: '+$500', recipient: 'Bank Transfer', time: '2 hours ago', status: 'Completed', direction: 'received' },
    { id: '2', type: 'Transfer', amount: '-$50', recipient: '0x1234567890abcdef1234567890abcdef12345678', time: '5 hours ago', status: 'Completed', direction: 'sent' },
    { id: '3', type: 'Donate', amount: '-$25', recipient: 'Charity Fund', time: '1 day ago', status: 'Completed', direction: 'sent' },
    { id: '4', type: 'Send Gift', amount: '-$100', recipient: 'Bob', time: '2 days ago', status: 'Completed', direction: 'sent' },
    { id: '5', type: 'Add Fund', amount: '+$200', recipient: 'Credit Card', time: '3 days ago', status: 'Completed', direction: 'received' },
    { id: '6', type: 'Transfer', amount: '-$75', recipient: '0xabcdef1234567890abcdef1234567890abcdef12', time: '4 days ago', status: 'Completed', direction: 'sent' },
    { id: '7', type: 'Donate', amount: '-$15', recipient: 'Local Shelter', time: '5 days ago', status: 'Completed', direction: 'sent' },
    { id: '8', type: 'Send Gift', amount: '-$30', recipient: '0x9876543210fedcba9876543210fedcba98765432', time: '1 week ago', status: 'Completed', direction: 'sent' },
    { id: '9', type: 'Add Fund', amount: '+$1000', recipient: 'Bank Transfer', time: '1 week ago', status: 'Completed', direction: 'received' },
    { id: '10', type: 'Transfer', amount: '-$200', recipient: 'Eve', time: '1 week ago', status: 'Completed', direction: 'sent' }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Add Fund':
        return 'arrow.down.left';
      case 'Transfer':
        return 'arrow.up.right';
      case 'Donate':
        return 'heart.fill';
      case 'Send Gift':
        return 'gift.fill';
      default:
        return 'arrow.left.arrow.right';
    }
  };

  const getTransactionColor = (amount: string) => {
    return amount.startsWith('+') ? '#007B50' : '#FF6B6B';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#007B50';
      case 'pending':
        return '#007AFF';
      case 'failed':
        return '#FF6B6B';
      default:
        return '#999';
    }
  };

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      console.log('🚀 Fetching transaction history...');
      setLoading(true);
      try {
        const result = await ApiClient.getTransactions();
        const list = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : []);
        setTransactions(list);
        console.log('🚀 Transaction history:', list);
      } catch (error) {
        console.error('❌ Failed to fetch transactions:', error);
        // Use mock data as fallback
        console.log('📋 Using mock data as fallback');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactionHistory();
  }, []);

  const computedTransactions = useMemo(() => {
    // Use mock data for now, or process real data if available
    const dataToUse = transactions.length > 0 ? transactions : mockHistoryData;
    
    if (transactions.length > 0) {
      const username = user?.username || user?.name;
      return transactions.map((tx) => {
        const direction = username && tx.fromUser && typeof tx.fromUser === 'string' && tx.fromUser.toLowerCase() === String(username).toLowerCase()
          ? 'sent'
          : (username && tx.toUser && typeof tx.toUser === 'string' && tx.toUser.toLowerCase() === String(username).toLowerCase() ? 'received' : 'transfer');

        const counterpart = direction === 'sent' ? (tx.toUser || tx.toAddress) : (tx.fromUser || tx.fromAddress);
        const amountNumber = Number(tx.amount || 0);
        const sign = direction === 'received' ? '+' : direction === 'sent' ? '-' : '';
        const amountText = `${sign}$${amountNumber.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const date = tx.createdAt ? new Date(tx.createdAt) : null;
        const dateText = date ? date.toLocaleString() : '';

        return {
          id: tx._id || tx.id || tx.txHash,
          type: 'Transfer',
          amount: amountText,
          recipient: truncateAddress(counterpart || 'Unknown'),
          time: dateText,
          status: (tx.status || 'completed').toLowerCase(),
          direction,
        };
      });
    }
    
    return mockHistoryData;
  }, [transactions, user, mockHistoryData]);

  const filteredTransactions = useMemo(() => {
    let filtered = selectedFilter === 'All' 
      ? computedTransactions 
      : computedTransactions.filter(tx => tx.type === selectedFilter);

    if (searchText.trim()) {
      filtered = filtered.filter(tx => 
        tx.recipient.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [computedTransactions, selectedFilter, searchText]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
                Transaction History
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                {filteredTransactions.length} transactions
              </Text>
            </View>

            {/* Filter Button */}
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowingFilters(!showingFilters)}
            >
              <IconSymbol 
                name="line.3.horizontal.decrease.circle" 
                size={12} 
                color="#007B50" 
              />
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
            <IconSymbol name="magnifyingglass" size={16} color={isDark ? '#666' : '#999'} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#FFF' : '#333' }]}
              placeholder="Search transactions..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Filter Chips */}
          {showingFilters && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filtersScrollView}
            >
              <View style={styles.filtersContainer}>
                {filterOptions.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      selectedFilter === filter && styles.filterChipSelected,
                      { backgroundColor: selectedFilter === filter ? '#007B50' : (isDark ? '#2A2A2A' : '#F0F0F0') }
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      { color: selectedFilter === filter ? '#FFF' : (isDark ? '#FFF' : '#333') }
                    ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Transaction Cards */}
        <View style={styles.transactionsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007B50" />
              <Text style={[styles.loadingText, { color: isDark ? '#AAA' : '#666' }]}>
                Loading transactions...
              </Text>
            </View>
          ) : filteredTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="doc.text" size={48} color={isDark ? '#666' : '#999'} />
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#333' }]}>
                No transactions found
              </Text>
              <Text style={[styles.emptySubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                Try adjusting your search or filter
              </Text>
            </View>
          ) : (
            filteredTransactions.map((transaction) => (
              <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.transactionType, { color: isDark ? '#FFF' : '#333' }]}>
                      {transaction.type}
                    </Text>
                    <Text style={[
                      styles.transactionAmount, 
                      { color: getTransactionColor(transaction.amount) }
                    ]}>
                      {transaction.amount}
                    </Text>
                  </View>

                  <View style={styles.cardDetails}>
                    <Text style={[styles.transactionRecipient, { color: isDark ? '#AAA' : '#666' }]}>
                      {truncateAddress(transaction.recipient)}
                    </Text>
                    <Text style={[styles.transactionTime, { color: isDark ? '#AAA' : '#666' }]}>
                      {transaction.time}
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(transaction.status) + '26' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(transaction.status) }
                      ]}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#007B50',
    borderRadius: 16,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007B50',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filtersScrollView: {
    marginBottom: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterChipSelected: {
    backgroundColor: '#007B50',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  transactionCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionRecipient: {
    fontSize: 14,
  },
  transactionTime: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // Legacy styles (kept for compatibility)
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
});