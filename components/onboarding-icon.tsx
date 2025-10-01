import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface OnboardingIconProps {
  iconName: string;
  gradient: string[];
}

export function OnboardingIcon({ iconName, gradient }: OnboardingIconProps) {
  let symbolName: any = 'qrcode';
  
  if (iconName === 'qrcode') symbolName = 'qrcode';
  else if (iconName === 'person.2.fill') symbolName = 'person.2.fill';
  else if (iconName === 'chart.line.uptrend.xyaxis') symbolName = 'chart.line.uptrend.xyaxis';
  
  return (
    <View style={styles.iconCircle}>
      <IconSymbol name={symbolName} size={60} color={gradient[0]} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
});