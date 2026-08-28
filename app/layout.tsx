import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gestion des véhicules',
  description: 'Gestion et réservation des véhicules de l’entreprise',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
