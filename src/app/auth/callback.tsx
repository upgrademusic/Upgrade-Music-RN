import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

// Web-only OAuth callback handler.
// Supabase redirects here with ?code=... after Google OAuth on web.
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      supabase.auth
        .exchangeCodeForSession(window.location.href)
        .then(({ error }) => {
          if (error) {
            console.error('OAuth callback error:', error.message);
          }
          router.replace('/(app)/(home)/' as any);
        });
    } else {
      router.replace('/(auth)/login');
    }
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.purple.DEFAULT} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
