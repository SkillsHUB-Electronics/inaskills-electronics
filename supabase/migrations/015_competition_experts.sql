-- Expert (pembimbing) per kompetisi. Satu kompetisi bisa punya banyak expert.
-- Expert bisa dari alumni (alumni_id terisi, nama/foto/instansi diambil dari alumni)
-- atau orang luar (alumni_id kosong, nama/foto/instansi diisi manual).
-- Jalankan sekali di Supabase SQL Editor setelah 014_result_awards.sql.

create table public.competition_experts (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  alumni_id uuid references public.alumni (id) on delete cascade,
  nama text,
  foto_url text,
  instansi text,
  peran_id text,
  peran_en text,
  urutan int not null default 0,
  created_at timestamptz not null default now(),
  constraint expert_alumni_or_nama check (alumni_id is not null or nullif(btrim(nama), '') is not null)
);

create index competition_experts_competition_id_idx on public.competition_experts (competition_id);
create index competition_experts_alumni_id_idx on public.competition_experts (alumni_id);

alter table public.competition_experts enable row level security;
create policy "publik baca" on public.competition_experts for select using (true);
create policy "admin tulis" on public.competition_experts for all using (public.is_admin()) with check (public.is_admin());
