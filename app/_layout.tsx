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
import { QueryProvider } from '@/contexts/QueryProvider';
import { TimeProvider } from '@/contexts/TimeContext';
import { ToastProvider } from '@/contexts/ToastContext';
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

  // DEV: always show onboarding — remove this for production
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding');
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
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <TimeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </TimeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
