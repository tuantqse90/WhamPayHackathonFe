import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      'whampay_access_token',
      'whampay_refresh_token', 
      'whampay_user',
      'twitter_token',
      'onboarding_seen'
    ]);
    console.log('✅ All storage cleared');
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
  }
};

export const logStorageContents = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('📦 All storage keys:', keys);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`📋 ${key}:`, value ? 'EXISTS' : 'NULL');
    }
  } catch (error) {
    console.error('❌ Error reading storage:', error);
  }
};