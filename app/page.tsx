'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Entity, Reservation, Vehicle } from '@/lib/types';
import VehiclesSection from './components/VehiclesSection';
import EntitiesSection from './components/EntitiesSection';
import ReservationsSection from './components/ReservationsSection';

type Tab = 'reservations' | 'vehicles' | 'entities';

export default function Home() {
  const [tab, setTab] = useState<Tab>('reservations');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    if (!supabase) return;
    const [vehiclesRes, entitiesRes, reservationsRes] = await Promise.all([
      supabase.from('vehicles').select('*').order('name'),
      supabase.from('entities').select('*').order('name'),
      supabase.from('reservations').select('*').order('start_at'),
    ]);

    if (vehiclesRes.data) setVehicles(vehiclesRes.data);
    if (entitiesRes.data) setEntities(entitiesRes.data);
    if (reservationsRes.data) setReservations(reservationsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();

    const client = supabase;
    if (!client) return;

    const channel = client
      .channel('public:fleet')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entities' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, loadAll)
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayCount = reservations.filter((r) => {
    const now = Date.now();
    return now >= new Date(r.start_at).getTime() && now < new Date(r.end_at).getTime();
  }).length;

  if (!supabase) {
    return (
      <main style={{ maxWidth: 640, margin: '80px auto', padding: 32, textAlign: 'center' }}>
        <h1>Configuration manquante</h1>
        <p style={{ color: '#666' }}>
          Renseignez <code>NEXT_PUBLIC_SUPABASE_URL</code> et <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> dans un
          fichier <code>.env.local</code> (voir <code>.env.example</code>).
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ margin: 0, color: '#666' }}>Entreprise</p>
        <h1 style={{ margin: '6px 0 0', fontSize: 32 }}>Gestion des véhicules</h1>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 32 }}>
        <article style={statCardStyle}>
          <div style={{ color: '#666' }}>Véhicules</div>
          <strong style={{ fontSize: 30 }}>{vehicles.length}</strong>
        </article>
        <article style={statCardStyle}>
          <div style={{ color: '#666' }}>Réservations en cours</div>
          <strong style={{ fontSize: 30 }}>{todayCount}</strong>
        </article>
        <article style={statCardStyle}>
          <div style={{ color: '#666' }}>Entités</div>
          <strong style={{ fontSize: 30 }}>{entities.length}</strong>
        </article>
      </section>

      <nav style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <TabButton active={tab === 'reservations'} onClick={() => setTab('reservations')}>
          Réservations
        </TabButton>
        <TabButton active={tab === 'vehicles'} onClick={() => setTab('vehicles')}>
          Véhicules
        </TabButton>
        <TabButton active={tab === 'entities'} onClick={() => setTab('entities')}>
          Entités
        </TabButton>
      </nav>

      <section style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #ddd' }}>
        {loading ? (
          <p style={{ color: '#666' }}>Chargement...</p>
        ) : (
          <>
            {tab === 'reservations' && (
              <ReservationsSection vehicles={vehicles} entities={entities} reservations={reservations} />
            )}
            {tab === 'vehicles' && <VehiclesSection vehicles={vehicles} />}
            {tab === 'entities' && <EntitiesSection entities={entities} />}
          </>
        )}
      </section>
    </main>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 18px',
        borderRadius: 8,
        border: '1px solid #ddd',
        background: active ? '#171717' : 'white',
        color: active ? 'white' : '#171717',
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

const statCardStyle: React.CSSProperties = {
  background: 'white',
  padding: 20,
  borderRadius: 12,
  border: '1px solid #ddd',
};
