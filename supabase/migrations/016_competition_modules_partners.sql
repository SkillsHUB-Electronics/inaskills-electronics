-- Modul / Task Project Breakdown dan Partners & Supporter per kompetisi.
-- Jalankan sekali di Supabase SQL Editor setelah 015_competition_experts.sql.

create table public.competition_modules (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  judul_id text not null,
  judul_en text,
  deskripsi_id text,
  deskripsi_en text,
  urutan int not null default 0,
  created_at timestamptz not null default now()
);

create table public.competition_partners (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  nama text not null,
  logo_url text,
  website text,
  urutan int not null default 0,
  created_at timestamptz not null default now()
);

create index competition_modules_competition_id_idx on public.competition_modules (competition_id);
create index competition_partners_competition_id_idx on public.competition_partners (competition_id);

do $$
declare t text;
begin
  foreach t in array array['competition_modules','competition_partners'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "publik baca" on public.%I for select using (true)', t);
    execute format('create policy "admin tulis" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;
