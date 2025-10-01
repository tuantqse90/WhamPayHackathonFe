import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Global QR Pay',
    subtitle: 'Smart QR Code Payments',
    description:
      'Connect with the most advanced QR Code payment system worldwide. Fast, secure and convenient payments anytime, anywhere.',
    icon: 'qrcode',
    gradient: ['#00CCFF', '#007B50'],
  },
  {
    title: 'Micro Payment Social',
    subtitle: 'Social Micro Payments',
    description:
      'Micro payment system integrated with social networks. Share, interact and pay all in one unified platform.',
    icon: 'person.2.fill',
    gradient: ['#007B50', '#0099CC'],
  },
  {
    title: 'Social Trading RWA Platform',
    subtitle: 'Social Real World Asset Trading',
    description:
      'Real World Asset (RWA) trading platform with social features. Smart investing, share experiences and optimize profits.',
    icon: 'chart.line.uptrend.xyaxis',
    gradient: ['#0099CC', '#00CCFF'],
  },
];

export default function OnboardingScreen({ onFinish }: { onFinish?: () => void }) {
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (page < slides.length - 1) {
      setPage(page + 1);
      scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
    } else {
      onFinish?.();
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
      scrollRef.current?.scrollTo({ x: width * (page - 1), animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[slides[page].gradient[0], '#1B263B', slides[page].gradient[1]]}
        style={StyleSheet.absoluteFill}
      />
      {/* Skip */}
      <View style={[styles.skipRow, { top: insets.top + 10 }]}> 
        <TouchableOpacity onPress={onFinish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {slides.map((slide, idx) => (
          <View key={slide.title} style={{ width, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <View style={styles.iconCircle}>
              <IconSymbol name={slide.icon as any} size={60} color={slide.gradient[0]} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>
      {/* Page Indicator */}
      <View style={styles.indicatorRow}>
        {slides.map((_, idx) => (
          <View
            key={idx}
            style={[styles.indicator, page === idx && styles.indicatorActive]}
          />
        ))}
      </View>
      {/* Navigation */}
      <View style={[styles.navRow, { marginBottom: insets.bottom + 30 }]}> 
        {page > 0 ? (
          <TouchableOpacity style={styles.navBtn} onPress={handlePrev}>
            <Text style={styles.navBtnText}>Previous</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 100 }} />}
        <TouchableOpacity style={styles.navBtn} onPress={handleNext}>
          <Text style={styles.navBtnText}>{page === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  skipRow: { position: 'absolute', right: 24, zIndex: 10 },
  skipText: { color: 'white', fontSize: 16, opacity: 0.8, fontWeight: '500' },
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
  iconText: { fontSize: 48, color: '#00CCFF' },
  title: { fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: 'white', opacity: 0.85, textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 15, color: 'white', opacity: 0.7, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  indicatorRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'white', opacity: 0.3, marginHorizontal: 6 },
  indicatorActive: { opacity: 1, width: 12, height: 12 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32 },
  navBtn: { backgroundColor: 'rgba(0,204,255,0.15)', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12 },
  navBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
