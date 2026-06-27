-- ============================================================
-- Seed data — run AFTER schema.sql, in Supabase SQL Editor.
-- Source: GA "Valley of the Sun" (Phoenix, AZ) Meeting List, January 2026.
-- Parsed from Docs/MeetingsJan2026.pdf. Details can be corrected later;
-- always verify against the latest monthly list.
-- Re-runnable: clears the table first.
-- ============================================================

delete from meetings;

insert into meetings
  (name, day, start_time, end_time, type_code, type_label, format, language, focus,
   location_name, address, city, state, zip, room_notes,
   online_url, online_id, online_password, phone_dial_in, contact_name, contact_phone, is_new, notes)
values
-- ===== SUNDAY =====
('Cross in the Desert — Sunday', 'Sunday', '9:30 AM', '11:00 AM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Topic/Therapy / 3rd Sunday Speaker',
 'Cross in the Desert Church', '12835 N. 32nd St', 'Phoenix', 'AZ', null, null,
 null, null, null, null, 'Kim E', '602-489-1957', false, 'Open Speaker Meeting on the 3rd Sunday (1/18/26 speaker Mo M).'),

('Desert Cross — GA Steps (Hybrid)', 'Sunday', '5:00 PM', '6:30 PM', 'CL', 'Closed', 'hybrid', 'English', '12-Step Writing/Discussion',
 'Desert Cross Lutheran Church', '8600 S. McClintock Dr', 'Tempe', 'AZ', null, 'In-Person: Educ Bldg, Rm 1/2',
 'https://zoom.us/j/6355093087', '6355093087', null, null, 'Pam K', '480-221-2092', false, 'GA literature for Recovery and/or Unity Step writing provided to all attendees.'),

('Desert Cross — Gam-Anon', 'Sunday', '7:30 PM', '8:30 PM', 'GAM', 'Gam-Anon', 'in_person', 'English', 'All GAM Members Welcome',
 'Desert Cross Lutheran Church', '8600 S. McClintock Dr', 'Tempe', 'AZ', null, 'Educ Bldg, Rm 1/2',
 null, null, null, null, 'Jenn B', '480-201-4884', false, null),

-- ===== MONDAY =====
('Online GA Step Meeting', 'Monday', '4:00 PM', '5:00 PM', 'CL', 'Closed', 'online', 'English', 'Step',
 null, null, null, 'AZ', null, null,
 'https://zoom.us/j/83417836640', '83417836640', '234201', null, 'Bob B', '602-918-4290', false, null),

('Online GA (Monday)', 'Monday', '6:30 PM', '8:30 PM', 'MCL', 'Modified Closed', 'online', 'English', 'Topic/Therapy',
 null, null, null, 'AZ', null, null,
 'https://zoom.us/j/85995021961', '85995021961', '763339', null, 'Matt G', '480-495-4104', false, null),

('Online Gam-Anon (Monday)', 'Monday', '6:30 PM', null, 'GAM', 'Gam-Anon', 'online', 'English', 'All GAM Members Welcome',
 null, null, null, 'AZ', null, null,
 'https://zoom.us/j/89835955858', '89835955858', 'friendship', null, null, null, false, null),

('Telephone GA (Monday)', 'Monday', '6:30 PM', '8:30 PM', 'OP', 'Open', 'telephone', 'English', 'Topic/Therapy',
 null, null, null, 'AZ', null, null,
 null, null, null, 'Dial-In: 1-667-770-1482; Access Code: 751246', 'Dave A (Host)', '480-943-7745', false, null),

('Cross in the Desert — Beginners', 'Monday', '6:15 PM', '7:25 PM', 'OP', 'Open', 'in_person', 'English', 'Beginners — Facilitated Topic/Therapy',
 'Cross in the Desert Church', '12835 N. 32nd St', 'Phoenix', 'AZ', null, null,
 null, null, null, null, 'Harrison A', '203-912-0328', false, 'Beginners 1yr/less & all members welcome. No guests allowed.'),

