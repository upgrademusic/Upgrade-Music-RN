import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

export type SearchTab = 'songs' | 'artists' | 'events' | 'movies';

export interface SongResult {
  spotifyId: string;
  title: string;
  artist: string;
  album: string | null;
  albumArt: string | null;
  previewUrl: string | null;
  inQueue: boolean;
  totalBidCents: number;
}

export interface ArtistResult {
  name: string;
  topAlbumArt: string | null;
  songCount: number;
}

export interface EventResult {
  id: string;
  name: string;
  status: string;
  starts_at: string | null;
  cover_image_url: string | null;
  venue_name: string | null;
  city: string | null;
}

export interface MovieResult {
  spotifyId: string;
  title: string;
  artist: string;
  album: string | null;
  albumArt: string | null;
}

export interface VideoCard {
  id: string;
  content_type: string;
  created_at: string;
  click_count: number;
  creator_name: string | null;
  creator_avatar: string | null;
  event_name: string | null;
  event_cover: string | null;
  venue_name: string | null;
  event_id: string | null;
}

async function spotifySearch(q: string): Promise<SongResult[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/spotify-search?q=${encodeURIComponent(q)}`,
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
      totalBidCents: 0,
    }));
  } catch {
    return [];
  }
}

async function searchArtists(q: string): Promise<ArtistResult[]> {
  const { data } = await supabase
    .from('songs')
    .select('artist, album_art_url')
    .ilike('artist', `%${q}%`)
    .limit(60);

  if (!data) return [];

  const map = new Map<string, { art: string | null; count: number }>();
  (data as any[]).forEach(row => {
    const key = row.artist as string;
    const cur = map.get(key);
    if (!cur) {
      map.set(key, { art: row.album_art_url ?? null, count: 1 });
    } else {
      map.set(key, { art: cur.art ?? row.album_art_url, count: cur.count + 1 });
    }
  });

  return Array.from(map.entries())
    .map(([name, { art, count }]) => ({ name, topAlbumArt: art, songCount: count }))
    .sort((a, b) => b.songCount - a.songCount)
    .slice(0, 20);
}

async function searchEvents(q: string): Promise<EventResult[]> {
  const { data } = await supabase
    .from('events')
    .select('id, name, status, starts_at, venues(name, city, cover_image_url)')
    .ilike('name', `%${q}%`)
    .in('status', ['scheduled', 'pre_event', 'active'])
    .order('starts_at', { ascending: true })
    .limit(20);

  if (!data) return [];
  return (data as any[]).map(e => ({
    id: e.id,
    name: e.name,
    status: e.status,
    starts_at: e.starts_at,
    cover_image_url: e.venues?.cover_image_url ?? null,
    venue_name: e.venues?.name ?? null,
    city: e.venues?.city ?? null,
  }));
}

async function searchMovies(q: string): Promise<MovieResult[]> {
  // Search songs whose album name suggests a movie soundtrack
  const { data } = await supabase
    .from('songs')
    .select('spotify_id, title, artist, album, album_art_url')
    .or(
      `album.ilike.%soundtrack%,album.ilike.%OST%,album.ilike.%motion picture%,album.ilike.%original score%,genre.ilike.%soundtrack%`
    )
    .or(`title.ilike.%${q}%,artist.ilike.%${q}%,album.ilike.%${q}%`)
    .limit(20);

  if (!data || data.length === 0) {
    // Fallback: Spotify search with "soundtrack" appended
    const spotifyResults = await spotifySearch(`${q} soundtrack`);
    return spotifyResults.slice(0, 15).map(s => ({
      spotifyId: s.spotifyId,
      title: s.title,
      artist: s.artist,
      album: s.album,
      albumArt: s.albumArt,
    }));
  }

  return (data as any[]).map(s => ({
    spotifyId: s.spotify_id ?? s.id,
    title: s.title,
    artist: s.artist,
    album: s.album ?? null,
    albumArt: s.album_art_url ?? null,
  }));
}

const VIDEO_PAGE_SIZE = 10;

export function useSearch() {
  const [tab, setTab] = useState<SearchTab>('songs');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [songResults, setSongResults] = useState<SongResult[]>([]);
  const [artistResults, setArtistResults] = useState<ArtistResult[]>([]);
  const [eventResults, setEventResults] = useState<EventResult[]>([]);
  const [movieResults, setMovieResults] = useState<MovieResult[]>([]);

  const [videoFeed, setVideoFeed] = useState<VideoCard[]>([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoPage, setVideoPage] = useState(0);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setSongResults([]);
      setArtistResults([]);
      setEventResults([]);
      setMovieResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        if (tab === 'songs') {
          const res = await spotifySearch(q);
          setSongResults(res);
        } else if (tab === 'artists') {
          const res = await searchArtists(q);
          setArtistResults(res);
        } else if (tab === 'events') {
          const res = await searchEvents(q);
          setEventResults(res);
        } else if (tab === 'movies') {
          const res = await searchMovies(q);
          setMovieResults(res);
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timerRef.current);
  }, [query, tab]);

  // Clear results when tab changes
  useEffect(() => {
    if (query.trim().length >= 2) {
      setLoading(true);
      setSongResults([]);
      setArtistResults([]);
      setEventResults([]);
      setMovieResults([]);
    }
  }, [tab]);

  // Video feed (shown when no query)
  const fetchVideos = useCallback(async (page: number) => {
    if (page === 0) setVideoLoading(true);

    const { data } = await supabase
      .from('social_shares')
      .select(`
        id, content_type, created_at, click_count, event_id,
        profiles!user_id ( display_name, avatar_url ),
        events ( name, venues ( name, cover_image_url ) )
      `)
      .order('created_at', { ascending: false })
      .range(page * VIDEO_PAGE_SIZE, page * VIDEO_PAGE_SIZE + VIDEO_PAGE_SIZE - 1);

    if (!data) { setVideoLoading(false); return; }
    if (data.length < VIDEO_PAGE_SIZE) setHasMoreVideos(false);

    const cards: VideoCard[] = (data as any[]).map(p => ({
      id: p.id,
      content_type: p.content_type,
      created_at: p.created_at,
      click_count: p.click_count,
      creator_name: p.profiles?.display_name ?? null,
      creator_avatar: p.profiles?.avatar_url ?? null,
      event_name: p.events?.name ?? null,
      event_cover: p.events?.venues?.cover_image_url ?? null,
      venue_name: p.events?.venues?.name ?? null,
      event_id: p.event_id,
    }));

    setVideoFeed(prev => page === 0 ? cards : [...prev, ...cards]);
    setVideoLoading(false);
  }, []);

  useEffect(() => { fetchVideos(0); }, [fetchVideos]);

  const loadMoreVideos = useCallback(() => {
    if (!hasMoreVideos || videoLoading) return;
    const next = videoPage + 1;
    setVideoPage(next);
    fetchVideos(next);
  }, [hasMoreVideos, videoLoading, videoPage, fetchVideos]);

  return {
    tab, setTab,
    query, setQuery,
    loading,
    songResults, artistResults, eventResults, movieResults,
    videoFeed, videoLoading, hasMoreVideos, loadMoreVideos,
  };
}
