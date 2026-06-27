# `db/` — the database definition

This folder describes **how the data is organized** in the database
(Supabase / Postgres). It is **not used yet** — we add it when we move
from fake data to a real database.

## What will live here

- `schema.sql` — the tables and their columns (posts, comments, meetings, resources, profiles)
- `seed.sql`   — starter data (sample meetings, the recovery resources)
- `policies.sql` — the "doorman" rules (Row Level Security): who can read/write what

## The tables (planned)

| Table       | One row =            | Key idea                                  |
|-------------|----------------------|-------------------------------------------|
| `profiles`  | one member           | anonymous — a handle, **no real name**    |
| `posts`     | one post             | category: discussion / support / milestone|
| `comments`  | one reply            | belongs to a post                         |
| `meetings`  | one meeting          | searchable by city / state / zip          |
| `resources` | one piece of literature | GA literature, newcomer info, etc.     |

Designed cleanly now so it's easy to sync to **Azure AI** later.
