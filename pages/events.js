import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

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
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black text-center text-gray-800 mb-12">Upcoming Events</h1>
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