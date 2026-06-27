import { supabase } from '@/lib/supabase';

export type ProfileRow = {
  id: string;
  handle: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  bio: string | null;
  clean_date: string | null;
  recovery_phrase: string | null;
  gambling_types: string[] | null;
  quiz_score: number | null;
};

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, handle, first_name, last_name, city, bio, clean_date, recovery_phrase, gambling_types, quiz_score')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as ProfileRow;
}

export async function updateGamblingTypes(userId: string, types: string[]): Promise<void> {
  const { error } = await supabase.from('profiles').update({ gambling_types: types }).eq('id', userId);
  if (error) throw error;
}

export async function updateQuizScore(userId: string, score: number): Promise<void> {
  const { error } = await supabase.from('profiles').update({ quiz_score: score }).eq('id', userId);
  if (error) throw error;
}

export async function updateHandle(userId: string, handle: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ handle: handle.trim() })
    .eq('id', userId);
  if (error) throw error;
}

export async function updatePersonalInfo(
  userId: string,
  info: { firstName: string; lastName: string; city: string; bio: string },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: info.firstName.trim() || null,
      last_name:  info.lastName.trim()  || null,
      city:       info.city.trim()      || null,
      bio:        info.bio.trim()       || null,
    })
    .eq('id', userId);
  if (error) throw error;
}

export async function updateCleanDate(userId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ clean_date: date.trim() || null })
    .eq('id', userId);
  if (error) throw error;
}
