import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Colors, Spacing, Radius } from '@/constants/theme';

type Role = 'guest' | 'dj' | 'venue';

export default function OnboardingScreen() {
  const router = useRouter();
  const { session, setRole } = useAuthStore();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('guest');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim(), onboarding_completed: true })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      if (selectedRole !== 'guest') {
        await supabase.from('user_roles').upsert({
          user_id: session.user.id,
          role: selectedRole,
        });
      }

      setRole(selectedRole);
      router.replace(`/(${selectedRole})/home` as any);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Progress */}
          <View style={styles.progressRow}>
            {[1, 2].map(s => (
              <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]} />
            ))}
          </View>

          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>What's your name?</Text>
              <Text style={styles.stepSub}>This is how other users will see you</Text>
              <TextInput
                style={styles.input}
                placeholder="Display name"
                placeholderTextColor={Colors.text.muted}
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.btn, !displayName.trim() && styles.btnDisabled]}
                onPress={() => displayName.trim() && setStep(2)}
                disabled={!displayName.trim()}
              >
                <Text style={styles.btnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>How will you use the app?</Text>
              <Text style={styles.stepSub}>You can always change this later</Text>

              {(['guest', 'dj', 'venue'] as Role[]).map(role => {
                const labels: Record<Role, { title: string; desc: string; emoji: string }> = {
                  guest: { title: 'Guest', desc: 'Discover events and request songs', emoji: '🎉' },
                  dj: { title: 'DJ', desc: 'Manage your queue and events', emoji: '🎧' },
                  venue: { title: 'Venue', desc: 'Host events and manage bookings', emoji: '🏟️' },
                };
                const { title, desc, emoji } = labels[role];
                const isSelected = selectedRole === role;
                return (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleCard, isSelected && styles.roleCardActive]}
                    onPress={() => setSelectedRole(role)}
                  >
                    <Text style={styles.roleEmoji}>{emoji}</Text>
                    <View style={styles.roleText}>
                      <Text style={[styles.roleTitle, isSelected && styles.roleActive]}>{title}</Text>
                      <Text style={styles.roleDesc}>{desc}</Text>
                    </View>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity style={styles.btn} onPress={handleFinish} disabled={loading}>
                {loading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.btnText}>Get Started</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['3xl'] },
  progressRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing['3xl'] },
  progressDot: { width: 32, height: 4, borderRadius: 2, backgroundColor: Colors.purple.dim },
  progressDotActive: { backgroundColor: Colors.purple.DEFAULT },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 26, fontWeight: '800', color: Colors.text.primary, marginBottom: Spacing.sm },
  stepSub: { fontSize: 15, color: Colors.text.secondary, marginBottom: Spacing['2xl'] },
  input: {
    backgroundColor: Colors.bg.surface,
    borderWidth: 1,
    borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    color: Colors.text.primary,
    fontSize: 16,
    marginBottom: Spacing.xl,
  },
  btn: {
    backgroundColor: Colors.purple.DEFAULT,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.purple.dim,
  },
  roleCardActive: { borderColor: Colors.purple.DEFAULT, backgroundColor: Colors.bg.card },
  roleEmoji: { fontSize: 28, marginRight: Spacing.md },
  roleText: { flex: 1 },
  roleTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  roleActive: { color: Colors.purple.light },
  roleDesc: { fontSize: 13, color: Colors.text.secondary, marginTop: 2 },
  checkmark: { color: Colors.purple.DEFAULT, fontSize: 20, fontWeight: '700' },
});
