import Avatar from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PolkadotMember {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  description: string;
}

enum SwipeDirection {
  None = 'none',
  Left = 'left',
  Right = 'right',
  Up = 'up',
}

const polkadotMembers: PolkadotMember[] = [
  {
    id: '1',
    name: 'Gavin Wood',
    username: '@gavofyork',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'Founder of Polkadot',
    description: 'Co-founder of Ethereum and creator of Polkadot',
  },
  {
    id: '2',
    name: 'Robert Habermeier',
    username: '@rphmeier',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'Co-founder of Polkadot',
    description: 'Core developer and co-founder of Polkadot',
  },
  {
    id: '3',
    name: 'Peter Czaban',
    username: '@peterczaban',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'Technology Director',
    description: 'Technology Director at Web3 Foundation',
  },
  {
    id: '4', 
    name: 'Jutta Steiner',
    username: '@juttasteiner',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'CEO of Parity',
    description: 'CEO of Parity Technologies',
  },
  {
    id: '5',
    name: 'Björn Wagner',
    username: '@bjornwgnr',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    role: 'Core Developer',
    description: 'Core developer at Parity Technologies',
  },
  {
    id: '6',
    name: 'Shawn Tabrizi',
    username: '@shawntabrizi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'Developer Advocate',
    description: 'Developer Advocate at Parity Technologies',
  },
  {
    id: '7',
    name: 'Bruno Skvorc',
    username: '@bitfalls',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'Technical Writer',
    description: 'Technical writer and blockchain educator',
  },
  {
    id: '8',
    name: 'Bill Laboon',
    username: '@bill_laboon',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'Education Lead',
    description: 'Education Lead at Web3 Foundation',
  },
];

