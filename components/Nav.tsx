'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Tableau de bord' },
  { href: '/vehicules', label: 'Véhicules' },
  { href: '/entites', label: 'Entités' },
  { href: '/reservations', label: 'Réservations' },
  { href: '/planning', label: 'Planning' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          Gestion des véhicules
        </div>
        <nav className="nav-links">
          {LINKS.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`nav-link${active ? ' active' : ''}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
