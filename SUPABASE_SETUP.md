# Supabase setup (DB + RLS) for CheckMatePH

This repo already has Supabase auth wired via `@supabase/ssr` and your `.env.local`.
What’s missing is the **database tables + policies** used by the app (feed/posts).

## 1) Verify env vars
In `.env.local` you should have:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Optional (used by `app/api/auth/resend/route.ts`):

- `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000` in dev)

## 2) Create tables + policies
1. Open Supabase Dashboard → your project
2. Go to **SQL Editor**
3. Paste and run the contents of `supabase/schema.sql`

Re-running it later is safe — it uses `if not exists` / `add column if not exists`.

This creates:
- `public.profiles` (1:1 with `auth.users`)
- `public.posts`
- `public.post_sources`
- Row Level Security (RLS) policies so only authenticated users can read/write
- A trigger to auto-create `profiles` rows on signup

## 3) Run the app
- `npm run dev`
- Login
- Go to `/feed`

The feed will load posts from `/api/posts`. Creating a post uses the same endpoint.

## Notes
- If you already have tables with different names/columns, you may need to reconcile them with `supabase/schema.sql`.
- If you want the feed to be publicly readable without login, adjust the RLS policies in `supabase/schema.sql` (currently `select` requires `authenticated`).
