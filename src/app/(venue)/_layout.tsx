import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function VenueLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg.surface,
          borderTopColor: Colors.purple.dim,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.purple.DEFAULT,
        tabBarInactiveTintColor: Colors.text.muted,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="events" options={{ title: 'Events' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
    </Tabs>
  );
}
