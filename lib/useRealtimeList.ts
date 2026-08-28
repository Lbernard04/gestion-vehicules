'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { toFriendlyError } from './queries';

export function useRealtimeList<T>(table: string, fetcher: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const data = await fetcher();
      setItems(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (err && typeof err === 'object' && 'message' in err) {
        setError(toFriendlyError(err as { code?: string; message: string }));
      } else {
        setError('Erreur inconnue.');
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  useEffect(() => {
    reload();

    const client = supabase;
    if (!client) return;

    const channel = client
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, reload)
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [table, reload]);

  return { items, loading, error, reload };
}
