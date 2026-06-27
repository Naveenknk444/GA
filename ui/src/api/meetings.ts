import { MEETINGS, type Meeting } from '@/data/meetings';
import { supabase } from '@/lib/supabase';

/**
 * The data-access layer for meetings.
 *
 * Screens call fetchMeetings() / fetchMeeting(id) and don't care that the data
 * comes from Supabase — if a query fails or the table is empty, they fall back
 * to the bundled sample data so a screen is never broken.
 */

const PALETTE = ['#9B8CFF', '#34D399', '#4F8CFF', '#E0A53E', '#3FCF8E'];

const FORMAT_LABEL: Record<string, string> = {
  in_person: 'In Person',
  online: 'Online',
  hybrid: 'Hybrid',
  telephone: 'Telephone',
};

/** Map one database row to the Meeting shape the UI expects. */
function mapRow(m: any, i: number): Meeting {
  const isOnline = m.format === 'online' || m.format === 'telephone';
  return {
    id: m.id,
    name: m.name,
    type: m.type_label ?? m.type_code ?? '',
    format: FORMAT_LABEL[m.format] ?? 'In Person',
    day: m.day,
    time: m.end_time ? `${m.start_time} – ${m.end_time}` : m.start_time,
    address: m.address ?? '',
    city: m.city ?? '',
    state: m.state ?? '',
    zip: m.zip ?? '',
    distanceMi: null,
    online: isOnline,
    phone: m.contact_phone ?? null,
    color: PALETTE[i % PALETTE.length],
    about: m.notes ?? m.room_notes ?? m.focus ?? '',
    endTime: m.end_time,
    typeCode: m.type_code,
    language: m.language,
    focus: m.focus,
    locationName: m.location_name,
    roomNotes: m.room_notes,
    onlineUrl: m.online_url,
    onlineId: m.online_id,
    onlinePassword: m.online_password,
    phoneDialIn: m.phone_dial_in,
    contactName: m.contact_name,
    isNew: m.is_new ?? false,
    notes: m.notes,
  };
}

export type MeetingsResult = { data: Meeting[]; source: 'live' | 'sample' };

export async function fetchMeetings(): Promise<MeetingsResult> {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('day', { ascending: true })
    .order('start_time', { ascending: true });

  if (error || !data || data.length === 0) {
    if (error) console.warn('[meetings] using sample data —', error.message);
    return { data: MEETINGS, source: 'sample' };
  }
  return { data: data.map(mapRow), source: 'live' };
}

export async function fetchMeeting(id: string): Promise<Meeting | null> {
  const { data, error } = await supabase.from('meetings').select('*').eq('id', id).maybeSingle();

  if (error || !data) {
    if (error) console.warn('[meeting] using sample data —', error.message);
    return MEETINGS.find((m) => m.id === id) ?? null;
  }
  return mapRow(data, 0);
}
