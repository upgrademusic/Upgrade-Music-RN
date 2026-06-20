import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

type VenuePlace = {
  name: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
};

// Dark purple map styles for Static Maps API
const MAP_STYLES = [
  'feature:all|element:geometry|color:0x1A1035',
  'feature:all|element:labels.icon|visibility:off',
  'feature:all|element:labels.text.fill|color:0xB0A8D0',
  'feature:all|element:labels.text.stroke|color:0x0D0B1A',
  'feature:administrative|element:geometry|color:0x4A3580',
  'feature:poi|element:geometry|color:0x120E28',
  'feature:road|element:geometry|color:0x2D2060',
  'feature:road|element:geometry.stroke|color:0x0D0B1A',
  'feature:road.highway|element:geometry|color:0x3D2880',
  'feature:transit|element:geometry|color:0x2D2060',
  'feature:water|element:geometry|color:0x0D0B1A',
].map(s => `style=${encodeURIComponent(s)}`).join('&');

function staticMapUrl(lat: number, lng: number) {
  const center = `${lat},${lng}`;
  const marker = `color:0x9B7BFF|${center}`;
  return (
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${center}&zoom=15&size=600x180&scale=2` +
    `&markers=${encodeURIComponent(marker)}` +
    `&${MAP_STYLES}` +
    `&key=${GOOGLE_MAPS_KEY}`
  );
}

export default function VenueMap({ place, onClear }: { place: VenuePlace; onClear: () => void }) {
  return (
    <View style={styles.mapWrap}>
      <Image
        source={{ uri: staticMapUrl(place.lat, place.lng) }}
        style={styles.map}
        contentFit="cover"
      />

      <View style={styles.infoBar}>
        <Ionicons name="location" size={14} color={Colors.purple.light} />
        <View style={{ flex: 1 }}>
          <Text style={styles.venueName} numberOfLines={1}>{place.name}</Text>
          <Text style={styles.venueAddress} numberOfLines={1}>
            {place.city}{place.country ? `, ${place.country}` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="close-circle" size={18} color={Colors.text.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    marginTop: Spacing.sm, borderRadius: Radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.purple.dim,
  },
  map: { width: '100%', height: 180 },
  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bg.surface,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: Colors.purple.dim,
  },
  venueName: { color: Colors.text.primary, fontWeight: '700', fontSize: 13 },
  venueAddress: { color: Colors.text.muted, fontSize: 11, marginTop: 1 },
});
