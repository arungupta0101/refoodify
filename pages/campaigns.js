import Header from '../components/Header';
import Footer from '../components/Footer';
import { HeartIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Campaigns() {
  const campaigns = [
    { id: 1, title: 'Winter Warmth Drive', ngo: 'Helping Hands', goal: 50000, raised: 35000, image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80' },
    { id: 2, title: 'Feed the Kids', ngo: 'Child Care', goal: 20000, raised: 12000, image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="page-kicker justify-center mb-4">Fundraising</p>
            <h1 className="section-heading">📢 NGO Campaigns</h1>
            <p className="section-copy max-w-2xl mx-auto mt-4">Support special initiatives by our partner NGOs to create a larger impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campaigns.map((camp, i) => (
              <motion.div 
                key={camp.id} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="premium-card p-0 overflow-hidden group"
              >
                <div className="h-56 overflow-hidden">
                   <img src={camp.image} alt={camp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{camp.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">by {camp.ngo}</p>
                  
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
                    <div className="bg-primary h-3 rounded-full transition-all duration-1000" style={{ width: `${(camp.raised / camp.goal) * 100}%` }} />
                  </div>
                  
                  <div className="flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300 mb-6">
                    <span>₹{camp.raised.toLocaleString()} raised</span>
                    <span>Goal: ₹{camp.goal.toLocaleString()}</span>
                  </div>
                  
                  <button onClick={() => toast.success("Redirecting to payment...")} className="premium-button w-full bg-red-500 hover:bg-red-600">
                    <HeartIcon className="w-5 h-5" /> Donate Now
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