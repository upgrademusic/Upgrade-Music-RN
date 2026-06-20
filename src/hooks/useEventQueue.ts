import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface QueueTrack {
  groupId: string;
  songId: string;
  title: string;
  artist: string;
  albumArt: string;
  spotifyId: string | null;
  totalBidCents: number;
  bidCount: number;
  status: string;
  originatorId: string | null;
}

export interface EventInfo {
  name: string;
  venueName: string | null;
  djName: string | null;
  djId: string | null;
  status: string;
}

export function useEventQueue(eventId: string) {
  const [queue, setQueue] = useState<QueueTrack[]>([]);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    const { data } = await supabase
      .from('request_groups')
      .select(`
        id, total_amount_cents, request_count, status, song_id, originator_id,
        songs!inner ( id, title, artist, album_art_url, spotify_id )
      `)
      .eq('event_id', eventId)
      .in('status', ['pending', 'accepted']);

    if (data) {
      const mapped: QueueTrack[] = (data as any[]).map(g => ({
        groupId: g.id,
        songId: g.song_id,
        title: g.songs.title,
        artist: g.songs.artist,
        albumArt: g.songs.album_art_url ?? '',
        spotifyId: g.songs.spotify_id ?? null,
        totalBidCents: g.total_amount_cents ?? 0,
        bidCount: g.request_count ?? 0,
        status: g.status,
        originatorId: g.originator_id ?? null,
      }));
      mapped.sort((a, b) => b.totalBidCents - a.totalBidCents);
      setQueue(mapped);
    }
  }, [eventId]);

  const fetchEventInfo = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select(`id, name, status, dj_id, venues!left ( name ), profiles!left ( display_name, dj_name )`)
      .eq('id', eventId)
      .single();

    if (data) {
      setEventInfo({
        name: data.name,
        venueName: (data as any).venues?.name ?? null,
        djName: (data as any).profiles?.dj_name ?? (data as any).profiles?.display_name ?? null,
        djId: (data as any).dj_id ?? null,
        status: data.status,
      });
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    Promise.all([fetchEventInfo(), fetchQueue()]).finally(() => setLoading(false));

    const channel = supabase
      .channel(`queue-${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'request_groups',
        filter: `event_id=eq.${eventId}`,
      }, fetchQueue)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId, fetchQueue, fetchEventInfo]);

  return { queue, eventInfo, loading, refetch: fetchQueue };
}
