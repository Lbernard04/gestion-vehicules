'use client';

import { useState } from 'react';
import ConfigWarning from '../../components/ConfigWarning';
import ReservationFormModal from '../../components/ReservationFormModal';
import { deleteReservation, listEntities, listReservations, listVehicles, toFriendlyError } from '../../lib/queries';
import { useRealtimeList } from '../../lib/useRealtimeList';
import { formatRange } from '../../lib/date';
import { supabase } from '../../lib/supabase';
import type { ReservationWithRelations } from '../../lib/types';

export default function ReservationsPage() {
  const { items: reservations, loading, error, reload } = useRealtimeList('reservations', listReservations);
  const { items: vehicles } = useRealtimeList('vehicles', listVehicles);
  const { items: entities } = useRealtimeList('entities', listEntities);

  const [modalReservation, setModalReservation] = useState<ReservationWithRelations | null | 'new'>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(reservation: ReservationWithRelations) {
    if (!confirm('Supprimer cette réservation ?')) return;
    setActionError(null);
    try {
      await deleteReservation(reservation.id);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? toFriendlyError({ message: err.message, code: (err as { code?: string }).code })
          : 'Erreur inconnue.'
      );
    }
  }

  const sorted = [...reservations].sort((a, b) => b.start_at.localeCompare(a.start_at));

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

      <div className="card">
        {loading ? (
          <div className="loading-state">Chargement…</div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Aucune réservation</div>
            Créez la première réservation d’un véhicule.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Créneau</th>
                  <th>Véhicule</th>
                  <th>Entité</th>
                  <th>Commentaire</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id}>
                    <td className="tabular">{formatRange(r.start_at, r.end_at)}</td>
                    <td>{r.vehicle ? `${r.vehicle.name} (${r.vehicle.registration})` : '—'}</td>
                    <td>{r.entity?.name ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.comment || '—'}</td>
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
