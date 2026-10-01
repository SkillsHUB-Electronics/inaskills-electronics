# Inaskills Electronics

Landing page tim elektronika Indonesia (Regional, Nasional, ASC, WSA, WSC) dengan Hall of Fame, profil alumni, kompetisi, dan sponsor. Situs dua bahasa (ID/EN) dengan mode admin.

Stack: Next.js (static export) + Tailwind CSS + Supabase.

## Menjalankan lokal

```bash
cp .env.example .env.local   # isi URL & anon key Supabase
npm install
npm run dev                  # http://localhost:3000
```

Tanpa env Supabase, situs tetap jalan dengan data contoh (`lib/sample-data.ts`).

## Setup Supabase

1. Buat project di supabase.com.
2. SQL Editor: jalankan `supabase/migrations/001_init.sql`.
3. Authentication > Users: buat 1 user admin, lalu jalankan
   `insert into public.admins (user_id) values ('<UUID user>');`
4. Authentication > Providers > Email: matikan "Allow new users to sign up".

## Deploy ke GitHub Pages

1. Settings > Pages > Source: **GitHub Actions**.
2. URL & publishable key Supabase sudah ada di `.github/workflows/deploy.yml`.
3. Push ke `main`, situs tampil di `https://<user>.github.io/<repo>/`.

Pindah ke Vercel/hosting lain: hubungkan repo, isi env yang sama, kosongkan `NEXT_PUBLIC_BASE_PATH`.

## Panel admin

Buka `/admin/` (mis. `https://skillshub-electronics.github.io/inaskills-electronics/admin/`), login dengan akun admin Supabase.
Menu: Alumni, Kompetisi (hasil/juara + galeri foto), Sponsor (logo), Konten & Kontak (hero, statistik, WhatsApp, email), Pesan Masuk.
Perubahan langsung tampil di situs tanpa build ulang.

## Mengelola akun admin

Admin = user di Supabase Auth yang UUID-nya ada di tabel `admins`.

- **Tambah admin:** Supabase > Authentication > Users > Add user, salin UUID, lalu di SQL Editor:
  `insert into public.admins (user_id) values ('<UUID>');`
- **Cabut admin:** `delete from public.admins where user_id = '<UUID>';` (boleh sekalian hapus user-nya di Authentication > Users).
- **Ganti akun admin:** tambah admin baru dulu, login untuk memastikan berhasil, baru cabut yang lama.
- **Ganti password:** dari panel admin, menu Akun.
- **Lihat daftar admin:** `select u.email from public.admins a join auth.users u on u.id = a.user_id;`
