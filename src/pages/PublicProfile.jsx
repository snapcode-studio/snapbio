import { useParams } from 'react-router-dom';

export default function PublicProfile() {
  const { username } = useParams();

  // Here we would fetch data from Firestore where bioProfile.username === username

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center pt-20 px-4">
      <div className="w-full max-w-md bg-white/50 backdrop-blur-md rounded-[2rem] p-8 shadow-xl border border-white">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-full mb-4 shadow-lg"></div>
          <h1 className="text-2xl font-bold text-gray-900">{username}</h1>
          <p className="text-gray-600 mt-2 text-center">To jest publiczny profil SnapBio.</p>
          
          <div className="w-full mt-8 space-y-4">
             <a href="#" className="block w-full py-4 text-center bg-white rounded-2xl shadow-sm hover:shadow-md transition font-medium text-gray-800 border border-gray-100">
               Rezerwuj wizytę (Booksy)
             </a>
             <a href="#" className="block w-full py-4 text-center bg-white rounded-2xl shadow-sm hover:shadow-md transition font-medium text-gray-800 border border-gray-100">
               Instagram
             </a>
             <a href="#" className="block w-full py-4 text-center bg-white rounded-2xl shadow-sm hover:shadow-md transition font-medium text-gray-800 border border-gray-100">
               Nasz Cennik
             </a>
          </div>
        </div>
        <div className="mt-12 text-center">
          <a href="/" className="text-xs text-gray-400 font-medium hover:text-gray-600">Stworzone w SnapBio</a>
        </div>
      </div>
    </div>
  );
}
