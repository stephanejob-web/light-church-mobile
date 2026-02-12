import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui';
import { fetchStats } from '@/services/mapService';

const ONBOARDING_KEY = 'hasCompletedOnboarding';
const { width } = Dimensions.get('window');

/** Animate a number from 0 → target over ~1.2s */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!target || target <= 0) return;

    let current = 0;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const next = Math.round(eased * target);

      if (next !== current) {
        current = next;
        setValue(next);
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

/** Format large numbers: 10000 → "10 000" */
function formatNumber(n: number): string {
  if (!n || isNaN(n)) return '0';
  return n.toLocaleString('fr-FR').replace(/\s/g, ' ');
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Stats from API
  const [churches, setChurches] = useState(0);
  const [events, setEvents] = useState(0);

  // Fade-in animation
  const [fadeAnim] = useState(() => new Animated.Value(0));

  // Animated counter values
  const displayChurches = useCountUp(churches);
  const displayEvents = useCountUp(events);

  useEffect(() => {
    // Fetch live stats
    fetchStats()
      .then(data => {
        if (data.success && data.stats) {
          setChurches(data.stats.churches || 0);
          setEvents((data.stats.ongoing_events || 0) + (data.stats.upcoming_events || 0));
        }
      })
      .catch(() => {
        setChurches(10000);
        setEvents(39878);
      });

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStart = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  const handleDiscoverMap = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#020617']}
        style={styles.background}
      />

      <Animated.View style={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom, opacity: fadeAnim }]}>
        <View style={styles.headerSection}>
          <Text style={styles.titleWhite}>L'information chrétienne</Text>
          <Text style={styles.titleBlue}>enfin centralisée.</Text>

          <Text style={styles.subtitle}>
            Découvrez les églises et événements autour de vous sur une plateforme unique, moderne et ultra-rapide. Plus de données éparpillées, tout est ici.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Ionicons name="map-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Lancer l'expérience</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsSection}>
          {/* Churches Stat */}
          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{formatNumber(displayChurches)}</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.statLabel}>ÉGLISES INDEXÉES</Text>
          </View>

          {/* Events Stat */}
          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{formatNumber(displayEvents)}</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.statLabel}>ÉVÉNEMENTS ACTIFS</Text>
          </View>
        </View>
      </Animated.View >
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40, // Fixed margin to prevent pushing stats too far
  },
  titleWhite: {
    fontSize: 28, // Slightly smaller for better fit
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
  },
  titleBlue: {
    fontSize: 28, // Slightly smaller
    fontWeight: '800',
    color: '#3B82F6',
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 320,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Use space-between for better edge alignment
    width: '100%',
    paddingHorizontal: 8,
    paddingBottom: 80, // Massive padding to lift from bottom
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28, // Slightly smaller to ensure fit
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  liveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EF4444',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
