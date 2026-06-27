import type { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type AuthCtx = {
  user: User | null;
  shortId: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithMemberId: (shortId: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null, shortId: null, loading: true,
  signIn: async () => {},
  signInWithMemberId: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session (returning user).
    // If none, stay on the login screen — don't auto-sign-in.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn() {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;   // bubble up so the login screen can show the message
    if (data.user) {
      await supabase.from('profiles').upsert(
        { id: data.user.id, handle: 'Member ' + data.user.id.slice(0, 8) },
        { onConflict: 'id', ignoreDuplicates: true }
      );
      setUser(data.user);
    }
  }

  async function signInWithMemberId(shortId: string, password: string) {
    // We store credentials as shortId@recovery.ga — no real email involved.
    const email = `${shortId.trim().toLowerCase()}@recovery.ga`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) setUser(data.user);
  }

  const shortId = user?.id.slice(0, 8) ?? null;

  return (
    <AuthContext.Provider value={{ user, shortId, loading, signIn, signInWithMemberId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
