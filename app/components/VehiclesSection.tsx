'use client';

import { FormEvent, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Vehicle } from '@/lib/types';

export default function VehiclesSection({ vehicles }: { vehicles: Vehicle[] }) {
  const [name, setName] = useState('');
  const [registration, setRegistration] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError(null);

    const { error } = await supabase.from('vehicles').insert({
      name,
      registration,
      type: type || null,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setName('');
    setRegistration('');
    setType('');
  }

  async function toggleActive(vehicle: Vehicle) {
    if (!supabase) return;
    await supabase.from('vehicles').update({ active: !vehicle.active }).eq('id', vehicle.id);
  }

  async function remove(vehicle: Vehicle) {
    if (!supabase) return;
    if (!confirm(`Supprimer le véhicule "${vehicle.name}" ?`)) return;
    await supabase.from('vehicles').delete().eq('id', vehicle.id);
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10, maxWidth: 480 }}>
        <h3 style={{ margin: 0 }}>Ajouter un véhicule</h3>
        <input placeholder="Nom (ex : Clio 4)" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        <input
          placeholder="Immatriculation"
          value={registration}
          onChange={(e) => setRegistration(e.target.value)}
          required
          style={inputStyle}
        />
        <input placeholder="Type (utilitaire, citadine...)" value={type} onChange={(e) => setType(e.target.value)} style={inputStyle} />
        {error && <p style={{ color: '#c0392b', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={saving} style={buttonStyle}>
          {saving ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>

      <div>
        <h3 style={{ margin: '0 0 10px' }}>Véhicules ({vehicles.length})</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {vehicles.length === 0 && <p style={{ color: '#666' }}>Aucun véhicule pour le moment.</p>}
          {vehicles.map((v) => (
            <div key={v.id} style={cardStyle}>
              <div>
                <strong>{v.name}</strong>{' '}
                <span style={{ color: '#666' }}>({v.registration}{v.type ? ` · ${v.type}` : ''})</span>
                {!v.active && <span style={badgeStyle}>Inactif</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleActive(v)} style={smallButtonStyle}>
                  {v.active ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => remove(v)} style={smallDangerButtonStyle}>
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

export const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #ccc',
  borderRadius: 8,
};

export const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: '#171717',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  fontWeight: 600,
};

export const cardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'white',
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid #e2e2e2',
};

export const smallButtonStyle: React.CSSProperties = {
  padding: '6px 10px',
  background: '#eee',
  border: 'none',
  borderRadius: 6,
  fontSize: 13,
};

export const smallDangerButtonStyle: React.CSSProperties = {
  ...smallButtonStyle,
  background: '#fbe4e4',
  color: '#c0392b',
};

export const badgeStyle: React.CSSProperties = {
  marginLeft: 8,
  fontSize: 12,
  background: '#f0f0f0',
  color: '#666',
  padding: '2px 8px',
  borderRadius: 999,
};
