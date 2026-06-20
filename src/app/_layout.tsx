import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, role, isLoading, setSession, setRole, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user || isLoading) return;

    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRole((data?.role as any) ?? 'guest');
        setLoading(false);
      });
  }, [session?.user?.id]);

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === '(auth)';
    const inGuest = segments[0] === '(guest)';
    const inDj = segments[0] === '(dj)';
    const inVenue = segments[0] === '(venue)';
    const inApp = inGuest || inDj || inVenue || segments[0] === 'event';

    if (!session && !inAuth) {
      router.replace('/(auth)/login');
    } else if (session && role) {
      if (inAuth) {
        router.replace(`/(${role})/home` as any);
      } else if (inApp) {
        // Check role mismatch
        if (role === 'dj' && inGuest) router.replace('/(dj)/home');
        if (role === 'venue' && inGuest) router.replace('/(venue)/home');
        if (role === 'guest' && inDj) router.replace('/(guest)/home');
        if (role === 'guest' && inVenue) router.replace('/(guest)/home');
      }
    }
  }, [session, role, isLoading, segments[0]]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <StatusBar style="light" />
      <AuthGate />
    </StripeProvider>
  );
}
