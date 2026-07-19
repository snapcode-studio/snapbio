import { useParams } from 'react-router-dom';

export default function PublicProfile() {
  const { username } = useParams();

  // Here we would fetch data from Firestore where bioProfile.username === username

  return (
    <>
      <nav>
        <div className="navbar__bar glass animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="logo-wrap">
            <img src="/logo.webp" alt="Logo" className="logo-img" onError={(e) => e.target.style.display='none'} />
            SnapBio
          </div>
        </div>
      </nav>

      <div className="container hero" style={{ minHeight: '70vh' }}>
        <div className="card animate-fade-up" style={{ maxWidth: '400px', width: '100%', margin: '0 auto', animationDelay: '0.2s', textAlign: 'center', padding: '40px' }}>
          <div style={{ width: '96px', height: '96px', margin: '0 auto 1.5rem', background: 'linear-gradient(to top right, #333, #666)', borderRadius: '50%', border: '4px solid #0a0a0c', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}></div>
          <h1 style={{ fontSize: '24px', letterSpacing: '-0.02em', marginBottom: '8px' }}>{username || "Twoja Nazwa"}</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Twój krótki, minimalistyczny opis. Czysta elegancja i zero zbędnych elementów.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <a href="#" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>
               Rezerwuj wizytę (Booksy)
             </a>
             <a href="#" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>
               Instagram
             </a>
             <a href="#" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
               Nasz Cennik
             </a>
          </div>
          
          <div style={{ marginTop: '2.5rem' }}>
            <a href="/" style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', fontFamily: "'Geist Mono', monospace" }}>
              SnapBio by Snap Code
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
