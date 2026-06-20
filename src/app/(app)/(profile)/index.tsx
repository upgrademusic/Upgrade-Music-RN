import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Colors, Spacing, Radius } from '@/constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  is_verified: boolean;
  spotify_connected: boolean;
  apple_music_connected: boolean;
};

type GuestStats = {
  nights_out: number;
  songs_requested: number;
  total_spent_cents: number;
};

type ActivityItem = {
  id: string;
  amount_cents: number;
  created_at: string;
  song: { title: string; artist: string; album_art_url: string | null } | null;
  event: { name: string } | null;
};

type DJEvent = {
  id: string;
  name: string;
  starts_at: string;
  status: string;
  total_bids_cents: number;
};

type DJStats = {
  events_hosted: number;
  total_revenue_cents: number;
  total_requests: number;
};

type VenueEvent = {
  id: string;
  name: string;
  starts_at: string;
  status: string;
  total_bids_cents: number;
};

type VenueStats = {
  events_count: number;
  total_revenue_cents: number;
};

type Mode = 'guest' | 'dj' | 'venue';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCents(cents: number) {
  if (cents >= 100000) return `$${(cents / 100).toFixed(0)}`;
  return `$${(cents / 100).toFixed(0)}`;
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusColor(status: string) {
  switch (status) {
    case 'active': return Colors.success;
    case 'completed': return Colors.text.muted;
    case 'draft': return Colors.warning;
    default: return Colors.text.muted;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={15} color={Colors.purple.light} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function StatsCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <View style={styles.activityCard}>
      <Image
        source={{ uri: item.song?.album_art_url ?? 'https://placehold.co/48x48/221845/9B7BFF?text=♪' }}
        style={styles.activityArt}
        contentFit="cover"
      />
      <View style={styles.activityInfo}>
        <Text style={styles.activitySong} numberOfLines={1}>
          {item.song?.title ?? 'Unknown song'}
        </Text>
        <Text style={styles.activityMeta} numberOfLines={1}>
          {item.song?.artist ?? ''}{item.event?.name ? ` · ${item.event.name}` : ''}
        </Text>
        <Text style={styles.activityTime}>
          {formatCents(item.amount_cents)} · {timeAgo(item.created_at)}
        </Text>
      </View>
    </View>
  );
}

function EventCard({ event, showRevenue = true }: { event: DJEvent | VenueEvent; showRevenue?: boolean }) {
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventIconWrap}>
        <Ionicons name="musical-notes" size={22} color={Colors.purple.light} />
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventName} numberOfLines={1}>{event.name}</Text>
        <Text style={styles.eventDate}>{formatEventDate(event.starts_at)}</Text>
        <View style={styles.eventMeta}>
          <View style={[styles.statusDot, { backgroundColor: statusColor(event.status) }]} />
          <Text style={styles.eventStatus}>{event.status}</Text>
          {showRevenue && event.total_bids_cents > 0 && (
            <Text style={styles.eventRevenue}> · {formatCents(event.total_bids_cents)} earned</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function MenuItem({
  icon, label, onPress, danger,
}: { icon: string; label: string; onPress?: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconWrap, danger && styles.menuIconDanger]}>
        <Ionicons name={icon as any} size={18} color={danger ? Colors.error : Colors.purple.light} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />}
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { session, isDJ, isVenue, signOut } = useAuthStore();
  const router = useRouter();
  const userId = session?.user?.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [djStats, setDJStats] = useState<DJStats | null>(null);
  const [djEvents, setDJEvents] = useState<DJEvent[]>([]);
  const [venueStats, setVenueStats] = useState<VenueStats | null>(null);
  const [venueEvents, setVenueEvents] = useState<VenueEvent[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [mode, setMode] = useState<Mode>('guest');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!userId) return;

    // Profile
    const { data: p } = await supabase
      .from('profiles')
      .select('display_name, username, avatar_url, bio, city, is_verified, spotify_connected, apple_music_connected')
      .eq('id', userId)
      .single();
    setProfile(p as Profile | null);

    // Follower counts
    const db = supabase as any;
    const [{ count: fCount }, { count: fgCount }] = await Promise.all([
      db.from('user_followers').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      db.from('user_followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ]);
    setFollowerCount(fCount ?? 0);
    setFollowingCount(fgCount ?? 0);

    // Guest stats + activity
    const { data: requests } = await supabase
      .from('song_requests')
      .select('id, amount_cents, created_at, event_id, song_id')
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });

    if (requests) {
      const uniqueEvents = new Set(requests.map(r => r.event_id)).size;
      const totalCents = requests.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
      setGuestStats({ nights_out: uniqueEvents, songs_requested: requests.length, total_spent_cents: totalCents });

      // Fetch song + event info for recent activity (last 10)
      const recent = requests.slice(0, 10);
      if (recent.length > 0) {
        const songIds = [...new Set(recent.map(r => r.song_id).filter(Boolean))];
        const eventIds = [...new Set(recent.map(r => r.event_id).filter(Boolean))];
        const [{ data: songs }, { data: events }] = await Promise.all([
          supabase.from('songs').select('id, title, artist, album_art_url').in('id', songIds),
          supabase.from('events').select('id, name').in('id', eventIds),
        ]);
        const songMap = Object.fromEntries((songs ?? []).map(s => [s.id, s]));
        const eventMap = Object.fromEntries((events ?? []).map(e => [e.id, e]));
        setActivity(recent.map(r => ({
          id: r.id,
          amount_cents: r.amount_cents ?? 0,
          created_at: r.created_at,
          song: r.song_id ? (songMap[r.song_id] ?? null) : null,
          event: r.event_id ? (eventMap[r.event_id] ?? null) : null,
        })));
      }
    }

    // DJ data
    if (isDJ) {
      const { data: myEvents } = await supabase
        .from('events')
        .select('id, name, starts_at, status')
        .eq('dj_id', userId)
        .order('starts_at', { ascending: false })
        .limit(10);

      if (myEvents && myEvents.length > 0) {
        const eIds = myEvents.map(e => e.id);
        const { data: groups } = await supabase
          .from('request_groups')
          .select('event_id, total_amount_cents')
          .in('event_id', eIds);

        const revenueByEvent: Record<string, number> = {};
        (groups ?? []).forEach(g => {
          revenueByEvent[g.event_id] = (revenueByEvent[g.event_id] ?? 0) + (g.total_amount_cents ?? 0);
        });

        const enrichedEvents: DJEvent[] = myEvents.map(e => ({
          id: e.id,
          name: e.name,
          starts_at: e.starts_at ?? '',
          status: e.status,
          total_bids_cents: revenueByEvent[e.id] ?? 0,
        }));

        setDJEvents(enrichedEvents);
        const totalRevenue = enrichedEvents.reduce((s, e) => s + e.total_bids_cents, 0);
        const totalRequests = (groups ?? []).reduce((s, g) => s + 1, 0);
        setDJStats({
          events_hosted: myEvents.length,
          total_revenue_cents: totalRevenue,
          total_requests: totalRequests,
        });
      } else {
        setDJStats({ events_hosted: 0, total_revenue_cents: 0, total_requests: 0 });
      }

      setMode('dj');
    }

    // Venue data
    if (isVenue) {
      const { data: myVenues } = await supabase
        .from('venues')
        .select('id')
        .eq('owner_id', userId);

      if (myVenues && myVenues.length > 0) {
        const vIds = myVenues.map(v => v.id);
        const { data: vEvents } = await supabase
          .from('events')
          .select('id, name, starts_at, status')
          .in('venue_id', vIds)
          .order('starts_at', { ascending: false })
          .limit(10);

        if (vEvents && vEvents.length > 0) {
          const eIds = vEvents.map(e => e.id);
          const { data: groups } = await supabase
            .from('request_groups')
            .select('event_id, total_amount_cents')
            .in('event_id', eIds);

          const revenueByEvent: Record<string, number> = {};
          (groups ?? []).forEach(g => {
            revenueByEvent[g.event_id] = (revenueByEvent[g.event_id] ?? 0) + (g.total_amount_cents ?? 0);
          });

          const enriched: VenueEvent[] = vEvents.map(e => ({
            id: e.id,
            name: e.name,
            starts_at: e.starts_at ?? '',
            status: e.status,
            total_bids_cents: revenueByEvent[e.id] ?? 0,
          }));

          setVenueEvents(enriched);
          const totalRevenue = enriched.reduce((s, e) => s + e.total_bids_cents, 0);
          setVenueStats({ events_count: vEvents.length, total_revenue_cents: totalRevenue });
        } else {
          setVenueStats({ events_count: 0, total_revenue_cents: 0 });
        }
      }

      if (!isDJ) setMode('venue');
    }
  }, [userId, isDJ, isVenue]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const openFollowers = async () => {
    const { data } = await (supabase as any)
      .from('user_followers')
      .select('follower:follower_id(id, display_name, avatar_url, username)')
      .eq('following_id', userId!)
      .limit(50);
    setFollowers((data ?? []).map((r: any) => r.follower));
    setShowFollowersModal(true);
  };

  const openFollowing = async () => {
    const { data } = await (supabase as any)
      .from('user_followers')
      .select('following:following_id(id, display_name, avatar_url, username)')
      .eq('follower_id', userId!)
      .limit(50);
    setFollowing((data ?? []).map((r: any) => r.following));
    setShowFollowingModal(true);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <ActivityIndicator color={Colors.purple.DEFAULT} size="large" style={{ marginTop: 120 }} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const displayName = profile?.display_name ?? session?.user?.email?.split('@')[0] ?? 'You';
  const showTabs = isDJ || isVenue;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.purple.DEFAULT} />}
        >

          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity activeOpacity={0.85}>
              <View style={styles.avatarWrap}>
                <Image
                  source={{ uri: profile?.avatar_url ?? `https://placehold.co/100x100/221845/9B7BFF?text=${displayName[0].toUpperCase()}` }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="camera" size={12} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{displayName}</Text>
              {profile?.is_verified && (
                <Ionicons name="checkmark-circle" size={18} color={Colors.purple.light} style={{ marginLeft: 6 }} />
              )}
            </View>

            {profile?.username && (
              <Text style={styles.username}>@{profile.username}</Text>
            )}

            {profile?.city && (
              <View style={styles.cityRow}>
                <Ionicons name="location-outline" size={13} color={Colors.text.muted} />
                <Text style={styles.city}>{profile.city}</Text>
              </View>
            )}

            {profile?.bio && (
              <Text style={styles.bio}>{profile.bio}</Text>
            )}

            {/* Role badge */}
            {(isDJ || isVenue) && (
              <View style={styles.roleBadge}>
                <Ionicons
                  name={isDJ ? 'headset' : 'business'}
                  size={13}
                  color={Colors.purple.light}
                />
                <Text style={styles.roleText}>{isDJ ? 'DJ' : 'Venue'}</Text>
              </View>
            )}
          </View>

          {/* ── Follower counts ── */}
          <View style={styles.followRow}>
            <TouchableOpacity style={styles.followItem} onPress={openFollowers}>
              <Text style={styles.followCount}>{followerCount}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.followDivider} />
            <TouchableOpacity style={styles.followItem} onPress={openFollowing}>
              <Text style={styles.followCount}>{followingCount}</Text>
              <Text style={styles.followLabel}>Following</Text>
            </TouchableOpacity>
            <View style={styles.followDivider} />
            <View style={styles.followItem}>
              <Text style={styles.followCount}>{guestStats?.nights_out ?? 0}</Text>
              <Text style={styles.followLabel}>Nights Out</Text>
            </View>
          </View>

          {/* ── Mode tabs ── */}
          {showTabs && (
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, mode === 'guest' && styles.tabActive]}
                onPress={() => setMode('guest')}
              >
                <Ionicons name="person-outline" size={15} color={mode === 'guest' ? Colors.purple.light : Colors.text.muted} />
                <Text style={[styles.tabText, mode === 'guest' && styles.tabTextActive]}>Guest</Text>
              </TouchableOpacity>
              {isDJ && (
                <TouchableOpacity
                  style={[styles.tab, mode === 'dj' && styles.tabActive]}
                  onPress={() => setMode('dj')}
                >
                  <Ionicons name="headset-outline" size={15} color={mode === 'dj' ? Colors.purple.light : Colors.text.muted} />
                  <Text style={[styles.tabText, mode === 'dj' && styles.tabTextActive]}>DJ</Text>
                </TouchableOpacity>
              )}
              {isVenue && (
                <TouchableOpacity
                  style={[styles.tab, mode === 'venue' && styles.tabActive]}
                  onPress={() => setMode('venue')}
                >
                  <Ionicons name="business-outline" size={15} color={mode === 'venue' ? Colors.purple.light : Colors.text.muted} />
                  <Text style={[styles.tabText, mode === 'venue' && styles.tabTextActive]}>Venue</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ══════════════════════════════════════════════════════
              GUEST MODE
          ══════════════════════════════════════════════════════ */}
          {mode === 'guest' && (
            <View>
              {/* Stats */}
              <View style={styles.statsCard}>
                <StatsCard value={String(guestStats?.songs_requested ?? 0)} label="Songs Bid" />
                <View style={styles.statDivider} />
                <StatsCard value={formatCents(guestStats?.total_spent_cents ?? 0)} label="Total Spent" />
                <View style={styles.statDivider} />
                <StatsCard
                  value={profile?.spotify_connected ? '🎵' : '—'}
                  label="Spotify"
                />
              </View>

              {/* Activity feed */}
              <SectionHeader title="Recent Activity" icon="time-outline" />
              {activity.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="musical-notes-outline" size={32} color={Colors.text.muted} />
                  <Text style={styles.emptyText}>No song bids yet</Text>
                  <Text style={styles.emptySub}>Attend an event and start bidding on songs!</Text>
                </View>
              ) : (
                <View style={styles.listCard}>
                  {activity.map((item, i) => (
                    <View key={item.id}>
                      <ActivityCard item={item} />
                      {i < activity.length - 1 && <View style={styles.separator} />}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ══════════════════════════════════════════════════════
              DJ MODE
          ══════════════════════════════════════════════════════ */}
          {mode === 'dj' && (
            <View>
              {/* DJ Stats */}
              <View style={styles.statsCard}>
                <StatsCard value={String(djStats?.events_hosted ?? 0)} label="Events" />
                <View style={styles.statDivider} />
                <StatsCard value={formatCents(djStats?.total_revenue_cents ?? 0)} label="Revenue" />
                <View style={styles.statDivider} />
                <StatsCard value={String(djStats?.total_requests ?? 0)} label="Requests" />
              </View>

              {/* Earnings summary */}
              {(djStats?.total_revenue_cents ?? 0) > 0 && (
                <View style={styles.earningsCard}>
                  <View style={styles.earningsLeft}>
                    <Ionicons name="wallet-outline" size={20} color={Colors.success} />
                    <View style={{ marginLeft: Spacing.sm }}>
                      <Text style={styles.earningsLabel}>Your DJ cut (50%)</Text>
                      <Text style={styles.earningsValue}>
                        {formatCents(Math.round((djStats?.total_revenue_cents ?? 0) * 0.5))}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.earningsBadge}>
                    <Text style={styles.earningsBadgeText}>Lifetime</Text>
                  </View>
                </View>
              )}

              {/* My Events */}
              <SectionHeader title="My Events" icon="calendar-outline" />
              {djEvents.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="calendar-outline" size={32} color={Colors.text.muted} />
                  <Text style={styles.emptyText}>No events yet</Text>
                  <Text style={styles.emptySub}>Create your first event from the + tab</Text>
                </View>
              ) : (
                <View style={styles.listCard}>
                  {djEvents.map((ev, i) => (
                    <View key={ev.id}>
                      <EventCard event={ev} />
                      {i < djEvents.length - 1 && <View style={styles.separator} />}
                    </View>
                  ))}
                </View>
              )}

              {/* DJ Tools menu */}
              <SectionHeader title="DJ Tools" icon="options-outline" />
              <View style={styles.menuCard}>
                <MenuItem icon="add-circle-outline" label="Create Event" onPress={() => router.push('/(app)/(event)/create-event' as any)} />
                <MenuItem icon="bar-chart-outline" label="Analytics" />
                <MenuItem icon="cash-outline" label="Earnings & Payouts" />
              </View>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════
              VENUE MODE
          ══════════════════════════════════════════════════════ */}
          {mode === 'venue' && (
            <View>
              {/* Venue Stats */}
              <View style={styles.statsCard}>
                <StatsCard value={String(venueStats?.events_count ?? 0)} label="Events" />
                <View style={styles.statDivider} />
                <StatsCard value={formatCents(venueStats?.total_revenue_cents ?? 0)} label="Revenue" />
                <View style={styles.statDivider} />
                <StatsCard
                  value={formatCents(Math.round((venueStats?.total_revenue_cents ?? 0) * 0.25))}
                  label="Venue Cut"
                />
              </View>

              {/* Venue Events */}
              <SectionHeader title="Events at My Venue" icon="calendar-outline" />
              {venueEvents.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="business-outline" size={32} color={Colors.text.muted} />
                  <Text style={styles.emptyText}>No events yet</Text>
                  <Text style={styles.emptySub}>Events hosted at your venue will appear here</Text>
                </View>
              ) : (
                <View style={styles.listCard}>
                  {venueEvents.map((ev, i) => (
                    <View key={ev.id}>
                      <EventCard event={ev} />
                      {i < venueEvents.length - 1 && <View style={styles.separator} />}
                    </View>
                  ))}
                </View>
              )}

              {/* Venue Tools */}
              <SectionHeader title="Venue Tools" icon="options-outline" />
              <View style={styles.menuCard}>
                <MenuItem icon="bar-chart-outline" label="Venue Analytics" />
                <MenuItem icon="people-outline" label="Team Members" />
                <MenuItem icon="cash-outline" label="Payout Settings" />
              </View>
            </View>
          )}

          {/* ── Footer menu (all modes) ── */}
          <SectionHeader title="Account" icon="person-circle-outline" />
          <View style={styles.menuCard}>
            <MenuItem icon="wallet-outline" label="Wallet & Credits" />
            <MenuItem icon="notifications-outline" label="Notification Settings" />
            <MenuItem icon="card-outline" label="Payment Methods" />
            <MenuItem icon="shield-outline" label="Preferences & Privacy" />
            <MenuItem icon="help-circle-outline" label="Help & Support" />
          </View>

          <View style={styles.menuCard}>
            <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleSignOut} danger />
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* ── Followers Modal ── */}
        <FollowModal
          visible={showFollowersModal}
          title="Followers"
          users={followers}
          onClose={() => setShowFollowersModal(false)}
        />
        <FollowModal
          visible={showFollowingModal}
          title="Following"
          users={following}
          onClose={() => setShowFollowingModal(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Follow Modal ─────────────────────────────────────────────────────────────

function FollowModal({
  visible, title, users, onClose,
}: { visible: boolean; title: string; users: any[]; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modal.container}>
        <View style={modal.header}>
          <Text style={modal.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        {users.length === 0 ? (
          <View style={modal.empty}>
            <Ionicons name="people-outline" size={40} color={Colors.text.muted} />
            <Text style={modal.emptyText}>No {title.toLowerCase()} yet</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={u => u?.id ?? Math.random().toString()}
            renderItem={({ item }) => (
              <View style={modal.row}>
                <Image
                  source={{ uri: item?.avatar_url ?? `https://placehold.co/40x40/221845/9B7BFF?text=${(item?.display_name?.[0] ?? '?').toUpperCase()}` }}
                  style={modal.avatar}
                  contentFit="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={modal.name}>{item?.display_name ?? 'Unknown'}</Text>
                  {item?.username && <Text style={modal.username}>@{item.username}</Text>}
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    gap: 6,
  },
  avatarWrap: { position: 'relative', marginBottom: Spacing.sm },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: Colors.purple.DEFAULT,
  },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.purple.DEFAULT,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.bg.deep,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  displayName: { color: Colors.text.primary, fontSize: 22, fontWeight: '800' },
  username: { color: Colors.text.muted, fontSize: 14 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  city: { color: Colors.text.muted, fontSize: 13 },
  bio: { color: Colors.text.secondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(155,123,255,0.12)',
    borderWidth: 1, borderColor: Colors.purple.dim,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
  },
  roleText: { color: Colors.purple.light, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  // Follow row
  followRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.surface,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  followItem: { flex: 1, alignItems: 'center' },
  followCount: { color: Colors.purple.light, fontSize: 20, fontWeight: '800' },
  followLabel: { color: Colors.text.muted, fontSize: 12, marginTop: 2 },
  followDivider: { width: 1, backgroundColor: Colors.purple.dim },

  // Mode tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: Radius.md,
  },
  tabActive: { backgroundColor: Colors.bg.card },
  tabText: { color: Colors.text.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: Colors.purple.light },

  // Section headers
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  sectionTitle: {
    color: Colors.text.muted, fontSize: 12, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },

  // Stats card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.surface,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing.base,
    paddingVertical: Spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.purple.light, fontSize: 20, fontWeight: '800' },
  statLabel: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.purple.dim },

  // Earnings card
  earningsCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)',
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    padding: Spacing.base,
  },
  earningsLeft: { flexDirection: 'row', alignItems: 'center' },
  earningsLabel: { color: Colors.text.muted, fontSize: 12 },
  earningsValue: { color: Colors.success, fontSize: 18, fontWeight: '800' },
  earningsBadge: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  earningsBadgeText: { color: Colors.success, fontSize: 11, fontWeight: '700' },

  // Generic list card
  listCard: {
    backgroundColor: Colors.bg.surface,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  separator: { height: 1, backgroundColor: Colors.bg.card, marginLeft: 70 },

  // Activity
  activityCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  activityArt: { width: 48, height: 48, borderRadius: Radius.sm },
  activityInfo: { flex: 1 },
  activitySong: { color: Colors.text.primary, fontSize: 14, fontWeight: '600' },
  activityMeta: { color: Colors.text.muted, fontSize: 12, marginTop: 2 },
  activityTime: { color: Colors.purple.light, fontSize: 11, marginTop: 3 },

  // Event card
  eventCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  eventIconWrap: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: Colors.bg.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.purple.dim,
  },
  eventInfo: { flex: 1 },
  eventName: { color: Colors.text.primary, fontSize: 14, fontWeight: '700' },
  eventDate: { color: Colors.text.muted, fontSize: 12, marginTop: 2 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  eventStatus: { color: Colors.text.muted, fontSize: 11, textTransform: 'capitalize' },
  eventRevenue: { color: Colors.success, fontSize: 11 },

  // Menu card
  menuCard: {
    backgroundColor: Colors.bg.surface,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.base,
    borderBottomWidth: 1, borderBottomColor: Colors.bg.card,
    gap: Spacing.md,
  },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: Radius.sm,
    backgroundColor: 'rgba(155,123,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: 'rgba(248,113,113,0.1)' },
  menuLabel: { flex: 1, color: Colors.text.primary, fontSize: 15 },

  // Empty state
  emptyCard: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bg.surface,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  emptyText: { color: Colors.text.primary, fontSize: 16, fontWeight: '700' },
  emptySub: { color: Colors.text.muted, fontSize: 13, textAlign: 'center', paddingHorizontal: Spacing.xl },
});

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.base },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.base,
    borderBottomWidth: 1, borderBottomColor: Colors.bg.surface,
  },
  title: { color: Colors.text.primary, fontSize: 17, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyText: { color: Colors.text.muted, fontSize: 15 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.bg.surface,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  name: { color: Colors.text.primary, fontSize: 15, fontWeight: '600' },
  username: { color: Colors.text.muted, fontSize: 13, marginTop: 1 },
});
