import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface ActivityItem {
  id: string;
  type: string;
  created_at: string;
  metadata: Record<string, any> | null;
}

export default function ActivityScreen() {
  const { session } = useAuthStore();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from('activity_feed')
      .select('id, activity_type, created_at, metadata')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setItems((data ?? []).map(d => ({
          id: d.id,
          type: d.activity_type,
          created_at: d.created_at ?? '',
          metadata: d.metadata as Record<string, any> | null,
        })));
        setLoading(false);
      });
  }, [session?.user?.id]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const activityLabel = (type: string, meta: Record<string, any> | null) => {
    switch (type) {
      case 'song_request': return `Requested "${meta?.song_title ?? 'a song'}"`;
      case 'song_boost': return `Boosted "${meta?.song_title ?? 'a song'}"`;
      case 'follow': return `Followed ${meta?.target_name ?? 'someone'}`;
      default: return type.replace(/_/g, ' ');
    }
  };

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
        </View>

        {loading && <ActivityIndicator color={Colors.purple.DEFAULT} style={{ marginTop: 40 }} />}

        {!loading && items.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptyText}>Your song requests and interactions will appear here</Text>
          </View>
        )}

        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.dot} />
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{activityLabel(item.type, item.metadata)}</Text>
                <Text style={styles.rowTime}>{formatTime(item.created_at)}</Text>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.purple.light, fontSize: 22, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  emptyText: { color: Colors.text.secondary, textAlign: 'center', fontSize: 14 },
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg.surface,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.purple.DEFAULT, marginTop: 5 },
  rowContent: { flex: 1 },
  rowLabel: { color: Colors.text.primary, fontSize: 14 },
  rowTime: { color: Colors.text.muted, fontSize: 12, marginTop: 3 },
});
