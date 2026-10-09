-- Penghargaan khusus (langka): Best of Nation dan Albert Vidal Award.
-- Bisa dicentang bersamaan dengan medali apa pun, termasuk "tanpa medali".
-- Jalankan sekali di Supabase SQL Editor setelah 013_public_contact.sql.

alter table public.results
  add column best_of_nation boolean not null default false,
  add column albert_vidal boolean not null default false;
