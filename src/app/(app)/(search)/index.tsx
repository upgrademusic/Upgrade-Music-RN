import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useSearch, type SearchTab,
  type SongResult, type ArtistResult, type EventResult,
  type MovieResult, type VideoCard,
} from '@/hooks/useSearch';
import { Colors, Spacing, Radius } from '@/constants/theme';

const { width: W, height: H } = Dimensions.get('window');

const TABS: { key: SearchTab; label: string; icon: string }[] = [
  { key: 'songs',   label: 'Songs',   icon: 'musical-note' },
  { key: 'artists', label: 'Artists', icon: 'person' },
  { key: 'events',  label: 'Events',  icon: 'calendar' },
  { key: 'movies',  label: 'Movies',  icon: 'film' },
];

const PLACEHOLDERS: Record<SearchTab, string> = {
  songs:   'Search any song or track…',
  artists: 'Search by artist name…',
  events:  'Search events & parties…',
  movies:  'Search movie soundtracks…',
};

const CONTENT_LABEL: Record<string, string> = {
  track_bid:    'placed a bid',
  track_top:    'pushed to #1',
  track_played: 'got song played',
  battle_won:   'won a battle',
  top_supporter:'is top supporter',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtCents(c: number) {
  return `$${(c / 100).toFixed(0)}`;
}

function avatarUrl(name: string | null, url: string | null) {
  if (url) return url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'U')}&background=221845&color=9B7BFF&size=128`;
}

/* ─── Row components ──────────────────────────────────── */

function SongRow({ item }: { item: SongResult }) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: item.albumArt ?? undefined }} style={styles.thumb56} contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>{item.artist}</Text>
        {item.album ? <Text style={styles.rowMuted} numberOfLines={1}>{item.album}</Text> : null}
      </View>
      {item.inQueue ? (
        <View style={styles.queueBadge}><Text style={styles.queueText}>{fmtCents(item.totalBidCents)}</Text></View>
      ) : (
        <View style={styles.reqBadge}><Text style={styles.reqText}>Request</Text></View>
      )}
    </View>
  );
}

function ArtistRow({ item }: { item: ArtistResult }) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: item.topAlbumArt ?? undefined }} style={styles.thumbRound} contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowSub}>{item.songCount} track{item.songCount !== 1 ? 's' : ''} in library</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.text.muted} />
    </View>
  );
}

function EventRow({ item, onPress }: { item: EventResult; onPress: () => void }) {
  const isLive = item.status === 'active';
  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: item.cover_image_url ?? undefined }} style={StyleSheet.absoluteFillObject}
        contentFit="cover" placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFill} />
      {isLive && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      )}
      <View style={styles.eventInfo}>
        <Text style={styles.eventName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.eventMeta} numberOfLines={1}>
          {[item.venue_name, item.city].filter(Boolean).join(' · ')}
          {item.starts_at ? `  ·  ${fmtDate(item.starts_at)}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function MovieRow({ item }: { item: MovieResult }) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: item.albumArt ?? undefined }} style={styles.thumb56} contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>{item.artist}</Text>
        {item.album ? <Text style={styles.rowMuted} numberOfLines={1}>{item.album}</Text> : null}
      </View>
      <Ionicons name="film-outline" size={18} color={Colors.purple.muted} />
    </View>
  );
}

