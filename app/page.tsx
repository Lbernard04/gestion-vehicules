'use client';

import { useMemo } from 'react';
import ConfigWarning from '../components/ConfigWarning';
import StatusBadge from '../components/StatusBadge';
import VehicleWarnings from '../components/VehicleWarnings';
import { listReservations, listVehicleWarnings, listVehicles } from '../lib/queries';
import { useRealtimeList } from '../lib/useRealtimeList';
import { formatRange, isWithinRange } from '../lib/date';
import { FUEL_LABELS } from '../lib/fuel';
import { supabase } from '../lib/supabase';

export default function DashboardPage() {
  const vehicles = useRealtimeList('vehicles', listVehicles);
  const reservations = useRealtimeList('reservations', listReservations);
  const warnings = useRealtimeList('vehicle_warnings', listVehicleWarnings);

  const now = useMemo(() => new Date(), [reservations.items]);

  const activeVehicles = vehicles.items.filter((v) => v.active);

  const busyVehicleIds = new Set(
    reservations.items
      .filter((r) => isWithinRange(now, r.start_at, r.end_at))
      .map((r) => r.vehicle_id)
  );

  const availableCount = activeVehicles.filter((v) => !busyVehicleIds.has(v.id)).length;

  const todayReservations = reservations.items
    .filter((r) => {
      const start = new Date(r.start_at);
      return (
        start.getFullYear() === now.getFullYear() &&
        start.getMonth() === now.getMonth() &&
        start.getDate() === now.getDate()
      );
    })
    .sort((a, b) => a.start_at.localeCompare(b.start_at));

  const loading = vehicles.loading || reservations.loading || warnings.loading;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Vue d’ensemble de la flotte et des réservations du jour.</p>
        </div>
      </div>

      {!supabase && <ConfigWarning />}
      {vehicles.error && <div className="form-error">{vehicles.error}</div>}
      {reservations.error && <div className="form-error">{reservations.error}</div>}

      {loading ? (
        <div className="loading-state">Chargement…</div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Véhicules actifs</div>
              <div className="stat-value tabular">{activeVehicles.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Disponibles maintenant</div>
              <div className="stat-value positive tabular">{availableCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Réservations aujourd’hui</div>
              <div className="stat-value accent tabular">{todayReservations.length}</div>
            </div>
          </div>

          <div className="card card-pad" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>Flotte</h2>
            {activeVehicles.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aucun véhicule actif pour le moment.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Véhicule</th>
                      <th>Immatriculation</th>
                      <th>Carburant</th>
                      <th>Statut</th>
                      <th>Avertissements</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeVehicles.map((v) => (
                      <tr key={v.id}>
                        <td>{v.name}</td>
                        <td className="plate">{v.registration || '—'}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {v.fuel_type ? FUEL_LABELS[v.fuel_type] : '—'}
                        </td>
                        <td>
                          {busyVehicleIds.has(v.id) ? (
                            <StatusBadge status="busy" label="En réservation" />
                          ) : (
                            <StatusBadge status="available" label="Disponible" />
                          )}
                        </td>
                        <td>
                          <VehicleWarnings
                            vehicleId={v.id}
                            warnings={warnings.items.filter((w) => w.vehicle_id === v.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card card-pad">
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>Réservations d’aujourd’hui</h2>
            {todayReservations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aucune réservation aujourd’hui.</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Créneau</th>
                      <th>Véhicule</th>
                      <th>Entité</th>
                      <th>Commentaire</th>
                      <th>Conducteur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayReservations.map((r) => (
                      <tr key={r.id}>
                        <td className="tabular">{formatRange(r.start_at, r.end_at)}</td>
                        <td>{r.vehicle ? `${r.vehicle.name}${r.vehicle.registration ? ` (${r.vehicle.registration})` : ''}` : '—'}</td>
                        <td>{r.entity?.name ?? '—'}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{r.comment || '—'}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{r.driver_name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
