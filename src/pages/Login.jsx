import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in db, if not create default profile
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString(),
          bioProfile: {
            username: user.email.split('@')[0],
            title: user.displayName,
            description: "Twój krótki opis...",
            theme: "dark",
            links: []
          }
        }, { merge: true }); // Merge true so we don't overwrite SnapMenu data if exists
      }

      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed", error);
      alert("Błąd logowania: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-2">SnapBio</h1>
        <p className="text-gray-500 mb-8">Stwórz swój profesjonalny Link-in-bio.</p>
        
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Logowanie..." : "Zaloguj przez Google"}
        </button>
      </div>
    </div>
  );
}
