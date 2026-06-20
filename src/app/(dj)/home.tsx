import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface QueueItem {
  groupId: string;
  songId: string;
  title: string;
  artist: string;
  albumArt: string;
  totalBidCents: number;
  bidCount: number;
  status: string;
}

interface DJEvent {
  id: string;
  name: string;
  status: string;
}

const formatCents = (c: number) => `$${(c / 100).toFixed(0)}`;

const BID_COLOR = (cents: number) => {
  if (cents >= 5000) return '#FACC15';
  if (cents >= 2000) return Colors.purple.DEFAULT;
  if (cents >= 1000) return '#60A5FA';
  return Colors.text.muted;
};

export default function DJDashboardScreen() {
  const { session } = useAuthStore();
  const [activeEvent, setActiveEvent] = useState<DJEvent | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [nowPlaying, setNowPlaying] = useState<QueueItem | null>(null);

  const loadEvent = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('events')
      .select('id, name, status')
      .eq('dj_id', session.user.id)
      .in('status', ['active', 'pre_event'])
      .order('starts_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setActiveEvent(data ?? null);
    return data?.id;
  }, [session?.user?.id]);

  const loadQueue = useCallback(async (eventId: string) => {
    const { data } = await supabase
      .from('request_groups')
      .select(`id, total_amount_cents, request_count, status, song_id,
        songs!inner ( id, title, artist, album_art_url )`)
      .eq('event_id', eventId)
      .in('status', ['pending', 'accepted']);

    if (data) {
      const items: QueueItem[] = (data as any[]).map(g => ({
        groupId: g.id,
        songId: g.song_id,
        title: g.songs.title,
        artist: g.songs.artist,
        albumArt: g.songs.album_art_url ?? '',
        totalBidCents: g.total_amount_cents ?? 0,
        bidCount: g.request_count ?? 0,
        status: g.status,
      })).sort((a, b) => b.totalBidCents - a.totalBidCents);
      setQueue(items);
      setNowPlaying(items[0] ?? null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadEvent().then(async (eventId) => {
      if (eventId) await loadQueue(eventId);
      setLoading(false);

      if (eventId) {
        const channel = supabase
          .channel(`dj-queue-${eventId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'request_groups', filter: `event_id=eq.${eventId}` }, () => loadQueue(eventId))
          .subscribe();
        return () => { supabase.removeChannel(channel); };
      }
    });
  }, [loadEvent]);

  const markPlayed = async (item: QueueItem) => {
    if (!activeEvent) return;
    Alert.alert('Mark as Played', `Mark "${item.title}" as played?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Played',
        onPress: async () => {
          await supabase
            .from('request_groups')
            .update({ status: 'completed' })
            .eq('id', item.groupId);
          setQueue(q => q.filter(i => i.groupId !== item.groupId));
          setNowPlaying(queue[1] ?? null);
        },
      },
    ]);
  };

  const skipSong = async (item: QueueItem) => {
    await supabase
      .from('request_groups')
      .update({ status: 'skipped' })
      .eq('id', item.groupId);
    setQueue(q => q.filter(i => i.groupId !== item.groupId));
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

  if (!activeEvent) {
    return (
      <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <Text style={styles.title}>DJ Dashboard</Text>
          </View>
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎧</Text>
            <Text style={styles.emptyTitle}>No active event</Text>
            <Text style={styles.emptyText}>Start or activate an event to manage the queue</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>DJ Dashboard</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.eventName}>{activeEvent.name}</Text>

        {/* Now Playing */}
        {nowPlaying && (
          <View style={styles.nowPlaying}>
            <Text style={styles.nowPlayingLabel}>▶ NOW PLAYING</Text>
            <View style={styles.nowPlayingRow}>
              <Image
                source={{ uri: nowPlaying.albumArt || 'https://placehold.co/64x64/221845/9B7BFF?text=🎵' }}
                style={styles.nowPlayingArt}
                contentFit="cover"
              />
              <View style={styles.nowPlayingInfo}>
                <Text style={styles.nowPlayingTitle} numberOfLines={1}>{nowPlaying.title}</Text>
                <Text style={styles.nowPlayingArtist} numberOfLines={1}>{nowPlaying.artist}</Text>
                <Text style={[styles.nowPlayingBid, { color: BID_COLOR(nowPlaying.totalBidCents) }]}>
                  {formatCents(nowPlaying.totalBidCents)} · {nowPlaying.bidCount} boosts
                </Text>
              </View>
            </View>
            <View style={styles.nowPlayingActions}>
              <TouchableOpacity style={styles.playedBtn} onPress={() => markPlayed(nowPlaying)}>
                <Text style={styles.playedBtnText}>✓ Mark Played</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={() => skipSong(nowPlaying)}>
                <Text style={styles.skipBtnText}>⏭ Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Queue */}
        <View style={styles.queueHeader}>
          <Text style={styles.queueTitle}>Up Next</Text>
          <Text style={styles.queueCount}>{queue.length - 1} songs</Text>
        </View>

        <FlatList
          data={queue.slice(1)}
          keyExtractor={i => i.groupId}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <View style={[styles.row, { borderLeftColor: BID_COLOR(item.totalBidCents), borderLeftWidth: 3 }]}>
              <Text style={styles.rowPos}>{index + 2}</Text>
              <Image
                source={{ uri: item.albumArt || 'https://placehold.co/44x44/221845/9B7BFF?text=🎵' }}
                style={styles.rowArt}
                contentFit="cover"
              />
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.rowArtist} numberOfLines={1}>{item.artist}</Text>
              </View>
              <Text style={[styles.rowBid, { color: BID_COLOR(item.totalBidCents) }]}>
                {formatCents(item.totalBidCents)}
              </Text>
              <TouchableOpacity onPress={() => skipSong(item)} style={styles.rowSkip}>
                <Text style={styles.rowSkipText}>✕</Text>
              </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { color: Colors.purple.light, fontSize: 22, fontWeight: '800' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  liveText: { color: '#EF4444', fontSize: 11, fontWeight: '800' },
  eventName: { color: Colors.text.secondary, fontSize: 14, paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  nowPlaying: {
    backgroundColor: Colors.bg.surface,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.purple.dim,
  },
  nowPlayingLabel: { color: Colors.purple.DEFAULT, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: Spacing.md },
  nowPlayingRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  nowPlayingArt: { width: 64, height: 64, borderRadius: Radius.md, backgroundColor: Colors.bg.card },
  nowPlayingInfo: { flex: 1, justifyContent: 'center' },
  nowPlayingTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '700' },
  nowPlayingArtist: { color: Colors.text.secondary, fontSize: 13, marginTop: 2 },
  nowPlayingBid: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  nowPlayingActions: { flexDirection: 'row', gap: Spacing.md },
  playedBtn: {
    flex: 1,
    backgroundColor: Colors.success + '22',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  playedBtnText: { color: Colors.success, fontWeight: '700', fontSize: 14 },
  skipBtn: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.text.muted,
  },
  skipBtnText: { color: Colors.text.muted, fontWeight: '600', fontSize: 14 },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  queueTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '700' },
  queueCount: { color: Colors.text.muted, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg.surface,
    gap: Spacing.sm,
    marginLeft: Spacing.base,
    borderRadius: 0,
  },
  rowPos: { color: Colors.text.muted, fontSize: 13, width: 18, textAlign: 'center' },
  rowArt: { width: 44, height: 44, borderRadius: Radius.sm, backgroundColor: Colors.bg.card },
  rowInfo: { flex: 1 },
  rowTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '600' },
  rowArtist: { color: Colors.text.secondary, fontSize: 12 },
  rowBid: { fontSize: 14, fontWeight: '700' },
  rowSkip: { padding: Spacing.sm },
  rowSkipText: { color: Colors.text.muted, fontSize: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.text.primary, fontSize: 20, fontWeight: '700', marginBottom: Spacing.sm },
  emptyText: { color: Colors.text.secondary, textAlign: 'center', fontSize: 14 },
});
