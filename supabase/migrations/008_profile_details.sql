-- Akun Saya: foto profil, bio, pekerjaan, instansi. Ikut ke profil alumni yang terhubung.
-- Jalankan sekali di Supabase SQL Editor setelah 007_users_admin.sql.

alter table public.profiles
  add column foto_url text,
  add column bio text,
  add column pekerjaan text,
  add column instansi text;

alter table public.alumni
  add column pekerjaan text,
  add column instansi text;

-- Bucket foto profil. Tiap user hanya boleh mengelola file di folder <user_id>/ miliknya.
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;

-- Hapus file lewat Storage API butuh izin select juga.
create policy "user baca avatar" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user upload avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user ubah avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user hapus avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Sinkron ke alumni: hanya kolom yang benar-benar diubah user, agar isian admin lain tidak tertimpa.
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
    instansi = case when new.instansi is distinct from old.instansi then new.instansi else a.instansi end
  where a.user_id = new.id;
  return new;
end;
$$;

drop trigger on_profile_updated on public.profiles;
create trigger on_profile_updated
  after update of linkedin_url, github_url, instagram_url, foto_url, bio, pekerjaan, instansi on public.profiles
  for each row execute function public.sync_profile_to_alumni();

-- Daftar akun untuk admin, kini dengan data profil lengkap.
drop function public.admin_list_users();
create function public.admin_list_users()
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
  instagram_url text,
  foto_url text,
  bio text,
  pekerjaan text,
  instansi text
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
           al.id, al.nama, p.linkedin_url, p.github_url, p.instagram_url,
           p.foto_url, p.bio, p.pekerjaan, p.instansi
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.alumni al on al.user_id = u.id
    order by u.created_at desc;
end;
$$;

revoke execute on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;
