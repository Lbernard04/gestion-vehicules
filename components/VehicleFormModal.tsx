'use client';

import { FormEvent, useState } from 'react';
import Modal from './Modal';
import { createVehicle, getErrorMessage, updateVehicle } from '../lib/queries';
import type { Vehicle } from '../lib/types';

export default function VehicleFormModal({
  vehicle,
  onClose,
  onSaved,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(vehicle?.name ?? '');
  const [registration, setRegistration] = useState(vehicle?.registration ?? '');
  const [type, setType] = useState(vehicle?.type ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !registration.trim()) {
      setError('Le nom et l’immatriculation sont obligatoires.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        registration: registration.trim().toUpperCase(),
        type: type.trim() || null,
      };
      if (vehicle) {
        await updateVehicle(vehicle.id, payload);
      } else {
        await createVehicle(payload);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={vehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label htmlFor="vehicle-name">Nom</label>
          <input
            id="vehicle-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Renault Kangoo"
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="vehicle-registration">Immatriculation</label>
          <input
            id="vehicle-registration"
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            placeholder="AB-123-CD"
            className="plate"
          />
        </div>

        <div className="field">
          <label htmlFor="vehicle-type">Type (optionnel)</label>
          <input
            id="vehicle-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Utilitaire, berline, camion…"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
