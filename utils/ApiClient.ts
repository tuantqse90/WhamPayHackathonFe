import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/api';

// Error types for better handling
export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ApiClient {
  private static async getAuthHeaders() {
    const token = await AsyncStorage.getItem('whampay_access_token');
    console.log('🔑 Bearer Token:', token ? `Bearer ${token}` : 'No token found');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('whampay_access_token');
      return !!token;
    } catch {
      return false;
    }
  }

  private static async handleResponse(response: Response, silent = false) {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or not authenticated
        const errorData = await response.json().catch(() => ({}));
        const error = new AuthenticationError(errorData.message || 'Authentication required');
        
        // Set a flag to indicate this is an auth error (for silent handling)
        (error as any).silent = silent;
        throw error;
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  }

  static async get(endpoint: string, options: { silent?: boolean } = {}) {
    const { silent = false } = options;
    
    // Check authentication first for protected endpoints
    if (!await this.isAuthenticated() && silent) {
      console.log('🔒 No authentication token, skipping API call silently');
      throw new AuthenticationError('No authentication token');
    }
    
    const headers = await this.getAuthHeaders();
    console.log('📡 GET Request:', `${BACKEND_URL}${endpoint}`);
    console.log('📋 Headers:', headers);
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    console.log('📥 Response Status:', response.status);
    return this.handleResponse(response, silent);
  }

  static async post(endpoint: string, data: any, options: { silent?: boolean } = {}) {
    const { silent = false } = options;
    
    if (!await this.isAuthenticated() && silent) {
      console.log('🔒 No authentication token, skipping API call silently');
      throw new AuthenticationError('No authentication token');
    }
    
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response, silent);
  }

  static async put(endpoint: string, data: any, options: { silent?: boolean } = {}) {
    const { silent = false } = options;
    
    if (!await this.isAuthenticated() && silent) {
      console.log('🔒 No authentication token, skipping API call silently');
      throw new AuthenticationError('No authentication token');
    }
    
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response, silent);
  }

  static async delete(endpoint: string, options: { silent?: boolean } = {}) {
    const { silent = false } = options;
    
    if (!await this.isAuthenticated() && silent) {
      console.log('🔒 No authentication token, skipping API call silently');
      throw new AuthenticationError('No authentication token');
    }
    
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response, silent);
  }

  // Specific API methods
  static async getUserInfo(options: { silent?: boolean } = {}) {
    return this.get('/auth/me', options);
  }

  static async getWalletBalance(options: { silent?: boolean } = {}) {
    return this.get('/wallet/balance', options);
  }

  static async getTransactionHistory(options: { silent?: boolean } = {}) {
    return this.get('/transaction/history', options);
  }

  static async sendPayment(data: {
    toAddress: string;
    amount: number;
    currency: string;
    memo?: string;
  }, options: { silent?: boolean } = {}) {
    return this.post('/transaction/send', data, options);
  }

  static async exportMainWallet(options: { silent?: boolean } = {}) {
    console.log('💰 Calling exportMainWallet API...');
    try {
      const result = await this.get('/wallets/export-main', options);
      console.log('✅ Wallet export success:', result);
      return result;
    } catch (error) {
      if (error instanceof AuthenticationError && options.silent) {
        console.log('🔒 Wallet export skipped - not authenticated');
        return { success: false, message: 'Authentication required', data: null };
      }
      console.error('❌ Wallet export error:', error);
      throw error;
    }
  }

  // Transfer to username (RECOMMENDED for your app)
  static async transferToUser(data: {
    recipient: string;        // username của người nhận
    amount: number;           // số lượng transfer
    isNative: boolean;        // true = ETH, false = token
    tokenAddress?: string;    // địa chỉ token (nếu không phải native)
    chainId?: number;         // default 8453
  }) {
    console.log('💸 Calling transferToUser API...', data);
    try {
      const result = await this.post('/transfers/transfer-to-user', data);
      console.log('✅ Transfer success:', result);
      return result;
    } catch (error) {
      console.error('❌ Transfer error:', error);
      throw error;
    }
  }

  // MultiSend to multiple addresses (for batch operations)
  static async multiSendTokens(data: {
    wallets: string[];        // array địa chỉ wallet nhận
    amount: number;           // số lượng cho mỗi địa chỉ
    isNative: boolean;        // true = ETH, false = token
    tokenAddress?: string;    // địa chỉ token (nếu không phải native)
    chainId?: number;         // default 8453
  }) {
    console.log('🚀 Calling multiSendTokens API...', data);
    try {
      const result = await this.post('/wallets/deposit', data);
      console.log('✅ MultiSend success:', result);
      return result;
    } catch (error) {
      console.error('❌ MultiSend error:', error);
      throw error;
    }
  }

  // Get list of available tokens
  static async getTokens(params: {
    page?: number;
    size?: number;
    desc?: boolean;
  } = {}, options: { silent?: boolean } = {}) {
    const { page = 1, size = 10, desc = false } = params;
    console.log('🪙 Calling getTokens API...', params);
    try {
      const result = await this.get(`/tokens?page=${page}&size=${size}&desc=${desc}`, options);
      console.log('✅ Tokens list success:', result);
      return result;
    } catch (error) {
      if (error instanceof AuthenticationError && options.silent) {
        console.log('🔒 Tokens list skipped - not authenticated');
        return [];
      }
      console.error('❌ Tokens list error:', error);
      throw error;
    }
  }

  // Get transaction history with filters
  static async getTransactions(params: {
    page?: number;
    size?: number;
    type?: string;
    status?: string;
    fromUsername?: string;
    toUsername?: string;
  } = {
    page: 1,
    size: 10,
    type: '',
    status: '',
    fromUsername: '',
    toUsername: '',
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    console.log('📜 Calling getTransactions API...', queryParams.toString());
    try {
      const result = await this.get(`/transactions?${queryParams}`);
      console.log('✅ Transactions list success:', result);
      return result;
    } catch (error) {
      console.error('❌ Transactions list error:', error);
      throw error;
    }
  }

  // Get single transaction by ID
  static async getTransactionById(id: string) {
    console.log('📋 Calling getTransactionById API...', id);
    try {
      const result = await this.get(`/transactions/${id}`);
      console.log('✅ Transaction detail success:', result);
      return result;
    } catch (error) {
      console.error('❌ Transaction detail error:', error);
      throw error;
    }
  }
  static async transfer(data: {
    recipient: string;
    address: string;
    chainId: number;
    isNative: boolean;
    tokenAddress: string;
    amount: number;
  }) {
    console.log('🚀 Calling transfer API...', data);
    try {
      const result = await this.post('/wallets/transfer', data);
      console.log('✅ Transfer success:', result);
      return result;
    } catch (error) {
      console.error('❌ Transfer error:', error);
      throw error;
    }
  }

  // Transfer NFT using the correct API endpoint
  static async transferNft721(data: {
    recipient: string;          // username of the receiver
    address: string;            // sender's wallet address
    chainId: number;            // network chain id
    nftAddress: string;         // NFT contract address
    tokenId: number;            // token id (as number, not string)
  }) {
    console.log('🖼️ Calling transferNft721 API...', data);
    try {
      const result = await this.post('/wallets/transfer-nft-721', data);
      console.log('✅ NFT transfer success:', result);
      return result;
    } catch (error) {
      console.error('❌ NFT transfer error:', error);
      throw error;
    }
  }
}

export default ApiClient;