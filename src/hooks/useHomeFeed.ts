import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

const SWISS_CITIES = ['zürich', 'zurich', 'geneva', 'basel', 'bern', 'lausanne', 'lucerne', 'lugano'];
const EU_COUNTRIES = ['germany', 'france', 'italy', 'spain', 'netherlands', 'austria', 'united kingdom', 'belgium', 'portugal'];

function geoScore(city: string | null, country: string | null, userCity: string | null): number {
  if (!userCity) return 0;
  const uc = userCity.toLowerCase();
  const vc = (city ?? '').toLowerCase();
  const vco = (country ?? '').toLowerCase();
  if (vc === uc) return 3;
  if (SWISS_CITIES.includes(vc) && SWISS_CITIES.includes(uc)) return 2;
  if (EU_COUNTRIES.includes(vco)) return 1;
  return 0;
}

export interface LiveStory {
  id: string;
  name: string;
  starts_at: string | null;
  cover_image_url: string | null;
  city: string | null;
  country: string | null;
  venue_name: string | null;
  dj_name: string | null;
  dj_avatar: string | null;
  queue_size: number;
}

export interface UpcomingEvent {
  id: string;
  name: string;
  starts_at: string | null;
  cover_image_url: string | null;
  venue_name: string | null;
  city: string | null;
}

export interface DiscoverPost {
  id: string;
  content_type: string;
  created_at: string;
  click_count: number;
  creator_name: string | null;
  creator_avatar: string | null;
  event_name: string | null;
  event_cover: string | null;
  event_id: string | null;
}

const PAGE_SIZE = 12;

const CONTENT_LABEL: Record<string, string> = {
  track_bid: 'placed a bid',
  track_top: 'pushed a track to #1',
  track_played: 'got their song played',
  battle_won: 'won a Song Battle',
  top_supporter: 'is a top supporter',
};

export function useHomeFeed() {
  const { user } = useAuthStore();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);

  const [liveStories, setLiveStories] = useState<LiveStory[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  const [discoverPosts, setDiscoverPosts] = useState<DiscoverPost[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [discoverPage, setDiscoverPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('display_name, city')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name);
          setUserCity(data.city);
        }
      });
  }, [user?.id]);

  const fetchLive = useCallback(async () => {
    setLiveLoading(true);
    const { data } = await supabase
      .from('events')
      .select(`
        id, name, starts_at,
        venues ( name, city, country, cover_image_url ),
        profiles!dj_id ( display_name, dj_name, avatar_url )
      `)
      .eq('status', 'active')
      .limit(20);

    if (!data) { setLiveLoading(false); return; }

    const ids = data.map((e: any) => e.id as string);
    const { data: qRows } = ids.length > 0
      ? await supabase
          .from('request_groups')
          .select('event_id')
          .in('event_id', ids)
          .in('status', ['pending', 'accepted', 'playing'])
      : { data: [] as any[] };

    const qMap: Record<string, number> = {};
    (qRows ?? []).forEach((r: any) => { qMap[r.event_id] = (qMap[r.event_id] ?? 0) + 1; });

    const stories: LiveStory[] = (data as any[]).map(e => ({
      id: e.id,
      name: e.name,
      starts_at: e.starts_at,
      cover_image_url: e.venues?.cover_image_url ?? null,
      city: e.venues?.city ?? null,
      country: e.venues?.country ?? null,
      venue_name: e.venues?.name ?? null,
      dj_name: e.profiles?.dj_name ?? e.profiles?.display_name ?? null,
      dj_avatar: e.profiles?.avatar_url ?? null,
      queue_size: qMap[e.id] ?? 0,
    }));

    stories.sort((a, b) =>
      geoScore(b.city, b.country, userCity) - geoScore(a.city, a.country, userCity)
    );

    setLiveStories(stories);
    setLiveLoading(false);
  }, [userCity]);

  useEffect(() => { fetchLive(); }, [fetchLive]);

  const fetchUpcoming = useCallback(async () => {
    setUpcomingLoading(true);
    const now = new Date();
    const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data } = await supabase
      .from('events')
      .select(`
        id, name, starts_at,
        venues ( name, city, cover_image_url )
      `)
      .in('status', ['scheduled', 'pre_event'])
      .gt('starts_at', now.toISOString())
      .lte('starts_at', week.toISOString())
      .order('starts_at', { ascending: true })
      .limit(20);

    if (!data) { setUpcomingLoading(false); return; }

    const events: UpcomingEvent[] = (data as any[]).map(e => ({
      id: e.id,
      name: e.name,
      starts_at: e.starts_at,
      cover_image_url: e.venues?.cover_image_url ?? null,
      venue_name: e.venues?.name ?? null,
      city: e.venues?.city ?? null,
    }));

    events.sort((a, b) => {
      const gs = geoScore(b.city, null, userCity) - geoScore(a.city, null, userCity);
      if (gs !== 0) return gs;
      return new Date(a.starts_at ?? 0).getTime() - new Date(b.starts_at ?? 0).getTime();
    });

    setUpcomingEvents(events);
    setUpcomingLoading(false);
  }, [userCity]);

  useEffect(() => { fetchUpcoming(); }, [fetchUpcoming]);

  const fetchDiscover = useCallback(async (page: number) => {
    if (page === 0) setDiscoverLoading(true);

    const { data } = await supabase
      .from('social_shares')
      .select(`
        id, content_type, created_at, click_count, event_id,
        profiles!user_id ( display_name, avatar_url ),
        events ( name, venues ( cover_image_url ) )
      `)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (!data) { setDiscoverLoading(false); return; }
    if (data.length < PAGE_SIZE) setHasMorePosts(false);

    const posts: DiscoverPost[] = (data as any[]).map(p => ({
      id: p.id,
      content_type: p.content_type,
      created_at: p.created_at,
      click_count: p.click_count,
      creator_name: p.profiles?.display_name ?? null,
      creator_avatar: p.profiles?.avatar_url ?? null,
      event_name: p.events?.name ?? null,
      event_cover: p.events?.venues?.cover_image_url ?? null,
      event_id: p.event_id,
    }));

    setDiscoverPosts(prev => page === 0 ? posts : [...prev, ...posts]);
    setDiscoverLoading(false);
  }, []);

  useEffect(() => { fetchDiscover(0); }, [fetchDiscover]);

  const loadMorePosts = useCallback(() => {
    if (!hasMorePosts || discoverLoading) return;
    const nextPage = discoverPage + 1;
    setDiscoverPage(nextPage);
    fetchDiscover(nextPage);
  }, [hasMorePosts, discoverLoading, discoverPage, fetchDiscover]);

  const refresh = useCallback(async () => {
    setDiscoverPage(0);
    setHasMorePosts(true);
    await Promise.all([fetchLive(), fetchUpcoming(), fetchDiscover(0)]);
  }, [fetchLive, fetchUpcoming, fetchDiscover]);

  return {
    displayName,
    liveStories,
    liveLoading,
    upcomingEvents,
    upcomingLoading,
    discoverPosts,
    discoverLoading,
    hasMorePosts,
    loadMorePosts,
    refresh,
    loading: liveLoading || upcomingLoading || discoverLoading,
  };
}

export { CONTENT_LABEL };
