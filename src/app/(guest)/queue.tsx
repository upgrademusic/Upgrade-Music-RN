import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEventQueue } from '@/hooks/useEventQueue';
import { Colors, Spacing, Radius } from '@/constants/theme';

// Demo event ID — replace with active event detection
const DEMO_EVENT_ID = 'demo';
const formatCents = (c: number) => `$${(c / 100).toFixed(0)}`;

export default function QueueScreen() {
  const { queue, eventInfo, loading } = useEventQueue(DEMO_EVENT_ID);
  const router = useRouter();

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Live Queue</Text>
          {eventInfo && (
            <Text style={styles.eventName}>{eventInfo.name}</Text>
          )}
        </View>

        {loading && <ActivityIndicator color={Colors.purple.DEFAULT} style={{ marginTop: 40 }} />}

        {!loading && queue.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎶</Text>
            <Text style={styles.emptyTitle}>No active queue</Text>
            <Text style={styles.emptyText}>Join a live event to see the queue</Text>
            <TouchableOpacity style={styles.btn} onPress={() => router.push('/(guest)/home')}>
              <Text style={styles.btnText}>Find Events</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={queue}
          keyExtractor={i => i.groupId}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <View style={[styles.row, index === 0 && styles.rowTop]}>
              {index === 0 && (
                <View style={styles.playingBadge}>
                  <Text style={styles.playingText}>▶ NOW PLAYING</Text>
                </View>
              )}
              <Text style={styles.pos}>{index + 1}</Text>
              <Image
                source={{ uri: item.albumArt || 'https://placehold.co/48x48/221845/9B7BFF?text=🎵' }}
                style={styles.art}
                contentFit="cover"
              />
              <View style={styles.info}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
                <Text style={styles.bidCount}>{item.bidCount} boosts</Text>
              </View>
              <Text style={styles.amount}>{formatCents(item.totalBidCents)}</Text>
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
  eventName: { color: Colors.text.secondary, fontSize: 14, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.text.primary, fontSize: 20, fontWeight: '700', marginBottom: Spacing.sm },
  emptyText: { color: Colors.text.secondary, textAlign: 'center', marginBottom: Spacing['2xl'] },
  btn: { backgroundColor: Colors.purple.DEFAULT, paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.md, borderRadius: 100 },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg.surface,
    gap: Spacing.md,
  },
  rowTop: { backgroundColor: 'rgba(155,123,255,0.08)' },
  playingBadge: {
    position: 'absolute',
    top: 6,
    right: Spacing.base,
  },
  playingText: { color: Colors.purple.DEFAULT, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  pos: { color: Colors.text.muted, fontSize: 13, width: 20, textAlign: 'center' },
  art: { width: 48, height: 48, borderRadius: Radius.sm, backgroundColor: Colors.bg.card },
  info: { flex: 1 },
  songTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '600' },
  songArtist: { color: Colors.text.secondary, fontSize: 12, marginTop: 2 },
  bidCount: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  amount: { color: Colors.purple.light, fontSize: 15, fontWeight: '700' },
});
