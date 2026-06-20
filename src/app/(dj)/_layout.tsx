import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function DJLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg.surface,
          borderTopColor: Colors.purple.dim,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.purple.DEFAULT,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="queue"
        options={{ title: 'Queue', tabBarIcon: ({ color, size }) => <Ionicons name="musical-notes" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
