import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { useInterestedEventsCount } from '@/hooks/query/useInterestedEvents';

const ACTIVE_COLOR = '#4285F4';
const INACTIVE_COLOR = '#5F6368';

export default function TabLayout() {
  const { data: savedCount = 0 } = useInterestedEventsCount();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: tabStyles.tabBar,
        tabBarLabelStyle: tabStyles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Découvrir',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: 'Enregistrés',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarBadge: savedCount > 0 ? savedCount : undefined,
          tabBarBadgeStyle: tabStyles.badge,
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: 'À propos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'information-circle' : 'information-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E8EAED',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#EA4335',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    top: 2,
  },
});
