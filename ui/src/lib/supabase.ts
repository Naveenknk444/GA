import { createClient } from '@supabase/supabase-js';

/**
 * The single Supabase client for the whole app.
 *
 * Reads the URL + anon key from the .env file (EXPO_PUBLIC_* vars are injected
 * by Expo at build time). The anon key is public-safe; Row Level Security in
 * the database is what actually protects the data.
 *
 * persistSession is off for now because this phase only READS public data
 * (meetings) and needs no login. We'll turn it on when we add anonymous auth
 * for posting.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY as string;

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,       // keep the anonymous session across refreshes
    autoRefreshToken: true,
    detectSessionInUrl: false,  // not using OAuth redirect links
  },
});
