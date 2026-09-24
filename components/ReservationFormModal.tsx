'use client';

import { FormEvent, useState } from 'react';
import Modal from './Modal';
import { createReservation, deleteReservation, getErrorMessage, hasConflict, updateReservation } from '../lib/queries';
import { fromLocalInputValue, toLocalInputValue } from '../lib/date';
import { WARNING_ICONS, WARNING_LABELS } from '../lib/warnings';
import type { Entity, ReservationWithRelations, Vehicle, VehicleWarning } from '../lib/types';

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
  warnings,
  defaultVehicleId,
  onClose,
  onSaved,
}: {
  reservation: ReservationWithRelations | null;
  vehicles: Vehicle[];
  entities: Entity[];
  warnings: VehicleWarning[];
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
  const [driverNote, setDriverNote] = useState(reservation?.driver_note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!reservation) return;
    if (!confirm('Annuler cette réservation ?')) return;
    setSaving(true);
    setError(null);
    try {
      await deleteReservation(reservation.id);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

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
        driver_note: driverNote.trim() || null,
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

  const selectedVehicleWarnings = warnings.filter((w) => w.vehicle_id === vehicleId);

  return (
    <Modal title={reservation ? 'Modifier la réservation' : 'Nouvelle réservation'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        {selectedVehicleWarnings.length > 0 && (
          <div className="form-warning">
            {selectedVehicleWarnings.map((w) => `${WARNING_ICONS[w.type]} ${WARNING_LABELS[w.type]}`).join(' · ')}
            {' — à anticiper avant votre trajet.'}
          </div>
        )}

        <div className="field">
          <label htmlFor="reservation-vehicle">Véhicule</label>
          <select id="reservation-vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            {vehicles.length === 0 && <option value="">Aucun véhicule</option>}
            {vehicles.map((v) => {
              const vehicleWarnings = warnings.filter((w) => w.vehicle_id === v.id);
              return (
                <option key={v.id} value={v.id} disabled={!v.active}>
                  {v.name}
                  {v.registration ? ` — ${v.registration}` : ''}
                  {vehicleWarnings.length > 0 ? ` • ${vehicleWarnings.map((w) => WARNING_ICONS[w.type]).join('')}` : ''}
                  {!v.active ? ' (désactivé)' : ''}
                </option>
              );
            })}
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

        <div className="field">
          <label htmlFor="reservation-driver-note">Message pour le conducteur (optionnel)</label>
          <textarea
            id="reservation-driver-note"
            rows={2}
            value={driverNote}
            onChange={(e) => setDriverNote(e.target.value)}
            placeholder="Ex : badge dans la boîte à gants, code du parking, point de retour…"
          />
        </div>

        <div className="form-actions" style={{ justifyContent: reservation ? 'space-between' : 'flex-end' }}>
          {reservation && (
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={saving}>
              Annuler la réservation
            </button>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Fermer
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || vehicles.length === 0 || entities.length === 0}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
