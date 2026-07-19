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
          
          // Check if they have SnapMenu configured
          // Assuming SnapMenu saves settings in the same document under "restaurantName" or similar
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

  if (!profile) return <div className="p-8">Ładowanie profilu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">SnapBio</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="block px-4 py-2 rounded-lg bg-gray-100 font-medium">Profil</a>
          <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-50">Wygląd</a>
          <a href="#" className="block px-4 py-2 rounded-lg hover:bg-gray-50">Linki</a>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">Wyloguj</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Witaj, {user?.displayName}</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="font-semibold mb-4">Twój link SnapBio</h3>
          <div className="flex gap-4 items-center">
            <input 
              type="text" 
              readOnly 
              value={`https://bio.getsnap.space/${profile.username || user?.uid}`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-600 outline-none"
            />
            <a 
              href={`/${profile.username || user?.uid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
            >
              Podgląd
            </a>
          </div>
        </div>

        {/* SnapMenu integration widget */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl border border-pink-100">
          <h3 className="font-bold text-pink-900 mb-2">Twój ekosystem Snap Code</h3>
          {hasSnapMenu ? (
            <p className="text-pink-800">
              Wykryliśmy, że korzystasz ze <b>SnapMenu</b>! Dodaj specjalny widget do swojego SnapBio, aby klienci mogli bezpośrednio przeglądać Twoje menu restauracyjne.
            </p>
          ) : (
            <p className="text-pink-800">
              Chcesz cyfrowe menu dla swojego salonu lub restauracji? Poznaj <b>SnapMenu</b> - bezpłatne menu QR, które idealnie łączy się ze SnapBio.
            </p>
          )}
        </div>
      </main>

      {/* Preview Pane (Optional, typical in Linktree clones) */}
      <aside className="w-96 bg-gray-100 border-l border-gray-200 p-8 hidden lg:block">
        <div className="w-full max-w-[320px] mx-auto h-[650px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
           {/* Mockup notch */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl"></div>
           
           <div className="w-full h-full bg-pink-50 p-6 flex flex-col items-center pt-16">
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
              <h3 className="font-bold text-lg">{profile.title}</h3>
              <p className="text-sm text-gray-500 mb-8">{profile.description}</p>
              
              <div className="w-full space-y-3">
                 <div className="w-full h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">Twój Link 1</div>
                 <div className="w-full h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">Twój Link 2</div>
              </div>
           </div>
        </div>
      </aside>
    </div>
  );
}
