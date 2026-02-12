/**
 * React Query Provider with React Native setup
 * Includes offline persistence for instant app launch
 */

import React, { useEffect } from 'react';
import { AppState, Platform, AppStateStatus } from 'react-native';
import { onlineManager, focusManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as Network from 'expo-network';
import { queryClient } from '@/lib/queryClient';
import { asyncStoragePersister } from '@/lib/queryPersister';

// Configure onlineManager for React Native
onlineManager.setEventListener((setOnline) => {
  const subscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected);
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
});

// Configure focusManager for React Native
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => {
    // Setup AppState listener for focus management
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
