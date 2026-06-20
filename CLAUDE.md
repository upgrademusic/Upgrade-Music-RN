# CLAUDE.md — Upgrade Music RN

## Project
React Native rebuild of the Upgrade Music web app using Expo SDK 56 + expo-router.
Supabase project: `semjiezsvbmebmzrnypz` (same backend as web app).

## Architecture
- **Router**: expo-router v3 (file-based). Route groups: `(auth)`, `(guest)`, `(dj)`, `(venue)`
- **Auth**: Supabase auth + `expo-secure-store`. Role resolved from `user_roles` table. Store: `src/store/auth.ts`
- **Supabase client**: `src/lib/supabase.ts` — import as `import { supabase } from '@/lib/supabase'`
- **Database types**: `src/types/database.ts` (generated, do not edit manually)
- **State**: Zustand stores in `src/store/`
- **Styling**: NativeWind v4 (TailwindCSS for RN). Use className for layout, `StyleSheet` for dynamic/computed values
- **Payments**: `@stripe/stripe-react-native`

## Business Rules
- Revenue split: 50% DJ / 25% Venue / 25% Platform
- Originator Reward: 5% off-top to original requester on third-party boosts
- Roles: `guest`, `dj`, `venue`, `admin` (stored in `user_roles` table)

## Aesthetic
- **Dark mode only** — no light mode, no white backgrounds
- Background: `Colors.bg.deep` (#0D0B1A) → `Colors.bg.base` (#1A1035)
- Purple accent: `Colors.purple.DEFAULT` (#9B7BFF) / `Colors.purple.light` (#B794FF)
- All colors in `src/constants/theme.ts`

## Conventions
- Env vars: `EXPO_PUBLIC_` prefix, stored in `.env.local`
- Alias: `@/` → `src/`
- SafeAreaView from `react-native-safe-area-context`, not RN core
- No light-mode variants. Always use dark palette.

## Feature Status (inheriting from web)
- Auth (Google OAuth, email): needs RN implementation
- DJ dashboard, Venue dashboard: shells only
- Spotify search: via Supabase edge function `spotify-search`
- Deezer 30s previews: via edge function `deezer-preview`
- Monetary engine (bids, payments): PRIORITY 1
- RSVP system: PRIORITY 2
- Real-time comments: PRIORITY 3
