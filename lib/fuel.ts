import type { FuelType } from './types';

export const FUEL_LABELS: Record<FuelType, string> = {
  essence: 'Essence',
  diesel: 'Diesel',
  hybride: 'Hybride',
  electrique: 'Électrique',
};

export const FUEL_TYPES: FuelType[] = ['essence', 'diesel', 'hybride', 'electrique'];
