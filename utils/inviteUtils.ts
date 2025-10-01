import { Share, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export interface InviteUtils {
  generateInviteLink: (username: string, userId: string) => string;
  generateInviteMessage: (inviteLink: string, userName?: string) => string;
  shareInvite: (inviteLink: string, userName?: string) => Promise<void>;
  copyInviteLink: (inviteLink: string) => Promise<void>;
}

export const inviteUtils: InviteUtils = {
  generateInviteLink: (username: string, userId: string) => {
    return `https://whampay.app/invite/${username}?ref=${userId}`;
  },

  generateInviteMessage: (inviteLink: string, userName?: string) => {
    const greeting = userName ? `${userName} invited you to` : 'Join me on';
    
    return `🚀 ${greeting} WhamPay! 

Send money instantly with zero fees using crypto. 

Download the app and use this invite link to get started:
${inviteLink}

✨ Benefits:
• Instant crypto payments
• Zero transaction fees  
• Secure blockchain technology
• Send money worldwide

#WhamPay #CryptoPayments #Web3`;
  },

  shareInvite: async (inviteLink: string, userName?: string) => {
    try {
      const message = inviteUtils.generateInviteMessage(inviteLink, userName);
      
      await Share.share({
        message,
        url: inviteLink,
        title: 'Join me on WhamPay!',
      });
    } catch (error) {
      console.error('Error sharing invite:', error);
      Alert.alert('Error', 'Failed to share invite link');
    }
  },

  copyInviteLink: async (inviteLink: string) => {
    try {
      await Clipboard.setStringAsync(inviteLink);
      Alert.alert('Copied!', 'Invite link copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy invite link');
    }
  },
};

export default inviteUtils;