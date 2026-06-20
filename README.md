# Upgrade Music — React Native App

A live event song-request platform where guests bid on songs in real-time. Built with Expo SDK 54 / React Native, powered by Supabase and Stripe.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 · expo-router v6 |
| Language | TypeScript |
| Backend | Supabase (Postgres + Edge Functions + Realtime) |
| Payments | Stripe (React Native SDK) |
| Auth | Supabase Auth — Google OAuth + email/password |
| Maps | react-native-maps (native) · Google Maps Static API (web) |
| Venue Search | react-native-google-places-autocomplete (native) · Google Maps JS SDK (web) |
| Styling | NativeWind v4 (TailwindCSS) + StyleSheet |
| State | Zustand |

---

## Prerequisites

- Node 18+
- Expo Go app on your phone (iOS or Android)
- A Supabase project
- A Stripe account
- A Google Cloud project with Maps, Places, and Static Maps APIs enabled

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/upgrademusic/Upgrade-Music-RN.git
cd Upgrade-Music-RN
npm install --legacy-peer-deps
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

### 3. Start the dev server

```bash
npx expo start --clear
```

Scan the QR code with Expo Go to run on your device, or open `http://localhost:8081` in a browser.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/             # Login, onboarding
│   └── (app)/
│       ├── (home)/         # Home feed — stories, live events, discover
│       ├── (search)/       # Search — songs, artists, events, videos
│       ├── (event)/        # Create hub — event, playlist, media upload
│       ├── (inbox)/        # Inbox / activity
│       └── (profile)/      # Profile — Guest / DJ / Venue modes
├── components/
│   ├── VenueMap.tsx            # Web: Static Maps image
│   ├── VenueMap.native.tsx     # Native: react-native-maps MapView
│   ├── VenueSearch.tsx         # Web: Google Maps JS SDK autocomplete
│   └── VenueSearch.native.tsx  # Native: GooglePlacesAutocomplete
├── constants/
│   └── theme.ts            # Colors, Spacing, Radius tokens
├── hooks/
│   ├── useEventQueue.ts    # Realtime song request queue
│   └── useSongSearch.ts    # Spotify search via edge function
├── lib/
│   ├── supabase.ts
│   ├── auth-storage.native.ts / .web.ts
│   └── stripe-provider.native.tsx / .web.tsx
└── store/
    └── auth.ts             # Zustand: session, user, role
```

---

## Key Features

### For Guests
- Browse live events and bid on songs in real-time
- Boost songs already in the queue
- View personal bid history and spending on the profile

### For DJs
- Create events with venue autocomplete (Google Places), date/time pickers, genre chips, artist invitations
- Invite artists by searching existing Upgrade Music users or by email
- View hosted events, total revenue, and per-event earnings in DJ profile mode

### For Venues
- Manage events hosted at the venue
- Track revenue and venue payout (25% of total bids)

---

## Supabase Edge Functions

| Function | Purpose |
|---|---|
| `spotify-search` | Proxies Spotify API song search |
| `create-payment-intent` | Creates Stripe PaymentIntent for a bid |
| `send-artist-invite` | Sends React Email invitation to performing artists |
| `process-email-queue` | Processes the transactional email queue |

---

## Database Schema (key tables)

| Table | Description |
|---|---|
| `profiles` | User profiles — display_name, username, bio, avatar_url, city |
| `user_roles` | Role per user: guest · dj · venue · admin |
| `user_followers` | Follow graph — follower_id → following_id |
| `events` | Events with DJ, venue, genre, bid settings |
| `event_artists` | Artists performing at an event (invite flow) |
| `songs` | Song catalogue from Spotify |
| `song_requests` | Individual bid/boost requests |
| `request_groups` | Grouped bids per song per event |
| `payments` | Stripe payment records — DJ 50% / Venue 25% / Platform 25% |
| `payouts` | Stripe transfer records per recipient |
| `venues` | Venue records with Google Maps location (lat/lng) |

---

## Platform Notes

### Native (Expo Go / dev build)
- Full Google Places autocomplete for venue search
- Interactive dark-styled MapView for venue preview
- Native date/time pickers (bottom sheet modal on iOS)
- Stripe payment sheet

### Web (localhost:8081)
- Google Maps JS SDK autocomplete (same Places API, loaded via script injection)
- Static Maps API image for venue preview (dark-styled to match app theme)
- Web stubs for native-only packages via `.native.tsx` / `.tsx` platform extensions

---

## Commands

```bash
npx expo start           # Start Metro bundler
npx expo start --clear   # Clear Metro cache (use after npm install)
npx tsc --noEmit         # TypeScript type-check
npm install --legacy-peer-deps  # Install packages (always use this flag)
```

---

## Design Tokens

| Token | Value |
|---|---|
| Background deep | `#0D0B1A` |
| Background base | `#1A1035` |
| Surface | `#221845` |
| Card | `#2A1F55` |
| Accent purple | `#9B7BFF` |
| Accent light | `#B794FF` |
| Text primary | `#FFFFFF` |
| Text secondary | `#B0A8D0` |
| Text muted | `#6B6285` |
