import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function WhamCardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleBack = () => {
    router.back();
  };

  const handleGetCard = () => {
    // Handle get card action
    console.log('Get Wham Card');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#000' : '#F5F9F5' }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFF' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#333' }]}>
          Wham Card
        </Text>
        <TouchableOpacity style={styles.infoButton}>
          <View style={[styles.infoIcon, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]}>
            <IconSymbol name="info" size={16} color={isDark ? '#FFF' : '#333'} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Card Display */}
        <View style={styles.cardSection}>
            <LinearGradient
              colors={[Colors[colorScheme ?? 'light'].primary, Colors[colorScheme ?? 'light'].secondary, '#004030']}
              style={styles.mainCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
            {/* Card Background Pattern */}
            <View style={styles.cardPattern}>
              <View style={styles.patternCircle1} />
              <View style={styles.patternCircle2} />
              <View style={styles.patternCircle3} />
              <View style={styles.patternCircle4} />
              <View style={styles.patternCircle5} />
            </View>

            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardLogo}>
                <Text style={styles.cardLogoText}>W</Text>
              </View>
            </View>

            {/* Card Center - Add some premium elements */}
            <View style={styles.cardCenter}>
              <View style={styles.cardNumber}>
                <Text style={styles.cardNumberText}>•••• •••• •••• 1234</Text>
              </View>
              <View style={styles.cardHolder}>
                <Text style={styles.cardHolderText}>CARDHOLDER NAME</Text>
              </View>
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.cardBrand}>
                <Text style={styles.cardBrandText}>WHAM PAY</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={[styles.featuresTitle, { color: isDark ? '#FFF' : '#333' }]}>
            Spend your Wham Pay balance
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]}>
                <IconSymbol name="globe" size={24} color="#007B50" />
              </View>
              <Text style={[styles.featureText, { color: isDark ? '#FFF' : '#333' }]}>
                Use online and in stores globally
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]}>
                <IconSymbol name="apple.logo" size={24} color="#007B50" />
              </View>
              <Text style={[styles.featureText, { color: isDark ? '#FFF' : '#333' }]}>
                Add to Apple Pay
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]}>
                <IconSymbol name="checkmark.circle" size={24} color="#007B50" />
              </View>
              <Text style={[styles.featureText, { color: isDark ? '#FFF' : '#333' }]}>
                No monthly or per transaction fees
              </Text>
            </View>
          </View>
        </View>

        {/* Premium Card Section */}
        <View style={styles.premiumSection}>
          <LinearGradient
            colors={[Colors[colorScheme ?? 'light'].primary, Colors[colorScheme ?? 'light'].secondary]}
            style={styles.premiumBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.premiumContent}>
              <View style={styles.premiumText}>
                <Text style={styles.premiumTitle}>Premium Card</Text>
                <Text style={styles.premiumSubtitle}>
                  Apply for a virtual card first, then get the premium card.
                </Text>
              </View>
              
              <View style={styles.premiumCardPreview}>
                <LinearGradient
                  colors={['#00FF88', '#00CC66', '#00AA44']}
                  style={styles.previewCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.previewCardPattern}>
                    <View style={styles.previewPatternCircle1} />
                    <View style={styles.previewPatternCircle2} />
                  </View>
                  
                  <View style={styles.previewCardHeader}>
                    <View style={styles.previewCardLogo}>
                      <Text style={styles.previewCardLogoText}>W</Text>
                    </View>
                  </View>

                  <View style={styles.previewCardCenter}>
                    <IconSymbol name="bolt.fill" size={32} color="rgba(255, 255, 255, 0.8)" />
                    <IconSymbol name="bolt.fill" size={24} color="rgba(255, 255, 255, 0.6)" style={{ marginLeft: 8 }} />
                  </View>

                  <View style={styles.previewCardFooter}>
                    <Text style={styles.previewCardBrand}>WHAM PAY</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity onPress={handleGetCard} style={styles.ctaButton} activeOpacity={0.9}>
            <LinearGradient
              colors={[Colors[colorScheme ?? 'light'].primary, Colors[colorScheme ?? 'light'].secondary]}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaText}>GET WHAM CARD</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={[styles.ctaSubtext, { color: isDark ? '#AAA' : '#666' }]}>
            No fees or credit check
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 123, 80, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  cardSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  mainCard: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#007B50',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
  },
  patternCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  patternCircle3: {
    position: 'absolute',
    top: 60,
    right: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  patternCircle4: {
    position: 'absolute',
    top: 120,
    left: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  patternCircle5: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 'auto',
  },
  cardLogo: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardLogoText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 20,
  },
  cardNumber: {
    marginBottom: 16,
  },
  cardNumberText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardHolder: {
    marginBottom: 8,
  },
  cardHolderText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardBrand: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardBrandText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  featureList: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  premiumSection: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumBackground: {
    padding: 24,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  premiumCardPreview: {
    transform: [{ rotate: '15deg' }],
  },
  previewCard: {
    width: 120,
    height: 75,
    borderRadius: 12,
    padding: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  previewCardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  previewPatternCircle1: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewPatternCircle2: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  previewCardLogo: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCardLogoText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  previewCardCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  previewCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  previewCardBrand: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#007B50',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  ctaGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  ctaSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
