-- Proyek & Riset (R&D alumni, data soal, task project), link sosial alumni.
-- Jalankan sekali di Supabase SQL Editor setelah 001_init.sql.

create type public.project_category as enum ('rnd', 'soal', 'task_project', 'lainnya');
create type public.project_status as enum ('published', 'under_development');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  judul_id text not null,
  judul_en text not null default '',
  deskripsi_id text not null default '',
  deskripsi_en text not null default '',
  kategori public.project_category not null default 'rnd',
  status public.project_status not null default 'published',
  tahun int,
  alumni_id uuid references public.alumni (id) on delete set null,
  cover_url text,
  repo_url text,
  demo_url text,
  file_url text,
  urutan int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "publik baca" on public.projects for select using (true);
create policy "admin tulis" on public.projects for all using (public.is_admin()) with check (public.is_admin());

alter table public.alumni
  add column linkedin_url text,
  add column github_url text,
  add column instagram_url text;

-- Bucket untuk file unduhan (PDF soal, ZIP project) dan sampul proyek.
insert into storage.buckets (id, name, public)
values ('projects', 'projects', true)
on conflict (id) do nothing;

drop policy "admin upload gambar" on storage.objects;
drop policy "admin ubah gambar" on storage.objects;
drop policy "admin hapus gambar" on storage.objects;

create policy "admin upload file" on storage.objects for insert
  with check (bucket_id in ('alumni','competitions','sponsors','projects') and public.is_admin());
create policy "admin ubah file" on storage.objects for update
  using (bucket_id in ('alumni','competitions','sponsors','projects') and public.is_admin());
create policy "admin hapus file" on storage.objects for delete
  using (bucket_id in ('alumni','competitions','sponsors','projects') and public.is_admin());

-- Link media sosial tim (diisi lewat admin > Konten & Kontak).
insert into public.site_content (key, value_id, value_en) values
  ('social_instagram', '', ''),
  ('social_youtube', '', ''),
  ('social_tiktok', '', ''),
  ('social_linkedin', '', ''),
  ('social_facebook', '', ''),
  ('social_github', '', '')
on conflict (key) do nothing;
