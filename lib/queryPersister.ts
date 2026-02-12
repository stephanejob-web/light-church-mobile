/**
 * React Query AsyncStorage Persister
 * Persists query cache to disk for instant app launch
 */

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'LIGHT_CHURCH_QUERY_CACHE',
  // Only persist cache for 24 hours
  throttleTime: 1000,
});
