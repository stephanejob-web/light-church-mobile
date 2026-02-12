/**
 * Calendar Utility Functions
 * Add events to device calendar
 */

import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  url?: string;
}

/**
 * Request calendar permissions
 */
export async function requestCalendarPermissions(): Promise<boolean> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status === 'granted') {
      return true;
    } else {
      Alert.alert(
        'Permission refusée',
        'Veuillez autoriser l\'accès au calendrier dans les paramètres pour ajouter des événements.',
        [{ text: 'OK' }]
      );
      return false;
    }
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
}

/**
 * Get a writable calendar ID
 * Filters out read-only calendars (Birthdays, Holidays, subscribed, etc.)
 */
async function getWritableCalendarId(): Promise<string | null> {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

    // Only keep calendars where we can actually create events
    const writable = calendars.filter(cal => cal.allowsModifications);

    if (writable.length === 0) {
      // No writable calendar exists — create a local one (iOS needs this sometimes)
      if (Platform.OS === 'ios') {
        const defaultSource = calendars.find(
          cal => cal.source.type === Calendar.CalendarType.LOCAL
        )?.source ?? calendars[0]?.source;

        if (!defaultSource) return null;

        const newCalendarId = await Calendar.createCalendarAsync({
          title: 'Light Church',
          color: '#4285F4',
          entityType: Calendar.EntityTypes.EVENT,
          source: {
            name: defaultSource.name,
            type: defaultSource.type as string,
            isLocalAccount: defaultSource.isLocalAccount,
          },
          name: 'Light Church',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
          ownerAccount: 'local',
        });
        return newCalendarId;
      }
      return null;
    }

    // Prefer: primary > iCloud/Google > first writable
    const primary = writable.find(cal => cal.isPrimary);
    if (primary) return primary.id;

    const cloudCalendar = writable.find(
      cal => cal.source.name === 'iCloud' || cal.source.name === 'Google'
    );
    if (cloudCalendar) return cloudCalendar.id;

    return writable[0].id;
  } catch (error) {
    console.error('Error getting calendars:', error);
    return null;
  }
}

/**
 * Add event to calendar
 */
export async function addEventToCalendar(event: CalendarEvent): Promise<boolean> {
  try {
    // Request permissions
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return false;
    }

    // Get a writable calendar (filters out read-only ones)
    const calendarId = await getWritableCalendarId();
    if (!calendarId) {
      Alert.alert(
        'Erreur',
        'Impossible de trouver un calendrier sur votre appareil.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // Create event
    const eventDetails = {
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location || '',
      notes: event.notes || '',
      timeZone: 'Europe/Paris',
      alarms: [
        { relativeOffset: -60 }, // 1 hour before
        { relativeOffset: -1440 }, // 1 day before
      ],
    } as Calendar.Event;

    // Add URL if available (works on iOS)
    // Type assertion needed because url is an iOS-only property
    if (Platform.OS === 'ios' && event.url) {
      const eventWithUrl = eventDetails as Calendar.Event & { url?: string };
      eventWithUrl.url = event.url;
    }

    const eventId = await Calendar.createEventAsync(calendarId, eventDetails);

    if (eventId) {
      Alert.alert(
        'Événement ajouté! ✓',
        `L'événement a été ajouté à votre calendrier.`,
        [{ text: 'OK' }]
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    Alert.alert(
      'Erreur',
      'Impossible d\'ajouter l\'événement au calendrier.',
      [{ text: 'OK' }]
    );
    return false;
  }
}
