import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHomeFeed, type LiveStory, type UpcomingEvent, type DiscoverPost, CONTENT_LABEL } from '@/hooks/useHomeFeed';
import { useAuthStore } from '@/store/auth';
import { Colors, Spacing, Radius } from '@/constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const STORY_W = SCREEN_W - 56;
const GRID_W = (SCREEN_W - Spacing.base * 2 - Spacing.sm) / 2;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function relativeTime(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function avatarUrl(name: string | null, url: string | null) {
  if (url) return url;
  const n = encodeURIComponent(name ?? 'U');
  return `https://ui-avatars.com/api/?name=${n}&background=221845&color=9B7BFF&size=128`;
}

/* ─── Story card ─────────────────────────────────────── */
function StoryCard({ item, onPress }: { item: LiveStory; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.storyCard, { width: STORY_W }]} onPress={onPress} activeOpacity={0.92}>
      <Image
        source={{ uri: item.cover_image_url ?? undefined }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.94)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top row */}
      <View style={styles.storyTop}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
        {item.city ? (
          <View style={styles.cityBadge}>
            <Ionicons name="location-outline" size={10} color={Colors.text.secondary} />
            <Text style={styles.cityText}>{item.city}</Text>
          </View>
        ) : null}
      </View>

      {/* Bottom info */}
      <View style={styles.storyBottom}>
        {item.dj_name ? (
          <View style={styles.djRow}>
            <Image source={{ uri: avatarUrl(item.dj_name, item.dj_avatar) }} style={styles.djAvatar} contentFit="cover" />
            <Text style={styles.djName}>{item.dj_name}</Text>
          </View>
        ) : null}
        <Text style={styles.storyTitle} numberOfLines={2}>{item.name}</Text>
        {item.venue_name ? (
          <Text style={styles.storyVenue} numberOfLines={1}>{item.venue_name}</Text>
        ) : null}
        <View style={styles.storyStats}>
          <View style={styles.statItem}>
            <Ionicons name="musical-notes-outline" size={12} color={Colors.purple.light} />
            <Text style={styles.statText}>{item.queue_size} in queue</Text>
          </View>
          <View style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Join →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Upcoming card ──────────────────────────────────── */
