import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

type Role = 'guest' | 'dj' | 'venue' | 'admin';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: Role | null;
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
  isLoading: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setRole: (role) => set({ role }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ session: null, user: null, role: null }),
}));
