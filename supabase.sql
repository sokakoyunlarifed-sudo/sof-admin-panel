-- Enable useful extensions
create extension if not exists pgcrypto;

-- =============================
-- Profiles (auth + profile role)
-- =============================
create table if not exists public.profiles (
  id uuid not null,
  role text not null default 'user',
  full_name text null,
  avatar_url text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey
    foreign key (id) references auth.users (id) on delete cascade
);

-- Indexes (optional helpers)
create index if not exists idx_profiles_role on public.profiles (role);

-- RLS for profiles
alter table public.profiles enable row level security;

-- Anyone can read profiles (needed for role fetch)
create policy if not exists profiles_read_all on public.profiles
for select using (true);

-- Users can insert/update only their own profile (optional, safe default)
create policy if not exists profiles_self_insert on public.profiles
for insert with check (id = auth.uid());

create policy if not exists profiles_self_update on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

-- =============================
-- Admin helper
-- =============================
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- =============================
-- Content: news
-- =============================
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date null,
  short_text text null,
  full_text text null,
  image text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_news_date on public.news (date desc);

alter table public.news enable row level security;

-- Read for everyone
create policy if not exists news_read_all on public.news
for select using (true);

-- Write only for admins (insert/update/delete)
create policy if not exists news_write_admin on public.news
for all using (public.is_admin()) with check (public.is_admin());

-- =============================
-- Content: announcements
-- =============================
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date null,
  location text null,
  description text null,
  image text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ann_date on public.announcements (date desc);

alter table public.announcements enable row level security;

create policy if not exists ann_read_all on public.announcements
for select using (true);

create policy if not exists ann_write_admin on public.announcements
for all using (public.is_admin()) with check (public.is_admin());

-- =============================
-- Content: committees
-- =============================
create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  image text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_committees_name on public.committees (name asc);

alter table public.committees enable row level security;

create policy if not exists comm_read_all on public.committees
for select using (true);

create policy if not exists comm_write_admin on public.committees
for all using (public.is_admin()) with check (public.is_admin());

-- =============================
-- Storage: mediaa bucket policies (public read, admin write)
-- =============================
-- NOTE: Create bucket named exactly 'mediaa' in Storage UI.
-- RLS is always on for storage.objects; attach bucket-scoped policies.

create policy if not exists storage_mediaa_public_read on storage.objects
for select using (bucket_id = 'mediaa');

create policy if not exists storage_mediaa_admin_insert on storage.objects
for insert with check (bucket_id = 'mediaa' and public.is_admin());

create policy if not exists storage_mediaa_admin_update on storage.objects
for update using (bucket_id = 'mediaa' and public.is_admin())
with check (bucket_id = 'mediaa' and public.is_admin());

create policy if not exists storage_mediaa_admin_delete on storage.objects
for delete using (bucket_id = 'mediaa' and public.is_admin());

-- =============================
-- Optional seed examples (uncomment to use)
-- =============================
-- insert into public.news (title, date, short_text, full_text, image)
-- values ('Örnek Haber', current_date, 'Kısa metin', 'Uzun metin', 'https://.../image.jpg');

-- insert into public.announcements (title, date, location, description, image)
-- values ('Örnek Duyuru', current_date, 'İstanbul', 'Açıklama', 'https://.../image.jpg');

-- insert into public.committees (name, role, image)
-- values ('Ahmet Yılmaz', 'Başkan', 'https://.../avatar.jpg'); 