'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';

type WithId = { id: string };

// Charge une liste via `fetcher`, puis se réabonne aux changements Postgres
// sur `table` pour la garder à jour en direct chez tous les utilisateurs,
// sans rechargement de page.
export function useRealtimeList<T extends WithId>(table: string, fetcher: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    try {
      setError(null);
      const data = await fetcherRef.current();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();

    const client = supabase;
    if (!client) return;

    // Les relations (vehicle/entity) ne sont pas incluses dans le payload
    // Realtime : on recharge la liste complète à chaque changement plutôt
    // que de tenter une fusion partielle, pour rester simple et fiable.
    const channel = client
      .channel(`realtime:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        reload();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [table, reload]);

  return { items, loading, error, reload };
}
