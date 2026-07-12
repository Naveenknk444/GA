-- Telephone List — full table + seed (55 members)
-- Run in Supabase SQL Editor.
-- Drops and recreates the table so re-running is safe.

-- ─── Table ────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.telephone_list;

CREATE TABLE public.telephone_list (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users ON DELETE SET NULL,  -- null for pre-seeded members
  name         text NOT NULL,
  phone        text NOT NULL,
  ga_birthday  date,          -- GA anniversary / clean date
  sponsor      text,
  visible      boolean DEFAULT true NOT NULL,
  created_at   timestamptz DEFAULT now() NOT NULL
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.telephone_list ENABLE ROW LEVEL SECURITY;

-- Any signed-in member can view visible entries
CREATE POLICY "members can view list"
  ON public.telephone_list FOR SELECT
  TO authenticated
  USING (visible = true);

-- Members can manage their own linked row
CREATE POLICY "members manage own entry"
  ON public.telephone_list FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Seed (55 members) ────────────────────────────────────────────────────────
INSERT INTO public.telephone_list (name, phone, ga_birthday, sponsor) VALUES
  ('Adam B',               '602-717-9468', NULL,         NULL),
  ('Alberto C.',           '602-513-0486', '2025-06-19', NULL),
  ('Andrew R',             '913-235-5506', '2025-04-14', 'Harrison A'),
  ('Ann Marie P',          '480-227-9195', '2006-12-12', NULL),
  ('Bill F',               '325-829-4367', '2025-10-31', 'Michael C'),
  ('Brandon E',            '480-347-7773', '2026-03-13', 'Steve Z'),
  ('Braxton T',            '402-613-6208', '2023-01-04', 'Michael C'),
  ('Brian G.',             '480-239-2423', '2025-07-21', 'Brian L'),
  ('Brian L',              '480-225-6001', '2023-03-06', NULL),
  ('Brian M.',             '602-509-8211', '2025-08-15', 'Frank R'),
  ('Bruce L',              '602-740-2828', '2006-10-09', 'Lenny S'),
  ('Caleb H',              '623-277-6981', '2025-09-16', 'Steve Z'),
  ('Carter B.',            '612-695-9182', '2025-03-09', 'Randy'),
  ('Chris B',              '219-241-5617', NULL,         NULL),
  ('CJ D',                 '602-332-3335', '2026-02-08', NULL),
  ('Danae H',              '520-878-8515', '2024-03-01', 'Harrison A'),
  ('Daniel S',             '480-338-1362', '2025-03-01', 'Harrison A'),
  ('David L',              '602-733-3444', '2025-11-15', 'Vance'),
  ('Dave P',               '480-889-4521', '2026-02-02', NULL),
  ('Ethan S.',             '480-352-3886', '2025-11-20', 'Michael C'),
  ('Foster D',             '720-839-0716', '2025-04-11', 'Phil'),
  ('Frank R',              '520-483-0342', '2013-01-09', 'Bruce L'),
  ('Frank S.',             '516-425-4542', '2005-04-23', 'Lenny S'),
  ('Greg B',               '602-577-8386', '2003-06-23', NULL),
  ('Harrison A.',          '203-912-0328', '2016-04-23', 'Lou C'),
  ('Jack B',               '949-374-1133', '2026-03-05', NULL),
  ('Jason M.',             '480-707-8124', '2025-08-28', 'Harrison A'),
  ('Joe K.',               '406-539-7411', '2025-12-03', 'Markus R'),
  ('John M',               '773-600-2843', '2025-12-23', 'Brian L'),
  ('Jordan J.',            '602-363-0659', '2025-09-03', 'Braxton'),
  ('Kaden K',              '480-285-9997', '2025-01-29', 'Harrison A'),
  ('Ken T',                '480-206-5024', '2024-04-17', 'Frank R'),
  ('Kurt P',               '480-236-0309', '2024-03-15', NULL),
  ('Lenny S.',             '602-320-4823', '2001-07-02', NULL),
  ('Lori F.',              '424-384-7334', '2023-10-21', NULL),
  ('Markus R',             '858-254-1598', '2024-04-21', 'Eric F'),
  ('Marsha S',             '602-921-5543', '2026-01-31', NULL),
  ('Max',                  '847-767-0509', '2025-11-09', 'Bruce L'),
  ('Melinda A',            '480-414-5043', NULL,         'Lori F'),
  ('Michael B',            '602-616-5696', '2025-12-06', 'Kurt P'),
  ('Michael M.',           '661-670-4196', '2025-05-06', NULL),
  ('Michael C.',           '602-321-1158', '2023-02-15', 'Phil'),
  ('Mike P (Montreal)',    '514-713-4449', NULL,         NULL),
  ('Nate L',               '480-251-7257', '2025-01-15', NULL),
  ('Nelson',               '661-350-7353', '2023-11-17', 'Greg B'),
  ('Nico M',               '602-380-8057', NULL,         'Lori F'),
  ('Paul K',               '516-492-2175', '2024-10-13', 'Michael C'),
  ('Phil',                 '602-931-0730', '2017-05-01', NULL),
  ('Quentin S - Treasurer','317-407-9081', '2024-01-06', 'Harrison A'),
  ('Richard S.',           '209-918-5769', '2025-05-01', 'Jason R'),
  ('Runjan J.',            '678-469-9092', '2024-08-23', 'Michael C'),
  ('Ryan A.',              '303-518-6358', '2025-07-20', 'Michael C'),
  ('Sean K',               '480-865-8085', '2025-02-25', 'Michael C'),
  ('Steve Z - Secretary',  '978-314-9570', '2024-10-21', 'Harrison A'),
  ('Tommy B',              '847-345-3591', '2025-10-16', NULL),
  ('Will W',               '614-556-8596', NULL,         NULL);
