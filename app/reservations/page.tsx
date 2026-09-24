'use client';

import { useMemo, useState } from 'react';
import ConfigWarning from '../../components/ConfigWarning';
import ReservationFormModal from '../../components/ReservationFormModal';
import StatusBadge from '../../components/StatusBadge';
import {
  deleteReservation,
  getErrorMessage,
  listEntities,
  listReservations,
  listVehicleWarnings,
  listVehicles,
} from '../../lib/queries';
import { useRealtimeList } from '../../lib/useRealtimeList';
import { formatRange, getReservationStatus } from '../../lib/date';
import { supabase } from '../../lib/supabase';
import type { ReservationWithRelations } from '../../lib/types';

const STATUS_LABELS = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  past: 'Passée',
} as const;

const STATUS_BADGE = {
  upcoming: 'available',
  ongoing: 'busy',
  past: 'inactive',
} as const;

export default function ReservationsPage() {
  const { items: reservations, loading, error, reload } = useRealtimeList('reservations', listReservations);
  const { items: vehicles } = useRealtimeList('vehicles', listVehicles);
  const { items: entities } = useRealtimeList('entities', listEntities);
  const { items: warnings } = useRealtimeList('vehicle_warnings', listVehicleWarnings);

  const [modalReservation, setModalReservation] = useState<ReservationWithRelations | null | 'new'>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  async function handleDelete(reservation: ReservationWithRelations) {
    if (!confirm('Supprimer cette réservation ?')) return;
    setActionError(null);
    try {
      await deleteReservation(reservation.id);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  const now = useMemo(() => new Date(), [reservations]);

  const sorted = useMemo(() => {
    const withStatus = reservations.map((r) => ({ r, status: getReservationStatus(r.start_at, r.end_at, now) }));
    const visible = showPast ? withStatus : withStatus.filter((x) => x.status !== 'past');
    return visible.sort((a, b) => b.r.start_at.localeCompare(a.r.start_at));
  }, [reservations, now, showPast]);

  const hiddenPastCount = reservations.filter((r) => getReservationStatus(r.start_at, r.end_at, now) === 'past').length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Réservations</h1>
          <p className="page-subtitle">{reservations.length} réservation{reservations.length > 1 ? 's' : ''} au total.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModalReservation('new')}
          disabled={vehicles.length === 0 || entities.length === 0}
          title={vehicles.length === 0 || entities.length === 0 ? 'Ajoutez d’abord un véhicule et une entité' : undefined}
        >
          + Nouvelle réservation
        </button>
      </div>

      {!supabase && <ConfigWarning />}
      {error && <div className="form-error">{error}</div>}
      {actionError && <div className="form-error">{actionError}</div>}

      <label className="checkbox-row" style={{ marginBottom: 14 }}>
        <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} />
        Afficher les réservations passées {hiddenPastCount > 0 && !showPast ? `(${hiddenPastCount} masquée${hiddenPastCount > 1 ? 's' : ''})` : ''}
      </label>

      <div className="card">
        {loading ? (
          <div className="loading-state">Chargement…</div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">
              {reservations.length === 0 ? 'Aucune réservation' : 'Aucune réservation à venir'}
            </div>
            {reservations.length === 0
              ? 'Créez la première réservation d’un véhicule.'
              : 'Cochez la case ci-dessus pour voir les réservations passées.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Créneau</th>
                  <th>Statut</th>
                  <th>Véhicule</th>
                  <th>Entité</th>
                  <th>Commentaire</th>
                  <th>Conducteur</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(({ r, status }) => (
                  <tr key={r.id}>
                    <td className="tabular">{formatRange(r.start_at, r.end_at)}</td>
                    <td>
                      <StatusBadge status={STATUS_BADGE[status]} label={STATUS_LABELS[status]} />
                    </td>
                    <td>{r.vehicle ? `${r.vehicle.name}${r.vehicle.registration ? ` (${r.vehicle.registration})` : ''}` : '—'}</td>
                    <td>{r.entity?.name ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.comment || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.driver_name || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setModalReservation(r)}>
                          Modifier
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalReservation && (
        <ReservationFormModal
          reservation={modalReservation === 'new' ? null : modalReservation}
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
