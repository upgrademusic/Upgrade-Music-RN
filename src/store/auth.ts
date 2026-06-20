import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

type Role = 'guest' | 'dj' | 'venue' | 'admin';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: Role | null;
  isDJ: boolean;
  isVenue: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setRole: (role: Role | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  isDJ: false,
  isVenue: false,
  isAdmin: false,
  isLoading: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setRole: (role) => set({
    role,
    isDJ: role === 'dj',
    isVenue: role === 'venue',
    isAdmin: role === 'admin',
  }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ session: null, user: null, role: null, isDJ: false, isVenue: false, isAdmin: false }),
}));
