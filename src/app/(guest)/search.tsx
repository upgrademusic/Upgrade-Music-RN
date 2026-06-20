import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSongSearch } from '@/hooks/useSongSearch';
import { Colors, Spacing, Radius } from '@/constants/theme';

function formatCents(c: number) {
  return `$${(c / 100).toFixed(0)}`;
}

export default function SearchScreen() {
  const { query, setQuery, results, loading } = useSongSearch();

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Search</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for any song..."
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

        {/* Results */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.purple.DEFAULT} size="large" />
          </View>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No songs found for "{query}"</Text>
          </View>
        )}

        {!loading && query.length < 2 && (
          <View style={styles.center}>
            <Text style={styles.hintEmoji}>🎵</Text>
            <Text style={styles.hintTitle}>Find any song</Text>
            <Text style={styles.hintText}>Search by title or artist to request at a live event</Text>
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={item => item.spotifyId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.songRow} activeOpacity={0.7}>
              <Image
                source={{ uri: item.albumArt ?? 'https://placehold.co/56x56/221845/9B7BFF?text=🎵' }}
                style={styles.albumArt}
                contentFit="cover"
              />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
                {item.album && <Text style={styles.songAlbum} numberOfLines={1}>{item.album}</Text>}
              </View>
              <View style={styles.songRight}>
                {item.inQueue ? (
                  <View style={styles.inQueueBadge}>
                    <Text style={styles.inQueueText}>{formatCents(item.totalBidCents)}</Text>
                  </View>
                ) : (
                  <View style={styles.requestBadge}>
                    <Text style={styles.requestText}>Request</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  headerRow: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { color: Colors.purple.light, fontSize: 22, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.purple.dim,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 15, paddingVertical: Spacing.md },
  clearIcon: { color: Colors.text.muted, fontSize: 16, padding: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  emptyText: { color: Colors.text.secondary, textAlign: 'center', fontSize: 15 },
  hintEmoji: { fontSize: 40, marginBottom: Spacing.md },
  hintTitle: { color: Colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  hintText: { color: Colors.text.secondary, textAlign: 'center', fontSize: 14 },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['3xl'] },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg.surface,
  },
  albumArt: { width: 52, height: 52, borderRadius: Radius.sm, backgroundColor: Colors.bg.card },
  songInfo: { flex: 1, marginLeft: Spacing.md },
  songTitle: { color: Colors.text.primary, fontSize: 15, fontWeight: '600' },
  songArtist: { color: Colors.text.secondary, fontSize: 13, marginTop: 2 },
  songAlbum: { color: Colors.text.muted, fontSize: 12, marginTop: 1 },
  songRight: { marginLeft: Spacing.md },
  inQueueBadge: {
    backgroundColor: Colors.purple.muted,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  inQueueText: { color: Colors.purple.light, fontSize: 12, fontWeight: '700' },
  requestBadge: {
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.purple.dim,
  },
  requestText: { color: Colors.text.secondary, fontSize: 12, fontWeight: '600' },
});
