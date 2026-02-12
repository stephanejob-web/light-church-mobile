/**
 * Onboarding Screen
 * Single welcome screen inspired by lightchurch.fr
 * Dark theme with live stats counters
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { fetchStats } from '@/services/mapService';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

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
  return n.toLocaleString('fr-FR');
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
          setEvents((data.stats.ongoingEvents || 0) + (data.stats.upcomingEvents || 0));
        }
      })
      .catch(() => {
        setChurches(10000);
        setEvents(39878);
      });

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStart = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Light Church</Text>

        {/* Headline */}
        <Text style={styles.headline}>
          L'information chrétienne{'\n'}enfin centralisée
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Découvrez les églises et événements autour de vous sur une plateforme
          unique, moderne et ultra-rapide. Plus de données éparpillées, tout est ici.
        </Text>

        {/* Live Counters */}
        <View style={styles.countersRow}>
          {/* Churches counter */}
          <View style={styles.counterCard}>
            <View style={styles.counterTop}>
              <Text style={styles.counterValue}>
                {formatNumber(displayChurches)}
              </Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.counterLabel}>Églises indexées</Text>
          </View>

          {/* Events counter */}
          <View style={styles.counterCard}>
            <View style={styles.counterTop}>
              <Text style={styles.counterValue}>
                {formatNumber(displayEvents)}
              </Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.counterLabel}>Événements actifs</Text>
          </View>
        </View>
      </Animated.View>

      {/* CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Commencer</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 56,
    height: 56,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 40,
  },
  countersRow: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
  },
  counterCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  counterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  counterLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
