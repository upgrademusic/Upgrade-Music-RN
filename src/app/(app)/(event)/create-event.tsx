import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Colors, Spacing, Radius } from '@/constants/theme';

const GENRES = ['Pop', 'Hip-Hop', 'Electronic', 'House', 'Techno', 'R&B', 'Latin', 'Afrobeats', 'Reggaeton', 'Dancehall', 'Funk', 'Soul'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function CreateEventScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [minBid, setMinBid] = useState('1.00');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allowExplicit, setAllowExplicit] = useState(false);
  const [allowPreBids, setAllowPreBids] = useState(true);
  const [saving, setSaving] = useState(false);

  function toggleGenre(g: string) {
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
  }

  async function handleCreate() {
    if (!name.trim()) { Alert.alert('Required', 'Event name is required.'); return; }
    if (!date.trim()) { Alert.alert('Required', 'Date is required (DD/MM/YYYY).'); return; }
    if (!time.trim()) { Alert.alert('Required', 'Time is required (HH:MM).'); return; }

    // Parse date/time → ISO
    const [day, month, year] = date.split('/').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    if (!day || !month || !year || hour === undefined || minute === undefined) {
      Alert.alert('Format error', 'Use DD/MM/YYYY for date and HH:MM for time.');
      return;
    }
    const startsAt = new Date(year, month - 1, day, hour, minute).toISOString();
    const minBidCents = Math.round(parseFloat(minBid) * 100);
    if (isNaN(minBidCents) || minBidCents < 100) {
      Alert.alert('Min bid', 'Minimum bid must be at least $1.00.');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          name: name.trim(),
          dj_id: user?.id ?? null,
          starts_at: startsAt,
          status: 'draft',
          min_bid_cents: minBidCents,
          genre_preferences: selectedGenres.length > 0 ? selectedGenres : null,
          allow_explicit: allowExplicit,
          allow_pre_event_bids: allowPreBids,
        })
        .select('id')
        .single();

      if (error) throw error;

      Alert.alert('Event created!', `"${name}" was saved as a draft.`, [
        { text: 'View event', onPress: () => router.replace({ pathname: '/(app)/(event)/[id]', params: { id: data.id } } as any) },
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not create event.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Event</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
            {saving
              ? <ActivityIndicator color={Colors.purple.light} size="small" />
              : <Text style={styles.saveBtnText}>Create</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <Field label="Event name *">
            <TextInput
              style={styles.input}
              placeholder="e.g. Neon Nights at Zurich"
              placeholderTextColor={Colors.text.muted}
              value={name}
              onChangeText={setName}
            />
          </Field>

          <Field label="Venue name">
            <TextInput
              style={styles.input}
              placeholder="e.g. Hive Club"
              placeholderTextColor={Colors.text.muted}
              value={venueName}
              onChangeText={setVenueName}
            />
          </Field>

          <Field label="City">
            <TextInput
              style={styles.input}
              placeholder="e.g. Zurich"
              placeholderTextColor={Colors.text.muted}
              value={city}
              onChangeText={setCity}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Date *">
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={Colors.text.muted}
                  value={date}
                  onChangeText={setDate}
                  keyboardType="numbers-and-punctuation"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Time *">
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.text.muted}
                  value={time}
                  onChangeText={setTime}
                  keyboardType="numbers-and-punctuation"
                />
              </Field>
            </View>
          </View>

          <Field label="Minimum bid (USD)">
            <View style={styles.prefixInput}>
              <Text style={styles.prefix}>$</Text>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="1.00"
                placeholderTextColor={Colors.text.muted}
                value={minBid}
                onChangeText={setMinBid}
                keyboardType="decimal-pad"
              />
            </View>
          </Field>

          <Field label="Genre preferences">
            <View style={styles.chips}>
              {GENRES.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, selectedGenres.includes(g) && styles.chipActive]}
                  onPress={() => toggleGenre(g)}
                >
                  <Text style={[styles.chipText, selectedGenres.includes(g) && styles.chipTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Allow explicit songs</Text>
              <Text style={styles.toggleSub}>Guests can request explicit tracks</Text>
            </View>
            <Switch
              value={allowExplicit}
              onValueChange={setAllowExplicit}
              trackColor={{ false: Colors.bg.card, true: Colors.purple.muted }}
              thumbColor={allowExplicit ? Colors.purple.light : Colors.text.muted}
            />
          </View>

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Allow pre-event bids</Text>
              <Text style={styles.toggleSub}>Guests can bid before the event starts</Text>
            </View>
            <Switch
              value={allowPreBids}
              onValueChange={setAllowPreBids}
              trackColor={{ false: Colors.bg.card, true: Colors.purple.muted }}
              thumbColor={allowPreBids ? Colors.purple.light : Colors.text.muted}
            />
          </View>

          <View style={styles.draftNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.text.muted} />
            <Text style={styles.draftNoteText}>Event is saved as draft — publish it from your profile when ready.</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.bg.surface,
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  saveBtn: {
    backgroundColor: Colors.purple.DEFAULT,
    paddingHorizontal: Spacing.base, paddingVertical: 7, borderRadius: Radius.full,
    minWidth: 64, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg, paddingBottom: 80 },
  row: { flexDirection: 'row', gap: Spacing.md },

  field: { marginBottom: Spacing.lg },
  label: { color: Colors.text.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.bg.surface,
    borderWidth: 1, borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    color: Colors.text.primary, fontSize: 15,
  },
  prefixInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.surface,
    borderWidth: 1, borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    paddingLeft: Spacing.md,
  },
  prefix: { color: Colors.text.secondary, fontSize: 15 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.purple.dim,
    backgroundColor: Colors.bg.surface,
  },
  chipActive: { backgroundColor: Colors.purple.dim, borderColor: Colors.purple.DEFAULT },
  chipText: { color: Colors.text.muted, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: Colors.purple.light, fontWeight: '700' },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.bg.surface,
    marginBottom: Spacing.sm,
  },
  toggleLabel: { color: Colors.text.primary, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  toggleSub: { color: Colors.text.muted, fontSize: 12 },

  draftNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginTop: Spacing.xl, padding: Spacing.md,
    backgroundColor: Colors.bg.surface, borderRadius: Radius.md,
  },
  draftNoteText: { color: Colors.text.muted, fontSize: 12, flex: 1, lineHeight: 18 },
});
