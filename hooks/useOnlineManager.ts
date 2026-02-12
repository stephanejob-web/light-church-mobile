/**
 * Hook to track online/offline status via React Query's onlineManager
 */

import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

function subscribe(callback: () => void) {
  return onlineManager.subscribe(callback);
}

function getSnapshot() {
  return onlineManager.isOnline();
}

export function useOnlineManager(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
