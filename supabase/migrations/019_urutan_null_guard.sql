-- Jaga-jaga: urutan kosong dari form admin tidak boleh membuat insert gagal (not null).
-- Trigger mengubah NULL eksplisit menjadi 0.
create or replace function public.urutan_default_zero() returns trigger
language plpgsql as $$
begin
  new.urutan := coalesce(new.urutan, 0);
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['sponsors','projects','competition_images','competition_experts','competition_modules','competition_partners'] loop
    execute format('drop trigger if exists urutan_default_zero on public.%I', t);
    execute format('create trigger urutan_default_zero before insert or update on public.%I for each row execute function public.urutan_default_zero()', t);
  end loop;
end $$;
