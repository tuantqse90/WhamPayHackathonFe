import { ApiClient } from './ApiClient';

export interface FriendshipDto {
  id: string;
  requester: {
    id: string;
    username: string;
    name: string;
    address: string;
  };
  addressee: {
    id: string;
    username: string;
    name: string;
    address: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummaryDto {
  id: string;
  username: string;
  name: string;
  address: string;
  status?: string;
  role?: string;
}

export interface BasePaginationResultDto<T> {
  data: T;
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface SendFriendRequestDto {
  username: string;
  message?: string;
}

export interface RespondToFriendRequestDto {
  friendshipId: string;
  status: 'accepted' | 'rejected';
}

export interface ListFriendsDto {
  status?: 'pending' | 'accepted' | 'rejected' | 'blocked';
  search?: string;
  page?: number;
  size?: number;
}

class FriendshipApiClient {
  // Get friends list
  static async getFriends(params: ListFriendsDto = {}, options: { silent?: boolean } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    console.log('👥 Calling getFriends API...', params);
    try {
      const result = await ApiClient.get(`/friendship?${queryParams}`, options);
      console.log('✅ Friends list success:', result);
      return result as BasePaginationResultDto<FriendshipDto[]>;
    } catch (error) {
      console.error('❌ Friends list error:', error);
      throw error;
    }
  }

  // Send friend request
  static async sendFriendRequest(data: SendFriendRequestDto, options: { silent?: boolean } = {}) {
    console.log('📤 Calling sendFriendRequest API...', data);
    try {
      const result = await ApiClient.post('/friendship/request', data, options);
      console.log('✅ Friend request sent:', result);
      return result as FriendshipDto;
    } catch (error) {
      console.error('❌ Send friend request error:', error);
      throw error;
    }
  }

  // Respond to friend request (accept/reject)
  static async respondToFriendRequest(data: RespondToFriendRequestDto, options: { silent?: boolean } = {}) {
    console.log('📬 Calling respondToFriendRequest API...', data);
    try {
      const result = await ApiClient.put('/friendship/respond', data, options);
      console.log('✅ Friend request response:', result);
      return result as FriendshipDto;
    } catch (error) {
      console.error('❌ Respond to friend request error:', error);
      throw error;
    }
  }

  // Get pending friend requests
  static async getPendingRequests(page = 1, size = 20, options: { silent?: boolean } = {}) {
    console.log('⏳ Calling getPendingRequests API...', { page, size });
    try {
      const result = await ApiClient.get(`/friendship/requests/pending?page=${page}&size=${size}`, options);
      console.log('✅ Pending requests success:', result);
      return result as BasePaginationResultDto<FriendshipDto[]>;
    } catch (error) {
      console.error('❌ Pending requests error:', error);
      throw error;
    }
  }

  // Remove friend
  static async removeFriend(username: string, options: { silent?: boolean } = {}) {
    console.log('🗑️ Calling removeFriend API...', username);
    try {
      const result = await ApiClient.delete(`/friendship/remove/${username}`, options);
      console.log('✅ Friend removed:', result);
      return result;
    } catch (error) {
      console.error('❌ Remove friend error:', error);
      throw error;
    }
  }

  // Get users not in friend list (for adding new friends)
  static async getUsersNotInFriendList(search = '', page = 1, size = 20, options: { silent?: boolean } = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(search && { search }),
    });
    
    console.log('🔍 Calling getUsersNotInFriendList API...', { search, page, size });
    try {
      const result = await ApiClient.get(`/friendship/not-friends?${queryParams}`, options);
      console.log('✅ Users not in friend list success:', result);
      return result as BasePaginationResultDto<UserSummaryDto[]>;
    } catch (error) {
      console.error('❌ Users not in friend list error:', error);
      throw error;
    }
  }

  // Get friendship status with a user
  static async getFriendshipStatus(username: string, options: { silent?: boolean } = {}) {
    console.log('📊 Calling getFriendshipStatus API...', username);
    try {
      const result = await ApiClient.get(`/friendship/status/${username}`, options);
      console.log('✅ Friendship status success:', result);
      return result as { status: string | null; friendship?: FriendshipDto };
    } catch (error) {
      console.error('❌ Friendship status error:', error);
      throw error;
    }
  }
}

export { FriendshipApiClient };
export default FriendshipApiClient;