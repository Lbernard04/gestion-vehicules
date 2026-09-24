'use client';

import { useMemo, useState } from 'react';
import ConfigWarning from '../../components/ConfigWarning';
import ReservationFormModal from '../../components/ReservationFormModal';
import { listEntities, listReservations, listVehicleWarnings, listVehicles } from '../../lib/queries';
import { useRealtimeList } from '../../lib/useRealtimeList';
import { addDays, formatDateLong, formatTime, isSameDay, startOfWeek } from '../../lib/date';
import { WARNING_ICONS } from '../../lib/warnings';
import { supabase } from '../../lib/supabase';
import type { ReservationWithRelations } from '../../lib/types';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function PlanningPage() {
  const { items: vehicles, loading: vehiclesLoading } = useRealtimeList('vehicles', listVehicles);
  const { items: reservations, loading: reservationsLoading, reload } = useRealtimeList(
    'reservations',
    listReservations
  );
  const { items: entities } = useRealtimeList('entities', listEntities);
  const { items: warnings } = useRealtimeList('vehicle_warnings', listVehicleWarnings);

  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [modalReservation, setModalReservation] = useState<ReservationWithRelations | null>(null);

  const weekStart = useMemo(() => startOfWeek(weekAnchor), [weekAnchor]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const today = new Date();

  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  function reservationsFor(vehicleId: string, day: Date) {
    return reservations
      .filter((r) => r.vehicle_id === vehicleId && isSameDay(new Date(r.start_at), day))
      .sort((a, b) => a.start_at.localeCompare(b.start_at));
  }

  const loading = vehiclesLoading || reservationsLoading;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Planning</h1>
          <p className="page-subtitle">Réservations par véhicule, semaine du {formatDateLong(weekStart)}.</p>
        </div>
      </div>

      {!supabase && <ConfigWarning />}

      <div className="planning-toolbar">
        <div className="planning-week-label">
          {formatDateLong(weekStart)} → {formatDateLong(addDays(weekStart, 6))}
        </div>
        <div className="planning-nav">
          <button className="btn btn-sm" onClick={() => setWeekAnchor(addDays(weekStart, -7))}>
            ← Semaine préc.
          </button>
          <button className="btn btn-sm" onClick={() => setWeekAnchor(new Date())}>
            Aujourd’hui
          </button>
          <button className="btn btn-sm" onClick={() => setWeekAnchor(addDays(weekStart, 7))}>
            Semaine suiv. →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Chargement…</div>
      ) : sortedVehicles.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-title">Aucun véhicule</div>
            Ajoutez des véhicules pour voir apparaître le planning.
          </div>
        </div>
      ) : (
        <div className="planning-grid">
          <div className="planning-head-cell" />
          {days.map((day, i) => (
            <div key={i} className={`planning-head-cell${isSameDay(day, today) ? ' today' : ''}`}>
              {DAY_LABELS[i]} {day.getDate()}/{day.getMonth() + 1}
            </div>
          ))}

          {sortedVehicles.map((vehicle) => {
            const vehicleWarnings = warnings.filter((w) => w.vehicle_id === vehicle.id);
            return (
              <div key={vehicle.id} style={{ display: 'contents' }}>
                <div className="planning-vehicle-cell" style={{ opacity: vehicle.active ? 1 : 0.55 }}>
                  <span className="planning-vehicle-name">
                    {vehicle.name}
                    {vehicleWarnings.length > 0 && (
                      <span title={vehicleWarnings.map((w) => w.type).join(', ')}>
                        {' '}
                        {vehicleWarnings.map((w) => WARNING_ICONS[w.type]).join('')}
                      </span>
                    )}
                  </span>
                  {vehicle.registration && <span className="planning-vehicle-plate">{vehicle.registration}</span>}
                </div>
                {days.map((day, i) => (
                  <div key={i} className="planning-cell">
                    {reservationsFor(vehicle.id, day).map((r) => (
                      <button
                        key={r.id}
                        className="planning-chip"
                        onClick={() => setModalReservation(r)}
                        title={[r.comment, r.driver_name && `Conducteur : ${r.driver_name}`].filter(Boolean).join(' — ') || undefined}
                      >
                        <strong>
                          {formatTime(r.start_at)}–{formatTime(r.end_at)}
                        </strong>
                        {r.entity?.name ?? '—'}
                        {r.driver_name ? ` · ${r.driver_name}` : ''}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {modalReservation && (
        <ReservationFormModal
          reservation={modalReservation}
          vehicles={vehicles}
          entities={entities}
          warnings={warnings}
          onClose={() => setModalReservation(null)}
          onSaved={() => {
            setModalReservation(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
