import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const containerStyle = { width: '100%', height: '500px' };

// --- Dummy Data ---
const gorakhpurRestaurants = [
  { id: 1, name: 'Bobbys Restaurant', foodType: 'Veg Thali', quantity: '20 Meals', location: 'Civil Lines, Gorakhpur', lat: 26.7588, lng: 83.3697, phone: '+91 98765 43210', freeFoodTime: '8-10 PM' },
  { id: 2, name: 'Choudhary Mansarovar', foodType: 'North Indian', quantity: '15 Packets', location: 'Golghar, Gorakhpur', lat: 26.7606, lng: 83.3731, phone: '+91 88776 55443', freeFoodTime: '9-11 PM' }
];

const dummyNgos = [
  { id: 101, name: 'Gorakhpur Seva Samiti', state: 'Uttar Pradesh', district: 'Gorakhpur', city: 'Gorakhpur', email: 'seva@gkp.org', phone: '0551-223344', location: 'Taramandal' },
  { id: 102, name: 'U.P. Food Bank', state: 'Uttar Pradesh', district: 'Lucknow', city: 'Lucknow', email: 'info@upfoodbank.in', phone: '0522-445566', location: 'Hazratganj' }
];

const successStories = [
  { id: 1, title: '500 Meals in Golghar', content: 'Last Sunday, we collected surplus food from Bobbys and fed 500 people near the station.', author: 'Gorakhpur Seva Samiti' }
];

export default function FindFood() {
  const [view, setView] = useState('map'); // Default view
  const [currentLocation, setCurrentLocation] = useState({ lat: 26.7606, lng: 83.3697 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [message, setMessage] = useState('');

  // NGO Filters
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      });
    }
  }, []);

  const filteredNgos = dummyNgos.filter(ngo => 
    (filterState === '' || ngo.state === filterState) &&
    (filterDistrict === '' || ngo.district === filterDistrict) &&
    (searchCity === '' || ngo.city.toLowerCase().includes(searchCity.toLowerCase()))
  );

  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-7xl mx-auto bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-primary">Refoodify Discovery</h1>

        {/* Navigation Tabs - Check click function here */}
        <div className="mb-10 flex flex-wrap justify-center gap-2 bg-white p-2 rounded-2xl shadow-sm w-fit mx-auto border border-gray-100">
          <button onClick={() => setView('map')} className={`px-5 py-2 rounded-xl transition-all ${view === 'map' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>🗺️ Map</button>
          <button onClick={() => setView('list')} className={`px-5 py-2 rounded-xl transition-all ${view === 'list' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>📋 List</button>
          <button onClick={() => setView('ngos')} className={`px-5 py-2 rounded-xl transition-all ${view === 'ngos' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>🏢 NGOs</button>
          <button onClick={() => setView('stories')} className={`px-5 py-2 rounded-xl transition-all ${view === 'stories' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>📖 Stories</button>
        </div>

        {/* --- 1. MAP VIEW --- */}
        <div className={view === 'map' ? 'block' : 'hidden'}>
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
              <GoogleMap mapContainerStyle={containerStyle} center={currentLocation} zoom={13}>
                <Marker position={currentLocation} label="You" />
                {gorakhpurRestaurants.map(res => (
                  <Marker key={res.id} position={{ lat: res.lat, lng: res.lng }} title={res.name} />
                ))}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>

        {/* --- 2. LIST VIEW --- */}
        <div className={view === 'list' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'hidden'}>
          {gorakhpurRestaurants.map(res => (
            <div key={res.id} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold mb-2">{res.name}</h3>
              <p className="text-sm text-gray-500">🍱 {res.foodType}</p>
              <p className="text-sm text-gray-500 mb-4">📍 {res.location}</p>
              <a href={`tel:${res.phone}`} className="block text-center bg-primary text-white py-2 rounded-xl font-bold">Call Now</a>
            </div>
          ))}
        </div>

        {/* --- 3. NGO FINDER --- */}
        <div className={view === 'ngos' ? 'block' : 'hidden'}>
          <div className="bg-white p-6 rounded-3xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select onChange={(e) => setFilterState(e.target.value)} className="p-3 border rounded-xl outline-none">
              <option value="">Select State</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Bihar">Bihar</option>
            </select>
            <input type="text" placeholder="District..." onChange={(e) => setFilterDistrict(e.target.value)} className="p-3 border rounded-xl outline-none"/>
            <input type="text" placeholder="City/Village..." onChange={(e) => setSearchCity(e.target.value)} className="p-3 border rounded-xl outline-none"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNgos.map(ngo => (
              <div key={ngo.id} className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-primary">
                <h3 className="text-xl font-bold">{ngo.name}</h3>
                <p className="text-gray-500 mb-4">{ngo.city}, {ngo.district}</p>
                <button onClick={() => { setSelectedNgo(ngo); setIsModalOpen(true); setIsSuccess(false); }} className="text-primary font-bold">✉️ Message NGO</button>
              </div>
            ))}
          </div>
        </div>

        {/* --- 4. STORIES --- */}
        <div className={view === 'stories' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'hidden'}>
          {successStories.map(story => (
            <div key={story.id} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-50">
              <h3 className="text-2xl font-bold mb-4">{story.title}</h3>
              <p className="text-gray-600 mb-6 italic">"{story.content}"</p>
              <p className="text-sm font-semibold text-gray-700">By {story.author}</p>
            </div>
          ))}
        </div>

        {/* --- MODAL LOGIC (Same as before) --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
              {!isSuccess ? (
                <>
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4">✕</button>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Message {selectedNgo?.name}</h2>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." className="w-full p-4 border rounded-2xl h-32 mb-4 outline-none focus:ring-2 ring-primary"/>
                  <button onClick={() => setIsSuccess(true)} className="w-full bg-primary text-white py-3 rounded-xl font-bold">Send Message</button>
                </>
              ) : (
                <div className="text-center py-6 animate-bounceIn">
                  <div className="text-5xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold mb-2">Thanks for Contacting!</h2>
                  <p>We have received your message.</p>
                  <button onClick={() => setIsModalOpen(false)} className="mt-6 text-primary font-bold">Close</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
      <style jsx>{`
        .animate-bounceIn { animation: bounceIn 0.5s ease-out; }
        @keyframes bounceIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </>
  );
}