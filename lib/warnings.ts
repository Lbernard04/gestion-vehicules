import type { VehicleWarningType } from './types';

export const WARNING_LABELS: Record<VehicleWarningType, string> = {
  plein: 'Faire le plein',
  garage: 'Passage au garage',
  controle_technique: 'Contrôle technique',
};

export const WARNING_ICONS: Record<VehicleWarningType, string> = {
  plein: '⛽',
  garage: '🔧',
  controle_technique: '🛠️',
};

export const WARNING_TYPES: VehicleWarningType[] = ['plein', 'garage', 'controle_technique'];
