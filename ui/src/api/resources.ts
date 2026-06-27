import { supabase } from '@/lib/supabase';

export type Resource = {
  id: string;
  category: string;
  title: string;
  summary: string | null;
  url: string | null;
  sort: number;
};

export async function fetchResources(): Promise<Resource[]> {
  const { data } = await supabase
    .from('resources')
    .select('id, category, title, summary, url, sort')
    .order('sort');
  return (data ?? []) as Resource[];
}
