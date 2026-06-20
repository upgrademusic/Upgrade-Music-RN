import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';

type VenuePlace = {
  name: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
};

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1A1035' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#B0A8D0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D0B1A' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#4A3580' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#B794FF' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#9B7BFF' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#120E28' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2D2060' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0D0B1A' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#B0A8D0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3D2880' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0D0B1A' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#B794FF' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2D2060' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#9B7BFF' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0D0B1A' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4A3580' }] },
];

export default function VenueMap({ place, onClear }: { place: VenuePlace; onClear: () => void }) {
  return (
    <View style={styles.mapWrap}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={MAP_STYLE}
        region={{
          latitude: place.lat,
          longitude: place.lng,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker coordinate={{ latitude: place.lat, longitude: place.lng }} title={place.name}>
          <View style={styles.markerOuter}>
            <View style={styles.markerInner} />
          </View>
        </Marker>
      </MapView>

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
  markerOuter: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.purple.DEFAULT + '33',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.purple.DEFAULT,
  },
  markerInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.purple.light },
  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bg.surface,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: Colors.purple.dim,
  },
  venueName: { color: Colors.text.primary, fontWeight: '700', fontSize: 13 },
  venueAddress: { color: Colors.text.muted, fontSize: 11, marginTop: 1 },
});
