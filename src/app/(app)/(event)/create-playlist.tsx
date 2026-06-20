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

export default function CreatePlaylistScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!title.trim()) { Alert.alert('Required', 'Playlist name is required.'); return; }
    if (!user?.id) { Alert.alert('Error', 'You must be logged in.'); return; }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('playlists')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          creator_id: user.id,
          is_public: isPublic,
        });

      if (error) throw error;

      Alert.alert('Playlist created!', `"${title}" is ready. Add tracks from search.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not create playlist.');
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
          <Text style={styles.headerTitle}>New Playlist</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
            {saving
              ? <ActivityIndicator color={Colors.purple.light} size="small" />
              : <Text style={styles.saveBtnText}>Create</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Cover placeholder */}
          <View style={styles.coverPlaceholder}>
            <LinearGradient colors={['#4A1D96', '#2563EB']} style={styles.coverGradient}>
              <Ionicons name="musical-notes" size={48} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Playlist name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Peak Hour Bangers"
              placeholderTextColor={Colors.text.muted}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="What's this playlist about?"
              placeholderTextColor={Colors.text.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Public playlist</Text>
              <Text style={styles.toggleSub}>Anyone can find and follow this playlist</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: Colors.bg.card, true: Colors.purple.muted }}
              thumbColor={isPublic ? Colors.purple.light : Colors.text.muted}
            />
          </View>

          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.text.muted} />
            <Text style={styles.hintText}>
              After creating, search for songs and add them to this playlist from the Song search tab.
            </Text>
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

  scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xl, paddingBottom: 80 },

  coverPlaceholder: {
    alignSelf: 'center', marginBottom: Spacing['2xl'],
    width: 140, height: 140, borderRadius: Radius.xl, overflow: 'hidden',
  },
  coverGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  field: { marginBottom: Spacing.lg },
  label: { color: Colors.text.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.bg.surface,
    borderWidth: 1, borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    color: Colors.text.primary, fontSize: 15,
  },
  multiline: { minHeight: 80, paddingTop: Spacing.md },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.bg.surface,
    marginBottom: Spacing.xl,
  },
  toggleLabel: { color: Colors.text.primary, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  toggleSub: { color: Colors.text.muted, fontSize: 12 },

  hint: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    padding: Spacing.md, backgroundColor: Colors.bg.surface, borderRadius: Radius.md,
  },
  hintText: { color: Colors.text.muted, fontSize: 12, flex: 1, lineHeight: 18 },
});
