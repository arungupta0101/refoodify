import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

export default function Donate() {
  const { user } = useAuth();
  const router = useRouter();
  const [donationType, setDonationType] = useState('food');
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    location: '',
    expiryDate: '',
    amount: '',
    volunteerName: '',
    volunteerEmail: '',
    volunteerPhone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to donate');
      router.push('/login');
      return;
    }

    try {
      if (donationType === 'food') {
        const response = await fetch('/api/create-donation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            donorId: user.uid,
            type: 'food',
            status: 'available',
          }),
        });
        
        if (!response.ok) throw new Error('Failed to create donation');
        
        toast.success('Food donation submitted!');
      } else if (donationType === 'money') {
        const response = await fetch('/api/create-donation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: formData.amount,
            donorId: user.uid,
            type: 'money',
          }),
        });
        
        if (!response.ok) throw new Error('Failed to create donation');
        
        toast.success('Money donation submitted!');
      } else if (donationType === 'volunteer') {
        const response = await fetch('/api/create-donation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            userId: user.uid,
            type: 'volunteer',
          }),
        });
        
        if (!response.ok) throw new Error('Failed to create volunteer registration');
        
        toast.success('Volunteer registration submitted!');
      }
    } catch (error) {
      toast.error('Error submitting donation');
    }
  };

  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Help Hungry People</h1>
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setDonationType('food')}
              className={`px-6 py-3 rounded ${donationType === 'food' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              🍽️ Food Donation
            </button>
            <button
              onClick={() => setDonationType('money')}
              className={`px-6 py-3 rounded ${donationType === 'money' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              💰 Money Donation
            </button>
            <button
              onClick={() => setDonationType('volunteer')}
              className={`px-6 py-3 rounded ${donationType === 'volunteer' ? 'bg-primary text-white' : 'bg-gray-200'}`}
            >
              🤝 Volunteer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-4">
          {donationType === 'food' && (
            <>
              <input
                type="text"
                name="foodType"
                placeholder="Food Type (e.g., Rice, Vegetables)"
                value={formData.foodType}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="text"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              />
            </>
          )}

          {donationType === 'money' && (
            <input
              type="number"
              name="amount"
              placeholder="Donation Amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-3 border rounded"
              required
            />
          )}

          {donationType === 'volunteer' && (
            <>
              <input
                type="text"
                name="volunteerName"
                placeholder="Full Name"
                value={formData.volunteerName}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="email"
                name="volunteerEmail"
                placeholder="Email"
                value={formData.volunteerEmail}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="tel"
                name="volunteerPhone"
                placeholder="Phone Number"
                value={formData.volunteerPhone}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              />
            </>
          )}

          <button type="submit" className="w-full bg-primary text-white p-3 rounded">
            Submit {donationType === 'food' ? 'Food Donation' : donationType === 'money' ? 'Money Donation' : 'Volunteer Registration'}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}