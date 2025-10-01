import React from 'react';
import { StyleSheet, View } from 'react-native';

interface QRIconProps {
  size?: number;
  color?: string;
  activeColor?: string;
  isActive?: boolean;
}

export function QRIcon({ size = 16, color = '#4A4A4A', activeColor = '#32CD32', isActive = false }: QRIconProps) {
  const iconColor = isActive ? activeColor : color;
  const iconSize = size;
  const squareSize = iconSize / 4;
  
  return (
    <View style={[styles.container, { width: iconSize, height: iconSize }]}>
      {/* Main QR pattern with better design */}
      <View style={styles.qrPattern}>
        {/* Top-left large square */}
        <View style={[styles.square, styles.topLeft, { 
          width: squareSize * 2.2, 
          height: squareSize * 2.2, 
          backgroundColor: iconColor,
          borderRadius: 2
        }]} />
        
        {/* Top-right square */}
        <View style={[styles.square, styles.topRight, { 
          width: squareSize * 1.2, 
          height: squareSize * 1.2, 
          backgroundColor: iconColor,
          borderRadius: 1
        }]} />
        
        {/* Bottom-left square */}
        <View style={[styles.square, styles.bottomLeft, { 
          width: squareSize * 1.2, 
          height: squareSize * 1.2, 
          backgroundColor: iconColor,
          borderRadius: 1
        }]} />
        
        {/* Bottom-right square */}
        <View style={[styles.square, styles.bottomRight, { 
          width: squareSize * 1.2, 
          height: squareSize * 1.2, 
          backgroundColor: iconColor,
          borderRadius: 1
        }]} />
        
        {/* Small center square */}
        <View style={[styles.square, styles.centerSquare, { 
          width: squareSize * 0.8, 
          height: squareSize * 0.8, 
          backgroundColor: iconColor,
          borderRadius: 1
        }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPattern: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  square: {
    position: 'absolute',
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 2,
    right: 2,
  },
  bottomLeft: {
    bottom: 2,
    left: 2,
  },
  bottomRight: {
    bottom: 2,
    right: 2,
  },
  centerSquare: {
    top: '50%',
    left: '50%',
    transform: [{ translateX: -2 }, { translateY: -2 }],
  },
});
