/**
 * Skeleton loading placeholder
 * Animated shimmer effect for loading states
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, type ViewStyle } from 'react-native';

interface SkeletonProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

/** Skeleton for a detail page (church or event) */
export function DetailSkeleton() {
  return (
    <View style={styles.detailContainer}>
      <Skeleton width="100%" height={200} borderRadius={0} />
      <View style={styles.detailContent}>
        <Skeleton width="70%" height={24} />
        <Skeleton width="50%" height={16} style={{ marginTop: 12 }} />
        <Skeleton width="100%" height={80} style={{ marginTop: 20 }} />
        <Skeleton width="100%" height={44} borderRadius={12} style={{ marginTop: 20 }} />
        <Skeleton width="100%" height={120} style={{ marginTop: 20 }} />
      </View>
    </View>
  );
}

/** Skeleton for a list of cards */
export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.cardSkeleton}>
          <Skeleton width={56} height={56} borderRadius={12} />
          <View style={styles.cardText}>
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
            <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E8EAED',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  detailContent: {
    padding: 16,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  cardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardText: {
    flex: 1,
  },
});
