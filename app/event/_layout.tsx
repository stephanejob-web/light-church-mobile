import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EventLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerTintColor: '#4285F4',
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: true,
        title: 'Événement',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
            <Ionicons name="chevron-back" size={28} color="#4285F4" />
          </TouchableOpacity>
        ),
      }}
    />
  );
}
