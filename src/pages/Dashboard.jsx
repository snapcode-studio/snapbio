import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hasSnapMenu, setHasSnapMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch profile
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile(data.bioProfile || {});
          
          if (data.restaurantName || data.menuActive) {
             setHasSnapMenu(true);
          }
        }
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth);
  };

  if (!profile) return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Ładowanie profilu...</div>;

  return (
    <>
      <nav>
        <div className="navbar__bar glass animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="logo-wrap">
            <img src="/logo.webp" alt="Logo" className="logo-img" onError={(e) => e.target.style.display='none'} />
            SnapBio Panel
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: 'auto', padding: '6px 16px', fontSize: '13px' }}>Wyloguj</button>
        </div>
      </nav>

      <div className="container dashboard-grid animate-fade-up" style={{ animationDelay: '0.2s' }}>
        
        {/* Panel Boczny: Wygląd i Podgląd */}
        <div className="sidebar card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignSelf: 'start' }}>
          <div>
            <h3>Twój Publiczny Link</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Skopiuj ten link do Instagrama, TikToka czy Facebooka.
            </p>
            <input 
              type="text" 
              readOnly 
              value={`https://bio.getsnap.space/${profile.username || user?.uid}`}
              style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border-light)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a 
                href={`/${profile.username || user?.uid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '12px', textDecoration: 'none' }}
              >
                Otwórz publiczny profil ↗
              </a>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Ekosystem Snap Code</h3>
            {hasSnapMenu ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Wykryliśmy, że korzystasz ze <span style={{ color: 'white', fontWeight: 500 }}>SnapMenu</span>! Możesz zintegrować interaktywne menu bezpośrednio w SnapBio.
              </p>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Prowadzisz gastronomię lub salon? Poznaj <a href="https://snapmenu.getsnap.space" style={{ color: 'white', fontWeight: 500, textDecoration: 'underline' }}>SnapMenu</a> - darmowe cyfrowe menu.
              </p>
            )}
          </div>
        </div>

        {/* Prawa Strona: Zarządzanie Profilu */}
        <div className="main-content card">
          <h2 style={{ marginBottom: '0.25rem' }}>Zarządzaj Profilem</h2>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Witaj, {user?.email}. Skonfiguruj wygląd swojej strony i dodaj linki.
          </p>
          
          <form style={{ display: 'flex', gap: '16px', marginBottom: '2.5rem', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <span className="input-label">Nazwa nagłówka</span>
              <input type="text" placeholder="Tytuł Twojej strony" defaultValue={profile.title} required style={{ marginBottom: '12px' }}/>
              
              <span className="input-label">Opis (Bio)</span>
              <input type="text" placeholder="Twój krótki opis" defaultValue={profile.description} style={{ marginBottom: '0' }} />
            </div>
            <div style={{ width: '160px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '160px', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled>Zapisz profil</button>
            </div>
          </form>

          <h3 style={{ marginBottom: '1rem' }}>Twoje linki</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Funkcja edycji linków w przygotowaniu.</p>
        </div>

      </div>
    </>
  );
}
