import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

export default function Restaurant() {
  const { user } = useAuth();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    foodType: '',
    quantity: '',
    expiryDate: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    checkRegistration();
    fetchDonations();
  }, [user]);

  const checkRegistration = async () => {
    try {
      const response = await fetch(`/api/get-restaurant?uid=${user.uid}`);
      if (response.ok) {
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
      }
    } catch (error) {
      setIsRegistered(false);
    }
  };

  const fetchDonations = async () => {
    try {
      const response = await fetch(`/api/get-donations?uid=${user.uid}`);
      if (response.ok) {
        const donations = await response.json();
        setDonations(donations);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/create-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          ownerId: user.uid,
        }),
      });

      if (!response.ok) throw new Error('Failed to register restaurant');

      setIsRegistered(true);
      toast.success('Restaurant registered!');
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    try {
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

      setFormData({ name: '', location: '', foodType: '', quantity: '', expiryDate: '' });
      fetchDonations();
      toast.success('Donation listed!');
    } catch (error) {
      toast.error('Donation failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user) return <div>Please login</div>;

  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Restaurant Dashboard</h1>

        {!isRegistered ? (
          <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md space-y-4 mb-8">
            <h2 className="text-xl font-semibold">Register Your Restaurant</h2>
            <input
              type="text"
              name="name"
              placeholder="Restaurant Name"
              value={formData.name}
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
            <button type="submit" className="w-full bg-primary text-white p-3 rounded">Register</button>
          </form>
        ) : (
          <>
            <form onSubmit={handleDonate} className="bg-white p-8 rounded-lg shadow-md space-y-4 mb-8">
              <h2 className="text-xl font-semibold">List Surplus Food</h2>
              <input
                type="text"
                name="foodType"
                placeholder="Food Type"
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
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              />
              <button type="submit" className="w-full bg-primary text-white p-3 rounded">List Donation</button>
            </form>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Your Donations</h2>
              <ul className="space-y-2">
                {donations.map((donation) => (
                  <li key={donation.id} className="border-b pb-2">
                    {donation.foodType} - {donation.quantity} - Status: {donation.status}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}