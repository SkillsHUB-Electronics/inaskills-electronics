-- Akun terdaftar: link media sosial di profil, hubungan akun <-> alumni, dan kelola admin dari panel.
-- Jalankan sekali di Supabase SQL Editor setelah 006_competition_logo.sql.

alter table public.profiles
  add column linkedin_url text,
  add column github_url text,
  add column instagram_url text;

-- Alumni bisa terhubung ke satu akun (alumni yang mendaftar sendiri).
alter table public.alumni
  add column user_id uuid unique references auth.users (id) on delete set null;

-- Link sosial yang diubah user di "Akun Saya" ikut diperbarui di profil alumninya.
create or replace function public.sync_profile_to_alumni()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.alumni
  set linkedin_url = new.linkedin_url,
      github_url = new.github_url,
      instagram_url = new.instagram_url
  where user_id = new.id;
  return new;
end;
$$;

create trigger on_profile_updated
  after update of linkedin_url, github_url, instagram_url on public.profiles
  for each row execute function public.sync_profile_to_alumni();

-- Daftar akun untuk panel admin (email ada di auth.users, jadi lewat fungsi khusus admin).
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  nama text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  is_admin boolean,
  alumni_id uuid,
  alumni_nama text,
  linkedin_url text,
  github_url text,
  instagram_url text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin';
  end if;
  return query
    select u.id, u.email::text, coalesce(p.nama, ''), u.created_at, u.last_sign_in_at,
           exists (select 1 from public.admins a where a.user_id = u.id),
           al.id, al.nama, p.linkedin_url, p.github_url, p.instagram_url
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.alumni al on al.user_id = u.id
    order by u.created_at desc;
end;
$$;

-- Jadikan / cabut admin. Admin tidak bisa mencabut dirinya sendiri (mencegah terkunci).
create or replace function public.admin_set_admin(target uuid, make_admin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin';
  end if;
  if make_admin then
    insert into public.admins (user_id) values (target) on conflict do nothing;
  else
    if target = auth.uid() then
      raise exception 'Tidak bisa mencabut admin akun sendiri';
    end if;
    delete from public.admins where user_id = target;
  end if;
end;
$$;

revoke execute on function public.admin_list_users() from public, anon;
revoke execute on function public.admin_set_admin(uuid, boolean) from public, anon;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;
