# `ui/` — the app people see

This is the **Expo / React Native** app: every screen the user taps
(Home, Talk, Meetings, Recovery, Share, Profile).

- Written once, runs on **iPhone, Android, and the web browser**.
- For now it runs in the **browser** so we can build fast without a phone.
- It does **not** store data. It only *displays* whatever list of data it
  is handed, and reacts to taps.

## What lives here (once we scaffold it)

- `app/`        — the screens (one file per screen)
- `components/` — reusable UI pieces (a post card, a tile, a button)
- `theme/`      — colors, fonts, spacing (the dark mountain look)

## Where does the data come from?

Right now: a **fake hardcoded list** (so we can see the UI with no database).
Later: the `../api/` layer fetches it from Supabase. The screens won't change —
they don't care where the list comes from.