/* ─── Fullscreen video card (TikTok / Reels style) ───── */
function VideoCardItem({ item, onPress }: { item: VideoCard; onPress: () => void }) {
  const creator = item.creator_name ?? 'Someone';
  const label = CONTENT_LABEL[item.content_type] ?? 'shared something';

  return (
    <TouchableOpacity style={styles.videoCard} onPress={onPress} activeOpacity={0.95}>
      {item.event_cover ? (
        <Image source={{ uri: item.event_cover }} style={StyleSheet.absoluteFill} contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
      ) : (
        <LinearGradient colors={[Colors.bg.surface, Colors.bg.card]} style={StyleSheet.absoluteFill} />
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.08)', 'transparent', 'rgba(0,0,0,0.78)']}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top badge */}
      <View style={styles.videoTop}>
        <View style={styles.contentBadge}>
          <Ionicons name="musical-notes" size={11} color={Colors.purple.light} />
          <Text style={styles.contentBadgeText}>
            {item.content_type.replace(/_/g, ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Right action column */}
      <View style={styles.videoActions}>
        <View style={styles.videoAction}>
          <Ionicons name="heart" size={30} color="#fff" />
          <Text style={styles.actionCount}>{item.click_count}</Text>
        </View>
        <View style={styles.videoAction}>
          <Ionicons name="chatbubble" size={26} color="#fff" />
          <Text style={styles.actionCount}>0</Text>
        </View>
        <View style={styles.videoAction}>
          <Ionicons name="share-social" size={26} color="#fff" />
        </View>
      </View>

      {/* Bottom info */}
      <View style={styles.videoBottom}>
        <View style={styles.creatorRow}>
          <Image source={{ uri: avatarUrl(creator, item.creator_avatar) }}
            style={styles.creatorAvatar} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.creatorName}>@{creator.toLowerCase().replace(/\s+/g, '_')}</Text>
            <Text style={styles.creatorLabel}>{label}</Text>
          </View>
        </View>
        {item.event_name ? (
          <View style={styles.videoEventRow}>
            <Ionicons name="musical-note" size={13} color={Colors.purple.light} />
            <Text style={styles.videoEventText} numberOfLines={1}>
              {item.event_name}{item.venue_name ? ` · ${item.venue_name}` : ''}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

/* ─── Shared header (tabs + search bar) ──────────────── */
function SearchHeader({ tab, setTab, query, setQuery }: {
  tab: SearchTab; setTab: (t: SearchTab) => void;
  query: string; setQuery: (q: string) => void;
}) {
  return (
    <View style={styles.headerSection}>
      <Text style={styles.screenTitle}>Search</Text>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.text.muted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={PLACEHOLDERS[tab]}
          placeholderTextColor={Colors.text.muted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}>
            <Ionicons name={t.icon as any} size={14}
              color={tab === t.key ? Colors.purple.light : Colors.text.muted} />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* ─── Main screen ─────────────────────────────────────── */
export default function SearchScreen() {
  const router = useRouter();
  const {
    tab, setTab, query, setQuery, loading,
    songResults, artistResults, eventResults, movieResults,
    videoFeed, videoLoading, hasMoreVideos, loadMoreVideos,
  } = useSearch();

  const hasQuery = query.trim().length >= 2;

  /* ── Empty state: fullscreen video feed ── */
  if (!hasQuery) {
    const videoHeader = (
      <View>
        <SearchHeader tab={tab} setTab={setTab} query={query} setQuery={setQuery} />
        <View style={styles.discoverHeader}>
          <Text style={styles.discoverTitle}>Discover</Text>
          <Text style={styles.discoverSub}>From the community</Text>
        </View>
      </View>
    );

    return (
      <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <FlatList
            data={videoFeed}
            keyExtractor={v => v.id}
            ListHeaderComponent={videoHeader}
            showsVerticalScrollIndicator={false}
            pagingEnabled
            decelerationRate="fast"
            onEndReached={loadMoreVideos}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              videoLoading ? (
                <View style={styles.videoPlaceholder}>
                  <ActivityIndicator color={Colors.purple.DEFAULT} size="large" />
                </View>
              ) : (
                <View style={styles.videoPlaceholder}>
                  <Ionicons name="film-outline" size={40} color={Colors.purple.dim} />
                  <Text style={styles.emptyText}>No content yet</Text>
                </View>
              )
            }
            ListFooterComponent={
              videoFeed.length > 0 && !hasMoreVideos ? (
                <View style={styles.footerBox}>
                  <Text style={styles.footerText}>You're caught up</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <VideoCardItem
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

  /* ── With query: tab results ── */
  type Wrapped =
    | { _t: 'song';   d: SongResult }
    | { _t: 'artist'; d: ArtistResult }
    | { _t: 'event';  d: EventResult }
    | { _t: 'movie';  d: MovieResult };

  const listData: Wrapped[] =
    tab === 'songs'   ? songResults.map(d => ({ _t: 'song' as const, d }))
    : tab === 'artists' ? artistResults.map(d => ({ _t: 'artist' as const, d }))
    : tab === 'events'  ? eventResults.map(d => ({ _t: 'event' as const, d }))
    : movieResults.map(d => ({ _t: 'movie' as const, d }));

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FlatList
          data={listData}
          keyExtractor={(_, i) => String(i)}
          ListHeaderComponent={
            <SearchHeader tab={tab} setTab={setTab} query={query} setQuery={setQuery} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            loading ? (
              <View style={styles.center}>
                <ActivityIndicator color={Colors.purple.DEFAULT} size="large" />
              </View>
            ) : (
              <View style={styles.center}>
                <Ionicons name="search-outline" size={36} color={Colors.purple.dim} />
                <Text style={styles.emptyText}>No results for "{query}"</Text>
              </View>
            )
          }
          renderItem={({ item }) => {
            if (item._t === 'song')   return <SongRow item={item.d} />;
            if (item._t === 'artist') return <ArtistRow item={item.d} />;
            if (item._t === 'movie')  return <MovieRow item={item.d} />;
            return (
              <EventRow
                item={item.d}
                onPress={() => router.push({ pathname: '/(app)/(event)/[id]', params: { id: item.d.id } } as any)}
              />
            );
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ─── Styles ──────────────────────────────────────────── */
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  headerSection: { paddingBottom: Spacing.sm },
  screenTitle: {
    color: Colors.purple.light, fontSize: 22, fontWeight: '800',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.surface, borderRadius: Radius.lg,
    marginHorizontal: Spacing.base, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.purple.dim, marginBottom: Spacing.md,
  },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 15, paddingVertical: Spacing.md },

  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: Radius.md, backgroundColor: Colors.bg.surface,
  },
  tabActive: { backgroundColor: Colors.purple.dim },
  tabLabel: { fontSize: 11, color: Colors.text.muted, fontWeight: '600' },
  tabLabelActive: { color: Colors.purple.light },

  discoverHeader: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  discoverTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  discoverSub: { fontSize: 12, color: Colors.text.muted },

  /* Video card — nearly full-screen height for snap-scroll */
  videoCard: {
    width: W, height: H * 0.76,
    backgroundColor: Colors.bg.card, marginBottom: 3,
  },
  videoTop: { position: 'absolute', top: Spacing.base, left: Spacing.base },
  contentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full,
  },
  contentBadgeText: { color: Colors.purple.light, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  videoActions: {
    position: 'absolute', right: Spacing.base, bottom: 110,
    alignItems: 'center', gap: Spacing.xl,
  },
  videoAction: { alignItems: 'center', gap: 4 },
  actionCount: { color: '#fff', fontSize: 12, fontWeight: '600' },
  videoBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 72,
    padding: Spacing.base, paddingBottom: Spacing.xl,
  },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  creatorAvatar: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, borderColor: Colors.purple.DEFAULT,
  },
  creatorName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  creatorLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  videoEventRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.md, alignSelf: 'flex-start',
  },
  videoEventText: { color: Colors.text.secondary, fontSize: 12 },

  videoPlaceholder: { height: H * 0.5, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },

  /* Search results */
  resultsList: { paddingBottom: 100 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.bg.surface,
  },
  thumb56: { width: 52, height: 52, borderRadius: Radius.sm, backgroundColor: Colors.bg.card },
  thumbRound: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.bg.card },
  rowInfo: { flex: 1, marginLeft: Spacing.md },
  rowTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '600' },
  rowSub: { color: Colors.text.secondary, fontSize: 13, marginTop: 2 },
  rowMuted: { color: Colors.text.muted, fontSize: 12, marginTop: 1 },
  queueBadge: {
    backgroundColor: Colors.purple.muted, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  queueText: { color: Colors.purple.light, fontSize: 12, fontWeight: '700' },
  reqBadge: {
    backgroundColor: Colors.bg.surface, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.purple.dim,
  },
  reqText: { color: Colors.text.secondary, fontSize: 12, fontWeight: '600' },

  eventCard: {
    marginHorizontal: Spacing.base, marginBottom: Spacing.md,
    height: 100, borderRadius: Radius.lg, overflow: 'hidden',
    backgroundColor: Colors.bg.card,
  },
  liveBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.purple.DEFAULT,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  liveBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  eventInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.md },
  eventName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  eventMeta: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  center: { paddingTop: Spacing['3xl'] * 2, alignItems: 'center', gap: Spacing.md },
  emptyText: { color: Colors.text.muted, fontSize: 14, textAlign: 'center' },
  footerBox: { padding: Spacing.xl, alignItems: 'center' },
  footerText: { color: Colors.text.muted, fontSize: 12 },
});
