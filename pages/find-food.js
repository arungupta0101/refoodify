import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { auth } from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';

const containerStyle = { width: '100%', height: '400px' };
const center = { lat: -3.745, lng: -38.523 };

export default function FindFood() {
  const [view, setView] = useState('map'); // 'map', 'list', 'ngos', 'stories'
  const [donations, setDonations] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [stories, setStories] = useState([
    { id: 1, title: 'Helped 500 Families', content: 'Through Refoodify, we distributed meals to 500 families in need.', author: 'NGO A' },
    { id: 2, title: 'Reduced Waste by 30%', content: 'Our partnership with local restaurants reduced food waste significantly.', author: 'Restaurant B' },
  ]);

  useEffect(() => {
    fetchDonations();
    fetchNgos();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/get-available-donations');
      if (response.ok) {
        const donations = await response.json();
        setDonations(donations);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const fetchNgos = async () => {
    try {
      const response = await fetch('/api/get-ngos');
      if (response.ok) {
        const ngos = await response.json();
        setNgos(ngos);
      }
    } catch (error) {
      console.error('Error fetching NGOs:', error);
    }
  };

  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Find Food & Support</h1>
        <div className="mb-8 flex justify-center space-x-4">
          <button onClick={() => setView('map')} className={`px-6 py-3 rounded ${view === 'map' ? 'bg-primary text-white' : 'bg-gray-200'}`}>🗺️ Map View</button>
          <button onClick={() => setView('list')} className={`px-6 py-3 rounded ${view === 'list' ? 'bg-primary text-white' : 'bg-gray-200'}`}>📋 List View</button>
          <button onClick={() => setView('ngos')} className={`px-6 py-3 rounded ${view === 'ngos' ? 'bg-primary text-white' : 'bg-gray-200'}`}>🏢 NGO Finder</button>
          <button onClick={() => setView('stories')} className={`px-6 py-3 rounded ${view === 'stories' ? 'bg-primary text-white' : 'bg-gray-200'}`}>📖 Success Stories</button>
        </div>

        {view === 'map' && (
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
              {donations.map((donation) => (
                <Marker key={donation.id} position={{ lat: donation.lat || center.lat, lng: donation.lng || center.lng }} />
              ))}
            </GoogleMap>
          </LoadScript>
        )}

        {view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {donations.map((donation) => (
              <div key={donation.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">{donation.foodType}</h3>
                <p>Quantity: {donation.quantity}</p>
                <p>Location: {donation.location}</p>
                <p>Expiry: {donation.expiryDate}</p>
              </div>
            ))}
          </div>
        )}

        {view === 'ngos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ngos.map((ngo) => (
              <div key={ngo.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">{ngo.name || 'NGO'}</h3>
                <p>Email: {ngo.email}</p>
                <p>Location: {ngo.location || 'Not specified'}</p>
              </div>
            ))}
          </div>
        )}

        {view === 'stories' && (
          <div className="space-y-6">
            {stories.map((story) => (
              <div key={story.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold">{story.title}</h3>
                <p className="text-gray-600 mb-2">By {story.author}</p>
                <p>{story.content}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}