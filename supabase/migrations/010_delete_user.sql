-- Admin bisa menghapus akun pengguna dari panel (Pengguna).
-- Jalankan sekali di Supabase SQL Editor setelah 009_public_stats.sql.

-- Admin boleh menghapus foto profil pengguna lain (dibersihkan sebelum akun dihapus).
create policy "admin hapus avatar" on storage.objects
  for delete using (bucket_id = 'avatars' and public.is_admin());

-- Hapus akun. Profil ikut terhapus; data alumni yang terhubung tetap ada (hubungannya saja yang lepas).
-- Tidak bisa menghapus diri sendiri, dan akun admin harus dicabut hak adminnya dulu.
create or replace function public.admin_delete_user(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin';
  end if;
  if target = auth.uid() then
    raise exception 'Tidak bisa menghapus akun sendiri';
  end if;
  if exists (select 1 from public.admins where user_id = target) then
    raise exception 'Cabut hak admin akun ini dulu sebelum menghapusnya';
  end if;
  delete from auth.users where id = target;
end;
$$;

revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
