-- Expert menjadi daftar tersendiri (seperti alumni); kompetisi hanya memilih dari daftar ini.
-- Expert boleh sekaligus alumni (alumni_id), maka riwayatnya tampil di profil alumni.
-- Jalankan sekali di Supabase SQL Editor setelah 016_competition_modules_partners.sql.

create table public.experts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nama text not null,
  alumni_id uuid references public.alumni (id) on delete set null,
  foto_url text,
  pekerjaan text,
  instansi text,
  bio_id text,
  bio_en text,
  linkedin_url text,
  created_at timestamptz not null default now()
);

create index experts_alumni_id_idx on public.experts (alumni_id);

alter table public.experts enable row level security;
create policy "publik baca" on public.experts for select using (true);
create policy "admin tulis" on public.experts for all using (public.is_admin()) with check (public.is_admin());

alter table public.competition_experts add column expert_id uuid references public.experts (id) on delete cascade;

-- Pindahkan data lama (jika ada) ke daftar expert.
do $$
declare r record; new_id uuid; n text;
begin
  for r in select ce.id, ce.alumni_id, ce.nama, ce.foto_url, ce.instansi, a.nama as alumni_nama
           from public.competition_experts ce left join public.alumni a on a.id = ce.alumni_id loop
    n := coalesce(nullif(btrim(r.nama), ''), r.alumni_nama, 'Expert');
    insert into public.experts (slug, nama, alumni_id, foto_url, instansi)
      values (lower(regexp_replace(n, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 6), n, r.alumni_id, r.foto_url, r.instansi)
      returning id into new_id;
    update public.competition_experts set expert_id = new_id where id = r.id;
  end loop;
end $$;

alter table public.competition_experts alter column expert_id set not null;
alter table public.competition_experts drop constraint expert_alumni_or_nama;
alter table public.competition_experts drop column alumni_id, drop column nama, drop column foto_url, drop column instansi;
create index competition_experts_expert_id_idx on public.competition_experts (expert_id);
