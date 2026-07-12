-- Add recurring flag and specific_date to schedule_blocks.
-- Run in Supabase dashboard → SQL Editor.
-- Existing blocks default to recurring = true (no change in behaviour).

ALTER TABLE schedule_blocks
  ADD COLUMN IF NOT EXISTS recurring      boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS specific_date  date;
