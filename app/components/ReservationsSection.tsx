'use client';

import { FormEvent, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Entity, Reservation, Vehicle } from '@/lib/types';
import { inputStyle, buttonStyle, cardStyle, smallDangerButtonStyle } from './VehiclesSection';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReservationsSection({
  vehicles,
  entities,
  reservations,
}: {
  vehicles: Vehicle[];
  entities: Entity[];
  reservations: Reservation[];
}) {
  const [vehicleId, setVehicleId] = useState('');
  const [entityId, setEntityId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const entityById = useMemo(() => new Map(entities.map((e) => [e.id, e])), [entities]);

  const now = Date.now();
  const sorted = useMemo(
    () => [...reservations].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()),
    [reservations]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError(null);

    const { error } = await supabase.from('reservations').insert({
      vehicle_id: vehicleId,
      entity_id: entityId,
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
      comment: comment || null,
    });

    setSaving(false);

    if (error) {
      if (error.code === '23P01') {
        setError('Ce véhicule est déjà réservé sur ce créneau.');
      } else if (error.code === '23514') {
        setError("La date de fin doit être après la date de début.");
      } else {
        setError(error.message);
      }
      return;
    }

    setVehicleId('');
    setEntityId('');
    setStartAt('');
    setEndAt('');
    setComment('');
  }

  async function remove(reservation: Reservation) {
    if (!supabase) return;
    if (!confirm('Annuler cette réservation ?')) return;
    await supabase.from('reservations').delete().eq('id', reservation.id);
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, maxWidth: 480 }}>
        <h3 style={{ margin: 0 }}>Réserver un véhicule</h3>
        <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required style={inputStyle}>
          <option value="">Véhicule...</option>
          {vehicles.filter((v) => v.active).map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.registration})
            </option>
          ))}
        </select>
        <select value={entityId} onChange={(e) => setEntityId(e.target.value)} required style={inputStyle}>
          <option value="">Réservé par...</option>
          {entities.filter((e) => e.active).map((ent) => (
            <option key={ent.id} value={ent.id}>
              {ent.name}
            </option>
          ))}
        </select>
        <label style={{ display: 'grid', gap: 4, fontSize: 13, color: '#666' }}>
          Début
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required style={inputStyle} />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 13, color: '#666' }}>
          Fin
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required style={inputStyle} />
        </label>
        <input placeholder="Commentaire (optionnel)" value={comment} onChange={(e) => setComment(e.target.value)} style={inputStyle} />
        {error && <p style={{ color: '#c0392b', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={saving} style={buttonStyle}>
          {saving ? 'Réservation...' : 'Réserver'}
        </button>
      </form>

      <div>
        <h3 style={{ margin: '0 0 10px' }}>Réservations ({sorted.length})</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {sorted.length === 0 && <p style={{ color: '#666' }}>Aucune réservation pour le moment.</p>}
          {sorted.map((r) => {
            const inProgress = now >= new Date(r.start_at).getTime() && now < new Date(r.end_at).getTime();
            return (
              <div key={r.id} style={cardStyle}>
                <div>
                  <strong>{vehicleById.get(r.vehicle_id)?.name ?? 'Véhicule supprimé'}</strong>
                  {' — réservé par '}
                  <strong>{entityById.get(r.entity_id)?.name ?? 'Entité supprimée'}</strong>
                  {inProgress && (
                    <span style={{ marginLeft: 8, fontSize: 12, background: '#e5f6e5', color: '#1e7d1e', padding: '2px 8px', borderRadius: 999 }}>
                      En cours
                    </span>
                  )}
                  <div style={{ color: '#666', fontSize: 14 }}>
                    Du {formatDateTime(r.start_at)} au {formatDateTime(r.end_at)}
                  </div>
                  {r.comment && <div style={{ color: '#666', fontSize: 14, fontStyle: 'italic' }}>{r.comment}</div>}
                </div>
                <button onClick={() => remove(r)} style={smallDangerButtonStyle}>
                  Annuler
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
