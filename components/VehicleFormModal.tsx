'use client';

import { FormEvent, useState } from 'react';
import Modal from './Modal';
import { createVehicle, getErrorMessage, updateVehicle } from '../lib/queries';
import { FUEL_LABELS, FUEL_TYPES } from '../lib/fuel';
import type { FuelType, Vehicle } from '../lib/types';

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
  const [fuelType, setFuelType] = useState<FuelType | ''>(vehicle?.fuel_type ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        registration: registration.trim() ? registration.trim().toUpperCase() : null,
        type: type.trim() || null,
        fuel_type: fuelType || null,
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
          <label htmlFor="vehicle-registration">Immatriculation (optionnel)</label>
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

        <div className="field">
          <label htmlFor="vehicle-fuel">Carburant (optionnel)</label>
          <select id="vehicle-fuel" value={fuelType} onChange={(e) => setFuelType(e.target.value as FuelType | '')}>
            <option value="">Non renseigné</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>
                {FUEL_LABELS[f]}
              </option>
            ))}
          </select>
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
