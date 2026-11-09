-- Catalogue settings: which species are published in the Sales and Customer portals,
-- and the order of the "Most popular" and "Lesser known" groups.
-- Edited from Administration > Catalogue. Everybody signed in can read it, only administrators can change it.
-- NOT applied yet: run it once in the Supabase SQL editor (or ask Claude to apply it).

create table if not exists public.catalogue_settings (
  code        text primary key,
  published   boolean     not null default true,
  tier        text        not null default '' check (tier in ('', 'popular', 'lesser')),
  sort        integer     not null default 1000,
  updated_at  timestamptz not null default now()
);

alter table public.catalogue_settings enable row level security;

drop policy if exists catalogue_settings_select on public.catalogue_settings;
create policy catalogue_settings_select on public.catalogue_settings
  for select to authenticated using (true);

drop policy if exists catalogue_settings_admin on public.catalogue_settings;
create policy catalogue_settings_admin on public.catalogue_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
