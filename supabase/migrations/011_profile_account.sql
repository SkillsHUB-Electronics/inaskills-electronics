-- Akun Saya (desain baru): lokasi, daftar keahlian, dan waktu terakhir profil diubah.
-- Jalankan sekali di Supabase SQL Editor setelah 010_delete_user.sql.

alter table public.profiles
  add column lokasi text,
  add column keahlian text[] not null default '{}',
  add column updated_at timestamptz not null default now();

-- Waktu ubah awal = waktu daftar, agar "Aktivitas Terbaru" tidak menampilkan tanggal migrasi.
update public.profiles set updated_at = created_at;

create or replace function public.touch_profile()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profile_touch
  before update on public.profiles
  for each row execute function public.touch_profile();
