import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEventQueue, type QueueTrack } from '@/hooks/useEventQueue';
import { useSongSearch, type SearchSong } from '@/hooks/useSongSearch';
import { Colors, Spacing, Radius } from '@/constants/theme';

const BID_OPTIONS = [500, 1000, 2000] as const;
const formatCents = (c: number) => `$${(c / 100).toFixed(0)}`;

export default function EventDetailScreen() {
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { queue, eventInfo, loading } = useEventQueue(eventId!);
  const { query, setQuery, results, loading: searching } = useSongSearch(eventId!);

  const [bidModal, setBidModal] = useState<{
    open: boolean;
    song: SearchSong | null;
    mode: 'request' | 'boost';
  }>({ open: false, song: null, mode: 'request' });
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');

  const openBid = useCallback((song: SearchSong) => {
    setBidModal({ open: true, song, mode: song.inQueue ? 'boost' : 'request' });
    setSelectedAmount(500);
    setCustomAmount('');
  }, []);

  const openQueueBid = useCallback((track: QueueTrack) => {
    setBidModal({
      open: true,
      song: {
        spotifyId: track.spotifyId ?? '',
        title: track.title,
        artist: track.artist,
        album: null,
        albumArt: track.albumArt,
        previewUrl: null,
        inQueue: true,
        queuePosition: 0,
        totalBidCents: track.totalBidCents,
        requestGroupId: track.groupId,
        originatorId: track.originatorId,
      },
      mode: 'boost',
    });
    setSelectedAmount(500);
    setCustomAmount('');
  }, []);

  const renderQueueItem = ({ item, index }: { item: QueueTrack; index: number }) => (
    <TouchableOpacity style={styles.queueRow} onPress={() => openQueueBid(item)} activeOpacity={0.8}>
      <Text style={styles.queuePos}>{index + 1}</Text>
      <Image
        source={{ uri: item.albumArt || 'https://placehold.co/48x48/221845/9B7BFF?text=🎵' }}
        style={styles.queueArt}
        contentFit="cover"
      />
      <View style={styles.queueInfo}>
        <Text style={styles.queueTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.queueArtist} numberOfLines={1}>{item.artist}</Text>
        <Text style={styles.queueBid}>{item.bidCount} bids</Text>
      </View>
      <View style={styles.queueRight}>
        <Text style={styles.queueAmount}>{formatCents(item.totalBidCents)}</Text>
        <Text style={styles.boostLabel}>Boost</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }: { item: SearchSong }) => (
    <TouchableOpacity style={styles.searchRow} onPress={() => openBid(item)} activeOpacity={0.8}>
      <Image
        source={{ uri: item.albumArt || 'https://placehold.co/48x48/221845/9B7BFF?text=🎵' }}
        style={styles.queueArt}
        contentFit="cover"
      />
      <View style={styles.queueInfo}>
        <Text style={styles.queueTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.queueArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <View style={[styles.requestBadge, item.inQueue && styles.boostBadge]}>
        <Text style={styles.requestBadgeText}>{item.inQueue ? `Boost ${formatCents(item.totalBidCents)}` : 'Request'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035', '#221845']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.eventName} numberOfLines={1}>{eventInfo?.name ?? 'Loading…'}</Text>
            {eventInfo?.venueName && <Text style={styles.venueName}>{eventInfo.venueName}</Text>}
          </View>
          {eventInfo?.status === 'active' && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Spotify to request a song…"
            placeholderTextColor={Colors.text.muted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {query.length >= 2 && (
          <View style={styles.searchResults}>
            {searching
              ? <ActivityIndicator color={Colors.purple.DEFAULT} style={{ padding: Spacing.xl }} />
              : <FlatList data={results} keyExtractor={i => i.spotifyId} renderItem={renderSearchResult} keyboardShouldPersistTaps="handled" />
            }
          </View>
        )}

        {query.length < 2 && (
          <>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle2}>Live Queue</Text>
              <Text style={styles.queueCount}>{queue.length} songs</Text>
            </View>
            {loading
              ? <ActivityIndicator color={Colors.purple.DEFAULT} style={{ marginTop: 40 }} />
              : queue.length === 0
                ? (
                  <View style={styles.emptyQueue}>
                    <Text style={styles.emptyQueueEmoji}>🎶</Text>
                    <Text style={styles.emptyQueueText}>Queue is empty</Text>
                    <Text style={styles.emptyQueueSub}>Search above to request the first song!</Text>
                  </View>
                )
                : <FlatList data={queue} keyExtractor={i => i.groupId} renderItem={renderQueueItem} contentContainerStyle={{ paddingBottom: 100 }} />
            }
          </>
        )}

        <Modal visible={bidModal.open} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>
                {bidModal.mode === 'boost' ? '🚀 Boost Song' : '🎵 Request Song'}
              </Text>
              {bidModal.song && (
                <View style={styles.modalSongRow}>
                  <Image source={{ uri: bidModal.song.albumArt ?? '' }} style={styles.modalArt} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalSongTitle} numberOfLines={1}>{bidModal.song.title}</Text>
                    <Text style={styles.modalSongArtist} numberOfLines={1}>{bidModal.song.artist}</Text>
                  </View>
                </View>
              )}
              <Text style={styles.modalLabel}>Choose your bid</Text>
              <View style={styles.bidOptions}>
                {BID_OPTIONS.map(amt => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.bidOption, selectedAmount === amt && !customAmount && styles.bidOptionSelected]}
                    onPress={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                  >
                    <Text style={[styles.bidOptionText, selectedAmount === amt && !customAmount && styles.bidOptionTextSelected]}>
                      {formatCents(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.customInput}
                placeholder="Custom amount (e.g. 25)"
                placeholderTextColor={Colors.text.muted}
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="decimal-pad"
              />
              <View style={styles.webNote}>
                <Text style={styles.webNoteText}>💳 Payments require the mobile app</Text>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setBidModal(m => ({ ...m, open: false }))}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.confirmBtn, styles.confirmBtnDisabled]} disabled>
                  <Text style={styles.confirmBtnText}>
                    Pay {formatCents(customAmount ? Math.max(1, parseFloat(customAmount || '0')) * 100 : selectedAmount)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backArrow: { color: Colors.purple.DEFAULT, fontSize: 22, fontWeight: '700' },
  headerInfo: { flex: 1 },
  eventName: { color: Colors.text.primary, fontSize: 17, fontWeight: '700' },
  venueName: { color: Colors.text.secondary, fontSize: 13 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 100, paddingHorizontal: Spacing.sm, paddingVertical: 3, gap: 4, borderWidth: 1, borderColor: '#EF4444' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  liveText: { color: '#EF4444', fontSize: 11, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.surface, borderRadius: Radius.lg, marginHorizontal: Spacing.base, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.purple.dim },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 14, paddingVertical: Spacing.md },
  clearIcon: { color: Colors.text.muted, padding: Spacing.sm },
  searchResults: { backgroundColor: Colors.bg.surface, borderRadius: Radius.lg, marginHorizontal: Spacing.base, maxHeight: 340, borderWidth: 1, borderColor: Colors.purple.dim },
  queueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  queueTitle2: { color: Colors.text.primary, fontSize: 16, fontWeight: '700' },
  queueCount: { color: Colors.text.muted, fontSize: 13 },
  queueRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.bg.surface, gap: Spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.bg.card },
  queuePos: { color: Colors.text.muted, fontSize: 13, width: 20, textAlign: 'center' },
  queueArt: { width: 48, height: 48, borderRadius: Radius.sm, backgroundColor: Colors.bg.card },
  queueInfo: { flex: 1 },
  queueTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '600' },
  queueArtist: { color: Colors.text.secondary, fontSize: 12, marginTop: 2 },
  queueBid: { color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  queueRight: { alignItems: 'flex-end', gap: 2 },
  queueAmount: { color: Colors.purple.light, fontSize: 15, fontWeight: '700' },
  boostLabel: { color: Colors.text.muted, fontSize: 11 },
  requestBadge: { backgroundColor: Colors.bg.surface, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4, borderWidth: 1, borderColor: Colors.purple.dim },
  boostBadge: { backgroundColor: 'rgba(155,123,255,0.15)', borderColor: Colors.purple.DEFAULT },
  requestBadgeText: { color: Colors.purple.light, fontSize: 12, fontWeight: '600' },
  emptyQueue: { alignItems: 'center', paddingTop: 60 },
  emptyQueueEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyQueueText: { color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  emptyQueueSub: { color: Colors.text.secondary, textAlign: 'center', fontSize: 14 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: { backgroundColor: Colors.bg.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing['2xl'], paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.purple.dim, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.xl },
  modalTitle: { color: Colors.text.primary, fontSize: 20, fontWeight: '800', marginBottom: Spacing.base },
  modalSongRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  modalArt: { width: 56, height: 56, borderRadius: Radius.md, backgroundColor: Colors.bg.card },
  modalSongTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '700' },
  modalSongArtist: { color: Colors.text.secondary, fontSize: 13, marginTop: 2 },
  modalLabel: { color: Colors.text.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.md },
  bidOptions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  bidOption: { flex: 1, backgroundColor: Colors.bg.card, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.purple.dim },
  bidOptionSelected: { backgroundColor: Colors.purple.muted, borderColor: Colors.purple.DEFAULT },
  bidOptionText: { color: Colors.text.secondary, fontSize: 16, fontWeight: '700' },
  bidOptionTextSelected: { color: Colors.white },
  customInput: { backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.purple.dim, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, color: Colors.text.primary, fontSize: 15, marginBottom: Spacing.md },
  webNote: { backgroundColor: 'rgba(155,123,255,0.1)', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  webNoteText: { color: Colors.purple.light, fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  cancelBtn: { flex: 1, backgroundColor: Colors.bg.card, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  cancelBtnText: { color: Colors.text.secondary, fontWeight: '600', fontSize: 15 },
  confirmBtn: { flex: 2, backgroundColor: Colors.purple.DEFAULT, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
