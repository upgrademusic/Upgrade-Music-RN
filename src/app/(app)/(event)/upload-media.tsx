import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Colors, Spacing, Radius } from '@/constants/theme';

const { width: W } = Dimensions.get('window');

type MediaType = 'video' | 'photo';

export default function UploadMediaScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const mediaType: MediaType = type === 'video' ? 'video' : 'photo';
  const { user } = useAuthStore();

  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  async function pickMedia() {
    const perm = mediaType === 'video'
      ? await ImagePicker.requestMediaLibraryPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission required', 'Please allow access to your media library in Settings.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === 'video'
        ? ImagePicker.MediaTypeOptions.Videos
        : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.85,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAsset(result.assets[0]);
    }
  }

  async function handleUpload() {
    if (!asset) { Alert.alert('No media', 'Please select a photo or video first.'); return; }
    if (!user?.id) { Alert.alert('Error', 'You must be logged in.'); return; }

    setUploading(true);
    try {
      // Read the file as a Blob via fetch (works in RN)
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const ext = mediaType === 'video' ? 'mp4' : 'jpg';
      const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('user-content')
        .upload(fileName, blob, { contentType: mimeType, upsert: false });

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage
        .from('user-content')
        .getPublicUrl(storageData.path);

      // Record in social_shares
      const { error: shareError } = await supabase
        .from('social_shares')
        .insert({
          user_id: user.id,
          content_type: mediaType === 'video' ? 'track_played' : 'track_bid',
          platform: mediaType === 'video' ? 'tiktok' : 'instagram_story',
          target_id: urlData.publicUrl,
          click_count: 0,
          impression_count: 0,
          conversion_count: 0,
        });

      if (shareError) throw shareError;

      Alert.alert(
        mediaType === 'video' ? 'Video uploaded!' : 'Photo uploaded!',
        'Your content is now live in the community feed.',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert('Upload failed', e.message ?? 'Something went wrong. Try again.');
    } finally {
      setUploading(false);
    }
  }

  const isVideo = mediaType === 'video';
  const accent = isVideo ? '#F9A8D4' : '#6EE7B7';
  const gradColors: [string, string] = isVideo ? ['#7C1D3C', '#DB2777'] : ['#1C3A2A', '#059669'];

  return (
    <LinearGradient colors={['#0D0B1A', '#1A1035']} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isVideo ? 'Upload Video' : 'Upload Photo'}</Text>
          <TouchableOpacity
            style={[styles.postBtn, !asset && styles.postBtnDisabled]}
            onPress={handleUpload}
            disabled={!asset || uploading}
          >
            {uploading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.postBtnText}>Post</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Media picker area */}
          {!asset ? (
            <TouchableOpacity style={styles.pickArea} onPress={pickMedia} activeOpacity={0.85}>
              <LinearGradient colors={gradColors} style={styles.pickGradient}>
                <Ionicons name={isVideo ? 'videocam' : 'camera'} size={48} color={accent} />
                <Text style={styles.pickTitle}>
                  {isVideo ? 'Select a video' : 'Select a photo'}
                </Text>
                <Text style={styles.pickSub}>
                  {isVideo ? 'Up to 60 seconds from your library' : 'From your camera roll'}
                </Text>
                <View style={[styles.pickBtn, { borderColor: accent }]}>
                  <Text style={[styles.pickBtnText, { color: accent }]}>
                    Choose from library
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.previewWrap}>
              <Image
                source={{ uri: asset.uri }}
                style={styles.preview}
                contentFit="cover"
              />
              {isVideo && (
                <View style={styles.videoBadge}>
                  <Ionicons name="videocam" size={14} color="#fff" />
                  <Text style={styles.videoBadgeText}>
                    {asset.duration ? `${Math.round(asset.duration)}s` : 'Video'}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.changeBtn} onPress={pickMedia}>
                <Text style={styles.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Caption */}
          <View style={styles.captionWrap}>
            <Text style={styles.label}>Caption</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption…"
              placeholderTextColor={Colors.text.muted}
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={280}
            />
            <Text style={styles.charCount}>{caption.length}/280</Text>
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="people-outline" size={16} color={Colors.purple.light} />
            <Text style={styles.infoText}>
              Your {isVideo ? 'video' : 'photo'} will appear in the community Discover feed and on your profile.
            </Text>
          </View>

          {isVideo && (
            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={16} color={Colors.text.muted} />
              <Text style={styles.infoText}>Videos are limited to 60 seconds.</Text>
            </View>
          )}

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
  postBtn: {
    backgroundColor: Colors.purple.DEFAULT,
    paddingHorizontal: Spacing.base, paddingVertical: 7, borderRadius: Radius.full,
    minWidth: 56, alignItems: 'center',
  },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  scroll: { paddingBottom: 80 },

  /* Picker */
  pickArea: {
    margin: Spacing.base, borderRadius: Radius.xl, overflow: 'hidden',
    height: W * 1.2,
  },
  pickGradient: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md,
    padding: Spacing['2xl'],
  },
  pickTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  pickSub: { color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center' },
  pickBtn: {
    marginTop: Spacing.md, borderWidth: 1.5, borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: 10,
  },
  pickBtnText: { fontWeight: '700', fontSize: 15 },

  /* Preview */
  previewWrap: {
    margin: Spacing.base, borderRadius: Radius.xl, overflow: 'hidden',
    height: W * 1.2, backgroundColor: Colors.bg.card,
  },
  preview: { flex: 1 },
  videoBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full,
  },
  videoBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  changeBtn: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
  },
  changeBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  /* Caption */
  captionWrap: { paddingHorizontal: Spacing.base, marginBottom: Spacing.lg },
  label: { color: Colors.text.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  captionInput: {
    backgroundColor: Colors.bg.surface,
    borderWidth: 1, borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    color: Colors.text.primary, fontSize: 15, minHeight: 80,
  },
  charCount: { color: Colors.text.muted, fontSize: 11, textAlign: 'right', marginTop: 4 },

  /* Info */
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
    padding: Spacing.md, backgroundColor: Colors.bg.surface, borderRadius: Radius.md,
  },
  infoText: { color: Colors.text.muted, fontSize: 12, flex: 1, lineHeight: 18 },
});
