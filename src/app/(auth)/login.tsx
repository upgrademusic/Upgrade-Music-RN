import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, Radius } from '@/constants/theme';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'google' | 'email' | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        return;
      }

      // Native (including Expo Go): always use the custom scheme.
      // ASWebAuthenticationSession intercepts custom scheme redirects automatically
      // even without the scheme being registered — no Expo Go limitation applies.
      const nativeRedirect = 'upgrademusic://auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: nativeRedirect, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, nativeRedirect);
        if (result.type === 'success') {
          const resultUrl = (result as any).url as string;
          // Implicit flow: Supabase returns tokens in the URL hash fragment
          const fragment = resultUrl.includes('#') ? resultUrl.split('#')[1] : '';
          const params = new URLSearchParams(fragment);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token) {
            await supabase.auth.setSession({ access_token, refresh_token: refresh_token ?? '' });
          }
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Google login failed');
    } finally {
      setLoading(null);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading('email');
    try {
      const { error } = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });
      if (error) throw error;
      if (mode === 'signup') {
        Alert.alert('Check your email', 'We sent you a confirmation link.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Authentication failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.hero}>
              <Text style={styles.emoji}>🎵</Text>
              <Text style={styles.title}>Upgrade Music</Text>
              <Text style={styles.subtitle}>The live music request platform</Text>
            </View>

            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              disabled={!!loading}
              activeOpacity={0.8}
            >
              {loading === 'google'
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.googleBtnText}>🔵  Continue with Google</Text>
              }
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.text.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleEmailAuth}
              disabled={!!loading}
              activeOpacity={0.8}
            >
              {loading === 'email'
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.primaryBtnText}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode(m => m === 'login' ? 'signup' : 'login')}>
              <Text style={styles.toggleText}>
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing['3xl'] },
  hero: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  emoji: { fontSize: 48, marginBottom: Spacing.md },
  title: { fontSize: 32, fontWeight: '800', color: Colors.purple.light, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.text.secondary, marginTop: Spacing.sm, textAlign: 'center' },
  googleBtn: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  googleBtnText: { color: Colors.black, fontSize: 16, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.purple.dim },
  dividerText: { color: Colors.text.muted, marginHorizontal: Spacing.md, fontSize: 13 },
  input: {
    backgroundColor: Colors.bg.surface,
    borderWidth: 1,
    borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    color: Colors.text.primary,
    fontSize: 15,
    marginBottom: Spacing.md,
  },
  primaryBtn: {
    backgroundColor: Colors.purple.DEFAULT,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  primaryBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  toggleText: { color: Colors.purple.DEFAULT, textAlign: 'center', fontSize: 14 },
});