('Cross in the Desert — GA & Gam-Anon', 'Monday', '7:30 PM', null, 'MCL', 'Modified Closed', 'in_person', 'English', 'Therapy',
 'Cross in the Desert Church', '12835 N. 32nd St', 'Phoenix', 'AZ', null, 'Masks Optional; GA & GAM held in separate rooms',
 null, null, null, null, 'Steve Z', '978-314-9570', false, null),

('Black Bear Diner — Newcomers & GA', 'Monday', '5:30 PM', '8:30 PM', 'CL', 'Closed', 'in_person', 'English', 'Newcomers & GA Topic/Therapy',
 'Black Bear Diner (front left Conf Rm)', '1809 E Baseline Rd', 'Gilbert', 'AZ', null, 'Newcomers 5:30; Dinner (optional) 6:00; GA Meeting 7:00',
 null, null, null, null, 'Joanne S', '630-721-8456', false, null),

-- ===== TUESDAY =====
('The Pigeon Coop', 'Tuesday', '10:00 AM', '11:00 AM', 'OP', 'Open', 'in_person', 'English', 'Therapy',
 'The Pigeon Coop', '4415 S. Rural Rd', 'Tempe', 'AZ', null, 'SE corner Rural Rd & US 60; Masks Optional',
 null, null, null, null, 'Bill O', '480-518-6571', false, null),

('Pinnacle Presbyterian — Beginners & GA', 'Tuesday', '5:00 PM', '7:00 PM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Beginners (OP) 5:00; GA (MCL) 5:45',
 'Pinnacle Presbyterian Church', '25150 N. Pima Road', 'Scottsdale', 'AZ', null, 'NW corner E Happy Valley & N Pima',
 null, null, null, null, 'Archie S', '858-922-6776', true, 'New meeting starting 1/20/26. Also: Sue A 602-463-9435.'),

('Maricopa Library (Hybrid)', 'Tuesday', '5:30 PM', '6:30 PM', 'CL', 'Closed', 'hybrid', 'English', 'Topic/Therapy/Comment',
 'Maricopa Library (Palo Verde Room)', '18160 N. Maya Angelou Dr', 'Maricopa', 'AZ', null, 'Masks optional; do not attend if sick',
 null, '82996748469', '8675309', null, 'Omeed P', '480-604-1354', true, 'New meeting starting 1/20/26.'),

('Desert Cross — Newcomers & GA (Tuesday)', 'Tuesday', '6:30 PM', '9:15 PM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Newcomers Orientation 6:30; GA 7:15',
 'Desert Cross Lutheran Church', '8600 S. McClintock Dr', 'Tempe', 'AZ', null, 'Educ Bldg: 6:30 in Rm 1/2; 7:15 in Rm 5/6',
 null, null, null, null, 'Vance A', '480-309-9041', false, null),

('Calvary Center', 'Tuesday', '7:00 PM', '9:00 PM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Therapy',
 'Calvary Center (Family Center Bldg)', '720 E. Montebello Ave', 'Phoenix', 'AZ', null, 'Do not park in front; use Employee lot on N. 8th Place',
 null, null, null, null, 'Pat M', '602-799-3511', false, null),

('Christ The Redeemer — Tuesday', 'Tuesday', '7:00 PM', '9:00 PM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Therapy',
 'Christ The Redeemer Lutheran Church', '8801 N. 43rd Ave', 'Phoenix', 'AZ', null, 'E side 43rd Av, S of Dunlap; Bldg B Courtyard Rm 9',
 null, null, null, null, 'Nick R', '602-463-9486', false, null),

-- ===== WEDNESDAY =====
('Love of Christ — Midday', 'Wednesday', '12:00 PM', '1:30 PM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Topic/Therapy',
 'Love of Christ Lutheran Church', '1525 N. Power Rd', 'East Mesa', 'AZ', null, 'Power & Hobart; back of church; Masks Optional/Available',
 null, null, null, null, 'Sharon H', '480-318-3016', false, null),

('Sun City Church of the Nazarene', 'Wednesday', '3:00 PM', '4:30 PM', 'OP', 'Open', 'in_person', 'English', 'Therapy',
 'Sun City Church of the Nazarene', '14636 N. Del Webb Blvd', 'Sun City', 'AZ', null, 'N of Grand Ave; Masks Optional',
 null, null, null, null, 'DeeAnna L', '602-339-2888', false, null),

