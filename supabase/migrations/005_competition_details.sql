-- Kompetisi: link situs resmi, tanggal mulai & selesai, kota & negara.
-- Jalankan sekali di Supabase SQL Editor setelah 004_hall_of_fame.sql.

alter table public.competitions rename column tanggal to tanggal_mulai;
alter table public.competitions rename column lokasi to kota;

alter table public.competitions
  add column tanggal_selesai date,
  add column negara text,
  add column website_url text,
  add constraint competitions_tanggal_urut check (tanggal_selesai is null or tanggal_mulai is null or tanggal_selesai >= tanggal_mulai);

-- Link situs resmi yang terlanjur diisi di kolom slug dipindah ke website_url, slug dibuat ulang dari nama.
update public.competitions
set website_url = slug,
    slug = trim(both '-' from regexp_replace(lower(nama_id), '[^a-z0-9]+', '-', 'g'))
where slug ~* '^https?://';
