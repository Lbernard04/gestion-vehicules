export type FuelType = 'essence' | 'diesel' | 'hybride' | 'electrique';

export interface Vehicle {
  id: string;
  name: string;
  registration: string | null;
  type: string | null;
  fuel_type: FuelType | null;
  needs_refuel: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  name: string;
  email: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  vehicle_id: string;
  entity_id: string;
  start_at: string;
  end_at: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationWithRelations extends Reservation {
  vehicle: Vehicle | null;
  entity: Entity | null;
}

export interface ActivityLogEntry {
  id: string;
  table_name: 'vehicles' | 'entities' | 'reservations';
  record_id: string;
  action: 'insert' | 'update' | 'delete';
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}
