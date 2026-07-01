import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function DonationWall() {
  const donations = [
    { id: 1, name: 'Arun Gupta', amount: '₹500', message: 'Keep up the good work!', time: '2 mins ago' },
    { id: 2, name: 'Anonymous', amount: '10kg Rice', message: 'For the kids.', time: '10 mins ago' },
    { id: 3, name: 'Shaily', amount: '₹1000', message: 'Happy to help.', time: '1 hour ago' },
    { id: 4, name: 'Harshit', amount: '50 Meals', message: 'Great initiative!', time: '2 hours ago' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="page-kicker justify-center mb-4">Community Gratitude</p>
            <h1 className="section-heading">💖 Public Donation Wall</h1>
            <p className="section-copy max-w-2xl mx-auto mt-4">A tribute to the generosity of our community. Thank you for every contribution.</p>
          </div>

          <div className="space-y-4">
            {donations.map((d, i) => (
              <motion.div 
                key={d.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="premium-card p-6 border-l-4 border-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">{d.name} <span className="text-slate-400 font-normal text-sm mx-1">donated</span> <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-1 rounded-lg">{d.amount}</span></h4>
                  <p className="text-slate-600 dark:text-slate-300 italic mt-1">"{d.message}"</p>
                </div>
                <span className="text-xs text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full whitespace-nowrap">{d.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}