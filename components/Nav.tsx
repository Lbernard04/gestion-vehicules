'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const { isAdmin, lock } = useAdmin();

  const links = isAdmin ? [...USER_LINKS, ...ADMIN_LINKS] : USER_LINKS;

  function handleLock() {
    lock();
    router.push('/');
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
          <Link href="/admin" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
            Mode admin
          </Link>
        )}
      </div>
    </div>
  );
}
