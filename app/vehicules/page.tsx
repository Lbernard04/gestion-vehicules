'use client';

import { useState } from 'react';
import AdminGate from '../../components/AdminGate';
import ConfigWarning from '../../components/ConfigWarning';
import StatusBadge from '../../components/StatusBadge';
import VehicleFormModal from '../../components/VehicleFormModal';
import { deleteVehicle, getErrorMessage, listVehicles, updateVehicle } from '../../lib/queries';
import { useRealtimeList } from '../../lib/useRealtimeList';
import { supabase } from '../../lib/supabase';
import type { Vehicle } from '../../lib/types';

export default function VehiclesPage() {
  return (
    <AdminGate>
      <VehiclesPageContent />
    </AdminGate>
  );
}

function VehiclesPageContent() {
  const { items: vehicles, loading, error, reload } = useRealtimeList('vehicles', listVehicles);
  const [modalVehicle, setModalVehicle] = useState<Vehicle | null | 'new'>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function toggleActive(vehicle: Vehicle) {
    setActionError(null);
    try {
      await updateVehicle(vehicle.id, { active: !vehicle.active });
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleDelete(vehicle: Vehicle) {
    if (!confirm(`Supprimer définitivement « ${vehicle.name} »${vehicle.registration ? ` (${vehicle.registration})` : ''} ?`)) return;
    setActionError(null);
    try {
      await deleteVehicle(vehicle.id);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Véhicules</h1>
          <p className="page-subtitle">{vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''} enregistré{vehicles.length > 1 ? 's' : ''}.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalVehicle('new')}>
          + Ajouter un véhicule
        </button>
      </div>

      {!supabase && <ConfigWarning />}
      {error && <div className="form-error">{error}</div>}
      {actionError && <div className="form-error">{actionError}</div>}

      <div className="card">
        {loading ? (
          <div className="loading-state">Chargement…</div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Aucun véhicule</div>
            Ajoutez le premier véhicule de la flotte pour commencer.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Immatriculation</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.name}</td>
                    <td className="plate">{vehicle.registration || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{vehicle.type || '—'}</td>
                    <td>
                      {vehicle.active ? (
                        <StatusBadge status="available" label="Actif" />
                      ) : (
                        <StatusBadge status="inactive" label="Désactivé" />
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setModalVehicle(vehicle)}>
                          Modifier
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(vehicle)}>
                          {vehicle.active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vehicle)}>
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

      {modalVehicle && (
        <VehicleFormModal
          vehicle={modalVehicle === 'new' ? null : modalVehicle}
          onClose={() => setModalVehicle(null)}
          onSaved={() => {
            setModalVehicle(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
