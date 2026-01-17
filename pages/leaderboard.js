import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrophyIcon } from '@heroicons/react/24/solid';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('points');

  const categories = [
    { id: 'all', label: 'All Heroes' },
    { id: 'donor', label: 'Top Donors' },
    { id: 'ngo', label: 'Top NGOs' },
    { id: 'restaurant', label: 'Restaurants' },
    { id: 'user', label: 'Individuals' }
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?type=${category}&sortBy=${sortBy}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLeaders(data);
        else setLeaders([]);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [category, sortBy]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-gray-800 mb-4 flex items-center justify-center gap-3">
              <TrophyIcon className="w-12 h-12 text-yellow-500" />
              Community Heroes
            </h1>
            <p className="text-gray-600 text-lg">Celebrating the top contributors making a difference.</p>
          </div>

          {/* Sort By Toggle */}
          <div className="flex justify-center gap-4 mb-6">
             <button 
               onClick={() => setSortBy('points')}
               className={`px-6 py-2 rounded-full font-bold transition-all ${sortBy === 'points' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200'}`}
             >
               🏆 By Points
             </button>
             <button 
               onClick={() => setSortBy('rating')}
               className={`px-6 py-2 rounded-full font-bold transition-all ${sortBy === 'rating' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200'}`}
             >
               ⭐ By Rating
             </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  category === cat.id
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-white text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {loading ? (
               <div className="p-12 text-center text-gray-500">Loading heroes...</div>
            ) : leaders.length > 0 ? (
              leaders.map((user, index) => (
                <div key={user._id} className={`flex items-center p-6 border-b border-gray-50 hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-yellow-50/30' : ''}`}>
                  <div className={`w-12 text-2xl font-black ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-300'}`}>
                    #{index + 1}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden mr-6 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-gray-400">
                    {user.photoURL ? <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" /> : (user.name ? user.name[0] : 'U')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{user.name || 'Anonymous Hero'}</h3>
                    <span className="text-xs uppercase font-bold text-gray-500">{user.userType}</span>
                  </div>
                  <div className="text-right">
                    {sortBy === 'points' ? (
                      <>
                        <p className="text-2xl font-black text-primary">{user.points}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Points</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-black text-yellow-500 flex items-center justify-end gap-1">{user.rating ? user.rating.toFixed(1) : '0.0'} <span className="text-lg">⭐</span></p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Rating ({user.ratingCount || 0})
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : <div className="p-12 text-center text-gray-500">No heroes found in this category yet.</div>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}