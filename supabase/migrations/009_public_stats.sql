-- Statistik Beranda dihitung otomatis dari Hall of Fame (results) dan Kompetisi.
-- Jalankan sekali di Supabase SQL Editor setelah 008_profile_details.sql.

create or replace function public.public_stats()
returns table (medals bigint, competitions bigint, alumni bigint, countries bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    -- Medali: emas, perak, perunggu, dan Medallion of Excellence.
    (select count(*) from public.results where medali in ('gold', 'silver', 'bronze', 'moe')),
    (select count(*) from public.competitions),
    -- Alumni juara: alumni yang punya minimal satu medali.
    (select count(distinct alumni_id) from public.results where medali in ('gold', 'silver', 'bronze', 'moe')),
    -- Negara dikunjungi: negara lokasi lomba selain Indonesia.
    (select count(distinct lower(trim(negara))) from public.competitions
      where coalesce(trim(negara), '') <> '' and lower(trim(negara)) <> 'indonesia');
$$;

grant execute on function public.public_stats() to anon, authenticated;

-- Angka manual lama tidak dipakai lagi.
delete from public.site_content where key in ('stats_medals', 'stats_competitions', 'stats_alumni', 'stats_countries');
