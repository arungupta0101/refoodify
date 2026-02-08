import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPinIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function VolunteerTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Food Pickup', location: 'Tasty Bites, Golghar', time: '2 Hours left', points: 50, status: 'Open' },
    { id: 2, title: 'Distribution Drive', location: 'Railway Station', time: 'Today, 5 PM', points: 100, status: 'Open' },
    { id: 3, title: 'Awareness Camp', location: 'City Mall', time: 'Tomorrow', points: 80, status: 'Filled' },
  ]);

  const handleAccept = (id) => {
    toast.success("Task Accepted! Check your dashboard.");
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'Accepted' } : t));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-black text-center text-gray-800 mb-8">🔥 Volunteer Task Marketplace</h1>
          <div className="grid gap-6">
            {tasks.map(task => (
              <div key={task.id} className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center border border-gray-100 hover:shadow-lg transition-all">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                  <p className="text-gray-500 flex items-center gap-2 mt-1"><MapPinIcon className="w-4 h-4" /> {task.location}</p>
                  <p className="text-xs text-orange-500 font-bold mt-2 flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {task.time}</p>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-primary">+{task.points} pts</span>
                  {task.status === 'Open' ? (
                    <button onClick={() => handleAccept(task.id)} className="mt-2 bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition-all">Accept</button>
                  ) : (
                    <span className="mt-2 inline-flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold">
                      <CheckCircleIcon className="w-5 h-5" /> {task.status}
                    </span>
                  )}
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