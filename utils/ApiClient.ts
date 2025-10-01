import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/api';

export class ApiClient {
  private static async getAuthHeaders() {
    const token = await AsyncStorage.getItem('whampay_access_token');
    console.log('🔑 Bearer Token:', token ? `Bearer ${token}` : 'No token found');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private static async handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshToken();
        throw new Error('Token expired, please retry');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  }

  private static async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('whampay_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      await AsyncStorage.multiSet([
        ['whampay_access_token', data.data.accessToken],
        ['whampay_refresh_token', data.data.refreshToken],
      ]);
    } catch (error) {
      // Clear tokens and redirect to login
      await AsyncStorage.multiRemove([
        'whampay_access_token',
        'whampay_refresh_token',
        'whampay_user',
      ]);
      throw error;
    }
  }

  static async get(endpoint: string) {
    const headers = await this.getAuthHeaders();
    console.log('📡 GET Request:', `${BACKEND_URL}${endpoint}`);
    console.log('📋 Headers:', headers);
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    console.log('📥 Response Status:', response.status);
    return this.handleResponse(response);
  }

  static async post(endpoint: string, data: any) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async put(endpoint: string, data: any) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async delete(endpoint: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  // Specific API methods
  static async getUserInfo() {
    return this.get('/auth/me');
  }

  static async getWalletBalance() {
    return this.get('/wallet/balance');
  }

  static async getTransactionHistory() {
    return this.get('/transaction/history');
  }

  static async sendPayment(data: {
    toAddress: string;
    amount: number;
    currency: string;
    memo?: string;
  }) {
    return this.post('/transaction/send', data);
  }

  static async exportMainWallet() {
    console.log('💰 Calling exportMainWallet API...');
    try {
      const result = await this.get('/wallets/export-main');
      console.log('✅ Wallet export success:', result);
      return result;
    } catch (error) {
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
  } = {}) {
    const { page = 1, size = 10, desc = false } = params;
    console.log('🪙 Calling getTokens API...', params);
    try {
      const result = await this.get(`/tokens?page=${page}&size=${size}&desc=${desc}`);
      console.log('✅ Tokens list success:', result);
      return result;
    } catch (error) {
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
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    console.log('📜 Calling getTransactions API...', params);
    try {
      const result = await this.get(`/transactions?${queryParams.toString()}`);
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
}

export default ApiClient;