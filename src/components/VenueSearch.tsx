import { useState, useEffect, useRef, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
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

declare global {
  interface Window {
    google: any;
    __gmapsReady: (() => void)[];
  }
}

function loadGoogleMapsSDK(): Promise<void> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') return;
    if (window.google?.maps?.places) { resolve(); return; }

    if (!window.__gmapsReady) window.__gmapsReady = [];
    window.__gmapsReady.push(resolve);

    if (document.getElementById('gmaps-script')) return; // already loading

    (window as any).__gmapsCallback = () => {
      window.__gmapsReady?.forEach(fn => fn());
      window.__gmapsReady = [];
    };

    const s = document.createElement('script');
    s.id = 'gmaps-script';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&callback=__gmapsCallback`;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  });
}

export default function VenueSearch({ onSelect }: { onSelect: (place: VenuePlace) => void }) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const autocompleteRef = useRef<any>(null);
  const placesRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadGoogleMapsSDK().then(() => setSdkReady(true));
  }, []);

  useEffect(() => {
    if (!sdkReady) return;
    autocompleteRef.current = new window.google.maps.places.AutocompleteService();
    const div = document.createElement('div');
    placesRef.current = new window.google.maps.places.PlacesService(div);
  }, [sdkReady]);

  const search = useCallback((text: string) => {
    if (!autocompleteRef.current || text.length < 2) { setPredictions([]); return; }
    setLoading(true);
    autocompleteRef.current.getPlacePredictions(
      { input: text, types: ['establishment'] },
      (results: any[], status: string) => {
        setLoading(false);
        setPredictions(status === 'OK' && results ? results : []);
      }
    );
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), 300);
  };

  const handleSelect = (prediction: any) => {
    setPredictions([]);
    setLoading(true);
    setQuery(prediction.structured_formatting.main_text);
    placesRef.current.getDetails(
      { placeId: prediction.place_id, fields: ['name', 'formatted_address', 'geometry', 'address_components'] },
      (place: any, status: string) => {
        setLoading(false);
        if (status !== 'OK' || !place) return;
        const comps: any[] = place.address_components ?? [];
        const get = (type: string) => comps.find((c: any) => c.types.includes(type))?.long_name ?? '';
        onSelect({
          name: place.name,
          address: place.formatted_address,
          city: get('locality') || get('administrative_area_level_1'),
          country: get('country'),
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          place_id: prediction.place_id,
        });
      }
    );
  };

  return (
    <View>
      <View style={styles.inputRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="location-outline" size={18} color={Colors.text.muted} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Search for a club, bar or venue…"
          placeholderTextColor={Colors.text.muted}
          value={query}
          onChangeText={handleChangeText}
          selectionColor={Colors.purple.DEFAULT}
        />
        {loading && (
          <ActivityIndicator size="small" color={Colors.purple.DEFAULT} style={styles.spinner} />
        )}
      </View>

      {predictions.length > 0 && (
        <View style={styles.dropdown}>
          {predictions.map((p, i) => (
            <TouchableOpacity
              key={p.place_id}
              style={[styles.row, i < predictions.length - 1 && styles.rowBorder]}
              onPress={() => handleSelect(p)}
              activeOpacity={0.75}
            >
              <Ionicons name="location-outline" size={14} color={Colors.purple.light} style={styles.rowIcon} />
              <View style={styles.rowText}>
                <Text style={styles.mainText} numberOfLines={1}>
                  {p.structured_formatting.main_text}
                </Text>
                <Text style={styles.secondaryText} numberOfLines={1}>
                  {p.structured_formatting.secondary_text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.surface,
    borderWidth: 1, borderColor: Colors.purple.dim,
    borderRadius: Radius.md, height: 48,
  },
  iconWrap: { paddingLeft: Spacing.md },
  input: {
    flex: 1, color: Colors.text.primary, fontSize: 15,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.md,
  },
  spinner: { marginRight: 12 },
  dropdown: {
    marginTop: 4,
    backgroundColor: '#1C1535',
    borderWidth: 1, borderColor: Colors.purple.dim,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1, borderBottomColor: Colors.bg.surface,
  },
  rowIcon: { marginRight: 10 },
  rowText: { flex: 1 },
  mainText: { color: Colors.text.primary, fontSize: 14, fontWeight: '600' },
  secondaryText: { color: Colors.text.muted, fontSize: 12, marginTop: 1 },
});
