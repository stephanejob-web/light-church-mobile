import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@shopify/restyle';
import 'react-native-reanimated';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAxiosInterceptor } from '@/hooks/useAxiosInterceptor';
import { useNotificationDeepLink } from '@/hooks/useNotificationDeepLink';
import { QueryProvider } from '@/contexts/QueryProvider';
import { TimeProvider } from '@/contexts/TimeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/OfflineBanner';
import theme from '@/theme/theme';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Configure axios interceptors with toast context
  useAxiosInterceptor();

  // Handle push notification deep links
  useNotificationDeepLink();

  // Redirect to onboarding on first launch
  useEffect(() => {
    const timer = setTimeout(() => {
      AsyncStorage.getItem(ONBOARDING_KEY).then(value => {
        if (value !== 'true') {
          router.replace('/onboarding');
        }
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerTintColor: '#4285F4', // Google Blue for back arrow
          }}
        >
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              animation: 'none',
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
        <OfflineBanner />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryProvider>
          <TimeProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </TimeProvider>
        </QueryProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
