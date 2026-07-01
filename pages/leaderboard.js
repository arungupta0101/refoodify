import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { TrophyIcon as TrophyIconSolid } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/outline';

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
        if (Array.isArray(data)) {
          // Filter out admin from leaderboard
          setLeaders(data.filter(user => {
            const email = (user.email || '').toLowerCase();
            const name = (user.name || '').toLowerCase();
            const type = (user.userType || '').toLowerCase();
            return email !== 'admin@refoodify.com' && !name.includes('admin') && type !== 'admin';
          }));
        }
        else setLeaders([]);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [category, sortBy]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="page-kicker justify-center mb-4">Community Impact</p>
            <h1 className="section-heading mb-4 flex items-center justify-center gap-3">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-500 dark:bg-amber-500/10">
                <TrophyIconSolid className="w-8 h-8" />
              </span>
              Community Heroes
            </h1>
            <p className="section-copy mx-auto">Celebrating the top contributors making a difference across the Refoodify network.</p>
          </div>

          {/* Sort By Toggle */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
             <button 
               onClick={() => setSortBy('points')}
               className={`premium-button px-5 py-2.5 text-sm ${sortBy === 'points' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-[0_18px_45px_rgba(245,158,11,0.28)]' : 'bg-white/80 text-slate-600 border border-slate-200/50 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700/50'}`}
             >
               <TrophyIconSolid className="w-4 h-4" /> By Points
             </button>
             <button 
               onClick={() => setSortBy('rating')}
               className={`premium-button px-5 py-2.5 text-sm ${sortBy === 'rating' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-[0_18px_45px_rgba(245,158,11,0.28)]' : 'bg-white/80 text-slate-600 border border-slate-200/50 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700/50'}`}
             >
               <StarIcon className="w-4 h-4" /> By Rating
             </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 rounded-[1.75rem] border border-slate-200/50 bg-white/75 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-950/50">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  category === cat.id
                    ? 'bg-gradient-to-r from-primary to-emerald-500 text-white shadow-[0_18px_45px_rgba(34,197,94,0.28)] scale-105'
                    : 'bg-transparent text-slate-500 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="premium-card p-0 overflow-hidden">
            {loading ? (
               <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading Heroes...</div>
            ) : leaders.length > 0 ? (
              leaders.map((user, index) => (
                <div key={user._id} className={`flex items-center gap-4 p-5 border-b border-slate-100 dark:border-slate-800 transition-colors last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${index < 3 ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''}`}>
                  <div className={`w-12 text-2xl font-black text-center ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-orange-600' : 'text-slate-300 dark:text-slate-600'}`}>
                    #{index + 1}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-white overflow-hidden border-2 border-white shadow-lg shadow-slate-200/70 flex items-center justify-center text-xl font-bold text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:shadow-black/20">
                    {user.photoURL ? <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" /> : (user.name ? user.name[0] : 'U')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{user.name || 'Anonymous Hero'}</h3>
                    <span className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">{user.userType}</span>
                  </div>
                  <div className="text-right">
                    {sortBy === 'points' ? (
                      <>
                        <p className="text-2xl font-black text-primary">{user.points || 0}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Points</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-black text-amber-500 flex items-center justify-end gap-1">{user.rating ? user.rating.toFixed(1) : '0.0'} <span className="text-lg">⭐</span></p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                          Rating ({user.ratingCount || 0})
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : <div className="p-12 text-center text-slate-500 dark:text-slate-400">No heroes found in this category yet. Be the first!</div>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}