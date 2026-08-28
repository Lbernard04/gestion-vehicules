'use client';

import { FormEvent, useState } from 'react';
import Modal from './Modal';
import { createEntity, getErrorMessage, updateEntity } from '../lib/queries';
import type { Entity } from '../lib/types';

export default function EntityFormModal({
  entity,
  onClose,
  onSaved,
}: {
  entity: Entity | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(entity?.name ?? '');
  const [email, setEmail] = useState(entity?.email ?? '');
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
      const payload = { name: name.trim(), email: email.trim() || null };
      if (entity) {
        await updateEntity(entity.id, payload);
      } else {
        await createEntity(payload);
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={entity ? 'Modifier l’entité' : 'Ajouter une entité'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="field">
          <label htmlFor="entity-name">Nom</label>
          <input
            id="entity-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Service commercial, Jean Dupont…"
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="entity-email">E-mail (optionnel)</label>
          <input
            id="entity-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@entreprise.fr"
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
