# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Upgrade Music — a live event song-request platform where guests bid on songs in real-time. React Native / Expo SDK 54 rebuild of the original Capacitor web app. Same Supabase backend (`semjiezsvbmebmzrnypz`).

## Commands

```bash
npx expo start          # start Metro + open QR for Expo Go
npx expo start --clear  # same but wipes Metro cache (use after installing packages)
npx tsc --noEmit        # type-check without building
npm install --legacy-peer-deps  # always use this flag — peer conflicts are expected
```

> After any `npm install`, restart Expo with `--clear`. The bundler caches transforms and will serve stale output otherwise.

## Architecture

### Routing (`src/app/`)

expo-router v6 file-based routing. Four role-based tab groups:

```
(auth)/         login, onboarding
(guest)/        home, search, queue, activity, profile
(dj)/           home (dashboard), queue, analytics, profile
(venue)/        home, events, analytics
event/[id]      full event detail — outside all groups so no tab bar shows
```

`_layout.tsx` (root) wraps everything in `StripeProvider` + `AuthGate`. `AuthGate` handles all session/role checks and redirects:
1. No session → `/(auth)/login`
2. Session + role → `/(${role})/home`
3. Role mismatch → redirect to correct group

### Auth & Role Resolution

`src/lib/supabase.ts` — single Supabase client, PKCE flow, tokens persisted via `expo-secure-store`.

`src/store/auth.ts` — Zustand store: `{ session, user, role, isLoading }`. Role is fetched from the `user_roles` table after session is established. Role is one of `guest | dj | venue | admin`.

Google OAuth uses `expo-auth-session` + `WebBrowser.openAuthSessionAsync` with deep-link redirect scheme `upgrademusic://auth/callback`. This URI must be whitelisted in Supabase Auth → Redirect URLs.

### Payment Flow (`src/app/event/[id].tsx`)

The bid/request flow is 5 sequential steps — each must succeed before the next:
1. Upsert song into `songs` table (by `spotify_id`)
2. Call `increment_request_group` RPC → reserves slot, returns `groupId`
3. Call `create-payment-intent` edge function → returns Stripe `clientSecret`
4. `initPaymentSheet` + `presentPaymentSheet` — user pays
5. Insert `song_requests` row; if boosting, insert `originator_rewards` (5% of boost amount)

### Real-Time Queue

`src/hooks/useEventQueue.ts` — subscribes to Supabase Realtime channel on `request_groups` filtered by `event_id`. Queue is sorted client-side by `total_amount_cents` desc. DJ dashboard (`(dj)/home.tsx`) uses the same pattern with its own channel.

### Spotify Search

`src/hooks/useSongSearch.ts` — 350ms debounced search via Supabase edge function `spotify-search`. Enriches results with queue data (shows "Boost $X" badge if song is already in queue).

## Environment

`.env.local` (gitignored) — required vars:
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

## Styling

- NativeWind v4 (TailwindCSS for RN). `className` for layout, `StyleSheet` for dynamic/computed values.
- All colors/spacing/radii are in `src/constants/theme.ts` — always use these constants, never hardcode values.
- Dark mode only. Background: `Colors.bg.deep → Colors.bg.base`. Accent: `Colors.purple.DEFAULT / .light`.
- `SafeAreaView` from `react-native-safe-area-context`, not RN core.

## Business Rules

- Revenue split on each request: 50% DJ / 25% Venue / 25% Platform
- Originator reward: when someone boosts a song they didn't originally request, 5% of the boost goes to the original requester (`originator_rewards` table)
- `request_groups.status` valid values: `pending`, `accepted`, `playing`, `completed`, `skipped`, `rejected`

## SDK 54 Dependency Notes

These are non-obvious requirements that break the app if wrong:
- `@react-navigation/native` must be **v7+** (expo-router v6 calls `createScreenFactory` which doesn't exist in v6)
- `react-native-worklets` must be **explicitly installed** — Reanimated v4 (SDK 54) depends on it but doesn't auto-install it
- When changing `expo` version, run `npx expo install --fix` to pin all expo-* packages, then `npm install --legacy-peer-deps`

## Path Alias

`@/` maps to `src/` (configured in `tsconfig.json`).
