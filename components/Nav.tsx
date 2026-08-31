'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Modal from './Modal';
import { useAdmin } from '../lib/adminAuth';

const USER_LINKS = [
  { href: '/', label: 'Tableau de bord' },
  { href: '/planning', label: 'Planning' },
  { href: '/reservations', label: 'Réservations' },
];

const ADMIN_LINKS = [
  { href: '/vehicules', label: 'Véhicules' },
  { href: '/entites', label: 'Entités' },
  { href: '/historique', label: 'Historique' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, unlock, lock } = useAdmin();
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const links = isAdmin ? [...USER_LINKS, ...ADMIN_LINKS] : USER_LINKS;

  function handleLock() {
    lock();
    router.push('/');
  }

  function handleUnlockSubmit(event: FormEvent) {
    event.preventDefault();
    if (unlock(code)) {
      setShowCodeModal(false);
      setCode('');
      setError(null);
    } else {
      setError('Code incorrect.');
    }
  }

  function closeModal() {
    setShowCodeModal(false);
    setCode('');
    setError(null);
  }

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          Gestion des véhicules
        </div>
        <nav className="nav-links">
          {links.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`nav-link${active ? ' active' : ''}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        {isAdmin ? (
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={handleLock}>
            Quitter le mode admin
          </button>
        ) : (
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShowCodeModal(true)}>
            Mode admin
          </button>
        )}
      </div>

      {showCodeModal && (
        <Modal title="Accès administrateur" onClose={closeModal}>
          <form onSubmit={handleUnlockSubmit}>
            {error && <div className="form-error">{error}</div>}
            <div className="field">
              <label htmlFor="nav-admin-code">Code</label>
              <input
                id="nav-admin-code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={closeModal}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                Déverrouiller
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
