'use client';

import { FormEvent, useState } from 'react';
import Modal from './Modal';
import { createReservation, getErrorMessage, hasConflict, updateReservation } from '../lib/queries';
import { fromLocalInputValue, toLocalInputValue } from '../lib/date';
import type { Entity, ReservationWithRelations, Vehicle } from '../lib/types';

function defaultStart(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d.toISOString();
}

function defaultEnd(): string {
  const d = new Date(defaultStart());
  d.setHours(d.getHours() + 2);
  return d.toISOString();
}

export default function ReservationFormModal({
  reservation,
  vehicles,
  entities,
  defaultVehicleId,
  onClose,
  onSaved,
}: {
  reservation: ReservationWithRelations | null;
  vehicles: Vehicle[];
  entities: Entity[];
  defaultVehicleId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [vehicleId, setVehicleId] = useState(reservation?.vehicle_id ?? defaultVehicleId ?? vehicles[0]?.id ?? '');
  const [entityId, setEntityId] = useState(reservation?.entity_id ?? entities[0]?.id ?? '');
  const [startAt, setStartAt] = useState(
    toLocalInputValue(reservation?.start_at ?? defaultStart())
  );
  const [endAt, setEndAt] = useState(toLocalInputValue(reservation?.end_at ?? defaultEnd()));
  const [comment, setComment] = useState(reservation?.comment ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!vehicleId || !entityId) {
      setError('Sélectionnez un véhicule et une entité.');
      return;
    }

    const startIso = fromLocalInputValue(startAt);
    const endIso = fromLocalInputValue(endAt);

    if (new Date(endIso) <= new Date(startIso)) {
      setError('La date de fin doit être postérieure à la date de début.');
      return;
    }

    setSaving(true);
    try {
      const conflict = await hasConflict({
        vehicleId,
        startAt: startIso,
        endAt: endIso,
        excludeReservationId: reservation?.id,
      });
      if (conflict) {
        setError('Ce véhicule est déjà réservé sur ce créneau.');
        setSaving(false);
        return;
      }

      const payload = {
        vehicle_id: vehicleId,
        entity_id: entityId,
        start_at: startIso,
        end_at: endIso,
        comment: comment.trim() || null,
      };

      if (reservation) {
        await updateReservation(reservation.id, payload);
      } else {
        await createReservation(payload);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={reservation ? 'Modifier la réservation' : 'Nouvelle réservation'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label htmlFor="reservation-vehicle">Véhicule</label>
          <select id="reservation-vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            {vehicles.length === 0 && <option value="">Aucun véhicule</option>}
            {vehicles.map((v) => (
              <option key={v.id} value={v.id} disabled={!v.active}>
                {v.name}
                {v.registration ? ` — ${v.registration}` : ''}
                {!v.active ? ' (désactivé)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="reservation-entity">Entité</label>
          <select id="reservation-entity" value={entityId} onChange={(e) => setEntityId(e.target.value)}>
            {entities.length === 0 && <option value="">Aucune entité</option>}
            {entities.map((ent) => (
              <option key={ent.id} value={ent.id} disabled={!ent.active}>
                {ent.name}
                {!ent.active ? ' (désactivée)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="reservation-start">Début</label>
            <input
              id="reservation-start"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="reservation-end">Fin</label>
            <input
              id="reservation-end"
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="reservation-comment">Commentaire (optionnel)</label>
          <textarea
            id="reservation-comment"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Motif du déplacement, précisions…"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || vehicles.length === 0 || entities.length === 0}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
