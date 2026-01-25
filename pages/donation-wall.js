import Header from '../components/Header';
import Footer from '../components/Footer';

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
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-center text-gray-800 mb-12">💖 Public Donation Wall</h1>
          <div className="space-y-4">
            {donations.map(d => (
              <div key={d.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{d.name} <span className="text-gray-400 font-normal text-sm mx-1">donated</span> <span className="text-green-600 bg-green-50 px-2 py-1 rounded-lg">{d.amount}</span></h4>
                  <p className="text-gray-600 italic mt-1">"{d.message}"</p>
                </div>
                <span className="text-xs text-gray-400 font-bold bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">{d.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}