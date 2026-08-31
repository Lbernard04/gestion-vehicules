'use client';

import { useState } from 'react';
import AdminGate from '../../components/AdminGate';
import ConfigWarning from '../../components/ConfigWarning';
import StatusBadge from '../../components/StatusBadge';
import EntityFormModal from '../../components/EntityFormModal';
import { deleteEntity, getErrorMessage, listEntities, updateEntity } from '../../lib/queries';
import { useRealtimeList } from '../../lib/useRealtimeList';
import { supabase } from '../../lib/supabase';
import type { Entity } from '../../lib/types';

export default function EntitiesPage() {
  return (
    <AdminGate>
      <EntitiesPageContent />
    </AdminGate>
  );
}

function EntitiesPageContent() {
  const { items: entities, loading, error, reload } = useRealtimeList('entities', listEntities);
  const [modalEntity, setModalEntity] = useState<Entity | null | 'new'>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function toggleActive(entity: Entity) {
    setActionError(null);
    try {
      await updateEntity(entity.id, { active: !entity.active });
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  async function handleDelete(entity: Entity) {
    if (!confirm(`Supprimer définitivement « ${entity.name} » ?`)) return;
    setActionError(null);
    try {
      await deleteEntity(entity.id);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Entités</h1>
          <p className="page-subtitle">{entities.length} entité{entities.length > 1 ? 's' : ''} enregistrée{entities.length > 1 ? 's' : ''}.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalEntity('new')}>
          + Ajouter une entité
        </button>
      </div>

      {!supabase && <ConfigWarning />}
      {error && <div className="form-error">{error}</div>}
      {actionError && <div className="form-error">{actionError}</div>}

      <div className="card">
        {loading ? (
          <div className="loading-state">Chargement…</div>
        ) : entities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Aucune entité</div>
            Ajoutez une première personne ou un premier service.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entities.map((entity) => (
                  <tr key={entity.id}>
                    <td>{entity.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{entity.email || '—'}</td>
                    <td>
                      {entity.active ? (
                        <StatusBadge status="available" label="Active" />
                      ) : (
                        <StatusBadge status="inactive" label="Désactivée" />
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setModalEntity(entity)}>
                          Modifier
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(entity)}>
                          {entity.active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entity)}>
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

      {modalEntity && (
        <EntityFormModal
          entity={modalEntity === 'new' ? null : modalEntity}
          onClose={() => setModalEntity(null)}
          onSaved={() => {
            setModalEntity(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
