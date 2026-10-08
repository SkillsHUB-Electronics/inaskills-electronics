-- Kontak publik alumni dengan opt-in: email & telepon hanya tampil di profil publik bila user mencentang.
-- Jalankan sekali di Supabase SQL Editor setelah 012_profile_quote.sql.

alter table public.profiles
  add column telepon text,
  add column email_publik boolean not null default false,
  add column telepon_publik boolean not null default false;

-- Salinan publik di alumni; terisi hanya saat user opt-in.
alter table public.alumni
  add column kontak_email text,
  add column kontak_telepon text;

-- Hitung kontak publik dari profil + email akun.
create or replace function public.apply_public_contact(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.alumni a set
    kontak_email = (select u.email::text from auth.users u join public.profiles p on p.id = u.id where u.id = uid and p.email_publik),
    kontak_telepon = (select nullif(trim(p.telepon), '') from public.profiles p where p.id = uid and p.telepon_publik)
  where a.user_id = uid;
end;
$$;
revoke execute on function public.apply_public_contact(uuid) from public, anon, authenticated;

create or replace function public.sync_public_contact()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.apply_public_contact(new.id);
  return new;
end;
$$;

create trigger on_profile_contact
  after update of telepon, email_publik, telepon_publik on public.profiles
  for each row execute function public.sync_public_contact();

-- Saat admin menghubungkan alumni ke akun, kontak opt-in ikut terisi.
create or replace function public.sync_contact_on_link()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is not null then
    perform public.apply_public_contact(new.user_id);
  end if;
  return null;
end;
$$;

create trigger on_alumni_link_contact
  after insert or update of user_id on public.alumni
  for each row execute function public.sync_contact_on_link();
