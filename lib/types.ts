export interface Vehicle {
  id: string;
  name: string;
  registration: string;
  type: string | null;
  active: boolean;
  created_at: string;
}

export interface Entity {
  id: string;
  name: string;
  email: string | null;
  active: boolean;
  created_at: string;
}

export interface Reservation {
  id: string;
  vehicle_id: string;
  entity_id: string;
  start_at: string;
  end_at: string;
  comment: string | null;
  created_at: string;
}
