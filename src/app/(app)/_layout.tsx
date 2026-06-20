import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

function PlusTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.plusWrap, focused && styles.plusWrapActive]}>
      <Text style={[styles.plusText, focused && styles.plusTextActive]}>+</Text>
    </View>
  );
}

export default function AppLayout() {
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
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(event)"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => <PlusTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(inbox)"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  plusWrap: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: Colors.text.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  plusWrapActive: {
    borderColor: Colors.purple.DEFAULT,
    backgroundColor: Colors.purple.dim,
  },
  plusText: { fontSize: 22, lineHeight: 26, color: Colors.text.muted, fontWeight: '300' },
  plusTextActive: { color: Colors.purple.light, fontWeight: '600' },
});
