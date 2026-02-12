/**
 * Onboarding Screen
 * Clean white theme — Apple style
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
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
  return n.toLocaleString('fr-FR').replace(/\s/g, ' ');
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [churches, setChurches] = useState(0);
  const [events, setEvents] = useState(0);
  const [fadeAnim] = useState(() => new Animated.Value(0));

  const displayChurches = useCountUp(churches);
  const displayEvents = useCountUp(events);

  useEffect(() => {
    fetchStats()
      .then(data => {
        if (data.success && data.stats) {
          setChurches(data.stats.churches || 0);
          const s = data.stats as Record<string, number>;
          setEvents(s.events || (s.ongoingEvents || 0) + (s.upcomingEvents || 0) || 0);
        }
      })
      .catch(() => {
        setChurches(10000);
        setEvents(39878);
      });

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

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo */}
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>
          {"L'information chrétienne\n"}
          <Text style={styles.titleAccent}>enfin centralisée.</Text>
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Découvrez les églises et événements autour de vous sur une plateforme unique, moderne et ultra-rapide. Plus de données éparpillées, tout est ici.
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <View style={styles.statValueRow}>
              <Text style={styles.statNumber}>{formatNumber(displayChurches)}</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.statUnit}>Églises indexées</Text>
          </View>

          <View style={styles.statSeparator} />

          <View style={styles.statBlock}>
            <View style={styles.statValueRow}>
              <Text style={styles.statNumber}>{formatNumber(displayEvents)}</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.statUnit}>Événements actifs</Text>
          </View>
        </View>
      </Animated.View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleStart} activeOpacity={0.8}>
          <Ionicons name="compass-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Commencer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 36,
  },
  titleAccent: {
    color: '#4285F4',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 320,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 20,
  },
  statBlock: {
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    fontVariant: ['tabular-nums'],
  },
  liveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#22C55E',
  },
  liveText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#22C55E',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
  },
  statSeparator: {
    width: 1,
    height: 36,
    backgroundColor: '#D1D1D6',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: '#4285F4',
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
