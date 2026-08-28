'use client';

import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Entity } from '@/lib/types';
import { inputStyle, buttonStyle, cardStyle, smallButtonStyle, smallDangerButtonStyle, badgeStyle } from './VehiclesSection';

export default function EntitiesSection({ entities }: { entities: Entity[] }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError(null);

    const { error } = await supabase.from('entities').insert({
      name,
      email: email || null,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setName('');
    setEmail('');
  }

  async function toggleActive(entity: Entity) {
    if (!supabase) return;
    await supabase.from('entities').update({ active: !entity.active }).eq('id', entity.id);
  }

  async function remove(entity: Entity) {
    if (!supabase) return;
    if (!confirm(`Supprimer l'entité "${entity.name}" ?`)) return;
    await supabase.from('entities').delete().eq('id', entity.id);
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, maxWidth: 480 }}>
        <h3 style={{ margin: 0 }}>Ajouter une entité</h3>
        <input placeholder="Nom (personne ou service)" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        <input placeholder="Email (optionnel)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        {error && <p style={{ color: '#c0392b', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={saving} style={buttonStyle}>
          {saving ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>

      <div>
        <h3 style={{ margin: '0 0 10px' }}>Entités ({entities.length})</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {entities.length === 0 && <p style={{ color: '#666' }}>Aucune entité pour le moment.</p>}
          {entities.map((ent) => (
            <div key={ent.id} style={cardStyle}>
              <div>
                <strong>{ent.name}</strong>
                {ent.email && <span style={{ color: '#666' }}> ({ent.email})</span>}
                {!ent.active && <span style={badgeStyle}>Inactif</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleActive(ent)} style={smallButtonStyle}>
                  {ent.active ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => remove(ent)} style={smallDangerButtonStyle}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
