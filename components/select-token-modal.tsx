import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiClient } from '@/utils/ApiClient';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type SelectableToken = {
  symbol: string;
  name: string;
  address?: string;
  isNative?: boolean;
};

interface SelectTokenModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (token: SelectableToken) => void;
  tokens?: SelectableToken[];
}

const DEFAULT_TOKENS: SelectableToken[] = [
  { symbol: 'ETH', name: 'Ethereum', isNative: true },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USDT', name: 'Tether USD' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'PAS', name: 'Passet', isNative: false },
];

export default function SelectTokenModal({ visible, onClose, onSelect, tokens = DEFAULT_TOKENS }: SelectTokenModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  const [apiTokens, setApiTokens] = useState<SelectableToken[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!visible) return;
      try {
        setLoading(true);
        const result = await ApiClient.getTokens({ page: 1, size: 100 });
        if (cancelled) return;
        if (Array.isArray(result)) {
          const mapped: SelectableToken[] = result.map((t: any) => ({
            symbol: t.symbol,
            name: t.name,
            address: t.address === '0x0000000000000000000000000000000000000000' ? undefined : t.address,
            isNative: t.address === '0x0000000000000000000000000000000000000000',
          }));
          setApiTokens(mapped);
        } else if (Array.isArray(result?.data)) {
          const mapped: SelectableToken[] = result.data.map((t: any) => ({
            symbol: t.symbol,
            name: t.name,
            address: t.address === '0x0000000000000000000000000000000000000000' ? undefined : t.address,
            isNative: t.address === '0x0000000000000000000000000000000000000000',
          }));
          setApiTokens(mapped);
        } else {
          setApiTokens(null);
        }
      } catch {
        setApiTokens(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const listTokens = useMemo(() => apiTokens ?? tokens, [apiTokens, tokens]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>        
        <View style={styles.handleBar} />

        <View style={styles.header}>          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]}>              
              <IconSymbol name="xmark" size={16} color={isDark ? '#FFF' : '#333'} />
            </View>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>Select Token</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>            
            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#007B50" />
                <Text style={[styles.loadingText, { color: isDark ? '#AAA' : '#666' }]}>Loading tokens...</Text>
              </View>
            )}
            <View style={styles.list}>
              {listTokens.map((token) => (
                <TouchableOpacity
                  key={token.symbol}
                  style={[styles.tokenRow, { backgroundColor: isDark ? '#111' : '#FFF', borderColor: isDark ? '#222' : '#E5E5E5' }]}
                  activeOpacity={0.7}
                  onPress={() => onSelect(token)}
                >
                  <View style={[styles.tokenIcon, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,123,80,0.08)' }]}>
                    <IconSymbol name="creditcard" size={18} color="#007B50" />
                  </View>
                  <View style={styles.tokenInfo}>
                    <Text style={[styles.tokenSymbol, { color: isDark ? '#FFF' : '#333' }]}>{token.symbol}</Text>
                    <Text style={[styles.tokenName, { color: isDark ? '#AAA' : '#666' }]}>{token.name}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={isDark ? '#666' : '#AAA'} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
  },
  list: {
    gap: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenName: {
    fontSize: 13,
  },
});


