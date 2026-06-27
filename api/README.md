# `api/` — the messenger layer

This is the layer that **gets and saves data** on behalf of the UI.

Think of it as a set of simple functions the screens call, like:

- `getPosts()`        → returns the list of posts
- `createPost(post)`  → saves a new post
- `getMeetings(city)` → returns meetings near a city

## Why a separate layer?

So the screens never talk to the database directly. They just call
`getPosts()` and don't care *how* it works underneath.

This lets us swap the source without touching any screen:

| Stage        | What `getPosts()` does inside                    |
|--------------|--------------------------------------------------|
| Now (MVP)    | returns a **fake hardcoded list**                |
| Later        | calls **Supabase** and returns real posts        |
| Phase 2/3    | may also send data to **Azure AI**               |

This single seam is what keeps the app easy to grow.
