import { supabase } from '@/lib/supabase';

export type PRGMeeting = {
  id: string;
  user_id: string;
  member_name: string | null;
  spouse_name: string | null;
  ga_group_name: string | null;
  meeting_date: string | null;
  reevaluation_date: string | null;
  committee_chair: string | null;
  other_attendees: string | null;
  children: { name: string; age: string }[];
  income: { source: string; per_week: string; monthly: string }[];
  expenses: { category: string; weekly: string; monthly: string }[];
  creditors: { type: string; creditor: string; balance: string; monthly_payment: string; interest_rate: string }[];
  total_income_monthly: number | null;
  total_expenses_monthly: number | null;
  available_for_debt: number | null;
  visible_to_sponsor: boolean;
  created_at: string;
  updated_at: string;
};

export type PRGDraft = Partial<Omit<PRGMeeting, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export async function fetchLatestMeeting(userId: string): Promise<PRGMeeting | null> {
  const { data } = await supabase
    .from('pressure_relief_meetings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as PRGMeeting | null;
}

export async function saveMeeting(
  userId: string,
  draft: PRGDraft & { id?: string },
): Promise<PRGMeeting | null> {
  const { id, ...fields } = draft;
  const payload = { ...fields, user_id: userId, updated_at: new Date().toISOString() };

  if (id) {
    const { data } = await supabase
      .from('pressure_relief_meetings')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    return data as PRGMeeting | null;
  }

  const { data } = await supabase
    .from('pressure_relief_meetings')
    .insert(payload)
    .select()
    .single();
  return data as PRGMeeting | null;
}