export default function RecognizerView() {
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [votedMembers, setVotedMembers] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(SwipeDirection.None);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  
  const translateX = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  const rotateZ = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const currentMember = polkadotMembers[currentMemberIndex];
  const progress = currentMemberIndex / polkadotMembers.length;

  const nextMember = useCallback(() => {
    if (currentMemberIndex < polkadotMembers.length - 1) {
      setCurrentMemberIndex(prev => prev + 1);
      setTimeRemaining(60);
    } else {
      setShowResult(true);
    }
  }, [currentMemberIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          nextMember();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMemberIndex, nextMember]);

  const resetAnimations = () => {
    translateX.setValue(0);
    translateY.setValue(0);
    rotateZ.setValue(0);
    scale.setValue(1);
  };

  const animateSwipe = (direction: 'left' | 'right' | 'up', callback: () => void) => {
    let toX = 0, toY = 0;
    
    switch (direction) {
      case 'left':
        toX = -screenWidth;
        break;
      case 'right':
        toX = screenWidth;
        break;
      case 'up':
        toY = -screenHeight;
        break;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: toX,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: toY,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetAnimations();
      callback();
    });
  };

  const voteYes = () => {
    setVotedMembers(prev => new Set([...prev, currentMemberIndex]));
    nextMember();
  };

  const voteNo = () => {
    nextMember();
  };

  const resetGame = () => {
    setCurrentMemberIndex(0);
    setTimeRemaining(60);
    setVotedMembers(new Set());
    setShowResult(false);
  };

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      
      setShowSwipeIndicator(false);
      setSwipeDirection(SwipeDirection.None);

      if (translationX < -100) {
        animateSwipe('left', voteNo);
      } else if (translationX > 100) {
        animateSwipe('right', voteYes);
      } else if (translationY < -100) {
        animateSwipe('up', nextMember);
      } else {
        // Return to center
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else if (event.nativeEvent.state === State.ACTIVE) {
      const { translationX, translationY } = event.nativeEvent;
      
      // Update rotation based on horizontal movement
      rotateZ.setValue(translationX * 0.1);
      scale.setValue(0.95);
      
      // Show swipe indicators
      if (translationX > 50) {
        setSwipeDirection(SwipeDirection.Right);
        setShowSwipeIndicator(true);
      } else if (translationX < -50) {
        setSwipeDirection(SwipeDirection.Left);
        setShowSwipeIndicator(true);
      } else if (translationY < -50) {
        setSwipeDirection(SwipeDirection.Up);
        setShowSwipeIndicator(true);
      } else {
        setSwipeDirection(SwipeDirection.None);
        setShowSwipeIndicator(false);
      }
    }
  };

  if (!currentMember && !showResult) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      <LinearGradient
        colors={isDark ? ['#000', '#111'] : ['#F5F9F5', '#EDF5ED']}
        style={styles.background}
      >
        {!showResult ? (
          <View style={styles.gameContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: isDark ? '#FFF' : '#333' }]}>
                  The Recognizer
                </Text>
                <Text style={[styles.subtitle, { color: isDark ? '#AAA' : '#666' }]}>
                  Swipe right if you recognize, left if you don&rsquo;t
                </Text>
              </View>
              
              <View style={styles.timerBadge}>
                <IconSymbol name="clock.fill" size={12} color="#007B50" />
                <Text style={styles.timerText}>{timeRemaining}s</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressText, { color: '#007B50' }]}>
                  {currentMemberIndex + 1} of {polkadotMembers.length}
                </Text>
                <Text style={[styles.progressText, { color: '#007B50' }]}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#007B50', '#005A3C']}
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>

            {/* Card */}
            <View style={styles.cardContainer}>
              <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
              >
                <Animated.View
                  style={[
                    styles.card,
                    {
                      transform: [
                        { translateX },
                        { translateY },
                        { rotateZ: rotateZ.interpolate({
                          inputRange: [-100, 100],
                          outputRange: ['-10deg', '10deg'],
                        }) },
                        { scale },
                      ],
                    },
                  ]}
                >
                  <Avatar name={currentMember.name} size={screenWidth - 40} />
                  
                  {/* Gradient Overlay */}
                  <LinearGradient
                    colors={['transparent', 'transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradientOverlay}
                  />
                  
                  {/* Member Info */}
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{currentMember.name}</Text>
                    <Text style={styles.memberRole}>{currentMember.role}</Text>
                    <Text style={styles.memberUsername}>{currentMember.username}</Text>
                  </View>
                  
                  {/* Score Badge */}
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreValue}>{Math.floor(Math.random() * 15) + 85}</Text>
                    <Text style={styles.scoreLabel}>Score</Text>
                  </View>
                  
                  {/* Swipe Indicators */}
                  {showSwipeIndicator && (
                    <View style={styles.swipeIndicatorContainer}>
                      {swipeDirection === SwipeDirection.Right && (
                        <View style={[styles.swipeIndicator, styles.swipeRight]}>
                          <IconSymbol name="heart.fill" size={40} color="#4CAF50" />
                          <Text style={[styles.swipeText, { color: '#4CAF50' }]}>RECOGNIZE</Text>
                        </View>
                      )}
                      {swipeDirection === SwipeDirection.Left && (
                        <View style={[styles.swipeIndicator, styles.swipeLeft]}>
                          <IconSymbol name="xmark" size={40} color="#F44336" />
                          <Text style={[styles.swipeText, { color: '#F44336' }]}>DON&rsquo;T KNOW</Text>
                        </View>
                      )}
                      {swipeDirection === SwipeDirection.Up && (
                        <View style={[styles.swipeIndicator, styles.swipeUp]}>
                          <IconSymbol name="arrow.up" size={40} color="#2196F3" />
                          <Text style={[styles.swipeText, { color: '#2196F3' }]}>NEXT</Text>
                        </View>
                      )}
                    </View>
                  )}
                </Animated.View>
              </PanGestureHandler>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.noButton]}
                onPress={() => animateSwipe('left', voteNo)}
              >
                <IconSymbol name="xmark" size={24} color="#F44336" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.nextButton]}
                onPress={() => animateSwipe('up', nextMember)}
              >
                <IconSymbol name="arrow.up" size={24} color="#2196F3" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.yesButton]}
                onPress={() => animateSwipe('right', voteYes)}
              >
                <IconSymbol name="heart.fill" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Results Screen */
          <View style={styles.resultsContainer}>
            <View style={styles.successIcon}>
              <LinearGradient
                colors={['#007B50', '#005A3C']}
                style={styles.successIconGradient}
              >
                <IconSymbol name="checkmark" size={40} color="white" />
              </LinearGradient>
            </View>
            
            <Text style={[styles.resultsTitle, { color: isDark ? '#FFF' : '#333' }]}>
              Recognition Complete!
            </Text>
            
            <Text style={[styles.resultsSubtitle, { color: isDark ? '#AAA' : '#666' }]}>
              You recognized {votedMembers.size} out of {polkadotMembers.length} members
            </Text>
            
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreLabel2, { color: isDark ? '#AAA' : '#666' }]}>Score:</Text>
              <Text style={[styles.finalScore, { color: '#007B50' }]}>
                {Math.round((votedMembers.size / polkadotMembers.length) * 100)}%
              </Text>
            </View>
            
            <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
              <LinearGradient
                colors={['#007B50', '#005A3C']}
                style={styles.playAgainGradient}
              >
                <Text style={styles.playAgainText}>Play Again</Text>
                <IconSymbol name="arrow.clockwise" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 123, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007B50',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 160,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    borderRadius: 160,
  },
  memberInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  memberUsername: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  scoreBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 123, 80, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  swipeIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 160,
  },
  swipeIndicator: {
    alignItems: 'center',
    gap: 8,
  },
  swipeRight: {
    alignSelf: 'flex-end',
    marginRight: 30,
  },
  swipeLeft: {
    alignSelf: 'flex-start',
    marginLeft: 30,
  },
  swipeUp: {
    alignSelf: 'center',
    marginTop: -80,
  },
  swipeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 50,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  noButton: {
    shadowColor: '#F44336',
  },
  nextButton: {
    shadowColor: '#2196F3',
  },
  yesButton: {
    shadowColor: '#4CAF50',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 30,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#007B50',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 123, 80, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  scoreLabel2: {
    fontSize: 14,
  },
  finalScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playAgainButton: {
    width: 280,
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#007B50',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  playAgainGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  playAgainText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});