export default function Home() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ margin: 0, color: '#666' }}>Entreprise</p>
        <h1 style={{ margin: '6px 0 0', fontSize: 32 }}>Gestion des véhicules</h1>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 32 }}>
        <article style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #ddd' }}>
          <div style={{ color: '#666' }}>Véhicules</div>
          <strong style={{ fontSize: 30 }}>0</strong>
        </article>
        <article style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #ddd' }}>
          <div style={{ color: '#666' }}>Réservations aujourd’hui</div>
          <strong style={{ fontSize: 30 }}>0</strong>
        </article>
        <article style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #ddd' }}>
          <div style={{ color: '#666' }}>Entités</div>
          <strong style={{ fontSize: 30 }}>0</strong>
        </article>
      </section>

      <section style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #ddd' }}>
        <h2 style={{ marginTop: 0 }}>Réservations</h2>
        <p style={{ color: '#666' }}>Le planning des réservations apparaîtra ici.</p>
      </section>
    </main>
  );
}
