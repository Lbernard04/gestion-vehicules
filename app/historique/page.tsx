'use client';

import AdminGate from '../../components/AdminGate';
import ConfigWarning from '../../components/ConfigWarning';
import StatusBadge from '../../components/StatusBadge';
import { listActivityLog, listEntities, listVehicles } from '../../lib/queries';
import { useRealtimeList } from '../../lib/useRealtimeList';
import { formatDateTime } from '../../lib/date';
import { WARNING_LABELS } from '../../lib/warnings';
import { supabase } from '../../lib/supabase';
import type { ActivityLogEntry, Entity, Vehicle, VehicleWarningType } from '../../lib/types';

const TABLE_LABELS: Record<ActivityLogEntry['table_name'], string> = {
  vehicles: 'Véhicule',
  entities: 'Entité',
  reservations: 'Réservation',
  vehicle_warnings: 'Avertissement',
};

const ACTION_LABELS: Record<ActivityLogEntry['action'], string> = {
  insert: 'Créé',
  update: 'Modifié',
  delete: 'Supprimé',
};

const ACTION_STATUS: Record<ActivityLogEntry['action'], 'available' | 'busy' | 'inactive'> = {
  insert: 'available',
  update: 'busy',
  delete: 'inactive',
};

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function describeEntry(
  entry: ActivityLogEntry,
  vehiclesById: Map<string, Vehicle>,
  entitiesById: Map<string, Entity>
): string {
  const data = (entry.action === 'delete' ? entry.old_data : entry.new_data) ?? {};

  if (entry.table_name === 'vehicles') {
    const name = asString(data.name) ?? 'Véhicule';
    const registration = asString(data.registration);
    return registration ? `${name} (${registration})` : name;
  }

  if (entry.table_name === 'entities') {
    return asString(data.name) ?? 'Entité';
  }

  if (entry.table_name === 'vehicle_warnings') {
    const vehicleId = asString(data.vehicle_id);
    const type = asString(data.type) as VehicleWarningType | null;
    const vehicleLabel = (vehicleId && vehiclesById.get(vehicleId)?.name) || 'véhicule supprimé';
    const typeLabel = type ? WARNING_LABELS[type] ?? type : 'avertissement';
    return `${typeLabel} — ${vehicleLabel}`;
  }

  // reservations
  const vehicleId = asString(data.vehicle_id);
  const entityId = asString(data.entity_id);
  const startAt = asString(data.start_at);
  const endAt = asString(data.end_at);

  const vehicleLabel = (vehicleId && vehiclesById.get(vehicleId)?.name) || 'véhicule supprimé';
  const entityLabel = (entityId && entitiesById.get(entityId)?.name) || 'entité supprimée';
  const range = startAt && endAt ? ` du ${formatDateTime(startAt)} au ${formatDateTime(endAt)}` : '';

  return `${vehicleLabel} — réservé par ${entityLabel}${range}`;
}

export default function HistoriquePage() {
  return (
    <AdminGate>
      <HistoriquePageContent />
    </AdminGate>
  );
}

function HistoriquePageContent() {
  const { items: entries, loading, error } = useRealtimeList('activity_log', listActivityLog);
  const { items: vehicles } = useRealtimeList('vehicles', listVehicles);
  const { items: entities } = useRealtimeList('entities', listEntities);

  const vehiclesById = new Map(vehicles.map((v) => [v.id, v]));
  const entitiesById = new Map(entities.map((e) => [e.id, e]));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Historique</h1>
          <p className="page-subtitle">Toutes les créations, modifications et suppressions, les plus récentes en premier.</p>
        </div>
      </div>

      {!supabase && <ConfigWarning />}
      {error && <div className="form-error">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="loading-state">Chargement…</div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Aucune activité</div>
            Les modifications apparaîtront ici au fur et à mesure.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Action</th>
                  <th>Détail</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="tabular">{formatDateTime(entry.created_at)}</td>
                    <td>{TABLE_LABELS[entry.table_name] ?? entry.table_name}</td>
                    <td>
                      <StatusBadge status={ACTION_STATUS[entry.action]} label={ACTION_LABELS[entry.action]} />
                    </td>
                    <td>{describeEntry(entry, vehiclesById, entitiesById)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
