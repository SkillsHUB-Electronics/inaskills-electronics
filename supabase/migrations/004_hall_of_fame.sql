-- Hall of Fame: foto & catatan dua bahasa per juara.
-- Hall of Fame tetap berasal dari tabel results (medali emas/perak/perunggu/MoE);
-- tingkat lomba (WSC/WSA/ASC/Nasional/Regional) dan tahun diambil dari kompetisinya.
-- Jalankan sekali di Supabase SQL Editor setelah 003_users_news.sql.

alter table public.results
  add column foto_url text,
  add column catatan_en text,
  add column created_at timestamptz not null default now();

comment on column public.results.catatan is 'Catatan (Indonesia), mis. "Juara umum".';
comment on column public.results.foto_url is 'Foto opsional (mis. di podium); kosong = pakai foto alumni.';

create index if not exists results_competition_id_idx on public.results (competition_id);
create index if not exists results_alumni_id_idx on public.results (alumni_id);
