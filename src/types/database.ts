export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_id: string | null
          event_type: string
          id: string
          payload: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          event_type: string
          id?: string
          payload?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          event_type?: string
          id?: string
          payload?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_group_members: {
        Row: {
          bid_amount_cents: number
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          bid_amount_cents?: number
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          bid_amount_cents?: number
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boost_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "boost_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      boost_groups: {
        Row: {
          created_at: string
          creator_id: string
          event_id: string
          id: string
          invite_link: string
          member_count: number
          song_id: string
          status: Database["public"]["Enums"]["boost_group_status"]
          total_boost_cents: number
        }
        Insert: {
          created_at?: string
          creator_id: string
          event_id: string
          id?: string
          invite_link: string
          member_count?: number
          song_id: string
          status?: Database["public"]["Enums"]["boost_group_status"]
          total_boost_cents?: number
        }
        Update: {
          created_at?: string
          creator_id?: string
          event_id?: string
          id?: string
          invite_link?: string
          member_count?: number
          song_id?: string
          status?: Database["public"]["Enums"]["boost_group_status"]
          total_boost_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "boost_groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_groups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_groups_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          brand_elements: Json
          created_at: string
          id: string
          is_active: boolean
          layout_config: Json
          name: string
          template_type: Database["public"]["Enums"]["template_type"]
          updated_at: string
        }
        Insert: {
          brand_elements?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          layout_config?: Json
          name: string
          template_type: Database["public"]["Enums"]["template_type"]
          updated_at?: string
        }
        Update: {
          brand_elements?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          layout_config?: Json
          name?: string
          template_type?: Database["public"]["Enums"]["template_type"]
          updated_at?: string
        }
        Relationships: []
      }
      curated_playlists: {
        Row: {
          created_at: string
          dj_id: string
          event_id: string | null
          id: string
          name: string
          published_at: string | null
          status: Database["public"]["Enums"]["playlist_status"]
          track_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dj_id: string
          event_id?: string | null
          id?: string
          name: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["playlist_status"]
          track_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dj_id?: string
          event_id?: string | null
          id?: string
          name?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["playlist_status"]
          track_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_playlists_dj_id_fkey"
            columns: ["dj_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_playlists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      curated_tracks: {
        Row: {
          added_at: string
          id: string
          playlist_id: string
          position: number
          song_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          playlist_id: string
          position?: number
          song_id: string
        }
        Update: {
          added_at?: string
          id?: string
          playlist_id?: string
          position?: number
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "curated_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_tracks_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      dj_hitlist_snapshots: {
        Row: {
          created_at: string
          data: Json
          event_id: string
          id: string
          snapshot_type: Database["public"]["Enums"]["snapshot_type"]
        }
        Insert: {
          created_at?: string
          data?: Json
          event_id: string
          id?: string
          snapshot_type: Database["public"]["Enums"]["snapshot_type"]
        }
        Update: {
          created_at?: string
          data?: Json
          event_id?: string
          id?: string
          snapshot_type?: Database["public"]["Enums"]["snapshot_type"]
        }
        Relationships: [
          {
            foreignKeyName: "dj_hitlist_snapshots_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      event_dj_playlists: {
        Row: {
          album_art_url: string | null
          created_at: string
          dj_id: string
          event_id: string
          id: string
          position: number
          price_cents: number
          song_artist: string
          song_title: string
          spotify_id: string | null
        }
        Insert: {
          album_art_url?: string | null
          created_at?: string
          dj_id: string
          event_id: string
          id?: string
          position?: number
          price_cents?: number
          song_artist: string
          song_title: string
          spotify_id?: string | null
        }
        Update: {
          album_art_url?: string | null
          created_at?: string
          dj_id?: string
          event_id?: string
          id?: string
          position?: number
          price_cents?: number
          song_artist?: string
          song_title?: string
          spotify_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_dj_playlists_dj_id_fkey"
            columns: ["dj_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_dj_playlists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "user_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_invitations: {
        Row: {
          created_at: string
          dj_id: string
          event_id: string
          id: string
          invited_by: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dj_id: string
          event_id: string
          id?: string
          invited_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dj_id?: string
          event_id?: string
          id?: string
          invited_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_invitations_dj_id_fkey"
            columns: ["dj_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "user_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          allow_explicit: boolean
          allow_pre_event_bids: boolean
          created_at: string
          description: string | null
          dj_id: string | null
          ends_at: string | null
          genre_preferences: string[] | null
          id: string
          max_queue_size: number | null
          min_bid_cents: number
          name: string
          pre_event_starts_at: string | null
          qr_code_url: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          allow_explicit?: boolean
          allow_pre_event_bids?: boolean
          created_at?: string
          description?: string | null
          dj_id?: string | null
          ends_at?: string | null
          genre_preferences?: string[] | null
          id?: string
          max_queue_size?: number | null
          min_bid_cents?: number
          name: string
          pre_event_starts_at?: string | null
          qr_code_url?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          allow_explicit?: boolean
          allow_pre_event_bids?: boolean
          created_at?: string
          description?: string | null
          dj_id?: string | null
          ends_at?: string | null
          genre_preferences?: string[] | null
          id?: string
          max_queue_size?: number | null
          min_bid_cents?: number
          name?: string
          pre_event_starts_at?: string | null
          qr_code_url?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_dj_id_fkey"
            columns: ["dj_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_favorites: {
        Row: {
          guest_id: string
          id: string
          imported_at: string
          song_id: string
          source: Database["public"]["Enums"]["favorite_source"]
        }
        Insert: {
          guest_id: string
          id?: string
          imported_at?: string
          song_id: string
          source?: Database["public"]["Enums"]["favorite_source"]
        }
        Update: {
          guest_id?: string
          id?: string
          imported_at?: string
          song_id?: string
          source?: Database["public"]["Enums"]["favorite_source"]
        }
        Relationships: [
          {
            foreignKeyName: "guest_favorites_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_favorites_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_matches: {
        Row: {
          bid_placed: boolean
          created_at: string
          event_id: string
          guest_id: string
          id: string
          match_source: Database["public"]["Enums"]["match_source"]
          notified: boolean
          playlist_id: string | null
          song_id: string
        }
        Insert: {
          bid_placed?: boolean
          created_at?: string
          event_id: string
          guest_id: string
          id?: string
          match_source: Database["public"]["Enums"]["match_source"]
          notified?: boolean
          playlist_id?: string | null
          song_id: string
        }
        Update: {
          bid_placed?: boolean
          created_at?: string
          event_id?: string
          guest_id?: string
          id?: string
          match_source?: Database["public"]["Enums"]["match_source"]
          notified?: boolean
          playlist_id?: string | null
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_matches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_matches_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_matches_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "curated_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_matches_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_rules: {
        Row: {
          event_id: string
          id: string
          rule_type: Database["public"]["Enums"]["moderation_rule_type"]
          value: string
        }
        Insert: {
          event_id: string
          id?: string
          rule_type: Database["public"]["Enums"]["moderation_rule_type"]
          value: string
        }
        Update: {
          event_id?: string
          id?: string
          rule_type?: Database["public"]["Enums"]["moderation_rule_type"]
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_rules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      originator_rewards: {
        Row: {
          boost_amount_cents: number
          boost_request_id: string | null
          booster_id: string | null
          confirmed_at: string | null
          created_at: string
          event_id: string
          id: string
          originator_id: string
          reversed_at: string | null
          reward_cents: number
          song_id: string
          status: Database["public"]["Enums"]["reward_status"]
        }
        Insert: {
          boost_amount_cents: number
          boost_request_id?: string | null
          booster_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          originator_id: string
          reversed_at?: string | null
          reward_cents: number
          song_id: string
          status?: Database["public"]["Enums"]["reward_status"]
        }
        Update: {
          boost_amount_cents?: number
          boost_request_id?: string | null
          booster_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          originator_id?: string
          reversed_at?: string | null
          reward_cents?: number
          song_id?: string
          status?: Database["public"]["Enums"]["reward_status"]
        }
        Relationships: [
          {
            foreignKeyName: "originator_rewards_boost_request_id_fkey"
            columns: ["boost_request_id"]
            isOneToOne: false
            referencedRelation: "song_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "originator_rewards_booster_id_fkey"
            columns: ["booster_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "originator_rewards_originator_id_fkey"
            columns: ["originator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "originator_rewards_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          captured_at: string | null
          created_at: string
          currency: string
          dj_share_cents: number
          id: string
          originator_reward_cents: number
          platform_share_cents: number
          song_request_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
          user_id: string
          venue_share_cents: number
        }
        Insert: {
          amount_cents: number
          captured_at?: string | null
          created_at?: string
          currency?: string
          dj_share_cents?: number
          id?: string
          originator_reward_cents?: number
          platform_share_cents?: number
          song_request_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          user_id: string
          venue_share_cents?: number
        }
        Update: {
          amount_cents?: number
          captured_at?: string | null
          created_at?: string
          currency?: string
          dj_share_cents?: number
          id?: string
          originator_reward_cents?: number
          platform_share_cents?: number
          song_request_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          user_id?: string
          venue_share_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_song_request_id_fkey"
            columns: ["song_request_id"]
            isOneToOne: false
            referencedRelation: "song_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          period_end: string | null
          period_start: string | null
          recipient_id: string
          recipient_type: Database["public"]["Enums"]["recipient_type"]
          status: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          recipient_id: string
          recipient_type: Database["public"]["Enums"]["recipient_type"]
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          recipient_id?: string
          recipient_type?: Database["public"]["Enums"]["recipient_type"]
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      play_confirmations: {
        Row: {
          confirmation_source: Database["public"]["Enums"]["confirmation_source"]
          confirmed_at: string
          dj_confirmed: boolean
          event_id: string
          hardware_device: string | null
          id: string
          metadata: Json | null
          play_duration_seconds: number | null
          request_group_id: string
          started_at: string | null
        }
        Insert: {
          confirmation_source?: Database["public"]["Enums"]["confirmation_source"]
          confirmed_at?: string
          dj_confirmed?: boolean
          event_id: string
          hardware_device?: string | null
          id?: string
          metadata?: Json | null
          play_duration_seconds?: number | null
          request_group_id: string
          started_at?: string | null
        }
        Update: {
          confirmation_source?: Database["public"]["Enums"]["confirmation_source"]
          confirmed_at?: string
          dj_confirmed?: boolean
          event_id?: string
          hardware_device?: string | null
          id?: string
          metadata?: Json | null
          play_duration_seconds?: number | null
          request_group_id?: string
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "play_confirmations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_confirmations_request_group_id_fkey"
            columns: ["request_group_id"]
            isOneToOne: false
            referencedRelation: "request_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_follows: {
        Row: {
          created_at: string | null
          id: string
          playlist_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          playlist_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          playlist_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_follows_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_tracks: {
        Row: {
          added_at: string | null
          album_art_url: string | null
          album_name: string | null
          artist_name: string
          deezer_preview_url: string | null
          deezer_track_id: string | null
          id: string
          playlist_id: string
          position: number
          spotify_track_id: string | null
          track_name: string
        }
        Insert: {
          added_at?: string | null
          album_art_url?: string | null
          album_name?: string | null
          artist_name: string
          deezer_preview_url?: string | null
          deezer_track_id?: string | null
          id?: string
          playlist_id: string
          position: number
          spotify_track_id?: string | null
          track_name: string
        }
        Update: {
          added_at?: string | null
          album_art_url?: string | null
          album_name?: string | null
          artist_name?: string
          deezer_preview_url?: string | null
          deezer_track_id?: string | null
          id?: string
          playlist_id?: string
          position?: number
          spotify_track_id?: string | null
          track_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          follower_count: number | null
          id: string
          is_public: boolean | null
          spotify_playlist_id: string | null
          title: string
          track_count: number | null
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          follower_count?: number | null
          id?: string
          is_public?: boolean | null
          spotify_playlist_id?: string | null
          title: string
          track_count?: number | null
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          follower_count?: number | null
          id?: string
          is_public?: boolean | null
          spotify_playlist_id?: string | null
          title?: string
          track_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlists_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_event_bids: {
        Row: {
          amount_cents: number
          carried_over_at: string | null
          created_at: string
          event_id: string
          guest_id: string
          id: string
          song_id: string
          status: Database["public"]["Enums"]["pre_event_bid_status"]
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents: number
          carried_over_at?: string | null
          created_at?: string
          event_id: string
          guest_id: string
          id?: string
          song_id: string
          status?: Database["public"]["Enums"]["pre_event_bid_status"]
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number
          carried_over_at?: string | null
          created_at?: string
          event_id?: string
          guest_id?: string
          id?: string
          song_id?: string
          status?: Database["public"]["Enums"]["pre_event_bid_status"]
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_event_bids_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_event_bids_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_event_bids_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_event_tracklists: {
        Row: {
          created_at: string
          event_id: string
          guest_id: string
          id: string
          name: string
          track_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_id: string
          id?: string
          name?: string
          track_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_id?: string
          id?: string
          name?: string
          track_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_event_tracklists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_event_tracklists_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_event_tracks: {
        Row: {
          added_at: string
          id: string
          position: number
          song_id: string
          source: Database["public"]["Enums"]["pre_event_track_source"]
          tracklist_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          position?: number
          song_id: string
          source?: Database["public"]["Enums"]["pre_event_track_source"]
          tracklist_id: string
        }
        Update: {
          added_at?: string
          id?: string
          position?: number
          song_id?: string
          source?: Database["public"]["Enums"]["pre_event_track_source"]
          tracklist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_event_tracks_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_event_tracks_tracklist_id_fkey"
            columns: ["tracklist_id"]
            isOneToOne: false
            referencedRelation: "pre_event_tracklists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          apple_music_connected: boolean
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string | null
          dj_bio: string | null
          dj_genres: string[] | null
          dj_hourly_rate: number | null
          dj_name: string | null
          follower_count: number | null
          following_count: number | null
          id: string
          is_dj: boolean | null
          is_venue: boolean | null
          onboarding_completed: boolean
          playlist_count: number | null
          spotify_connected: boolean
          spotify_display_name: string | null
          spotify_user_id: string | null
          updated_at: string
          username: string
          venue_address: string | null
          venue_capacity: number | null
          venue_city: string | null
          venue_name: string | null
          venue_type: string | null
        }
        Insert: {
          apple_music_connected?: boolean
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          dj_bio?: string | null
          dj_genres?: string[] | null
          dj_hourly_rate?: number | null
          dj_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          id: string
          is_dj?: boolean | null
          is_venue?: boolean | null
          onboarding_completed?: boolean
          playlist_count?: number | null
          spotify_connected?: boolean
          spotify_display_name?: string | null
          spotify_user_id?: string | null
          updated_at?: string
          username: string
          venue_address?: string | null
          venue_capacity?: number | null
          venue_city?: string | null
          venue_name?: string | null
          venue_type?: string | null
        }
        Update: {
          apple_music_connected?: boolean
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          dj_bio?: string | null
          dj_genres?: string[] | null
          dj_hourly_rate?: number | null
          dj_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          is_dj?: boolean | null
          is_venue?: boolean | null
          onboarding_completed?: boolean
          playlist_count?: number | null
          spotify_connected?: boolean
          spotify_display_name?: string | null
          spotify_user_id?: string | null
          updated_at?: string
          username?: string
          venue_address?: string | null
          venue_capacity?: number | null
          venue_city?: string | null
          venue_name?: string | null
          venue_type?: string | null
        }
        Relationships: []
      }
      queue_items: {
        Row: {
          created_at: string
          ended_at: string | null
          event_id: string
          id: string
          position: number
          request_group_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["queue_status"]
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          event_id: string
          id?: string
          position: number
          request_group_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["queue_status"]
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          event_id?: string
          id?: string
          position?: number
          request_group_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["queue_status"]
        }
        Relationships: [
          {
            foreignKeyName: "queue_items_request_group_id_fkey"
            columns: ["request_group_id"]
            isOneToOne: false
            referencedRelation: "request_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_conversions: {
        Row: {
          conversion_type: Database["public"]["Enums"]["conversion_type"]
          created_at: string
          downstream_gmv_cents: number
          id: string
          referral_link_id: string
          referred_user_id: string
          reward_cents: number
        }
        Insert: {
          conversion_type: Database["public"]["Enums"]["conversion_type"]
          created_at?: string
          downstream_gmv_cents?: number
          id?: string
          referral_link_id: string
          referred_user_id: string
          reward_cents?: number
        }
        Update: {
          conversion_type?: Database["public"]["Enums"]["conversion_type"]
          created_at?: string
          downstream_gmv_cents?: number
          id?: string
          referral_link_id?: string
          referred_user_id?: string
          reward_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_referral_link_id_fkey"
            columns: ["referral_link_id"]
            isOneToOne: false
            referencedRelation: "referral_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_conversions_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_links: {
        Row: {
          click_count: number
          code: string
          conversion_count: number
          created_at: string
          id: string
          owner_id: string
          owner_type: Database["public"]["Enums"]["referral_owner_type"]
          target_id: string | null
          target_type: Database["public"]["Enums"]["referral_target_type"]
          url: string | null
        }
        Insert: {
          click_count?: number
          code: string
          conversion_count?: number
          created_at?: string
          id?: string
          owner_id: string
          owner_type: Database["public"]["Enums"]["referral_owner_type"]
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["referral_target_type"]
          url?: string | null
        }
        Update: {
          click_count?: number
          code?: string
          conversion_count?: number
          created_at?: string
          id?: string
          owner_id?: string
          owner_type?: Database["public"]["Enums"]["referral_owner_type"]
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["referral_target_type"]
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_links_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      request_groups: {
        Row: {
          created_at: string
          event_id: string
          id: string
          originator_id: string | null
          queue_position: number | null
          request_count: number
          song_id: string
          status: Database["public"]["Enums"]["group_status"]
          total_amount_cents: number
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          originator_id?: string | null
          queue_position?: number | null
          request_count?: number
          song_id: string
          status?: Database["public"]["Enums"]["group_status"]
          total_amount_cents?: number
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          originator_id?: string | null
          queue_position?: number | null
          request_count?: number
          song_id?: string
          status?: Database["public"]["Enums"]["group_status"]
          total_amount_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "request_groups_originator_id_fkey"
            columns: ["originator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_groups_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      share_events: {
        Row: {
          created_at: string
          id: string
          platform: Database["public"]["Enums"]["share_platform"]
          referral_link_id: string | null
          share_type: Database["public"]["Enums"]["share_type"]
          target_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: Database["public"]["Enums"]["share_platform"]
          referral_link_id?: string | null
          share_type: Database["public"]["Enums"]["share_type"]
          target_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["share_platform"]
          referral_link_id?: string | null
          share_type?: Database["public"]["Enums"]["share_type"]
          target_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_events_referral_link_id_fkey"
            columns: ["referral_link_id"]
            isOneToOne: false
            referencedRelation: "referral_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connections: {
        Row: {
          access_token_encrypted: string | null
          connected_at: string
          created_at: string
          followers_count: number
          id: string
          last_synced_at: string | null
          platform: Database["public"]["Enums"]["connection_platform"]
          platform_user_id: string | null
          platform_username: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          connected_at?: string
          created_at?: string
          followers_count?: number
          id?: string
          last_synced_at?: string | null
          platform: Database["public"]["Enums"]["connection_platform"]
          platform_user_id?: string | null
          platform_username?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          connected_at?: string
          created_at?: string
          followers_count?: number
          id?: string
          last_synced_at?: string | null
          platform?: Database["public"]["Enums"]["connection_platform"]
          platform_user_id?: string | null
          platform_username?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_shares: {
        Row: {
          click_count: number
          content_template_id: string | null
          content_type: Database["public"]["Enums"]["social_content_type"]
          conversion_count: number
          created_at: string
          event_id: string | null
          id: string
          impression_count: number
          platform: Database["public"]["Enums"]["social_platform"]
          referral_link_id: string | null
          target_id: string | null
          user_id: string
        }
        Insert: {
          click_count?: number
          content_template_id?: string | null
          content_type: Database["public"]["Enums"]["social_content_type"]
          conversion_count?: number
          created_at?: string
          event_id?: string | null
          id?: string
          impression_count?: number
          platform: Database["public"]["Enums"]["social_platform"]
          referral_link_id?: string | null
          target_id?: string | null
          user_id: string
        }
        Update: {
          click_count?: number
          content_template_id?: string | null
          content_type?: Database["public"]["Enums"]["social_content_type"]
          conversion_count?: number
          created_at?: string
          event_id?: string | null
          id?: string
          impression_count?: number
          platform?: Database["public"]["Enums"]["social_platform"]
          referral_link_id?: string | null
          target_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_social_shares_template"
            columns: ["content_template_id"]
            isOneToOne: false
            referencedRelation: "content_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_shares_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_shares_referral_link_id_fkey"
            columns: ["referral_link_id"]
            isOneToOne: false
            referencedRelation: "referral_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      song_requests: {
        Row: {
          amount_cents: number
          created_at: string
          event_id: string
          id: string
          is_boost: boolean
          original_request_id: string | null
          request_group_id: string | null
          requester_id: string
          song_id: string
          status: Database["public"]["Enums"]["request_status"]
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          event_id: string
          id?: string
          is_boost?: boolean
          original_request_id?: string | null
          request_group_id?: string | null
          requester_id: string
          song_id: string
          status?: Database["public"]["Enums"]["request_status"]
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          event_id?: string
          id?: string
          is_boost?: boolean
          original_request_id?: string | null
          request_group_id?: string | null
          requester_id?: string
          song_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_requests_original_request_id_fkey"
            columns: ["original_request_id"]
            isOneToOne: false
            referencedRelation: "song_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_requests_request_group_id_fkey"
            columns: ["request_group_id"]
            isOneToOne: false
            referencedRelation: "request_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_requests_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          album: string | null
          album_art_url: string | null
          apple_music_id: string | null
          artist: string
          bpm: number | null
          created_at: string
          duration_ms: number | null
          energy: number | null
          explicit: boolean
          genre: string | null
          id: string
          spotify_id: string | null
          title: string
          youtube_music_id: string | null
        }
        Insert: {
          album?: string | null
          album_art_url?: string | null
          apple_music_id?: string | null
          artist: string
          bpm?: number | null
          created_at?: string
          duration_ms?: number | null
          energy?: number | null
          explicit?: boolean
          genre?: string | null
          id?: string
          spotify_id?: string | null
          title: string
          youtube_music_id?: string | null
        }
        Update: {
          album?: string | null
          album_art_url?: string | null
          apple_music_id?: string | null
          artist?: string
          bpm?: number | null
          created_at?: string
          duration_ms?: number | null
          energy?: number | null
          explicit?: boolean
          genre?: string | null
          id?: string
          spotify_id?: string | null
          title?: string
          youtube_music_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          city: string | null
          cover_image_url: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          end_time: string | null
          entrance_fee_cents: number | null
          entrance_fee_currency: string | null
          event_date: string
          id: string
          is_active: boolean | null
          is_public: boolean | null
          start_time: string | null
          title: string
          updated_at: string | null
          venue_address: string | null
          venue_lat: number | null
          venue_lng: number | null
          venue_name: string | null
          venue_place_id: string | null
        }
        Insert: {
          city?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          end_time?: string | null
          entrance_fee_cents?: number | null
          entrance_fee_currency?: string | null
          event_date: string
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          start_time?: string | null
          title: string
          updated_at?: string | null
          venue_address?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
          venue_place_id?: string | null
        }
        Update: {
          city?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          end_time?: string | null
          entrance_fee_cents?: number | null
          entrance_fee_currency?: string | null
          event_date?: string
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          start_time?: string | null
          title?: string
          updated_at?: string | null
          venue_address?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
          venue_place_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          id: string
          last_city: string | null
          last_latitude: number | null
          last_location_update: string | null
          last_longitude: number | null
          updated_at: string
        }
        Insert: {
          id: string
          last_city?: string | null
          last_latitude?: number | null
          last_location_update?: string | null
          last_longitude?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          last_city?: string | null
          last_latitude?: number | null
          last_location_update?: string | null
          last_longitude?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tiers: {
        Row: {
          created_at: string
          id: string
          tier: Database["public"]["Enums"]["user_tier"]
          tier_updated_at: string | null
          total_bids_placed: number
          total_originator_rewards_cents: number
          total_referrals: number
          total_shares: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tier?: Database["public"]["Enums"]["user_tier"]
          tier_updated_at?: string | null
          total_bids_placed?: number
          total_originator_rewards_cents?: number
          total_referrals?: number
          total_shares?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tier?: Database["public"]["Enums"]["user_tier"]
          tier_updated_at?: string | null
          total_bids_placed?: number
          total_originator_rewards_cents?: number
          total_referrals?: number
          total_shares?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tiers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_user_role: {
        Args: {
          p_new_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      calculate_payment_split: {
        Args: {
          amount_cents: number
          is_third_party_boost: boolean
          p_originator_id: string
        }
        Returns: {
          dj_share: number
          originator_reward: number
          platform_share: number
          venue_share: number
        }[]
      }
      carry_over_pre_event_bids: {
        Args: { p_event_id: string }
        Returns: number
      }
      compute_guest_matches: {
        Args: { p_event_id: string; p_guest_id: string }
        Returns: number
      }
      connect_social_platform: {
        Args: {
          p_platform: string
          p_platform_user_id: string
          p_platform_username: string
          p_user_id: string
        }
        Returns: {
          access_token_encrypted: string | null
          connected_at: string
          created_at: string
          followers_count: number
          id: string
          last_synced_at: string | null
          platform: Database["public"]["Enums"]["connection_platform"]
          platform_user_id: string | null
          platform_username: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "social_connections"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_boost_group: {
        Args: { p_creator_id: string; p_event_id: string; p_song_id: string }
        Returns: {
          created_at: string
          creator_id: string
          event_id: string
          id: string
          invite_link: string
          member_count: number
          song_id: string
          status: Database["public"]["Enums"]["boost_group_status"]
          total_boost_cents: number
        }
        SetofOptions: {
          from: "*"
          to: "boost_groups"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_notification: {
        Args: {
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_post_event_recap: {
        Args: { p_event_id: string; p_user_id: string }
        Returns: Json
      }
      generate_referral_link: {
        Args: {
          p_owner_id: string
          p_owner_type: string
          p_target_id?: string
          p_target_type: string
        }
        Returns: {
          click_count: number
          code: string
          conversion_count: number
          created_at: string
          id: string
          owner_id: string
          owner_type: Database["public"]["Enums"]["referral_owner_type"]
          target_id: string | null
          target_type: Database["public"]["Enums"]["referral_target_type"]
          url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "referral_links"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_request_group: {
        Args: {
          p_amount: number
          p_event_id: string
          p_is_boost: boolean
          p_requester_id: string
          p_song_id: string
        }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_event_dj: { Args: { p_event_id: string }; Returns: boolean }
      is_event_venue_owner: { Args: { p_event_id: string }; Returns: boolean }
      is_playlist_owner: { Args: { _playlist_id: string }; Returns: boolean }
      is_playlist_published: {
        Args: { _playlist_id: string }
        Returns: boolean
      }
      is_tracklist_owner: { Args: { _tracklist_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      record_referral_conversion: {
        Args: {
          p_conversion_type: string
          p_referral_code: string
          p_referred_user_id: string
        }
        Returns: {
          conversion_type: Database["public"]["Enums"]["conversion_type"]
          created_at: string
          downstream_gmv_cents: number
          id: string
          referral_link_id: string
          referred_user_id: string
          reward_cents: number
        }
        SetofOptions: {
          from: "*"
          to: "referral_conversions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_social_share: {
        Args: {
          p_content_type: string
          p_event_id: string
          p_platform: string
          p_target_id: string
          p_user_id: string
        }
        Returns: {
          click_count: number
          content_template_id: string | null
          content_type: Database["public"]["Enums"]["social_content_type"]
          conversion_count: number
          created_at: string
          event_id: string | null
          id: string
          impression_count: number
          platform: Database["public"]["Enums"]["social_platform"]
          referral_link_id: string | null
          target_id: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "social_shares"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_queue_positions: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      update_user_tier: { Args: { p_user_id: string }; Returns: undefined }
      upsert_song: {
        Args: {
          p_album_art_url?: string
          p_artist: string
          p_explicit?: boolean
          p_spotify_id?: string
          p_title: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "guest" | "dj" | "venue" | "admin"
      boost_group_status: "active" | "completed" | "expired"
      confirmation_source: "hardware" | "software" | "manual"
      connection_platform: "instagram" | "tiktok" | "spotify" | "google"
      conversion_type: "signup" | "first_bid" | "event_join"
      event_status:
        | "draft"
        | "scheduled"
        | "pre_event"
        | "active"
        | "ended"
        | "cancelled"
      favorite_source: "spotify" | "apple_music" | "manual"
      group_status:
        | "pending"
        | "accepted"
        | "playing"
        | "completed"
        | "rejected"
        | "skipped"
      match_source:
        | "spotify_top"
        | "spotify_recent"
        | "apple_library"
        | "manual_favorite"
        | "listening_history"
      moderation_rule_type: "block_artist" | "block_song" | "block_genre"
      payment_status:
        | "authorized"
        | "captured"
        | "released"
        | "refunded"
        | "failed"
      payout_status: "pending" | "processing" | "completed" | "failed"
      playlist_status: "draft" | "published"
      pre_event_bid_status: "active" | "carried_over" | "released"
      pre_event_track_source: "dj_playlist" | "search" | "suggestion"
      queue_status: "queued" | "now_playing" | "played" | "skipped"
      recipient_type: "dj" | "venue" | "guest"
      referral_owner_type: "guest" | "dj" | "venue"
      referral_target_type: "event" | "playlist" | "track" | "general"
      request_status:
        | "reserved"
        | "queued"
        | "playing"
        | "confirmed"
        | "charged"
        | "released"
        | "rejected"
      reward_status: "pending" | "confirmed" | "reversed"
      share_platform:
        | "whatsapp"
        | "instagram"
        | "tiktok"
        | "twitter"
        | "copy_link"
      share_type: "track" | "playlist" | "event" | "reward_card" | "battle"
      snapshot_type: "pre_event" | "live"
      social_content_type:
        | "track_bid"
        | "track_top"
        | "track_played"
        | "battle_won"
        | "top_supporter"
        | "event_promo"
        | "playlist_promo"
        | "reward_card"
        | "post_event_recap"
        | "dj_stats"
      social_platform:
        | "instagram_story"
        | "tiktok"
        | "whatsapp"
        | "messenger"
        | "copy_link"
      template_type:
        | "instagram_story"
        | "tiktok_short"
        | "whatsapp_card"
        | "event_recap"
        | "dj_promo"
      user_tier: "rookie" | "trend_starter" | "top_influencer" | "kingmaker"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["guest", "dj", "venue", "admin"],
      boost_group_status: ["active", "completed", "expired"],
      confirmation_source: ["hardware", "software", "manual"],
      connection_platform: ["instagram", "tiktok", "spotify", "google"],
      conversion_type: ["signup", "first_bid", "event_join"],
      event_status: [
        "draft",
        "scheduled",
        "pre_event",
        "active",
        "ended",
        "cancelled",
      ],
      favorite_source: ["spotify", "apple_music", "manual"],
      group_status: [
        "pending",
        "accepted",
        "playing",
        "completed",
        "rejected",
        "skipped",
      ],
      match_source: [
        "spotify_top",
        "spotify_recent",
        "apple_library",
        "manual_favorite",
        "listening_history",
      ],
      moderation_rule_type: ["block_artist", "block_song", "block_genre"],
      payment_status: [
        "authorized",
        "captured",
        "released",
        "refunded",
        "failed",
      ],
      payout_status: ["pending", "processing", "completed", "failed"],
      playlist_status: ["draft", "published"],
      pre_event_bid_status: ["active", "carried_over", "released"],
      pre_event_track_source: ["dj_playlist", "search", "suggestion"],
      queue_status: ["queued", "now_playing", "played", "skipped"],
      recipient_type: ["dj", "venue", "guest"],
      referral_owner_type: ["guest", "dj", "venue"],
      referral_target_type: ["event", "playlist", "track", "general"],
      request_status: [
        "reserved",
        "queued",
        "playing",
        "confirmed",
        "charged",
        "released",
        "rejected",
      ],
      reward_status: ["pending", "confirmed", "reversed"],
      share_platform: [
        "whatsapp",
        "instagram",
        "tiktok",
        "twitter",
        "copy_link",
      ],
      share_type: ["track", "playlist", "event", "reward_card", "battle"],
      snapshot_type: ["pre_event", "live"],
      social_content_type: [
        "track_bid",
        "track_top",
        "track_played",
        "battle_won",
        "top_supporter",
        "event_promo",
        "playlist_promo",
        "reward_card",
        "post_event_recap",
        "dj_stats",
      ],
      social_platform: [
        "instagram_story",
        "tiktok",
        "whatsapp",
        "messenger",
        "copy_link",
      ],
      template_type: [
        "instagram_story",
        "tiktok_short",
        "whatsapp_card",
        "event_recap",
        "dj_promo",
      ],
      user_tier: ["rookie", "trend_starter", "top_influencer", "kingmaker"],
    },
  },
} as const
