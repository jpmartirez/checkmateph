-- Supabase DB schema for CheckMatePH
-- Run this in the Supabase Dashboard -> SQL Editor.

-- Extensions
create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.post_category as enum ('OPINION', 'CLAIM');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.post_status as enum ('SUPPORTED', 'DEBATED', 'DISPUTED', 'UNDER_REVIEW', 'VERIFIED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.comment_type as enum ('OPINION', 'CLAIM', 'COUNTER_CLAIM');
exception when duplicate_object then null;
end $$;

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  cover_url text,
  subtitle text,
  intro_text text,
  bio text,
  is_verified boolean not null default false,
  followers_count integer not null default 0,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- For existing projects that already ran an earlier version of this file
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists cover_url text;
alter table public.profiles add column if not exists subtitle text;
alter table public.profiles add column if not exists intro_text text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists is_verified boolean not null default false;
alter table public.profiles add column if not exists followers_count integer not null default 0;

alter table public.post_sources add column if not exists host text;
alter table public.post_sources add column if not exists is_verified boolean not null default false;

-- username uniqueness (case-insensitive by convention; we store lowercase)
create unique index if not exists profiles_username_unique on public.profiles (username);

-- Optional: keep usernames sane
do $$ begin
  alter table public.profiles
    add constraint profiles_username_format
    check (username is null or username ~ '^[a-z0-9_]{3,20}$');
exception when duplicate_object then null;
end $$;

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category public.post_category not null,
  content text not null,
  image_url text,
  status public.post_status[] not null default '{}'::public.post_status[],
  reactions_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id);

-- Sources / evidence links for CLAIM posts
create table if not exists public.post_sources (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  title text not null,
  url text not null,
  host text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists post_sources_post_id_idx on public.post_sources (post_id);

-- Verified sources directory
create table if not exists public.verified_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  host text not null,
  url text,
  category text,
  created_at timestamptz not null default now()
);

create unique index if not exists verified_sources_host_unique
  on public.verified_sources (host);

insert into public.verified_sources (name, host, url, category)
values
  ('GMA Network', 'gmanetwork.com', 'https://www.gmanetwork.com', 'news'),
  ('Philippine News Agency', 'pna.gov.ph', 'https://www.pna.gov.ph', 'agency'),
  ('Official Gazette', 'officialgazette.gov.ph', 'https://www.officialgazette.gov.ph', 'government'),
  ('ABS-CBN News', 'abscbnnews.com', 'https://www.abscbnnews.com', 'news'),
  ('Philippine Statistics Authority', 'psa.gov.ph', 'https://psa.gov.ph', 'agency'),
  ('Bureau of Internal Revenue', 'bir.gov.ph', 'https://www.bir.gov.ph', 'government')
on conflict (host) do update
  set name = excluded.name,
      url = excluded.url,
      category = excluded.category;

update public.profiles
set role = 'EXPERT'
where lower(display_name) in (
  'dr. elena santos',
  'atty. mateo ruiz',
  'sofia mercado'
);

-- Comments
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  type public.comment_type not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists post_comments_post_id_idx on public.post_comments (post_id);
create index if not exists post_comments_author_id_idx on public.post_comments (author_id);

create table if not exists public.comment_sources (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.post_comments(id) on delete cascade,
  title text not null,
  url text not null,
  host text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists comment_sources_comment_id_idx
  on public.comment_sources (comment_id);

-- Reactions (likes)
create table if not exists public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists post_reactions_post_id_idx on public.post_reactions (post_id);
create index if not exists post_reactions_user_id_idx on public.post_reactions (user_id);

-- Expert reviews for claim verification
create table if not exists public.expert_reviews (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  expert_id uuid not null references public.profiles(id) on delete cascade,
  source_credibility integer not null check (source_credibility between 1 and 5),
  evidence_quality integer not null check (evidence_quality between 1 and 5),
  consistency integer not null check (consistency between 1 and 5),
  verifiability integer not null check (verifiability between 1 and 5),
  context_accuracy integer not null check (context_accuracy between 1 and 5),
  average_score numeric(3, 2) generated always as (
    (source_credibility + evidence_quality + consistency + verifiability + context_accuracy) / 5.0
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, expert_id)
);

create index if not exists expert_reviews_post_id_idx on public.expert_reviews (post_id);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists set_post_comments_updated_at on public.post_comments;
create trigger set_post_comments_updated_at
before update on public.post_comments
for each row execute function public.set_updated_at();

drop trigger if exists set_expert_reviews_updated_at on public.expert_reviews;
create trigger set_expert_reviews_updated_at
before update on public.expert_reviews
for each row execute function public.set_updated_at();

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  username_from_meta text;
  display_name_from_meta text;
begin
  username_from_meta := lower(coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1)
  ));

  display_name_from_meta := nullif(trim(
    coalesce(new.raw_user_meta_data ->> 'first_name', '') || ' ' ||
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  ), '');

  if display_name_from_meta is null then
    display_name_from_meta := coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    );
  end if;

  insert into public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    cover_url,
    subtitle,
    intro_text,
    bio,
    role
  )
  values (
    new.id,
    username_from_meta,
    display_name_from_meta,
    null,
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    'Community Member',
    '"Welcome to CheckMatePH. Keep it evidence-based."',
    'No bio yet.',
    'NORMAL'
  )
  on conflict (id) do update
    set display_name = excluded.display_name,
        username = coalesce(public.profiles.username, excluded.username);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_sources enable row level security;
