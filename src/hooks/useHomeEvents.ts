import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface LiveEvent {
  id: string;
  name: string;
  status: string;
  cover_image_url: string | null;
  starts_at: string | null;
  city: string | null;
  venue_name: string | null;
  dj_name: string | null;
  dj_avatar: string | null;
  queue_size: number;
}

export function useHomeEvents() {
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: live } = await supabase
        .from('events')
        .select(`
          id, name, status, cover_image_url, starts_at, city,
          venues!left ( name ),
          profiles!left ( display_name, dj_name, avatar_url )
        `)
        .eq('status', 'active')
        .limit(15);

      const { data: upcoming } = await supabase
        .from('events')
        .select(`
          id, name, status, cover_image_url, starts_at, city,
          venues!left ( name ),
          profiles!left ( display_name, dj_name, avatar_url )
        `)
        .in('status', ['scheduled', 'pre_event'])
        .gt('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(20);

      const mapEvent = (e: any): LiveEvent => ({
        id: e.id,
        name: e.name,
        status: e.status,
        cover_image_url: e.cover_image_url,
        starts_at: e.starts_at,
        city: e.city,
        venue_name: e.venues?.name ?? null,
        dj_name: e.profiles?.dj_name ?? e.profiles?.display_name ?? null,
        dj_avatar: e.profiles?.avatar_url ?? null,
        queue_size: 0,
      });

      setLiveEvents((live ?? []).map(mapEvent));
      setUpcomingEvents((upcoming ?? []).map(mapEvent));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { liveEvents, upcomingEvents, loading, refresh: load };
}
