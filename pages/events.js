import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPinIcon, UserGroupIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [liveMode, setLiveMode] = useState(false);

  useEffect(() => {
    fetch('/api/events').then(res => res.json()).then(data => {
      if(Array.isArray(data)) setEvents(data);
      // Mock data if empty
      if(!data || data.length === 0) setEvents([
        { _id: '1', title: 'City Food Drive', date: new Date().toISOString(), location: 'Central Park, Gorakhpur', description: 'Join us for our monthly city-wide food drive. We will be distributing over 500 freshly cooked meals to those in need near the central park area.', participants: [] },
        { _id: '2', title: 'Zero Waste Workshop', date: new Date(Date.now() + 86400000).toISOString(), location: 'Community Hall', description: 'Learn how to compost and reduce kitchen waste.', participants: [] }
      ]);
    });
  }, []);

  const handleJoin = async (eventId) => {
    if (!user) return toast.error('Login to join');
    try {
      await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId: user.uid })
      });
      toast.success('You have joined the event!');
    } catch (e) { toast.error('Failed to join'); }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="page-kicker justify-center mb-4">Community Gatherings</p>
            <h1 className="section-heading">Upcoming Events</h1>
            <p className="section-copy max-w-2xl mx-auto mt-4">Join our drives, workshops, and community events to make a hands-on difference.</p>
          </div>

          <div className="flex justify-center mb-12">
            <button 
              onClick={() => setLiveMode(!liveMode)} 
              className={`premium-button flex items-center gap-2 transition-all ${liveMode ? 'bg-red-600 text-white animate-pulse shadow-red-300' : 'bg-white text-slate-700'}`}
            >
              <VideoCameraIcon className="w-5 h-5" /> {liveMode ? 'Exit Live Mode' : 'Live Event Mode'}
            </button>
          </div>

          {liveMode && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 bg-black rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md font-bold text-xs uppercase tracking-wider animate-pulse">● Live</div>
                <p className="text-white text-xl font-bold opacity-50">🔴 Live Stream: City Food Drive (Demo)</p>
              </div>
              <div className="p-6 bg-slate-800 text-white flex justify-between items-center">
                <p className="font-bold flex items-center gap-2"><UserGroupIcon className="w-5 h-5" /> Watching: 1,204</p>
                <button className="premium-button bg-red-600 hover:bg-red-700">Donate to Event</button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event, i) => (
              <motion.div 
                key={event._id} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="premium-card p-0 overflow-hidden flex flex-col group"
              >
                <div className="h-48 bg-gradient-to-r from-primary to-emerald-600 relative overflow-hidden">
                  <img src={`https://source.unsplash.com/random/600x400/?community,event&sig=${event._id}`} alt={event.title} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-950/80 px-4 py-2 rounded-xl font-bold text-slate-800 dark:text-white shadow-md">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{event.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 flex-1">{event.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    <div className="flex items-center gap-2"><MapPinIcon className="w-5 h-5" /> {event.location}</div>
                    <div className="flex items-center gap-2"><UserGroupIcon className="w-5 h-5" /> {event.participants?.length || i * 12} Joining</div>
                  </div>

                  <button 
                    onClick={() => handleJoin(event._id)}
                    className="premium-button w-full bg-slate-900 hover:bg-black"
                  >
                    Join Event
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}