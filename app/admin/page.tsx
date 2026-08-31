'use client';

import Link from 'next/link';
import AdminGate from '../../components/AdminGate';

export default function AdminPage() {
  return (
    <AdminGate>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Mode admin</h1>
            <p className="page-subtitle">Vous avez accès à la gestion de la flotte, des entités et à l’historique.</p>
          </div>
        </div>

        <div className="card card-pad" style={{ maxWidth: 480 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/vehicules" className="btn btn-primary btn-sm">
              Véhicules
            </Link>
            <Link href="/entites" className="btn btn-primary btn-sm">
              Entités
            </Link>
            <Link href="/historique" className="btn btn-primary btn-sm">
              Historique
            </Link>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
