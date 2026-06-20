import { View, Text, FlatList, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useHomeEvents } from '@/hooks/useHomeEvents';
import { EventCard } from '@/components/ui/EventCard';
import { Colors, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const { liveEvents, upcomingEvents, loading, refresh } = useHomeEvents();
  const router = useRouter();

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.purple.DEFAULT} />}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good evening 👋</Text>
              <Text style={styles.headerTitle}>Upgrade Music</Text>
            </View>
          </View>

          {liveEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.sectionLabel}>LIVE NOW</Text>
                </View>
                <Text style={styles.count}>{liveEvents.length} events</Text>
              </View>
              <FlatList
                data={liveEvents}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={e => e.id}
                contentContainerStyle={{ paddingHorizontal: Spacing.base }}
                renderItem={({ item }) => <EventCard event={item} variant="story" />}
              />
            </View>
          )}

          {upcomingEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>UPCOMING</Text>
              </View>
              <View style={styles.cardList}>
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} variant="card" />
                ))}
              </View>
            </View>
          )}

          {!loading && liveEvents.length === 0 && upcomingEvents.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🎵</Text>
              <Text style={styles.emptyTitle}>No events right now</Text>
              <Text style={styles.emptyText}>Check back soon for live events near you</Text>
              <TouchableOpacity style={styles.searchBtn} onPress={() => router.push('/(guest)/search')}>
                <Text style={styles.searchBtnText}>Search Songs</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  greeting: { color: Colors.text.secondary, fontSize: 14 },
  headerTitle: { color: Colors.purple.light, fontSize: 22, fontWeight: '800' },
  section: { marginBottom: Spacing['2xl'] },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionLabel: { color: Colors.text.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  count: { color: Colors.text.muted, fontSize: 12 },
  cardList: { paddingHorizontal: Spacing.base },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing['2xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.base },
  emptyTitle: { color: Colors.text.primary, fontSize: 20, fontWeight: '700', marginBottom: Spacing.sm },
  emptyText: { color: Colors.text.secondary, textAlign: 'center', fontSize: 14, marginBottom: Spacing['2xl'] },
  searchBtn: {
    backgroundColor: Colors.purple.DEFAULT,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderRadius: 100,
  },
  searchBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
