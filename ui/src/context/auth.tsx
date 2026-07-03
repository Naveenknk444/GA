import type { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type AuthCtx = {
  user: User | null;
  shortId: string | null;
  loading: boolean;
  checkMemberIdAvailable: (memberId: string) => Promise<boolean>;
  signIn: (memberId: string, cleanDate: string) => Promise<void>;
  signInWithMemberId: (memberId: string, cleanDate: string) => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null, shortId: null, loading: true,
  checkMemberIdAvailable: async () => true,
  signIn: async () => {},
  signInWithMemberId: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkMemberIdAvailable(memberId: string): Promise<boolean> {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', memberId.toLowerCase().trim());
    return (count ?? 1) === 0;
  }

  async function signIn(memberId: string, cleanDate: string) {
    const id = memberId.toLowerCase().trim();

    // Step 1: create anonymous session
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    if (!data.user) throw new Error('Account creation failed');

    // Step 2: link email+password so the user can recover on a new device.
    // Requires "Confirm email" to be DISABLED in Supabase → Authentication → Email settings.
    const { error: linkErr } = await supabase.auth.updateUser({
      email: `${id}@recovery.ga`,
      password: cleanDate,
    });
    if (linkErr) throw linkErr;

    // Step 3: save member_id and clean_date in profile
    await supabase.from('profiles').upsert(
      { id: data.user.id, handle: id, member_id: id, clean_date: cleanDate },
      { onConflict: 'id' },
    );

    setUser(data.user);
  }

  async function signInWithMemberId(memberId: string, cleanDate: string) {
    const id = memberId.toLowerCase().trim();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${id}@recovery.ga`,
      password: cleanDate,
    });
    if (error) throw error;
    if (data.user) setUser(data.user);
  }

  const shortId = user?.id.slice(0, 8) ?? null;

  return (
    <AuthContext.Provider value={{ user, shortId, loading, checkMemberIdAvailable, signIn, signInWithMemberId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
