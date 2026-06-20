import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';

const ACTIONS = [
  {
    route: 'create-event',
    icon: 'calendar' as const,
    label: 'Create Event',
    sub: 'Host a new party or live set',
    gradient: ['#4A1D96', '#7C3AED'] as [string, string],
    accent: '#A78BFA',
  },
  {
    route: 'create-playlist',
    icon: 'musical-notes' as const,
    label: 'New Playlist',
    sub: 'Curate tracks for your next set',
    gradient: ['#1E3A5F', '#2563EB'] as [string, string],
    accent: '#93C5FD',
  },
  {
    route: 'upload-media',
    params: { type: 'video' },
    icon: 'videocam' as const,
    label: 'Upload Video',
    sub: 'Share a short clip from the night',
    gradient: ['#7C1D3C', '#DB2777'] as [string, string],
    accent: '#F9A8D4',
  },
  {
    route: 'upload-media',
    params: { type: 'photo' },
    icon: 'camera' as const,
    label: 'Upload Photo',
    sub: 'Share a moment with the community',
    gradient: ['#1C3A2A', '#059669'] as [string, string],
    accent: '#6EE7B7',
  },
] as const;

export default function CreateHub() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.plusIcon}>
              <Ionicons name="add" size={36} color={Colors.purple.light} />
            </View>
            <Text style={styles.title}>Create</Text>
            <Text style={styles.sub}>What would you like to share?</Text>
          </View>

          <View style={styles.cards}>
            {ACTIONS.map(action => (
              <TouchableOpacity
                key={action.route + (action as any).params?.type}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() =>
                  router.push({
                    pathname: `/(app)/(event)/${action.route}` as any,
                    params: (action as any).params,
                  })
                }
              >
                <LinearGradient
                  colors={action.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name={action.icon} size={30} color={action.accent} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardLabel}>{action.label}</Text>
                    <Text style={[styles.cardSub, { color: action.accent + 'BB' }]}>{action.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['3xl'] },

  header: { paddingTop: Spacing['2xl'], paddingBottom: Spacing['2xl'], alignItems: 'center', gap: Spacing.sm },
  plusIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.bg.surface,
    borderWidth: 2, borderColor: Colors.purple.dim,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { fontSize: 28, fontWeight: '900', color: Colors.purple.light, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: Colors.text.secondary },

  cards: { gap: Spacing.md },
  card: { borderRadius: Radius.xl, overflow: 'hidden' },
  cardGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, gap: Spacing.base,
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 3 },
  cardSub: { fontSize: 13 },
});
