import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Switch, Modal, Platform,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Colors, Spacing, Radius } from '@/constants/theme';

const GENRES = ['Pop', 'Hip-Hop', 'Electronic', 'House', 'Techno', 'R&B', 'Latin', 'Afrobeats', 'Reggaeton', 'Dancehall', 'Funk', 'Soul'];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(d: Date) {
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}
function formatTime(d: Date) {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

type ArtistEntry = {
  key: string;
  user_id: string | null;
  invited_email: string | null;
  display_name: string;
  avatar_url: string | null;
};

type ProfileResult = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  city: string | null;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function PickerModal({
  visible, mode, value, minimumDate, onConfirm, onDismiss,
}: {
  visible: boolean;
  mode: 'date' | 'time';
  value: Date;
  minimumDate?: Date;
  onConfirm: (d: Date) => void;
  onDismiss: () => void;
}) {
  const [local, setLocal] = useState(value);

  if (!visible) return null;

  function handleChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      onDismiss();
      if (selected) onConfirm(selected);
      return;
    }
    if (selected) setLocal(selected);
  }

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display="default"
        minimumDate={minimumDate}
        onChange={handleChange}
      />
    );
  }

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onDismiss} />
      <View style={styles.pickerSheet}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.pickerCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.pickerTitle}>{mode === 'date' ? 'Select Date' : 'Select Time'}</Text>
          <TouchableOpacity onPress={() => { onConfirm(local); onDismiss(); }}>
            <Text style={styles.pickerDone}>Done</Text>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          value={local}
          mode={mode}
          display={mode === 'date' ? 'inline' : 'spinner'}
          minimumDate={minimumDate}
          onChange={handleChange}
          themeVariant="dark"
          accentColor={Colors.purple.DEFAULT}
          style={styles.picker}
        />
      </View>
    </Modal>
  );
}

