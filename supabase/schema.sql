-- Schéma initial de l'application de gestion des véhicules.
-- À exécuter dans Supabase > SQL Editor.

create extension if not exists btree_gist;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration text unique,
  type text,
  fuel_type text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- L'immatriculation est optionnelle (table déjà existante : on retire la contrainte).
alter table public.vehicles alter column registration drop not null;

-- Carburant (optionnel) (table déjà existante : on ajoute la colonne).
alter table public.vehicles add column if not exists fuel_type text;

alter table public.vehicles drop constraint if exists vehicles_fuel_type_check;
alter table public.vehicles
  add constraint vehicles_fuel_type_check
  check (fuel_type is null or fuel_type in ('essence', 'diesel', 'hybride', 'electrique'));

-- Remplacé par la table vehicle_warnings (avertissements multiples et typés) ci-dessous.
alter table public.vehicles drop column if exists needs_refuel;

-- Avertissements sur un véhicule (plein, garage, contrôle technique...), ajoutables et
-- levables depuis le tableau de bord. Un avertissement actif = une ligne dans cette table ;
-- le "décocher" du côté app supprime simplement la ligne.
create table if not exists public.vehicle_warnings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  type text not null check (type in ('plein', 'garage', 'controle_technique')),
  created_at timestamptz not null default now()
);

create index if not exists vehicle_warnings_vehicle_id_idx on public.vehicle_warnings(vehicle_id);

alter table public.vehicle_warnings enable row level security;

grant select, insert, update, delete on public.vehicle_warnings to anon;

drop policy if exists "anon_read_vehicle_warnings" on public.vehicle_warnings;
create policy "anon_read_vehicle_warnings"
on public.vehicle_warnings for select to anon, authenticated using (true);

drop policy if exists "anon_insert_vehicle_warnings" on public.vehicle_warnings;
create policy "anon_insert_vehicle_warnings"
on public.vehicle_warnings for insert to anon, authenticated with check (true);

drop policy if exists "anon_delete_vehicle_warnings" on public.vehicle_warnings;
create policy "anon_delete_vehicle_warnings"
on public.vehicle_warnings for delete to anon, authenticated using (true);

alter table public.vehicle_warnings replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'vehicle_warnings'
  ) then
    alter publication supabase_realtime add table public.vehicle_warnings;
  end if;
end $$;

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
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  entity_id uuid not null references public.entities(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  comment text,
  driver_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_dates_valid check (end_at > start_at)
);

-- Nom du conducteur, en texte libre (table déjà existante : on ajoute la colonne).
alter table public.reservations add column if not exists driver_name text;
alter table public.reservations drop column if exists driver_note;

-- Empêche deux réservations qui se chevauchent pour le même véhicule.
alter table public.reservations
  drop constraint if exists reservations_no_overlap;
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

-- RLS : pas d'authentification pour le moment, toute personne ayant le lien
-- (donc la clé publique "anon") peut lire et modifier les données.
-- ATTENTION : cela signifie qu'il n'y a aucun contrôle d'accès applicatif.
-- À restreindre dès qu'une authentification sera mise en place.
alter table public.vehicles enable row level security;
alter table public.entities enable row level security;
alter table public.reservations enable row level security;

-- Le rôle anon doit avoir les privilèges de base sur les tables (RLS filtre ensuite les lignes).
grant usage on schema public to anon;
grant select, insert, update, delete on public.vehicles to anon;
grant select, insert, update, delete on public.entities to anon;
grant select, insert, update, delete on public.reservations to anon;

drop policy if exists "anon_read_vehicles" on public.vehicles;
create policy "anon_read_vehicles"
on public.vehicles for select to anon, authenticated using (true);

drop policy if exists "anon_insert_vehicles" on public.vehicles;
create policy "anon_insert_vehicles"
on public.vehicles for insert to anon, authenticated with check (true);

drop policy if exists "anon_update_vehicles" on public.vehicles;
create policy "anon_update_vehicles"
on public.vehicles for update to anon, authenticated using (true) with check (true);

drop policy if exists "anon_delete_vehicles" on public.vehicles;
create policy "anon_delete_vehicles"
on public.vehicles for delete to anon, authenticated using (true);

drop policy if exists "anon_read_entities" on public.entities;
create policy "anon_read_entities"
on public.entities for select to anon, authenticated using (true);

drop policy if exists "anon_insert_entities" on public.entities;
create policy "anon_insert_entities"
on public.entities for insert to anon, authenticated with check (true);

drop policy if exists "anon_update_entities" on public.entities;
create policy "anon_update_entities"
on public.entities for update to anon, authenticated using (true) with check (true);

drop policy if exists "anon_delete_entities" on public.entities;
create policy "anon_delete_entities"
on public.entities for delete to anon, authenticated using (true);

drop policy if exists "anon_read_reservations" on public.reservations;
create policy "anon_read_reservations"
on public.reservations for select to anon, authenticated using (true);

drop policy if exists "anon_insert_reservations" on public.reservations;
create policy "anon_insert_reservations"
on public.reservations for insert to anon, authenticated with check (true);

drop policy if exists "anon_update_reservations" on public.reservations;
create policy "anon_update_reservations"
on public.reservations for update to anon, authenticated using (true) with check (true);

drop policy if exists "anon_delete_reservations" on public.reservations;
create policy "anon_delete_reservations"
on public.reservations for delete to anon, authenticated using (true);

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

-- ---------- Historique des modifications ----------
-- Journalise automatiquement chaque création/modification/suppression sur les
-- 3 tables métier, quel que soit l'appelant (le "mode admin" côté app n'est
-- qu'une protection d'affichage, pas une restriction au niveau base de données).

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_created_at_idx on public.activity_log(created_at desc);

alter table public.activity_log enable row level security;

grant select on public.activity_log to anon;

drop policy if exists "anon_read_activity_log" on public.activity_log;
create policy "anon_read_activity_log"
on public.activity_log for select to anon, authenticated using (true);

-- security definer : le trigger peut écrire dans activity_log même si
-- l'appelant (rôle anon) n'a pas de droit d'écriture direct sur cette table.
create or replace function public.log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rec_id uuid;
begin
  if tg_op = 'DELETE' then
    rec_id := old.id;
  else
    rec_id := new.id;
  end if;

  insert into public.activity_log (table_name, record_id, action, old_data, new_data)
  values (
    tg_table_name,
    rec_id,
    lower(tg_op),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists vehicles_log_activity on public.vehicles;
create trigger vehicles_log_activity
after insert or update or delete on public.vehicles
for each row execute function public.log_activity();

drop trigger if exists entities_log_activity on public.entities;
create trigger entities_log_activity
after insert or update or delete on public.entities
for each row execute function public.log_activity();

drop trigger if exists reservations_log_activity on public.reservations;
create trigger reservations_log_activity
after insert or update or delete on public.reservations
for each row execute function public.log_activity();

drop trigger if exists vehicle_warnings_log_activity on public.vehicle_warnings;
create trigger vehicle_warnings_log_activity
after insert or update or delete on public.vehicle_warnings
for each row execute function public.log_activity();

-- Active le flux Realtime sur l'historique aussi.
alter table public.activity_log replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'activity_log'
  ) then
    alter publication supabase_realtime add table public.activity_log;
  end if;
end $$;
