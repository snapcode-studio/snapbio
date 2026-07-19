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
        <div className="hero-content animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h1>Link w Bio.<br/>Design klasy<br/>Premium.</h1>
          <p style={{ fontSize: '1.1rem', marginTop: '1rem', maxWidth: '400px' }}>
            Zarządzaj swoimi linkami i wizerunkiem w social mediach.
          </p>
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
