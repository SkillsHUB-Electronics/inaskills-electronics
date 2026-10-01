-- User biasa (profil) dan Berita.
-- Jalankan sekali di Supabase SQL Editor setelah 002_projects_social.sql.

-- Profil untuk setiap akun (admin maupun user biasa). Fitur anggota menyusul.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nama text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "user baca profil sendiri" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "user ubah profil sendiri" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Buat profil otomatis saat user mendaftar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nama)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nama', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profil untuk akun yang sudah ada (mis. admin).
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

-- Berita & kegiatan
create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  judul_id text not null,
  judul_en text not null default '',
  ringkasan_id text not null default '',
  ringkasan_en text not null default '',
  isi_id text not null default '',
  isi_en text not null default '',
  cover_url text,
  tanggal date not null default current_date,
  terbit boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.news enable row level security;
create policy "publik baca berita terbit" on public.news for select using (terbit or public.is_admin());
create policy "admin tulis" on public.news for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public) values ('news', 'news', true) on conflict (id) do nothing;

drop policy "admin upload file" on storage.objects;
drop policy "admin ubah file" on storage.objects;
drop policy "admin hapus file" on storage.objects;

create policy "admin upload file" on storage.objects for insert
  with check (bucket_id in ('alumni','competitions','sponsors','projects','news') and public.is_admin());
create policy "admin ubah file" on storage.objects for update
  using (bucket_id in ('alumni','competitions','sponsors','projects','news') and public.is_admin());
create policy "admin hapus file" on storage.objects for delete
  using (bucket_id in ('alumni','competitions','sponsors','projects','news') and public.is_admin());
