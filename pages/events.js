import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CalendarIcon, MapPinIcon, UserGroupIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [liveMode, setLiveMode] = useState(false);

  useEffect(() => {
    fetch('/api/events').then(res => res.json()).then(data => {
      if(Array.isArray(data)) setEvents(data);
      // Mock data if empty
      if(data.length === 0) setEvents([
        { _id: '1', title: 'City Food Drive', date: new Date().toISOString(), location: 'Central Park', description: 'Join us to distribute food to 500 people.', participants: [] },
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
      <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <h1 className="text-4xl font-black text-gray-800">Upcoming Events</h1>
            <button 
              onClick={() => setLiveMode(!liveMode)} 
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${liveMode ? 'bg-red-600 text-white animate-pulse shadow-red-300 shadow-lg' : 'bg-white text-gray-700 shadow-md hover:bg-gray-50'}`}
            >
              <VideoCameraIcon className="w-5 h-5" /> {liveMode ? 'Exit Live Mode' : 'Live Event Mode'}
            </button>
          </div>

          {liveMode && (
            <div className="mb-12 bg-black rounded-3xl overflow-hidden shadow-2xl relative animate-fadeIn">
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md font-bold text-xs uppercase tracking-wider animate-pulse">● Live</div>
                <p className="text-white text-xl font-bold opacity-50">🔴 Live Stream: City Food Drive (Simulation)</p>
              </div>
              <div className="p-6 bg-gray-800 text-white flex justify-between items-center">
                <p className="font-bold flex items-center gap-2"><UserGroupIcon className="w-5 h-5" /> Watching: 1.2k</p>
                <button className="bg-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-all">Donate to Event</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map(event => (
              <div key={event._id} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
                <div className="h-48 bg-gradient-to-r from-primary to-green-600 relative">
                  <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-xl font-bold text-gray-800 shadow-md">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{event.title}</h3>
                  <p className="text-gray-600 mb-6 flex-1">{event.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2"><MapPinIcon className="w-5 h-5" /> {event.location}</div>
                    <div className="flex items-center gap-2"><UserGroupIcon className="w-5 h-5" /> {event.participants?.length || 0} Joining</div>
                  </div>

                  <button 
                    onClick={() => handleJoin(event._id)}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all"
                  >
                    Join Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}