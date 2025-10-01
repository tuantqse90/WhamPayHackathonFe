import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://172.16.184.16:3000/v1';

export class ApiClient {
  private static async getAuthHeaders() {
    const token = await AsyncStorage.getItem('whampay_access_token');
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

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  static async post(endpoint: string, data: any) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async put(endpoint: string, data: any) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async delete(endpoint: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
}

export default ApiClient;