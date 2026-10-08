-- Profil publik alumni (desain baru): quote (ID/EN), lokasi, dan keahlian ikut ke profil alumni yang terhubung.
-- Jalankan sekali di Supabase SQL Editor setelah 011_profile_account.sql.

alter table public.profiles
  add column quote_id text,
  add column quote_en text;

alter table public.alumni
  add column lokasi text,
  add column keahlian text[] not null default '{}',
  add column quote_id text,
  add column quote_en text;

-- Alumni yang sudah terhubung ke akun: salin lokasi & keahlian yang sudah ada.
update public.alumni a set lokasi = p.lokasi, keahlian = p.keahlian
from public.profiles p where p.id = a.user_id;

-- Sinkron ke alumni: hanya kolom yang benar-benar diubah user, agar isian admin tidak tertimpa.
create or replace function public.sync_profile_to_alumni()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.alumni a set
    linkedin_url = case when new.linkedin_url is distinct from old.linkedin_url then new.linkedin_url else a.linkedin_url end,
    github_url = case when new.github_url is distinct from old.github_url then new.github_url else a.github_url end,
    instagram_url = case when new.instagram_url is distinct from old.instagram_url then new.instagram_url else a.instagram_url end,
    foto_url = case when new.foto_url is distinct from old.foto_url then new.foto_url else a.foto_url end,
    bio_id = case when new.bio is distinct from old.bio then coalesce(new.bio, '') else a.bio_id end,
    pekerjaan = case when new.pekerjaan is distinct from old.pekerjaan then new.pekerjaan else a.pekerjaan end,
    instansi = case when new.instansi is distinct from old.instansi then new.instansi else a.instansi end,
    lokasi = case when new.lokasi is distinct from old.lokasi then new.lokasi else a.lokasi end,
    keahlian = case when new.keahlian is distinct from old.keahlian then new.keahlian else a.keahlian end,
    quote_id = case when new.quote_id is distinct from old.quote_id then new.quote_id else a.quote_id end,
    quote_en = case when new.quote_en is distinct from old.quote_en then new.quote_en else a.quote_en end
  where a.user_id = new.id;
  return new;
end;
$$;

drop trigger on_profile_updated on public.profiles;
create trigger on_profile_updated
  after update of linkedin_url, github_url, instagram_url, foto_url, bio, pekerjaan, instansi, lokasi, keahlian, quote_id, quote_en on public.profiles
  for each row execute function public.sync_profile_to_alumni();
