import { Stack } from 'expo-router';

export default function EventStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="create-event"    options={{ presentation: 'modal' }} />
      <Stack.Screen name="create-playlist" options={{ presentation: 'modal' }} />
      <Stack.Screen name="upload-media"    options={{ presentation: 'modal' }} />
    </Stack>
  );
}
