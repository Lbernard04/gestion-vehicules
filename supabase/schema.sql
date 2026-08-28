-- Schéma initial de l'application de gestion des véhicules.
-- À exécuter dans Supabase > SQL Editor.

create extension if not exists btree_gist;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration text not null unique,
  type text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  entity_id uuid not null references public.entities(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_dates_valid check (end_at > start_at)
);

-- Empêche deux réservations qui se chevauchent pour le même véhicule.
alter table public.reservations
  add constraint reservations_no_overlap
  exclude using gist (
    vehicle_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  );

create index if not exists reservations_vehicle_id_idx on public.reservations(vehicle_id);
create index if not exists reservations_entity_id_idx on public.reservations(entity_id);
create index if not exists reservations_start_at_idx on public.reservations(start_at);

-- Mise à jour automatique de updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists entities_set_updated_at on public.entities;
create trigger entities_set_updated_at
before update on public.entities
for each row execute function public.set_updated_at();

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

-- RLS : les données seront accessibles à l'application authentifiée.
alter table public.vehicles enable row level security;
alter table public.entities enable row level security;
alter table public.reservations enable row level security;

-- Pour le MVP, tout utilisateur authentifié peut lire et modifier les données.
-- Ces politiques pourront ensuite être affinées avec des rôles administrateur/utilisateur.
drop policy if exists "authenticated_read_vehicles" on public.vehicles;
create policy "authenticated_read_vehicles"
on public.vehicles for select to authenticated using (true);

drop policy if exists "authenticated_insert_vehicles" on public.vehicles;
create policy "authenticated_insert_vehicles"
on public.vehicles for insert to authenticated with check (true);

drop policy if exists "authenticated_update_vehicles" on public.vehicles;
create policy "authenticated_update_vehicles"
on public.vehicles for update to authenticated using (true) with check (true);

drop policy if exists "authenticated_delete_vehicles" on public.vehicles;
create policy "authenticated_delete_vehicles"
on public.vehicles for delete to authenticated using (true);

drop policy if exists "authenticated_read_entities" on public.entities;
create policy "authenticated_read_entities"
on public.entities for select to authenticated using (true);

drop policy if exists "authenticated_insert_entities" on public.entities;
create policy "authenticated_insert_entities"
on public.entities for insert to authenticated with check (true);

drop policy if exists "authenticated_update_entities" on public.entities;
create policy "authenticated_update_entities"
on public.entities for update to authenticated using (true) with check (true);

drop policy if exists "authenticated_delete_entities" on public.entities;
create policy "authenticated_delete_entities"
on public.entities for delete to authenticated using (true);

drop policy if exists "authenticated_read_reservations" on public.reservations;
create policy "authenticated_read_reservations"
on public.reservations for select to authenticated using (true);

drop policy if exists "authenticated_insert_reservations" on public.reservations;
create policy "authenticated_insert_reservations"
on public.reservations for insert to authenticated with check (true);

drop policy if exists "authenticated_update_reservations" on public.reservations;
create policy "authenticated_update_reservations"
on public.reservations for update to authenticated using (true) with check (true);

drop policy if exists "authenticated_delete_reservations" on public.reservations;
create policy "authenticated_delete_reservations"
on public.reservations for delete to authenticated using (true);

-- Active le flux Realtime sur les trois tables.
alter table public.vehicles replica identity full;
alter table public.entities replica identity full;
alter table public.reservations replica identity full;

-- Ajout au publication Realtime uniquement si les tables n'y sont pas déjà.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'vehicles'
  ) then
    alter publication supabase_realtime add table public.vehicles;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'entities'
  ) then
    alter publication supabase_realtime add table public.entities;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reservations'
  ) then
    alter publication supabase_realtime add table public.reservations;
  end if;
end $$;
