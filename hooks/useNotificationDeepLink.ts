/**
 * Handle deep links from push notifications
 * Opens the correct screen when a notification is tapped
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

type NotificationsModule = typeof import('expo-notifications') | null;

let Notifications: NotificationsModule = null;
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch {
    // Not available
  }
}

export function useNotificationDeepLink() {
  const router = useRouter();

  useEffect(() => {
    if (!Notifications) return;

    // Handle notification tap when app is in background/killed
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.type === 'event' && data?.id) {
          router.push(`/event/${data.id}`);
        } else if (data?.type === 'church' && data?.id) {
          router.push(`/church/${data.id}`);
        }
      }
    );

    return () => {
      responseSubscription.remove();
    };
  }, [router]);
}
