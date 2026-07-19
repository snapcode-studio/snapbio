import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let user;
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
      }

      // Check if user exists in db, if not create default profile
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          createdAt: new Date().toISOString(),
          bioProfile: {
            username: user.uid.substring(0, 8),
            title: "Moja Strona",
            description: "Twój krótki opis...",
            theme: "dark",
            links: []
          }
        }, { merge: true });
      }

      navigate('/dashboard');
    } catch (error) {
      console.error("Auth failed", error);
      setErrorMsg("Błąd: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
      
      <div className="container hero">
        <div className="hero-content animate-fade-up" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1>Link w Bio.<br/>Design klasy<br/>Premium.</h1>
            <p style={{ fontSize: '1.1rem', marginTop: '1rem', maxWidth: '400px', color: 'var(--text-secondary)' }}>
              Zarządzaj swoimi linkami i wizerunkiem w social mediach z jednego miejsca.
            </p>
          </div>
          
          <div className="hero-graphic glass anim-wiggle" style={{ position: 'relative', width: '100%', maxWidth: '300px', padding: '30px 20px', borderRadius: '32px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)', zIndex: 0 }}></div>
             
             <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', border: '2px solid rgba(255,255,255,0.2)' }}></div>
               <div style={{ width: '120px', height: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.8)' }}></div>
               <div style={{ width: '80px', height: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.4)' }}></div>
             </div>
             
             <div style={{ zIndex: 1, display: 'flex', justifyContent: 'center', gap: '12px', margin: '10px 0' }}>
               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
             </div>

             <div style={{ zIndex: 1, width: '100%', height: '48px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '40%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.5)' }}></div>
             </div>
             <div style={{ zIndex: 1, width: '100%', height: '48px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ width: '50%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.5)' }}></div>
             </div>
             
             <div className="anim-pulse" style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '150px', height: '150px', background: '#ec4899', filter: 'blur(60px)', opacity: 0.3, zIndex: 0 }}></div>
             <div className="anim-pulse" style={{ position: 'absolute', top: '-10%', left: '-20%', width: '120px', height: '120px', background: '#a855f7', filter: 'blur(50px)', opacity: 0.3, zIndex: 0, animationDelay: '1s' }}></div>
          </div>
        </div>

        <div className="auth-box card animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{isLogin ? "Zaloguj się" : "Zarejestruj się"}</h2>
          <form onSubmit={handleAuth}>
            <input 
              type="email" 
              placeholder="Adres e-mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              placeholder="Hasło" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            {isLogin && (
              <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '12px' }}>
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}>Zapomniałeś hasła?</a>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Przetwarzanie..." : "Rozpocznij"}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setErrorMsg(''); }}
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
            >
              {isLogin ? "Nie masz konta? Zarejestruj się" : "Masz już konto? Zaloguj się"}
            </a>
          </p>
          {errorMsg && (
            <div style={{ color: '#ff453a', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