('Love of Christ — Evening', 'Wednesday', '6:00 PM', '8:00 PM', 'OP', 'Open', 'in_person', 'English', 'Topic/Therapy',
 'Love of Christ Lutheran Church', '1525 N. Power Rd', 'East Mesa', 'AZ', null, 'Power Rd & Indigo St; Meets in Outreach Room',
 null, null, null, null, 'Brian M', '480-789-9374', false, null),

('Cross in the Desert — Step & GA', 'Wednesday', '6:00 PM', '9:30 PM', 'CL', 'Closed', 'in_person', 'English', 'Step Discussion 6:00; GA 7:30',
 'Cross in the Desert Church', '12835 N. 32nd St', 'Phoenix', 'AZ', null, 'GA Step Mtg 6:00-7:15; GA Regular Mtg 7:30-9:30',
 null, null, null, null, 'Frank R', '520-483-0342', false, null),

('Desert Cross — GA Espanol', 'Wednesday', '7:00 PM', '8:00 PM', 'OP', 'Open', 'in_person', 'Spanish', 'Tema/Terapia',
 'Desert Cross Lutheran Church', '8600 S. McClintock Dr', 'Tempe', 'AZ', null, 'Meets in Educ Bldg, Room 5/6',
 null, null, null, null, 'Julian F', '480-720-6053', false, 'Spanish-speaking meeting (~Espanol~).'),

('Veterans & Friends Online', 'Wednesday', '7:00 PM', '8:30 PM', 'CL', 'Closed', 'online', 'English', 'Topic/Therapy',
 'Veterans & Friends Online', null, null, 'AZ', null, null,
 'https://zoom.us/j/75235365986', '75235365986', 'wisdom', null, 'Amy S', '480-580-2229', false, null),

('Online GA Espanol (Wednesday)', 'Wednesday', '7:00 PM', '8:00 PM', 'OP', 'Open', 'online', 'Spanish', 'Tema/Terapia',
 null, null, null, 'AZ', null, null,
 'https://zoom.us/j/9266798768', '9266798768', null, null, 'Julian F', '480-720-6053', false, 'No password needed. Spanish-speaking (~Espanol~).'),

-- ===== THURSDAY =====
('A Path to Healing', 'Thursday', '6:30 PM', '8:00 PM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Topic/Therapy/Comment',
 'A Path to Healing', '2324 E. Indian School Rd', 'Phoenix', 'AZ', null, 'Ring bell to enter after 6:30',
 null, null, null, null, 'Lynn A', '602-370-0619', false, 'All GA Newcomers & Members welcome.'),

('Palm Valley Community Center', 'Thursday', '7:00 PM', '8:30 PM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Therapy',
 'Palm Valley Community Center', '14145 W Palm Valley Blvd', 'Goodyear', 'AZ', null, 'West of Litchfield Rd; Masks Optional',
 null, null, null, null, 'Betty S', '623-907-3211', true, 'New meeting starting 1/20/26.'),

('Mission Bells Methodist Church', 'Thursday', '7:00 PM', '9:00 PM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Topic/Therapy',
 'Mission Bells Methodist Church', '4645 W. Bell Rd', 'Glendale', 'AZ', null, 'Room 10',
 null, null, null, null, 'Rich S', '209-918-5769', false, null),

('Love of Christ — Center of Compassion', 'Thursday', '7:00 PM', '9:00 PM', 'OP', 'Open', 'in_person', 'English', 'Topic/Therapy',
 'Love of Christ Center of Compassion', '1525 N. Power Rd', 'East Mesa', 'AZ', null, 'Power Rd & Indigo St; Rooms 12 & 12A; Newcomers Orientation 6:30; Masks Optional',
 null, null, null, null, 'Dave W', '480-290-1117', false, null),

