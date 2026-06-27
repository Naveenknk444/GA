# Recovery Community App

A free, anonymous recovery community app for compulsive gamblers
(Talk · Meetings · Recovery · Share).

> ⚠️ This is a **learning MVP**. The goal is to understand how an app like
> this is built, not to ship production code.

## Folder structure (separation of concerns)

| Folder      | Job                                                                 |
|-------------|---------------------------------------------------------------------|
| `ui/`       | What people see and tap. The Expo / React Native app. Runs in the browser. |
| `api/`      | The "messenger" layer — functions that fetch/save data. Fake data now, Supabase later. |
| `db/`       | The database definition — table designs and seed data (SQL). Used when we add Supabase. |
| `notes/`    | All documentation — the BRD, the plan, decisions, learning notes.   |
| `Mock Ups/` | The design mockups (screen images).                                 |

## The big picture

```
 Phone / Browser            Internet
 ┌──────────────┐          ┌──────────────────────┐        (Phase 2/3)
 │   ui/        │  asks →  │  api/  →  db/         │   →   Azure AI
 │ (the screens)│  ← data  │ (Supabase: data lives)│
 └──────────────┘          └──────────────────────┘
```

- **Now (MVP):** build `ui/` only, with fake data. View it in the browser.
- **Later:** wire `api/` to Supabase (`db/`), then sync data to Azure AI.

## Current stage

UI-first build: get the screens looking right with hardcoded data,
**no database yet**.
