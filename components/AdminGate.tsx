'use client';

import { FormEvent, useState, type ReactNode } from 'react';
import { useAdmin } from '../lib/adminAuth';

export default function AdminGate({ children }: { children: ReactNode }) {
  const { isAdmin, ready, unlock } = useAdmin();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="page">
        <div className="loading-state">Chargement…</div>
      </div>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (unlock(code)) {
      setError(null);
      setCode('');
    } else {
      setError('Code incorrect.');
    }
  }

  return (
    <div className="page">
      <div className="card card-pad" style={{ maxWidth: 360, margin: '60px auto' }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Accès administrateur</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Cette page est réservée aux administrateurs. Entrez le code pour continuer.
        </p>
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label htmlFor="admin-code">Code</label>
            <input
              id="admin-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Déverrouiller
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
