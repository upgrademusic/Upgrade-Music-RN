import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

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
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user || isLoading) return;

    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => {
        setRole((data?.role as any) ?? 'guest');
      });
  }, [session?.user?.id]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && role && inAuthGroup) {
      router.replace(`/(${role})/home` as any);
    }
  }, [session, role, isLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <AuthGate />
    </>
  );
}
