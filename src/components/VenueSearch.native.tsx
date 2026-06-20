import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
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
  place_id: string;
};

export default function VenueSearch({ onSelect }: { onSelect: (place: VenuePlace) => void }) {
  return (
    <View style={styles.wrap}>
      <GooglePlacesAutocomplete
        placeholder="Search for a club, bar or venue…"
        onPress={(data, details) => {
          const comps = details?.address_components ?? [];
          const get = (type: string) =>
            comps.find(c => (c.types as string[]).includes(type))?.long_name ?? '';
          onSelect({
            name: data.structured_formatting.main_text,
            address: data.description,
            city: get('locality') || get('administrative_area_level_1'),
            country: get('country'),
            lat: details?.geometry.location.lat ?? 0,
            lng: details?.geometry.location.lng ?? 0,
            place_id: data.place_id,
          });
        }}
        query={{ key: GOOGLE_MAPS_KEY, language: 'en', types: ['establishment'] as any }}
        fetchDetails
        enablePoweredByContainer={false}
        minLength={2}
        debounce={300}
        styles={{
          textInput: placeStyles.textInput,
          listView: placeStyles.listView,
          row: placeStyles.row,
          description: placeStyles.description,
          separator: placeStyles.separator,
          poweredContainer: { display: 'none' },
        }}
        textInputProps={{
          placeholderTextColor: Colors.text.muted,
          selectionColor: Colors.purple.DEFAULT,
        }}
        renderLeftButton={() => (
          <View style={placeStyles.searchIcon}>
            <Ionicons name="location-outline" size={18} color={Colors.text.muted} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: Radius.md, overflow: 'visible' },
});

const placeStyles = {
  searchIcon: {
    position: 'absolute' as const,
    left: 12, top: 15, zIndex: 1,
  },
  textInput: {
    backgroundColor: Colors.bg.surface,
    color: Colors.text.primary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    paddingLeft: 40,
    height: 48,
  },
  listView: {
    backgroundColor: '#1C1535',
    borderWidth: 1,
    borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    marginTop: 4,
    overflow: 'hidden' as const,
  },
  row: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  description: {
    color: Colors.text.primary,
    fontSize: 14,
  },
  separator: {
    backgroundColor: Colors.bg.surface,
    height: 1,
  },
};
