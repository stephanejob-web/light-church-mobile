/**
 * Offline Banner
 * Shows a persistent banner when the device has no internet connection
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { useOnlineManager } from '@/hooks/useOnlineManager';
import { Box, Text } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

export function OfflineBanner() {
  const isOnline = useOnlineManager();

  if (isOnline) return null;

  return (
    <Box style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
      <Text style={styles.text}>Vous êtes hors ligne</Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#5F6368',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});
