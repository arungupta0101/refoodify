import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPinIcon, ClockIcon, CheckCircleIcon, FireIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
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
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="page-kicker justify-center mb-4">Get Involved</p>
            <h1 className="section-heading flex items-center justify-center gap-3">
              <FireIcon className="w-10 h-10 text-orange-500" />
              Volunteer Task Marketplace
            </h1>
            <p className="section-copy max-w-2xl mx-auto mt-4">Find and accept tasks in your community. Earn points and make a direct impact.</p>
          </div>

          <div className="grid gap-6">
            {tasks.map((task, i) => (
              <motion.div 
                key={task.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="premium-card p-6 flex flex-col sm:flex-row justify-between items-center gap-4"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> {task.location}</p>
                    <p className="flex items-center gap-1.5 text-orange-500 font-semibold"><ClockIcon className="w-4 h-4" /> {task.time}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="block text-2xl font-black text-primary mb-2">+{task.points} pts</span>
                  {task.status === 'Open' ? (
                    <button onClick={() => handleAccept(task.id)} className="premium-button bg-slate-900 hover:bg-black">Accept Task</button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold dark:bg-emerald-900/50 dark:text-emerald-300">
                      <CheckCircleIcon className="w-5 h-5" /> {task.status}
                    </span>
                  )}
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