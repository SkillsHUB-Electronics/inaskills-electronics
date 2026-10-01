-- Skema awal Inaskills Electronics.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run.

-- Admin tunggal: isi UUID user admin (Authentication > Users) setelah akun dibuat.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create type public.competition_level as enum ('regional', 'nasional', 'asc', 'wsa', 'wsc');
create type public.medal as enum ('gold', 'silver', 'bronze', 'moe', 'peserta');

create table public.alumni (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nama text not null,
  foto_url text,
  bio_id text not null default '',
  bio_en text not null default '',
  asal_daerah text,
  tahun_aktif text,
  unggulan boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nama_id text not null,
  nama_en text not null default '',
  level public.competition_level not null,
  tahun int not null,
  lokasi text,
  tanggal date,
  overview_id text not null default '',
  overview_en text not null default '',
  cover_url text,
  created_at timestamptz not null default now()
);

create table public.results (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  alumni_id uuid not null references public.alumni (id) on delete cascade,
  medali public.medal not null,
  peringkat int,
  catatan text
);

create table public.competition_images (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  url text not null,
  caption_id text not null default '',
  caption_en text not null default '',
  urutan int not null default 0
);

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  logo_url text not null,
  website text,
  tier text,
  urutan int not null default 0,
  aktif boolean not null default true
);

-- Teks yang bisa diedit admin: hero, stats_medals, stats_competitions,
-- stats_alumni, stats_countries, contact_whatsapp, contact_email, dll.
create table public.site_content (
  key text primary key,
  value_id text not null default '',
  value_en text not null default ''
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  perusahaan text,
  email text not null,
  telepon text,
  pesan text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: publik hanya baca, admin semua.
alter table public.admins enable row level security;
alter table public.alumni enable row level security;
alter table public.competitions enable row level security;
alter table public.results enable row level security;
alter table public.competition_images enable row level security;
alter table public.sponsors enable row level security;
alter table public.site_content enable row level security;
alter table public.contact_messages enable row level security;

create policy "admin baca daftar admin" on public.admins for select using (public.is_admin());

do $$
declare t text;
begin
  foreach t in array array['alumni','competitions','results','competition_images','sponsors','site_content'] loop
    execute format('create policy "publik baca" on public.%I for select using (true)', t);
    execute format('create policy "admin tulis" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Form sponsor: siapa saja boleh kirim, hanya admin yang bisa baca/hapus.
create policy "publik kirim pesan" on public.contact_messages for insert with check (true);
create policy "admin kelola pesan" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

-- Storage gambar
insert into storage.buckets (id, name, public)
values ('alumni', 'alumni', true), ('competitions', 'competitions', true), ('sponsors', 'sponsors', true)
on conflict (id) do nothing;

create policy "admin upload gambar" on storage.objects for insert
  with check (bucket_id in ('alumni','competitions','sponsors') and public.is_admin());
create policy "admin ubah gambar" on storage.objects for update
  using (bucket_id in ('alumni','competitions','sponsors') and public.is_admin());
create policy "admin hapus gambar" on storage.objects for delete
  using (bucket_id in ('alumni','competitions','sponsors') and public.is_admin());

-- Konten awal
insert into public.site_content (key, value_id, value_en) values
  ('stats_medals', '0', '0'),
  ('stats_competitions', '0', '0'),
  ('stats_alumni', '0', '0'),
  ('stats_countries', '0', '0'),
  ('contact_whatsapp', '', ''),
  ('contact_email', '', '');
