import Header from '../components/Header';
import Footer from '../components/Footer';
import { HeartIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function Campaigns() {
  const campaigns = [
    { id: 1, title: 'Winter Warmth Drive', ngo: 'Helping Hands', goal: 50000, raised: 35000, image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80' },
    { id: 2, title: 'Feed the Kids', ngo: 'Child Care', goal: 20000, raised: 12000, image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black text-center text-gray-800 mb-12">📢 NGO Campaigns</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campaigns.map(camp => (
              <div key={camp.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="h-48 overflow-hidden">
                   <img src={camp.image} alt={camp.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{camp.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 font-medium">by {camp.ngo}</p>
                  
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                    <div className="bg-primary h-3 rounded-full transition-all duration-1000" style={{ width: `${(camp.raised / camp.goal) * 100}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between text-sm font-bold text-gray-600 mb-6">
                    <span>₹{camp.raised.toLocaleString()} raised</span>
                    <span>Goal: ₹{camp.goal.toLocaleString()}</span>
                  </div>
                  
                  <button onClick={() => toast.success("Redirecting to payment...")} className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-200">
                    <HeartIcon className="w-5 h-5" /> Donate Now
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