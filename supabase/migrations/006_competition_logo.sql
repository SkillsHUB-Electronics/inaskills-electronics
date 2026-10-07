-- Logo kompetisi (berbeda tiap tahun), terpisah dari foto sampul (cover_url).
-- Jalankan sekali di Supabase SQL Editor setelah 005_competition_details.sql.

alter table public.competitions add column logo_url text;
