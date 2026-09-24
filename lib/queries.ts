import { supabase } from './supabase';
import type {
  ActivityLogEntry,
  Entity,
  FuelType,
  Reservation,
  ReservationWithRelations,
  Vehicle,
  VehicleWarning,
  VehicleWarningType,
} from './types';

// Message d'erreur unique si les variables d'environnement Supabase manquent,
// pour que l'UI puisse afficher un message clair au lieu d'un crash silencieux.
function requireClient() {
  if (!supabase) {
    throw new Error(
      "Connexion à Supabase indisponible : vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }
  return supabase;
}

// Traduit les erreurs Postgres les plus courantes en messages compréhensibles.
export function toFriendlyError(error: { code?: string; message: string }): string {
  if (error.code === '23505') {
    return "Cette valeur existe déjà (immatriculation ou champ unique en doublon).";
  }
  if (error.code === '23P01') {
    return 'Ce véhicule est déjà réservé sur ce créneau.';
  }
  if (error.code === '23503') {
    return 'Impossible : cet élément est encore référencé ailleurs (désactivez-le plutôt que de le supprimer).';
  }
  return error.message;
}

// Extrait un message affichable depuis n'importe quelle erreur interceptée
// (PostgrestError de Supabase, Error classique, ou valeur inattendue).
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    return toFriendlyError(err as { code?: string; message: string });
  }
  return 'Erreur inconnue.';
}

// ---------- Véhicules ----------

export async function listVehicles(): Promise<Vehicle[]> {
  const client = requireClient();
  const { data, error } = await client.from('vehicles').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createVehicle(input: {
  name: string;
  registration: string | null;
  type: string | null;
  fuel_type: FuelType | null;
}): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('vehicles').insert(input);
  if (error) throw error;
}

export async function updateVehicle(
  id: string,
  input: Partial<Pick<Vehicle, 'name' | 'registration' | 'type' | 'fuel_type' | 'active'>>
): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('vehicles').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteVehicle(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('vehicles').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Avertissements véhicule ----------

export async function listVehicleWarnings(): Promise<VehicleWarning[]> {
  const client = requireClient();
  const { data, error } = await client.from('vehicle_warnings').select('*').order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addVehicleWarning(vehicleId: string, type: VehicleWarningType): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('vehicle_warnings').insert({ vehicle_id: vehicleId, type });
  if (error) throw error;
}

export async function removeVehicleWarning(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('vehicle_warnings').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Entités ----------

export async function listEntities(): Promise<Entity[]> {
  const client = requireClient();
  const { data, error } = await client.from('entities').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createEntity(input: { name: string; email: string | null }): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('entities').insert(input);
  if (error) throw error;
}

export async function updateEntity(
  id: string,
  input: Partial<Pick<Entity, 'name' | 'email' | 'active'>>
): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('entities').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteEntity(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('entities').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Réservations ----------

const RESERVATION_SELECT = '*, vehicle:vehicles(*), entity:entities(*)';

export async function listReservations(): Promise<ReservationWithRelations[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('reservations')
    .select(RESERVATION_SELECT)
    .order('start_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ReservationWithRelations[];
}

export async function createReservation(input: {
  vehicle_id: string;
  entity_id: string;
  start_at: string;
  end_at: string;
  comment: string | null;
  driver_name: string | null;
}): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('reservations').insert(input);
  if (error) throw error;
}

export async function updateReservation(
  id: string,
  input: Partial<Pick<Reservation, 'vehicle_id' | 'entity_id' | 'start_at' | 'end_at' | 'comment' | 'driver_name'>>
): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('reservations').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteReservation(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from('reservations').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Historique ----------

export async function listActivityLog(): Promise<ActivityLogEntry[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  return (data ?? []) as ActivityLogEntry[];
}

// Vérification côté client (avant envoi) qu'aucune réservation existante ne
// chevauche le créneau demandé pour ce véhicule. La contrainte PostgreSQL
// (reservations_no_overlap) reste le garde-fou final contre les accès concurrents.
export async function hasConflict(input: {
  vehicleId: string;
  startAt: string;
  endAt: string;
  excludeReservationId?: string;
}): Promise<boolean> {
  const client = requireClient();
  let query = client
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('vehicle_id', input.vehicleId)
    .lt('start_at', input.endAt)
    .gt('end_at', input.startAt);

  if (input.excludeReservationId) {
    query = query.neq('id', input.excludeReservationId);
  }

  const { count, error } = await query;
  if (error) throw error;
  return (count ?? 0) > 0;
}