('East Mesa Online GA', 'Thursday', '7:00 PM', '9:00 PM', 'OP', 'Open', 'online', 'English', 'Topic/Therapy',
 'East Mesa Online GA Open Meeting', null, null, 'AZ', null, null,
 'https://zoom.us/j/9192841002', '9192841002', '751174', null, 'Sharon H', '480-318-3016', false, null),

('Online GA Meeting (Thursday)', 'Thursday', '7:00 PM', '9:00 PM', 'MCL', 'Modified Closed', 'online', 'English', 'Topic/Therapy',
 'Online GA Meeting', null, null, 'AZ', null, null,
 'https://zoom.us/j/89367754289', '89367754289', '401592', null, 'Gary D', '607-368-1467', false, null),

('St. John''s Lutheran — Espanol', 'Thursday', '7:30 PM', '9:00 PM', 'OP', 'Open', 'in_person', 'Spanish', 'Tema/Terapia',
 'St. John''s Lutheran Church', '7205 N. 51st Ave', 'Glendale', 'AZ', null, '51st & Myrtle; Room 9 & 10',
 null, null, null, null, 'Dora H', '602-625-3640', false, 'Spanish-speaking meeting (~Espanol~).'),

-- ===== FRIDAY =====
('Desert Cross — Men Preferred', 'Friday', '7:00 PM', '9:00 PM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Therapy/Comment (Men Preferred)',
 'Desert Cross Lutheran Church', '8600 S. McClintock Dr', 'Tempe', 'AZ', null, 'Community Ctr Classroom; Masks Optional',
 null, null, null, null, 'Kevin N', '602-349-7713', false, 'In accordance with Trustee Guidelines for video meetings.'),

('Online GA Espanol (Friday)', 'Friday', '7:00 PM', '8:00 PM', 'OP', 'Open', 'online', 'Spanish', 'Tema/Terapia',
 null, null, null, 'AZ', null, null,
 'https://zoom.us/j/9266798768', '9266798768', null, null, 'Julian F', '480-720-6053', false, 'No password needed. Spanish-speaking (~Espanol~).'),

('Algamus Gambling Recovery Center', 'Friday', '7:00 PM', '9:00 PM', 'OP', 'Open', 'in_person', 'English', 'Topic/Therapy',
 'Algamus Gambling Recovery Center', '1616 N. Litchfield Rd', 'Goodyear', 'AZ', null, 'In Palm Valley Office Park, Suite A220',
 null, null, null, null, 'Anthony W', '928-713-0265', false, null),

-- ===== SATURDAY =====
('Christ The Redeemer — Saturday AM', 'Saturday', '8:00 AM', '10:00 AM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Topic/Therapy',
 'Christ The Redeemer Lutheran Church', '8801 N. 43rd Ave', 'Phoenix', 'AZ', null, 'E side 43rd Av, S of Dunlap; Bldg B Courtyard Rm 9',
 null, null, null, null, 'Carter B', '612-695-9182', false, null),

('Vista Church', 'Saturday', '8:00 AM', '10:00 AM', 'MCL', 'Modified Closed', 'in_person', 'English', 'Topic/Therapy',
 'Vista Church (formerly First Southern Baptist)', '5230 N. Scottsdale Rd', 'Scottsdale', 'AZ', null, 'Between Jackrabbit & Chaparral; Meets in Choir Room',
 null, null, null, null, 'Joe S', '480-385-9442', false, null),

('Scottsdale AZ Online', 'Saturday', '8:00 AM', '9:30 AM', 'CL', 'Closed', 'online', 'English', 'Topic/Therapy',
 'Scottsdale AZ Online Meeting', null, null, 'AZ', null, null,
 'https://zoom.us/j/86530780038', '86530780038', 'GGu2up', null, 'Danny L', '602-820-1010', false, null),

('Sun Lakes Country Club', 'Saturday', '10:00 AM', '11:00 AM', 'CL', 'Closed', 'in_person', 'English', 'Topic/Therapy',
 'Sun Lakes Country Club', '25601 S. Sun Lakes Blvd', 'Chandler', 'AZ', null, 'I-10 Exit 167; E on Riggs; S on Sun Lakes Blvd; Grand Slam Rm',
 null, null, null, null, 'Pam K', '480-221-2092', false, null);
