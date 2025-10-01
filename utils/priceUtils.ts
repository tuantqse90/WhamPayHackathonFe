// Price utilities for fetching real token prices
interface TokenPrice {
  usd: number;
  usd_24h_change: number;
}

interface CoinGeckoResponse {
  [key: string]: TokenPrice;
}

// CoinGecko coin IDs mapping
const COINGECKO_IDS: { [symbol: string]: string } = {
  'ETH': 'ethereum',
  'BTC': 'bitcoin', 
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'BNB': 'binancecoin',
  'DOT': 'polkadot',
  'PAS': 'ethereum', // Fallback to ETH for unknown tokens
};

// Cache for prices (5 minutes cache)
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get token price from CoinGecko API with caching
 */
export async function getTokenPrice(symbol: string): Promise<number> {
  const cacheKey = symbol.toUpperCase();
  const cached = priceCache.get(cacheKey);
  
  // Return cached price if valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    const coinId = COINGECKO_IDS[symbol.toUpperCase()] || 'ethereum';
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CoinGeckoResponse = await response.json();
    const price = data[coinId]?.usd || 0;

    // Cache the price
    priceCache.set(cacheKey, { price, timestamp: Date.now() });
    
    return price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    
    // Return cached price if available, even if expired
    if (cached) {
      return cached.price;
    }
    
    // Fallback prices for common tokens
    const fallbackPrices: { [key: string]: number } = {
      'ETH': 3000,
      'BTC': 65000,
      'USDT': 1,
      'USDC': 1,
      'BNB': 600,
      'DOT': 5,
      'PAS': 3000, // Fallback to ETH price
    };
    
    return fallbackPrices[symbol.toUpperCase()] || 1;
  }
}

/**
 * Get multiple token prices at once
 */
export async function getMultipleTokenPrices(symbols: string[]): Promise<{ [symbol: string]: number }> {
  const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase()))];
  const prices: { [symbol: string]: number } = {};
  
  // Check cache first
  const uncachedSymbols = uniqueSymbols.filter(symbol => {
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      prices[symbol] = cached.price;
      return false;
    }
    return true;
  });

  if (uncachedSymbols.length === 0) {
    return prices;
  }

  try {
    // Build CoinGecko IDs list
    const coinIds = uncachedSymbols.map(symbol => 
      COINGECKO_IDS[symbol] || 'ethereum'
    ).join(',');

    console.log('🚀 Calling CoinGecko API...', coinIds);

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CoinGeckoResponse = await response.json();
    
    // Map results back to symbols and cache
    uncachedSymbols.forEach(symbol => {
      const coinId = COINGECKO_IDS[symbol] || 'ethereum';
      const price = data[coinId]?.usd || 1;
      prices[symbol] = price;
      priceCache.set(symbol, { price, timestamp: Date.now() });
    });

  } catch (error) {
    console.error('Error fetching multiple token prices:', error);
    
    // Use fallback prices for failed requests
    const fallbackPrices: { [key: string]: number } = {
      'ETH': 3000,
      'BTC': 65000,
      'USDT': 1,
      'USDC': 1,
      'BNB': 600,
      'DOT': 5,
      'PAS': 3000,
    };
    
    uncachedSymbols.forEach(symbol => {
      if (!(symbol in prices)) {
        prices[symbol] = fallbackPrices[symbol] || 1;
      }
    });
  }

  return prices;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  } else if (price >= 1) {
    return price.toFixed(2);
  } else {
    return price.toFixed(6);
  }
}

/**
 * Calculate USD value with proper formatting
 */
export function calculateUSDValue(balance: string, price: number): string {
  const balanceNum = parseFloat(balance || '0');
  const usdValue = balanceNum * price;
  
  if (usdValue < 0.01) {
    return '0.00';
  } else if (usdValue < 1000) {
    return usdValue.toFixed(2);
  } else {
    return usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}