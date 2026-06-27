/**
 * Mock meeting data for the UI phase.
 *
 * This stands in for the real `api/` layer. The screens call getMeetings() /
 * getMeeting(id) and don't care that the data is hardcoded here — later these
 * same functions will fetch from Supabase and nothing in the UI has to change.
 */

export type Meeting = {
  id: string;
  name: string;
  type: string; // type label, e.g. 'Open' | 'Closed' | 'Modified Closed' | 'Gam-Anon'
  format: string; // display: 'In Person' | 'Online' | 'Hybrid' | 'Telephone'
  day: string;
  time: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  distanceMi: number | null; // null => online (no physical distance)
  online: boolean;
  phone: string | null;
  color: string; // avatar color
  about: string;
  // richer fields from the real data (all optional so older code still compiles)
  endTime?: string | null;
  typeCode?: string | null;
  language?: string | null;
  focus?: string | null;
  locationName?: string | null;
  roomNotes?: string | null;
  onlineUrl?: string | null;
  onlineId?: string | null;
  onlinePassword?: string | null;
  phoneDialIn?: string | null;
  contactName?: string | null;
  isNew?: boolean;
  notes?: string | null;
};

export const MEETINGS: Meeting[] = [
  {
    id: 'harrisburg-ga',
    name: 'Harrisburg GA',
    type: 'Open Meeting',
    format: 'In Person',
    day: 'Friday',
    time: '7:30 PM',
    address: '1234 Main St',
    city: 'Harrisburg',
    state: 'PA',
    zip: '17101',
    distanceMi: 0.8,
    online: false,
    phone: '+1 (717) 555-0142',
    color: '#9B8CFF',
    about:
      'A welcoming meeting for anyone who has a desire to stop gambling. Join us as we share experience, strength, and hope.',
  },
  {
    id: 'newcomers',
    name: 'Newcomers Meeting',
    type: 'Open Meeting',
    format: 'In Person',
    day: 'Friday',
    time: '9:30 PM',
    address: '1234 Main St',
    city: 'Harrisburg',
    state: 'PA',
    zip: '17101',
    distanceMi: 0.8,
    online: false,
    phone: '+1 (717) 555-0177',
    color: '#34D399',
    about: 'A meeting focused on welcoming newcomers and answering questions about the GA program.',
  },
  {
    id: 'midday',
    name: 'Midday Meeting',
    type: 'Open Meeting',
    format: 'In Person',
    day: 'Saturday',
    time: '12:00 PM',
    address: '987 State St',
    city: 'Camp Hill',
    state: 'PA',
    zip: '17011',
    distanceMi: 2.3,
    online: false,
    phone: null,
    color: '#4F8CFF',
    about: 'A midday meeting for those who prefer to share during the day.',
  },
  {
    id: 'hope-recovery',
    name: 'Hope & Recovery',
    type: 'Closed Meeting',
    format: 'In Person',
    day: 'Saturday',
    time: '8:00 PM',
    address: '456 Elm St',
    city: 'Mechanicsburg',
    state: 'PA',
    zip: '17050',
    distanceMi: 4.7,
    online: false,
    phone: null,
    color: '#E0A53E',
    about: 'A closed meeting for those who have a desire to stop gambling.',
  },
  {
    id: 'online-newcomers',
    name: 'Online Meeting',
    type: 'Open Meeting',
    format: 'Online',
    day: 'Saturday',
    time: '9:00 PM',
    address: 'Video call',
    city: 'Online',
    state: '',
    zip: '',
    distanceMi: null,
    online: true,
    phone: null,
    color: '#3FCF8E',
    about: 'An online meeting open to members anywhere. A video link is shared at meeting time.',
  },
];

export function getMeetings(): Meeting[] {
  return MEETINGS;
}

export function getMeeting(id: string): Meeting | undefined {
  return MEETINGS.find((m) => m.id === id);
}
