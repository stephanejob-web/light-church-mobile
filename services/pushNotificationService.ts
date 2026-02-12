/**
 * Push Notification Service
 * Gère les notifications push via Expo Notifications
 * Compatible avec Expo Go (mode dégradé) et Development Build
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import api from '@/lib/axios';
import Constants from 'expo-constants';

/**
 * Types for expo-notifications and expo-device modules
 * Loaded conditionally to support Expo Go
 */
type NotificationsModule = typeof import('expo-notifications') | null;
type DeviceModule = typeof import('expo-device') | null;

// Import conditionnel pour éviter l'erreur dans Expo Go
let Notifications: NotificationsModule = null;
let Device: DeviceModule = null;

// Détecter si on est dans Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Charger les modules seulement si pas dans Expo Go
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');

    // Configuration des notifications (seulement en dev build)
    if (Notifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  } catch (error) {
    console.warn('Push notifications not available in Expo Go');
  }
}

const DEVICE_ID_KEY = 'light_church_device_id';
const PUSH_TOKEN_KEY = 'light_church_push_token';

/**
 * Generate a cryptographically secure device ID
 */
async function generateDeviceId(): Promise<string> {
  const uuid = Crypto.randomUUID();
  return `${Platform.OS}-${uuid}`;
}

/**
 * Demande la permission pour les notifications push
 */
export async function requestPushPermissions(): Promise<boolean> {
  // Dans Expo Go, retourner false (notifications non disponibles)
  if (isExpoGo || !Notifications || !Device) {
    console.warn('Push notifications not available in Expo Go');
    return false;
  }

  if (!Device.isDevice) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  return true;
}

/**
 * Obtient le token push Expo et l'enregistre sur le serveur
 * Dans Expo Go, crée seulement un device_id sans notifications
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Dans Expo Go, juste créer un device_id
    if (isExpoGo || !Notifications) {
      console.warn('Expo Go detected: creating device_id without push notifications');
      return await getDeviceId();
    }

    // Vérifier les permissions
    const hasPermission = await requestPushPermissions();
    if (!hasPermission) {
      // Créer quand même un device_id pour tracker l'intérêt
      return await getDeviceId();
    }

    // Obtenir le token Expo
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'your-project-id',
    });
    const expoPushToken = tokenData.data;

    // Générer ou récupérer le device_id
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = await generateDeviceId();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }

    // Enregistrer sur le serveur
    await api.post('/public/push-tokens', {
      device_id: deviceId,
      push_token: expoPushToken,
      platform: Platform.OS,
    });

    // Sauvegarder le token localement (chiffré)
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, expoPushToken);

    return deviceId;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    // En cas d'erreur, au moins créer un device_id
    return await getDeviceId();
  }
}

/**
 * Récupère le device_id stocké de manière sécurisée
 * Si aucun device_id n'existe, en crée un avec crypto
 */
export async function getDeviceId(): Promise<string | null> {
  try {
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    // Si pas de device_id, en créer un sécurisé
    if (!deviceId) {
      deviceId = await generateDeviceId();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a accepté les notifications
 */
export async function hasNotificationPermission(): Promise<boolean> {
  if (isExpoGo || !Notifications) {
    return false;
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Could not check notification permission:', error);
    return false;
  }
}

/**
 * Configure le canal Android pour les notifications
 * Requis pour Android 8.0+
 */
export async function setupAndroidNotificationChannel() {
  if (isExpoGo || !Notifications) {
    return;
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4285F4',
        sound: 'default',
      });
    } catch (error) {
      console.warn('Could not setup Android notification channel:', error);
    }
  }
}
