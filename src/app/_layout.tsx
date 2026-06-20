import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@/lib/stripe-provider';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, role, isLoading, setSession, setRole, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        setRole((data?.role as any) ?? 'guest');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        setRole((data?.role as any) ?? 'guest');
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === '(auth)';

    if (!session && !inAuth) {
      router.replace('/(auth)/login');
    } else if (session && role && inAuth) {
      router.replace('/(app)/(home)/' as any);
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
