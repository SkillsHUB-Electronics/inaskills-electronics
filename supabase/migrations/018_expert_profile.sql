-- Profil expert (non-alumni) selevel profil alumni, dan bisa ditautkan ke akun pengguna.
-- Jalankan sekali di Supabase SQL Editor setelah 017_experts.sql.

alter table public.experts
  add column user_id uuid unique references auth.users (id) on delete set null,
  add column lokasi text,
  add column keahlian text[],
  add column quote_id text,
  add column quote_en text,
  add column github_url text,
  add column instagram_url text,
  add column kontak_email text,
  add column kontak_telepon text;

-- Perubahan profil user ikut ke expert yang tertaut (hanya kolom yang benar-benar diubah).
create or replace function public.sync_profile_to_experts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.experts e set
    linkedin_url = case when new.linkedin_url is distinct from old.linkedin_url then new.linkedin_url else e.linkedin_url end,
    github_url = case when new.github_url is distinct from old.github_url then new.github_url else e.github_url end,
    instagram_url = case when new.instagram_url is distinct from old.instagram_url then new.instagram_url else e.instagram_url end,
    foto_url = case when new.foto_url is distinct from old.foto_url then new.foto_url else e.foto_url end,
    bio_id = case when new.bio is distinct from old.bio then coalesce(new.bio, '') else e.bio_id end,
    pekerjaan = case when new.pekerjaan is distinct from old.pekerjaan then new.pekerjaan else e.pekerjaan end,
    instansi = case when new.instansi is distinct from old.instansi then new.instansi else e.instansi end,
    lokasi = case when new.lokasi is distinct from old.lokasi then new.lokasi else e.lokasi end,
    keahlian = case when new.keahlian is distinct from old.keahlian then new.keahlian else e.keahlian end,
    quote_id = case when new.quote_id is distinct from old.quote_id then new.quote_id else e.quote_id end,
    quote_en = case when new.quote_en is distinct from old.quote_en then new.quote_en else e.quote_en end
  where e.user_id = new.id;
  return new;
end;
$$;

create trigger on_profile_updated_experts
  after update of linkedin_url, github_url, instagram_url, foto_url, bio, pekerjaan, instansi, lokasi, keahlian, quote_id, quote_en on public.profiles
  for each row execute function public.sync_profile_to_experts();

-- Kontak publik (opt-in) ikut ke expert juga.
create or replace function public.apply_public_contact(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare em text; tel text;
begin
  select u.email::text into em from auth.users u join public.profiles p on p.id = u.id where u.id = uid and p.email_publik;
  select nullif(trim(p.telepon), '') into tel from public.profiles p where p.id = uid and p.telepon_publik;
  update public.alumni set kontak_email = em, kontak_telepon = tel where user_id = uid;
  update public.experts set kontak_email = em, kontak_telepon = tel where user_id = uid;
end;
$$;
revoke execute on function public.apply_public_contact(uuid) from public, anon, authenticated;

-- Saat expert ditautkan ke akun: isian yang masih kosong diisi dari profil akun, kontak opt-in ikut terisi.
create or replace function public.sync_expert_on_link()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is not null and (tg_op = 'INSERT' or old.user_id is distinct from new.user_id) then
    update public.experts e set
      foto_url = coalesce(nullif(e.foto_url, ''), p.foto_url),
      bio_id = coalesce(nullif(e.bio_id, ''), p.bio),
      pekerjaan = coalesce(nullif(e.pekerjaan, ''), p.pekerjaan),
      instansi = coalesce(nullif(e.instansi, ''), p.instansi),
      lokasi = coalesce(nullif(e.lokasi, ''), p.lokasi),
      keahlian = coalesce(e.keahlian, p.keahlian),
      quote_id = coalesce(nullif(e.quote_id, ''), p.quote_id),
      quote_en = coalesce(nullif(e.quote_en, ''), p.quote_en),
      linkedin_url = coalesce(nullif(e.linkedin_url, ''), p.linkedin_url),
      github_url = coalesce(nullif(e.github_url, ''), p.github_url),
      instagram_url = coalesce(nullif(e.instagram_url, ''), p.instagram_url)
    from public.profiles p
    where e.id = new.id and p.id = new.user_id;
    perform public.apply_public_contact(new.user_id);
  end if;
  return null;
end;
$$;

create trigger on_expert_link
  after insert or update of user_id on public.experts
  for each row execute function public.sync_expert_on_link();
