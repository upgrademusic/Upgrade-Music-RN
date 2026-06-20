import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { LiveEvent } from '@/hooks/useHomeEvents';
import { Colors, Spacing, Radius } from '@/constants/theme';

const CARD_WIDTH = Dimensions.get('window').width * 0.72;

interface Props {
  event: LiveEvent;
  variant?: 'story' | 'card';
}

export function EventCard({ event, variant = 'story' }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={variant === 'story' ? styles.story : styles.card}
      onPress={() => router.push({ pathname: '/(app)/(event)/[id]', params: { id: event.id } } as any)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: event.cover_image_url ?? 'https://placehold.co/400x300/1A1035/9B7BFF?text=Event' }}
        style={variant === 'story' ? styles.storyImg : styles.cardImg}
        contentFit="cover"
      />
      {event.status === 'active' && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}
      <View style={styles.overlay}>
        <Text style={styles.name} numberOfLines={2}>{event.name}</Text>
        {event.venue_name && (
          <Text style={styles.venue} numberOfLines={1}>{event.venue_name}</Text>
        )}
        {event.dj_name && (
          <Text style={styles.dj} numberOfLines={1}>DJ {event.dj_name}</Text>
        )}
        {variant === 'card' && event.starts_at && (
          <Text style={styles.date}>
            {new Date(event.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  story: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.bg.card,
    marginRight: Spacing.md,
  },
  storyImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.bg.card,
    marginBottom: Spacing.md,
  },
  cardImg: { width: '100%', height: 160 },
  liveBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.white },
  liveText: { color: Colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingTop: Spacing['2xl'],
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  name: { color: Colors.white, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  venue: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 1 },
  dj: { color: Colors.purple.light, fontSize: 12, fontWeight: '600' },
  date: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
});
