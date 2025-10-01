import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface SwipeNavigationProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export default function SwipeNavigation({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 100 
}: SwipeNavigationProps) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20]) // Require more horizontal movement to activate (reduced sensitivity)
    .failOffsetY([-30, 30]) // Allow more vertical scroll before failing gesture
    .onBegin(() => {
      translateX.value = 0;
      console.log('🎯 Gesture began');
    })
    .onUpdate((event) => {
      // Only translate if horizontal movement is significant
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        translateX.value = event.translationX * 0.3;
        console.log('👆 Gesture update:', event.translationX);
      }
    })
    .onEnd((event) => {
      console.log('✋ Gesture ended. Translation:', event.translationX);
      // Reset position
      translateX.value = withSpring(0);
      
      // Check swipe direction and threshold
      if (Math.abs(event.translationX) > threshold && Math.abs(event.translationX) > Math.abs(event.translationY)) {
        if (event.translationX > 0 && onSwipeRight) {
          console.log('➡️ Swipe RIGHT detected');
          runOnJS(onSwipeRight)();
        } else if (event.translationX < 0 && onSwipeLeft) {
          console.log('⬅️ Swipe LEFT detected');
          runOnJS(onSwipeLeft)();
        }
      } else {
        console.log('❌ Swipe threshold not met:', event.translationX);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
