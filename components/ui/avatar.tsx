import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export default function Avatar({ 
  name, 
  size = 50, 
  backgroundColor, 
  textColor = 'white' 
}: AvatarProps) {
  const getInitials = (fullName: string): string => {
    if (!fullName || typeof fullName !== 'string') return '?';
    
    const words = fullName.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    // Lấy chữ cái đầu của từ đầu và từ cuối
    const firstInitial = words[0].charAt(0).toUpperCase();
    const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
    
    return firstInitial + lastInitial;
  };

  // Tạo màu nền dựa trên tên (hash-based color)
  const generateBackgroundColor = (name: string): string => {
    if (backgroundColor) return backgroundColor;
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#F4D03F',
      '#AED6F1', '#A9DFBF', '#F9E79F', '#D7BDE2', '#A3E4D7'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials(name);
  const bgColor = generateBackgroundColor(name);
  const fontSize = Math.round(size * 0.4);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          {
            fontSize,
            color: textColor,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});