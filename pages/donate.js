import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

export default function Donate() {
  const { user } = useAuth();
  const router = useRouter();
  const [donationType, setDonationType] = useState('food');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New Loading State

  const [formData, setFormData] = useState({
    foodType: '', quantity: '', location: '', expiryDate: '',
    amount: '', volunteerName: '', volunteerEmail: '', volunteerPhone: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const generateReferenceNumber = () => `REF-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first');
      return router.push('/login');
    }

    setIsSubmitting(true); // Open Loading Modal

    try {
      if (donationType === 'volunteer') {
        const q = query(collection(db, 'volunteers'), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          toast.error('Already registered as volunteer!');
          setIsSubmitting(false);
          return;
        }

        const refNum = generateReferenceNumber();
        await addDoc(collection(db, 'volunteers'), {
          ...formData, userId: user.uid, referenceNumber: refNum, status: 'pending', submittedAt: new Date()
        });
        setReferenceNumber(refNum);
        setShowSuccessModal(true);
      } else {
        // Food/Money Logic
        const res = await fetch('/api/create-donation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, donorId: user.uid, type: donationType }),
        });
        if (!res.ok) throw new Error('API Error');
        toast.success(`${donationType} donation successful!`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Submission failed. Check Console.');
    } finally {
      setIsSubmitting(false); // Close Loading Modal
    }
  };

  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-4xl mx-auto min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-8">Refoodify Donations</h1>
        
        {/* Type Selection */}
        <div className="flex justify-center gap-2 mb-8">
          {['food', 'money', 'volunteer'].map(t => (
            <button key={t} onClick={() => setDonationType(t)} className={`px-5 py-2 rounded-full capitalize ${donationType === t ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg space-y-4 border">
          {donationType === 'food' && (
             <div className="animate-fadeIn space-y-3">
               <input type="text" name="foodType" placeholder="Food Name" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
               <input type="text" name="quantity" placeholder="Quantity" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
               <input type="text" name="location" placeholder="Address" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
               <input type="date" name="expiryDate" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
             </div>
          )}
          {donationType === 'money' && (
            <input type="number" name="amount" placeholder="Amount (₹)" onChange={handleChange} className="w-full p-3 border rounded-lg animate-fadeIn" required />
          )}
          {donationType === 'volunteer' && (
            <div className="animate-fadeIn space-y-3">
              <input type="text" name="volunteerName" placeholder="Full Name" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
              <input type="email" name="volunteerEmail" placeholder="Email" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
              <input type="tel" name="volunteerPhone" placeholder="Phone" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
            </div>
          )}
          <button type="submit" className="w-full bg-orange-500 text-white p-4 rounded-xl font-bold hover:bg-orange-600">
            Submit Registration
          </button>
        </form>
      </main>

      {/* --- 🍔 FOOD LOADING MODAL --- */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
          <div className="relative">
            {/* Spinning Food Icons */}
            <div className="text-5xl animate-spin duration-[2000ms]">🥗</div>
            <div className="absolute -top-6 -left-6 text-3xl animate-bounce">🍎</div>
            <div className="absolute -bottom-6 -right-6 text-3xl animate-bounce delay-150">🥪</div>
          </div>
          <h2 className="mt-8 text-xl font-bold text-gray-800 animate-pulse">Processing your kindness...</h2>
          <p className="text-gray-500">Connecting to Refoodify servers</p>
        </div>
      )}

      {/* --- 🎉 SUCCESS MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full animate-popIn shadow-2xl">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Registration Done!</h2>
            <p className="text-gray-600 mb-6">Your unique volunteer ID is:</p>
            <div className="bg-orange-100 p-4 rounded-xl border-2 border-dashed border-orange-400 mb-6">
              <span className="text-2xl font-mono font-bold text-orange-700">{referenceNumber}</span>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full bg-black text-white py-3 rounded-xl">Awesome!</button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-popIn { animation: popIn 0.3s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <Footer />
    </>
  );
}