function UpcomingCard({ item, onPress }: { item: UpcomingEvent; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.upcomingCard, { width: GRID_W }]} onPress={onPress} activeOpacity={0.88}>
      <Image
        source={{ uri: item.cover_image_url ?? undefined }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.88)']}
        locations={[0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      {item.starts_at ? (
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{fmtDate(item.starts_at)}</Text>
        </View>
      ) : null}
      <View style={styles.upcomingInfo}>
        <Text style={styles.upcomingName} numberOfLines={2}>{item.name}</Text>
        {item.venue_name ? (
          <Text style={styles.upcomingVenue} numberOfLines={1}>{item.venue_name}</Text>
        ) : null}
        {item.starts_at ? (
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={10} color={Colors.purple.light} />
            <Text style={styles.timeText}>{fmtTime(item.starts_at)}</Text>
            {item.city ? <Text style={styles.citySmall}> · {item.city}</Text> : null}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

/* ─── Discover post ──────────────────────────────────── */
function DiscoverPostCard({ item, onPress }: { item: DiscoverPost; onPress: () => void }) {
  const label = CONTENT_LABEL[item.content_type] ?? 'shared something';
  const creator = item.creator_name ?? 'Someone';
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: avatarUrl(creator, item.creator_avatar) }} style={styles.postAvatar} contentFit="cover" />
        <View style={styles.postMeta}>
          <Text style={styles.postCreator} numberOfLines={1}>{creator}</Text>
          <Text style={styles.postLabel} numberOfLines={1}>
            {label}{item.event_name ? ` · ${item.event_name}` : ''} · {relativeTime(item.created_at)}
          </Text>
        </View>
        {item.event_id ? (
          <TouchableOpacity style={styles.viewBtn} onPress={onPress}>
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity style={styles.postImage} onPress={onPress} activeOpacity={0.9}>
        {item.event_cover ? (
          <Image source={{ uri: item.event_cover }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={styles.postImageFallback}>
            <Ionicons name="musical-notes" size={40} color={Colors.purple.dim} />
          </View>
        )}
        <View style={styles.contentTypeBadge}>
          <Text style={styles.contentTypeText}>
            {item.content_type.replace(/_/g, ' ').toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.postActions}>
        <View style={styles.actionBtn}>
          <Ionicons name="heart-outline" size={22} color={Colors.text.muted} />
          <Text style={styles.actionCount}>{item.click_count}</Text>
        </View>
        <View style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.text.muted} />
          <Text style={styles.actionCount}>0</Text>
        </View>
      </View>
    </View>
  );
}

/* ─── Main screen ────────────────────────────────────── */
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    displayName, liveStories, liveLoading,
    upcomingEvents, upcomingLoading,
    discoverPosts, discoverLoading, hasMorePosts,
    loadMorePosts, refresh, loading,
  } = useHomeFeed();

  const firstName = displayName?.split(' ')[0]
    ?? (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]
    ?? 'there';

  const ListHeader = (
    <View>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* ══ SECTION 1: LIVE STORIES ══ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.liveLabel}>
            <View style={styles.livePulse} />
            <Text style={styles.sectionTitle}>Live Now</Text>
          </View>
        </View>

        {liveLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Colors.purple.DEFAULT} />
          </View>
        ) : liveStories.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No live events right now</Text>
            <Text style={styles.emptySubtext}>Check back tonight</Text>
          </View>
        ) : (
          <FlatList
            data={liveStories}
            horizontal
            pagingEnabled={false}
            decelerationRate="fast"
            snapToAlignment="start"
            snapToInterval={STORY_W + Spacing.md}
            showsHorizontalScrollIndicator={false}
            keyExtractor={e => e.id}
            contentContainerStyle={styles.storyList}
            renderItem={({ item }) => (
              <StoryCard
                item={item}
                onPress={() => router.push({ pathname: '/(app)/(event)/[id]', params: { id: item.id } } as any)}
              />
            )}
          />
        )}
      </View>

      {/* ══ SECTION 2: UPCOMING EVENTS ══ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming This Week</Text>
        </View>

        {upcomingLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={Colors.purple.DEFAULT} />
          </View>
        ) : upcomingEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No events in the next 7 days</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {upcomingEvents.map(ev => (
              <UpcomingCard
                key={ev.id}
                item={ev}
                onPress={() => router.push({ pathname: '/(app)/(event)/[id]', params: { id: ev.id } } as any)}
              />
            ))}
          </View>
        )}
      </View>

      {/* ══ SECTION 3: DISCOVER header ══ */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Discover</Text>
        <Text style={styles.sectionSub}>Latest activity</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FlatList
          data={discoverPosts}
          keyExtractor={p => p.id}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.purple.DEFAULT} />
          }
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            discoverLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.purple.DEFAULT} />
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            )
          }
          ListFooterComponent={
            discoverPosts.length > 0 ? (
              <View style={styles.footer}>
                {hasMorePosts
                  ? <ActivityIndicator size="small" color={Colors.purple.dim} />
                  : <Text style={styles.footerText}>You're all caught up</Text>
                }
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <DiscoverPostCard
              item={item}
              onPress={() => item.event_id
                ? router.push({ pathname: '/(app)/(event)/[id]', params: { id: item.event_id } } as any)
                : undefined
              }
            />
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: { fontSize: 13, color: Colors.text.muted },
  name: { fontSize: 24, fontWeight: '800', color: Colors.purple.light, marginTop: 2 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bg.surface,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Sections */
  section: { marginBottom: Spacing['2xl'] },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  sectionSub: { fontSize: 12, color: Colors.text.muted },
  liveLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },

  /* Story cards */
  storyList: { paddingHorizontal: Spacing.base, gap: Spacing.md },
  storyCard: {
    height: 480, borderRadius: Radius.xl + 4,
    overflow: 'hidden', backgroundColor: Colors.bg.card,
  },
  storyTop: {
    position: 'absolute', top: Spacing.base, left: Spacing.base, right: Spacing.base,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.purple.DEFAULT,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  cityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full,
  },
  cityText: { color: Colors.text.secondary, fontSize: 11 },
  storyBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg },
  djRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  djAvatar: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: Colors.purple.DEFAULT,
  },
  djName: { color: Colors.text.primary, fontSize: 13, fontWeight: '600' },
  storyTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4, lineHeight: 26 },
  storyVenue: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: Spacing.md },
  storyStats: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)',
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 12, color: Colors.purple.light },
  joinBtn: {
    backgroundColor: Colors.purple.DEFAULT,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full,
  },
  joinBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  /* Upcoming grid */
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  upcomingCard: {
    height: GRID_W * 1.3, borderRadius: Radius.lg,
    overflow: 'hidden', backgroundColor: Colors.bg.card,
  },
  dateBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 7, paddingVertical: 4, borderRadius: Radius.sm,
  },
  dateBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  upcomingInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  upcomingName: { fontSize: 12, fontWeight: '800', color: '#fff', lineHeight: 16, marginBottom: 2 },
  upcomingVenue: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginBottom: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timeText: { fontSize: 10, color: Colors.purple.light, fontWeight: '600' },
  citySmall: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },

  /* Discover post */
  postCard: { paddingHorizontal: Spacing.base, marginBottom: Spacing['2xl'] },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  postAvatar: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: Colors.purple.DEFAULT,
  },
  postMeta: { flex: 1 },
  postCreator: { fontSize: 13, fontWeight: '700', color: Colors.text.primary },
  postLabel: { fontSize: 11, color: Colors.text.muted, marginTop: 1 },
  viewBtn: {
    backgroundColor: 'rgba(155,123,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
  },
  viewBtnText: { color: Colors.purple.light, fontSize: 11, fontWeight: '600' },
  postImage: {
    width: '100%', aspectRatio: 1, borderRadius: Radius.lg,
    overflow: 'hidden', backgroundColor: Colors.bg.surface,
  },
  postImageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  contentTypeBadge: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm,
  },
  contentTypeText: { color: Colors.purple.light, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  postActions: { flexDirection: 'row', gap: 20, marginTop: 10, paddingHorizontal: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionCount: { fontSize: 13, color: Colors.text.muted },

  /* Shared */
  loadingRow: { paddingVertical: Spacing['2xl'], alignItems: 'center' },
  emptyCard: {
    marginHorizontal: Spacing.base, padding: Spacing['2xl'],
    backgroundColor: Colors.bg.surface, borderRadius: Radius.lg,
    alignItems: 'center',
  },
  emptyText: { color: Colors.text.muted, fontSize: 14 },
  emptySubtext: { color: Colors.text.muted, fontSize: 12, marginTop: 4, opacity: 0.6 },
  footer: { paddingVertical: Spacing.xl, alignItems: 'center' },
  footerText: { color: Colors.text.muted, fontSize: 12 },
});