export default function CreateEventScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Basic fields
  const [name, setName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [minBid, setMinBid] = useState('1.00');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [allowExplicit, setAllowExplicit] = useState(false);
  const [allowPreBids, setAllowPreBids] = useState(true);
  const [saving, setSaving] = useState(false);

  // Artist search
  const [artistQuery, setArtistQuery] = useState('');
  const [artistResults, setArtistResults] = useState<ProfileResult[]>([]);
  const [artistSearching, setArtistSearching] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState<ArtistEntry[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickerBaseDate = eventDate ?? new Date();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    const q = artistQuery.trim();
    if (q.length < 2) { setArtistResults([]); return; }

    searchTimeout.current = setTimeout(async () => {
      setArtistSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, email, city')
        .or(`display_name.ilike.%${q}%,email.ilike.%${q}%`)
        .neq('id', user?.id ?? '')
        .limit(8);
      setArtistResults((data as unknown as ProfileResult[]) ?? []);
      setArtistSearching(false);
    }, 300);
  }, [artistQuery]);

  function addArtistFromProfile(p: ProfileResult) {
    const already = selectedArtists.some(a => a.user_id === p.id);
    if (already) return;
    setSelectedArtists(prev => [...prev, {
      key: p.id,
      user_id: p.id,
      invited_email: null,
      display_name: p.display_name ?? p.email ?? 'Unknown',
      avatar_url: p.avatar_url,
    }]);
    setArtistQuery('');
    setArtistResults([]);
  }

  function inviteByEmail(email: string) {
    const norm = email.trim().toLowerCase();
    const already = selectedArtists.some(a => a.invited_email === norm || a.user_id !== null && false);
    if (already) return;
    setSelectedArtists(prev => [...prev, {
      key: `invite-${norm}`,
      user_id: null,
      invited_email: norm,
      display_name: norm,
      avatar_url: null,
    }]);
    setArtistQuery('');
    setArtistResults([]);
  }

  function removeArtist(key: string) {
    setSelectedArtists(prev => prev.filter(a => a.key !== key));
  }

  function toggleGenre(g: string) {
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
  }

  function applyDate(picked: Date) {
    const base = eventDate ?? new Date();
    setEventDate(new Date(picked.getFullYear(), picked.getMonth(), picked.getDate(), base.getHours(), base.getMinutes()));
  }
  function applyTime(picked: Date) {
    const base = eventDate ?? new Date();
    setEventDate(new Date(base.getFullYear(), base.getMonth(), base.getDate(), picked.getHours(), picked.getMinutes()));
  }

  async function handleCreate() {
    if (!name.trim()) { Alert.alert('Required', 'Event name is required.'); return; }
    if (!eventDate) { Alert.alert('Required', 'Please select a date and time.'); return; }
    const minBidCents = Math.round(parseFloat(minBid) * 100);
    if (isNaN(minBidCents) || minBidCents < 100) {
      Alert.alert('Min bid', 'Minimum bid must be at least $1.00.'); return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          name: name.trim(),
          dj_id: user?.id ?? null,
          starts_at: eventDate.toISOString(),
          status: 'draft',
          min_bid_cents: minBidCents,
          genre_preferences: selectedGenres.length > 0 ? selectedGenres : null,
          allow_explicit: allowExplicit,
          allow_pre_event_bids: allowPreBids,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Insert artists
      if (selectedArtists.length > 0) {
        const rows = selectedArtists.map(a => ({
          event_id: data.id,
          user_id: a.user_id,
          invited_email: a.invited_email,
          display_name: a.display_name,
          avatar_url: a.avatar_url,
          status: 'pending',
        }));
        const { error: artistErr } = await (supabase as any).from('event_artists').insert(rows);
        if (artistErr) console.warn('event_artists insert:', artistErr.message);
      }

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

  const hasDate = eventDate !== null;
  const dateHasTime = hasDate && (eventDate.getHours() !== 0 || eventDate.getMinutes() !== 0);
  const showInviteEmail = artistQuery.trim().length > 0 && isEmail(artistQuery) && artistResults.length === 0 && !artistSearching;
  const showNoResults = artistQuery.trim().length >= 2 && !artistSearching && artistResults.length === 0 && !isEmail(artistQuery.trim());

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
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

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

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

          {/* Date & Time */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Date *">
                <TouchableOpacity
                  style={[styles.pickerBtn, hasDate && styles.pickerBtnFilled]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={16} color={hasDate ? Colors.purple.light : Colors.text.muted} />
                  <Text style={[styles.pickerBtnText, hasDate && styles.pickerBtnTextFilled]} numberOfLines={1}>
                    {hasDate ? formatDate(eventDate) : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </Field>
            </View>
            <View style={{ flex: 0.6 }}>
              <Field label="Time *">
                <TouchableOpacity
                  style={[styles.pickerBtn, dateHasTime && styles.pickerBtnFilled]}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="time-outline" size={16} color={dateHasTime ? Colors.purple.light : Colors.text.muted} />
                  <Text style={[styles.pickerBtnText, dateHasTime && styles.pickerBtnTextFilled]}>
                    {hasDate ? formatTime(eventDate) : '--:--'}
                  </Text>
                </TouchableOpacity>
              </Field>
            </View>
          </View>

          {/* ── Artists ── */}
          <Field label="Artists performing">
            {/* Selected artist chips */}
            {selectedArtists.length > 0 && (
              <View style={styles.artistChips}>
                {selectedArtists.map(a => (
                  <View key={a.key} style={[styles.artistChip, a.user_id === null && styles.artistChipInvite]}>
                    {a.avatar_url ? (
                      <Image source={{ uri: a.avatar_url }} style={styles.artistChipAvatar} contentFit="cover" />
                    ) : (
                      <View style={[styles.artistChipAvatar, styles.artistChipAvatarPlaceholder]}>
                        <Ionicons
                          name={a.user_id === null ? 'mail-outline' : 'person'}
                          size={11}
                          color={Colors.text.muted}
                        />
                      </View>
                    )}
                    <Text style={styles.artistChipName} numberOfLines={1}>{a.display_name}</Text>
                    {a.user_id === null && (
                      <Text style={styles.inviteBadge}>Invite</Text>
                    )}
                    <TouchableOpacity onPress={() => removeArtist(a.key)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                      <Ionicons name="close-circle" size={16} color={Colors.text.muted} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Search input */}
            <View style={styles.artistSearchWrap}>
              <Ionicons name="search" size={16} color={Colors.text.muted} style={styles.artistSearchIcon} />
              <TextInput
                style={styles.artistSearchInput}
                placeholder="Search by name or enter email to invite"
                placeholderTextColor={Colors.text.muted}
                value={artistQuery}
                onChangeText={setArtistQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {artistSearching && <ActivityIndicator size="small" color={Colors.purple.light} style={{ marginRight: 8 }} />}
            </View>

            {/* Search results dropdown */}
            {artistResults.length > 0 && (
              <View style={styles.dropdown}>
                {artistResults.map(p => {
                  const already = selectedArtists.some(a => a.user_id === p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.dropdownRow, already && styles.dropdownRowDisabled]}
                      onPress={() => !already && addArtistFromProfile(p)}
                      activeOpacity={already ? 1 : 0.75}
                    >
                      {p.avatar_url ? (
                        <Image source={{ uri: p.avatar_url }} style={styles.dropdownAvatar} contentFit="cover" />
                      ) : (
                        <View style={[styles.dropdownAvatar, styles.dropdownAvatarPlaceholder]}>
                          <Ionicons name="person" size={16} color={Colors.text.muted} />
                        </View>
                      )}
                      <View style={styles.dropdownInfo}>
                        <Text style={styles.dropdownName}>{p.display_name ?? p.email}</Text>
                        {p.city ? <Text style={styles.dropdownSub}>{p.city}</Text> : null}
                      </View>
                      {already
                        ? <Ionicons name="checkmark-circle" size={18} color={Colors.purple.light} />
                        : <Ionicons name="add-circle-outline" size={18} color={Colors.text.muted} />
                      }
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* No results — offer email invite */}
            {showNoResults && (
              <View style={styles.dropdown}>
                <View style={styles.dropdownEmpty}>
                  <Text style={styles.dropdownEmptyText}>No users found for "{artistQuery.trim()}"</Text>
                  <Text style={styles.dropdownEmptyHint}>Enter their email address to send an invite.</Text>
                </View>
              </View>
            )}

            {/* Email invite row */}
            {showInviteEmail && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownRow}
                  onPress={() => inviteByEmail(artistQuery)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.dropdownAvatar, styles.inviteAvatarBg]}>
                    <Ionicons name="mail-outline" size={16} color={Colors.purple.light} />
                  </View>
                  <View style={styles.dropdownInfo}>
                    <Text style={styles.dropdownName}>Invite "{artistQuery.trim()}"</Text>
                    <Text style={styles.dropdownSub}>They'll receive an email invitation</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={18} color={Colors.purple.light} />
                </TouchableOpacity>
              </View>
            )}
          </Field>

          {/* Min bid */}
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

          {/* Genres */}
          <Field label="Genre preferences">
            <View style={styles.chips}>
              {GENRES.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, selectedGenres.includes(g) && styles.chipActive]}
                  onPress={() => toggleGenre(g)}
                >
                  <Text style={[styles.chipText, selectedGenres.includes(g) && styles.chipTextActive]}>{g}</Text>
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

        <PickerModal
          visible={showDatePicker}
          mode="date"
          value={pickerBaseDate}
          minimumDate={today}
          onConfirm={applyDate}
          onDismiss={() => setShowDatePicker(false)}
        />
        <PickerModal
          visible={showTimePicker}
          mode="time"
          value={pickerBaseDate}
          onConfirm={applyTime}
          onDismiss={() => setShowTimePicker(false)}
        />
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

  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.bg.surface,
    borderWidth: 1, borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  pickerBtnFilled: { borderColor: Colors.purple.DEFAULT },
  pickerBtnText: { color: Colors.text.muted, fontSize: 14, flex: 1 },
  pickerBtnTextFilled: { color: Colors.text.primary, fontWeight: '600' },

  prefixInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.surface,
    borderWidth: 1, borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    paddingLeft: Spacing.md,
  },
  prefix: { color: Colors.text.secondary, fontSize: 15 },

  // Artist chips (selected)
  artistChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  artistChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.purple.dim,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.purple.DEFAULT,
    paddingVertical: 5, paddingLeft: 4, paddingRight: 8,
    maxWidth: 200,
  },
  artistChipInvite: {
    borderColor: Colors.text.muted, backgroundColor: Colors.bg.surface,
  },
  artistChipAvatar: { width: 22, height: 22, borderRadius: 11 },
  artistChipAvatarPlaceholder: {
    backgroundColor: Colors.bg.card, alignItems: 'center', justifyContent: 'center',
  },
  artistChipName: { color: Colors.text.primary, fontSize: 13, fontWeight: '600', flex: 1 },
  inviteBadge: {
    fontSize: 10, color: Colors.text.muted, fontWeight: '700',
    borderWidth: 1, borderColor: Colors.text.muted, borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 1,
  },

  // Artist search
  artistSearchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.surface,
    borderWidth: 1, borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
  },
  artistSearchIcon: { marginLeft: Spacing.md },
  artistSearchInput: {
    flex: 1, color: Colors.text.primary, fontSize: 15,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.md,
  },

  // Dropdown
  dropdown: {
    marginTop: 4,
    backgroundColor: '#1C1535',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.purple.dim,
    overflow: 'hidden',
  },
  dropdownRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.bg.surface,
  },
  dropdownRowDisabled: { opacity: 0.5 },
  dropdownAvatar: { width: 36, height: 36, borderRadius: 18 },
  dropdownAvatarPlaceholder: {
    backgroundColor: Colors.bg.card, alignItems: 'center', justifyContent: 'center',
  },
  inviteAvatarBg: { backgroundColor: Colors.purple.dim, alignItems: 'center', justifyContent: 'center' },
  dropdownInfo: { flex: 1 },
  dropdownName: { color: Colors.text.primary, fontWeight: '600', fontSize: 14 },
  dropdownSub: { color: Colors.text.muted, fontSize: 12, marginTop: 1 },
  dropdownEmpty: { padding: Spacing.md, alignItems: 'center' },
  dropdownEmptyText: { color: Colors.text.secondary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  dropdownEmptyHint: { color: Colors.text.muted, fontSize: 12 },

  // Genre chips
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

  // iOS date picker modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  pickerSheet: {
    backgroundColor: '#1C1535',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.purple.dim,
  },
  pickerTitle: { color: Colors.text.primary, fontWeight: '700', fontSize: 16 },
  pickerCancel: { color: Colors.text.muted, fontSize: 16 },
  pickerDone: { color: Colors.purple.light, fontSize: 16, fontWeight: '700' },
  picker: { backgroundColor: 'transparent' },
});
