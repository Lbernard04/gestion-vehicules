export default function ConfigWarning() {
  return (
    <div className="form-error" style={{ marginBottom: 24 }}>
      Connexion à Supabase indisponible. Vérifiez que <code>NEXT_PUBLIC_SUPABASE_URL</code> et{' '}
      <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> sont bien définies (fichier{' '}
      <code>.env.local</code> en local, variables d&apos;environnement sur Vercel).
    </div>
  );
}
