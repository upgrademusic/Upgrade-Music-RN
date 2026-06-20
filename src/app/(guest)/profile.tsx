import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface Profile {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface Stats {
  nights_out: number;
  songs_requested: number;
  total_spent_cents: number;
}

export default function ProfileScreen() {
  const { session, signOut } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const load = async () => {
      const { data: p } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url, bio')
        .eq('id', session.user.id)
        .single();
      setProfile(p);

      const { data: requests } = await supabase
        .from('song_requests')
        .select('amount_cents, event_id')
        .eq('requester_id', session.user.id);

      if (requests) {
        const totalCents = requests.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
        const uniqueEvents = new Set(requests.map(r => r.event_id)).size;
        setStats({
          nights_out: uniqueEvents,
          songs_requested: requests.length,
          total_spent_cents: totalCents,
        });
      }

      setLoading(false);
    };

    load();
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <ActivityIndicator color={Colors.purple.DEFAULT} style={{ marginTop: 80 }} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: profile?.avatar_url ?? 'https://placehold.co/80x80/1A1035/9B7BFF?text=👤' }}
              style={styles.avatar}
              contentFit="cover"
            />
            <Text style={styles.displayName}>{profile?.display_name ?? session?.user?.email?.split('@')[0]}</Text>
            {profile?.username && <Text style={styles.username}>@{profile.username}</Text>}
            {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          </View>

          {/* Stats */}
          {stats && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.nights_out}</Text>
                <Text style={styles.statLabel}>Nights Out</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.songs_requested}</Text>
                <Text style={styles.statLabel}>Songs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${(stats.total_spent_cents / 100).toFixed(0)}</Text>
                <Text style={styles.statLabel}>Spent</Text>
              </View>
            </View>
          )}

          {/* Menu */}
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuEmoji}>🎵</Text>
              <Text style={styles.menuLabel}>My Song History</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuEmoji}>📋</Text>
              <Text style={styles.menuLabel}>My Playlists</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuEmoji}>⚙️</Text>
              <Text style={styles.menuLabel}>Settings</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  profileHeader: { alignItems: 'center', paddingTop: Spacing['2xl'], paddingBottom: Spacing['2xl'], paddingHorizontal: Spacing['2xl'] },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.bg.card, marginBottom: Spacing.md },
  displayName: { color: Colors.text.primary, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  username: { color: Colors.text.muted, fontSize: 14, marginBottom: Spacing.sm },
  bio: { color: Colors.text.secondary, fontSize: 14, textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.surface,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing['2xl'],
    paddingVertical: Spacing.xl,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.purple.light, fontSize: 22, fontWeight: '800' },
  statLabel: { color: Colors.text.muted, fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.purple.dim },
  menu: {
    backgroundColor: Colors.bg.surface,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing['2xl'],
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg.card,
    gap: Spacing.md,
  },
  menuEmoji: { fontSize: 18 },
  menuLabel: { flex: 1, color: Colors.text.primary, fontSize: 15 },
  menuArrow: { color: Colors.text.muted, fontSize: 18 },
  signOutBtn: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  signOutText: { color: Colors.error, fontWeight: '700', fontSize: 15 },
});
