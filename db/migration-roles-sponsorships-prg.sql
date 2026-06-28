-- ══════════════════════════════════════════════
-- MIGRATION: Roles, Sponsorships, Pressure Relief Meetings
-- Run once in Supabase SQL Editor
-- ══════════════════════════════════════════════


-- ══════════════════════════════════════════════
-- 1. USER ROLES
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_roles (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN (
               'member', 'sponsee', 'sponsor', 'treasurer', 'secretary',
               'chairperson', 'intergroup_rep', 'literature_chair', 'trustee',
               'newcomer', 'moderator', 'admin'
             )),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- User sees their own roles
CREATE POLICY "user views own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Any logged-in user can see others' roles (needed for finding sponsors)
CREATE POLICY "authenticated users view all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

-- User can add their own roles
CREATE POLICY "user manages own roles"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User can remove their own roles
CREATE POLICY "user removes own roles"
  ON user_roles FOR DELETE
  USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════
-- 2. SPONSORSHIPS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sponsorships (
  sponsor_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'active', 'ended')),
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at    TIMESTAMPTZ,           -- set when sponsor accepts
  ended_at      TIMESTAMPTZ,           -- set when either party ends the relationship
  PRIMARY KEY (sponsor_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_sponsorships_member  ON sponsorships(member_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_sponsor ON sponsorships(sponsor_id);

ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;

-- Both sponsor and sponsee can see their relationship
CREATE POLICY "parties view sponsorship"
  ON sponsorships FOR SELECT
  USING (auth.uid() = sponsor_id OR auth.uid() = member_id);

-- Sponsee sends the initial request
CREATE POLICY "member requests sponsorship"
  ON sponsorships FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- Either party can update status (sponsor accepts, either can end)
CREATE POLICY "parties update sponsorship"
  ON sponsorships FOR UPDATE
  USING (auth.uid() = sponsor_id OR auth.uid() = member_id);


-- ══════════════════════════════════════════════
-- 3. PRESSURE RELIEF MEETINGS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pressure_relief_meetings (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Meeting header (page 5 of workbook)
  member_name            TEXT,
  spouse_name            TEXT,
  ga_group_name          TEXT,
  meeting_date           DATE,
  reevaluation_date      DATE,
  committee_chair        TEXT,
  other_attendees        TEXT,

  -- Flexible lists stored as JSON
  children               JSONB DEFAULT '[]',  -- [{name, age}]
  income                 JSONB DEFAULT '[]',  -- [{source, per_week, monthly}]
  expenses               JSONB DEFAULT '[]',  -- [{category, weekly, monthly}]
  creditors              JSONB DEFAULT '[]',  -- [{type, creditor, balance, monthly_payment, interest_rate}]

  -- Auto-calculated budget summary
  total_income_monthly   NUMERIC(12,2),
  total_expenses_monthly NUMERIC(12,2),
  available_for_debt     NUMERIC(12,2),

  -- Sponsor sharing toggle
  visible_to_sponsor     BOOLEAN DEFAULT false,

  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prg_meetings_user ON pressure_relief_meetings(user_id);

ALTER TABLE pressure_relief_meetings ENABLE ROW LEVEL SECURITY;

-- User always sees their own meetings
CREATE POLICY "user sees own meetings"
  ON pressure_relief_meetings FOR ALL
  USING (auth.uid() = user_id);

-- Sponsor sees a meeting ONLY if: sharing is on AND they have an active sponsorship
CREATE POLICY "sponsor sees shared meetings"
  ON pressure_relief_meetings FOR SELECT
  USING (
    visible_to_sponsor = true
    AND EXISTS (
      SELECT 1 FROM sponsorships
      WHERE sponsor_id  = auth.uid()
        AND member_id   = pressure_relief_meetings.user_id
        AND status      = 'active'
    )
  );


-- ══════════════════════════════════════════════
-- 4. AUTO-ASSIGN 'member' ROLE ON SIGNUP
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION assign_default_role();


-- ══════════════════════════════════════════════
-- 5. BACKFILL existing users → 'member' role
-- ══════════════════════════════════════════════
INSERT INTO user_roles (user_id, role)
SELECT id, 'member' FROM auth.users
ON CONFLICT DO NOTHING;