alter table public.verified_sources enable row level security;
alter table public.post_comments enable row level security;
alter table public.comment_sources enable row level security;
alter table public.post_reactions enable row level security;
alter table public.expert_reviews enable row level security;

-- Grants (ensure API roles can access tables)
-- Note: RLS still governs which rows are readable/writable.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.posts to authenticated;
grant select, insert, update, delete on table public.post_sources to authenticated;
grant select, insert, update, delete on table public.verified_sources to authenticated;
grant select, insert, update, delete on table public.post_comments to authenticated;
grant select, insert, update, delete on table public.comment_sources to authenticated;
grant select, insert, update, delete on table public.post_reactions to authenticated;
grant select, insert, update, delete on table public.expert_reviews to authenticated;

-- profiles policies
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- posts policies
drop policy if exists "posts_select_authenticated" on public.posts;
create policy "posts_select_authenticated"
on public.posts for select
to authenticated
using (true);

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own"
on public.posts for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own"
on public.posts for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own"
on public.posts for delete
to authenticated
using (auth.uid() = author_id);

-- post_sources policies
drop policy if exists "post_sources_select_authenticated" on public.post_sources;
create policy "post_sources_select_authenticated"
on public.post_sources for select
to authenticated
using (true);

drop policy if exists "post_sources_insert_own_post" on public.post_sources;
create policy "post_sources_insert_own_post"
on public.post_sources for insert
to authenticated
with check (
  exists (
    select 1 from public.posts p
    where p.id = post_id and p.author_id = auth.uid()
  )
);

drop policy if exists "post_sources_delete_own_post" on public.post_sources;
create policy "post_sources_delete_own_post"
on public.post_sources for delete
to authenticated
using (
  exists (
    select 1 from public.posts p
    where p.id = post_id and p.author_id = auth.uid()
  )
);

-- verified_sources policies
drop policy if exists "verified_sources_select_authenticated" on public.verified_sources;
create policy "verified_sources_select_authenticated"
on public.verified_sources for select
to authenticated
using (true);

-- post_comments policies
drop policy if exists "post_comments_select_authenticated" on public.post_comments;
create policy "post_comments_select_authenticated"
on public.post_comments for select
to authenticated
using (true);

drop policy if exists "post_comments_insert_own" on public.post_comments;
create policy "post_comments_insert_own"
on public.post_comments for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "post_comments_update_own" on public.post_comments;
create policy "post_comments_update_own"
on public.post_comments for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "post_comments_delete_own" on public.post_comments;
create policy "post_comments_delete_own"
on public.post_comments for delete
to authenticated
using (auth.uid() = author_id);

-- comment_sources policies
drop policy if exists "comment_sources_select_authenticated" on public.comment_sources;
create policy "comment_sources_select_authenticated"
on public.comment_sources for select
to authenticated
using (true);

drop policy if exists "comment_sources_insert_own_comment" on public.comment_sources;
create policy "comment_sources_insert_own_comment"
on public.comment_sources for insert
to authenticated
with check (
  exists (
    select 1 from public.post_comments c
    where c.id = comment_id and c.author_id = auth.uid()
  )
);

drop policy if exists "comment_sources_delete_own_comment" on public.comment_sources;
create policy "comment_sources_delete_own_comment"
on public.comment_sources for delete
to authenticated
using (
  exists (
    select 1 from public.post_comments c
    where c.id = comment_id and c.author_id = auth.uid()
  )
);

-- post_reactions policies
drop policy if exists "post_reactions_select_authenticated" on public.post_reactions;
create policy "post_reactions_select_authenticated"
on public.post_reactions for select
to authenticated
using (true);

drop policy if exists "post_reactions_insert_own" on public.post_reactions;
create policy "post_reactions_insert_own"
on public.post_reactions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "post_reactions_delete_own" on public.post_reactions;
create policy "post_reactions_delete_own"
on public.post_reactions for delete
to authenticated
using (auth.uid() = user_id);

-- expert_reviews policies
drop policy if exists "expert_reviews_select_authenticated" on public.expert_reviews;
create policy "expert_reviews_select_authenticated"
on public.expert_reviews for select
to authenticated
using (true);

drop policy if exists "expert_reviews_insert_own" on public.expert_reviews;
create policy "expert_reviews_insert_own"
on public.expert_reviews for insert
to authenticated
with check (auth.uid() = expert_id);

drop policy if exists "expert_reviews_update_own" on public.expert_reviews;
create policy "expert_reviews_update_own"
on public.expert_reviews for update
to authenticated
using (auth.uid() = expert_id)
with check (auth.uid() = expert_id);
