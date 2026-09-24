'use client';

import { useState } from 'react';
import { addVehicleWarning, getErrorMessage, removeVehicleWarning } from '../lib/queries';
import { WARNING_ICONS, WARNING_LABELS, WARNING_TYPES } from '../lib/warnings';
import type { VehicleWarning, VehicleWarningType } from '../lib/types';

export default function VehicleWarnings({
  vehicleId,
  warnings,
}: {
  vehicleId: string;
  warnings: VehicleWarning[];
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTypes = new Set(warnings.map((w) => w.type));
  const available = WARNING_TYPES.filter((t) => !activeTypes.has(t));

  async function handleAdd(type: VehicleWarningType) {
    setBusy(true);
    setError(null);
    try {
      await addVehicleWarning(vehicleId, type);
      setOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(warning: VehicleWarning) {
    setBusy(true);
    setError(null);
    try {
      await removeVehicleWarning(warning.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      {warnings.map((w) => (
        <button
          key={w.id}
          type="button"
          className="badge status-busy"
          style={{ border: 'none', font: 'inherit', cursor: 'pointer' }}
          onClick={() => handleRemove(w)}
          disabled={busy}
          title="Cliquer une fois fait, pour le retirer"
        >
          {WARNING_ICONS[w.type]} {WARNING_LABELS[w.type]} ✕
        </button>
      ))}

      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setOpen((v) => !v)}
          aria-label="Ajouter un avertissement"
          title="Ajouter un avertissement"
        >
          +
        </button>
        {open && (
          <div
            className="card card-pad"
            style={{ position: 'absolute', top: '110%', left: 0, zIndex: 30, minWidth: 210 }}
          >
            {available.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Tous les avertissements sont déjà actifs.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 4 }}>
                {available.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => handleAdd(t)}
                    disabled={busy}
                  >
                    {WARNING_ICONS[t]} {WARNING_LABELS[t]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="form-error" style={{ margin: 0 }}>
          {error}
        </div>
      )}
    </div>
  );
}
