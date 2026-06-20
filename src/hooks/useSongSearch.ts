import { useState, useEffect, useRef } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

export interface SearchSong {
  spotifyId: string;
  title: string;
  artist: string;
  album: string | null;
  albumArt: string | null;
  previewUrl: string | null;
  inQueue: boolean;
  queuePosition: number;
  totalBidCents: number;
  requestGroupId: string | null;
  originatorId: string | null;
}

async function searchSpotify(query: string): Promise<SearchSong[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/spotify-search?q=${encodeURIComponent(query)}`,
      { headers: { apikey: SUPABASE_ANON_KEY } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.tracks ?? []).map((t: any) => ({
      spotifyId: t.spotify_id,
      title: t.title,
      artist: t.artist,
      album: t.album ?? null,
      albumArt: t.album_art_url ?? null,
      previewUrl: t.preview_url ?? null,
      inQueue: false,
      queuePosition: 0,
      totalBidCents: 0,
      requestGroupId: null,
      originatorId: null,
    }));
  } catch {
    return [];
  }
}

export function useSongSearch(eventId?: string) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchSong[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    if (q.length < 2) { setResults([]); setLoading(false); return; }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      let queueGroups: any[] = [];
      if (eventId) {
        const { data } = await supabase
          .from('request_groups')
          .select('id, song_id, total_amount_cents, originator_id, songs!inner(spotify_id)')
          .eq('event_id', eventId)
          .in('status', ['pending', 'accepted']);
        queueGroups = data ?? [];
      }
      const spotifyResults = await searchSpotify(q);

      const queueMap = new Map<string, any>();
      (queueGroups as any[]).forEach(g => {
        if (g.songs?.spotify_id) queueMap.set(g.songs.spotify_id, g);
      });

      const enriched = spotifyResults.map((song, idx) => {
        const group = queueMap.get(song.spotifyId);
        return {
          ...song,
          inQueue: !!group,
          queuePosition: group ? idx + 1 : 0,
          totalBidCents: group?.total_amount_cents ?? 0,
          requestGroupId: group?.id ?? null,
          originatorId: group?.originator_id ?? null,
        };
      });

      setResults(enriched);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timerRef.current);
  }, [query, eventId]);

  return { query, setQuery, results, loading };
}
