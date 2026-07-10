import { supabase } from '@/lib/supabase';

export type TelephoneMember = {
  id: string;
  name: string;
  phone: string;
  ga_birthday: string | null;  // YYYY-MM-DD
  sponsor: string | null;
};

export async function fetchTelephoneList(): Promise<TelephoneMember[]> {
  const { data } = await supabase
    .from('telephone_list')
    .select('id, name, phone, ga_birthday, sponsor')
    .eq('visible', true)
    .order('name');
  return (data ?? []) as TelephoneMember[];
}

export function daysCleanFromBirthday(gabirthday: string | null): number | null {
  if (!gabirthday) return null;
  const [y, m, d] = gabirthday.split('-').map(Number);
  const diff = Date.now() - new Date(y, m - 1, d).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

export function formatCleanTime(days: number): string {
  if (days < 30)  return `${days}d clean`;
  if (days < 365) return `${Math.floor(days / 30)}mo clean`;
  const yrs = Math.floor(days / 365);
  const mos = Math.floor((days % 365) / 30);
  return mos > 0 ? `${yrs}yr ${mos}mo clean` : `${yrs}yr clean`;
}

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}
