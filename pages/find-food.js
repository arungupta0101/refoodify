import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon, 
  MapPinIcon, 
  ListBulletIcon, 
  BuildingOfficeIcon, 
  BookOpenIcon, 
  UserGroupIcon, 
  FunnelIcon, 
  ClockIcon, 
  CheckBadgeIcon, 
  ArrowRightIcon,
  XMarkIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import('../components/Map'), { ssr: false });

const successStories = [
  { id: 1, title: '500 Meals in Golghar', content: 'Last Sunday, we collected surplus food from Bobbys and fed 500 people near the station.', author: 'Gorakhpur Seva Samiti' }
];

export default function FindFood() {
  const { user } = useAuth();
  const [view, setView] = useState('map'); // Default view
  const [currentLocation, setCurrentLocation] = useState({ lat: 26.7606, lng: 83.3697 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [message, setMessage] = useState('');
  const [realDonations, setRealDonations] = useState([]);
  const [verifyModal, setVerifyModal] = useState(null); // Donation object to verify
  const [verifyForm, setVerifyForm] = useState({ rating: 5, review: '', photo: '' });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [partners, setPartners] = useState({ restaurants: [], ngos: [], volunteers: [] });
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [mapSearchTriggered, setMapSearchTriggered] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [vegOnly, setVegOnly] = useState(false);
  
  // New UI States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [filters, setFilters] = useState({
    distance: 10,
    type: 'all',
    surplus: true,
    ngos: true,
    volunteers: true
  });

  // NGO Filters
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      });
    }
    // Fetch Real Donations for Map/List
    fetch('/api/get-available-donations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRealDonations(data);
      });
    
    // Fetch Partners (Restaurants, NGOs, Volunteers)
    fetch('/api/partners')
      .then(res => res.json())
      .then(data => {
        if (data) {
            setPartners(data);
        }
      });
  }, []);

  const handleMapSearch = () => {
    setMapSearchTriggered(true);
  };

  useEffect(() => {
    setSelectedMarker(null);
  }, [filters, vegOnly, searchQuery, selectedState, selectedCity]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const filteredRestaurants = partners.restaurants.filter(res => {
    const matchSearch = searchQuery === '' || 
      (res.address && res.address.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (res.name && res.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (res.organizationName && res.organizationName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchState = !mapSearchTriggered || selectedState === '' || (res.address && res.address.toLowerCase().includes(selectedState.toLowerCase()));
    const matchCity = !mapSearchTriggered || selectedCity === '' || (res.address && res.address.toLowerCase().includes(selectedCity.toLowerCase()));
    return matchSearch && matchState && matchCity;
  });

  const filteredNgos = partners.ngos.filter(ngo => 
    (filterState === '' || (ngo.address && ngo.address.includes(filterState))) &&
    (filterDistrict === '' || (ngo.address && ngo.address.toLowerCase().includes(filterDistrict.toLowerCase()))) &&
    (searchQuery === '' || (ngo.address && ngo.address.toLowerCase().includes(searchQuery.toLowerCase())) || (ngo.name && ngo.name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Camera access denied");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setVerifyForm(prev => ({ ...prev, photo: dataUrl }));
      stopCamera();
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyModal) return;

    if (!verifyForm.photo) {
      toast.error("Photo proof is required!");
      return;
    }

    try {
      const res = await fetch('/api/verify-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId: verifyModal._id || verifyModal.id,
          ngoId: user.uid,
          ...verifyForm
        })
      });
      if (!res.ok) throw new Error('Verification failed');
      toast.success('Donation Verified & Rated!');
      setVerifyModal(null);
      // Refresh donations
      fetch('/api/get-available-donations')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setRealDonations(data); });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleViewOnMap = (item) => {
    if (item.lat && item.lng) {
      setCurrentLocation({ lat: item.lat, lng: item.lng });
      setSelectedMarker(item);
      setView('map');
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      toast.error("Location coordinates not available");
    }
  };

  // Combine markers for the map
  const mapMarkers = [
    ...(filters.surplus ? filteredRestaurants.filter(r => r.lat && r.lng).map(r => ({ ...r, type: 'restaurant' })) : []),
    ...(filters.surplus ? realDonations.filter(d => d.lat && d.lng).map(d => ({ ...d, type: 'donation' })) : [])
  ].filter(m => {
    if (vegOnly) {
       const type = (m.foodType || m.foodTypeOffered || '').toLowerCase();
       return type.includes('veg') && !type.includes('non');
    }
    return true;
  });

  return (
    <>
      <Head>
        {/* Leaflet CSS */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </Head>
      <Header />
      <main className="py-8 px-4 max-w-7xl mx-auto min-h-screen">
        
        {/* 🔝 Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-2">Refoodify Discovery</h1>
          <p className="text-gray-500 text-lg">Discover surplus food, NGOs and volunteering opportunities near you</p>
        </div>


        {/*  Discovery Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {[
            { id: 'map', label: 'Map View', icon: <MapPinIcon className="w-5 h-5" /> },
            { id: 'list', label: 'List View', icon: <ListBulletIcon className="w-5 h-5" /> },
            { id: 'ngos', label: 'NGOs', icon: <BuildingOfficeIcon className="w-5 h-5" /> },
            { id: 'stories', label: 'Stories', icon: <BookOpenIcon className="w-5 h-5" /> },
            { id: 'volunteers', label: 'Volunteers', icon: <UserGroupIcon className="w-5 h-5" /> }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setView(tab.id)} 
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                view === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-green-200 scale-105' 
                : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar (Common for Map & List) */}
        {(view === 'map' || view === 'list') && (
          <div className="mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by city, area, food type..." 
                  className="flex-1 bg-transparent border-none outline-none px-3 text-sm font-medium text-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>
        )}

        {/* --- MAP VIEW (Split Layout) --- */}
        <div className={view === 'map' ? 'grid grid-cols-1 lg:grid-cols-5 gap-8' : 'hidden'}>
          {/* Left Column: Map (Sticky) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white h-[600px]">
                {/* Locate Me Button */}
                <button 
                  onClick={() => navigator.geolocation.getCurrentPosition(pos => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }))}
                  className="absolute bottom-6 right-4 z-[1000] bg-white p-3 rounded-full shadow-xl border border-gray-200 hover:bg-gray-50 transition-all text-gray-700"
                  title="Show Your Location"
                >
                  <MapPinIcon className="w-6 h-6" />
                </button>

                {/* Map Component */}
                <Map 
                  center={currentLocation} 
                  markers={mapMarkers} 
                  selectedMarker={selectedMarker} 
                  setSelectedMarker={setSelectedMarker}
                  radius={searchRadius}
                >
                  {selectedMarker && (
                  <div className="p-2 min-w-[200px]">
                          <h3 className="font-bold text-gray-800 text-lg mb-1">{selectedMarker.name || selectedMarker.foodType}</h3>
                          <p className="text-sm text-gray-600 mb-1">🍱 {selectedMarker.foodType || 'Surplus Food'}</p>
                          <p className="text-sm text-gray-600 mb-2">📦 {selectedMarker.quantity}</p>
                          <p className="text-xs text-gray-400 mb-3">📍 {selectedMarker.location}</p>
                          <p className="text-xs text-blue-500 font-bold mb-3">📏 {calculateDistance(currentLocation.lat, currentLocation.lng, selectedMarker.lat, selectedMarker.lng)} km away</p>
                          
                          {selectedMarker.foodType ? (
                            user?.userType === 'ngo' ? (
                              <button onClick={() => { setVerifyModal(selectedMarker); setSelectedMarker(null); }} className="w-full bg-primary text-white py-2 rounded-lg text-xs font-bold">Verify & Pickup</button>
                            ) : (
                              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedMarker.location)}`} target="_blank" className="block text-center w-full bg-blue-500 text-white py-2 rounded-lg text-xs font-bold">Navigate</a>
                            )
                          ) : (
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.lat},${selectedMarker.lng}`} target="_blank" className="block text-center w-full bg-green-500 text-white py-2 rounded-lg text-xs font-bold">Navigate</a>
                          )}
                  </div>
                  )}
                </Map>
              </div>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-3 space-y-6">
             {/* Location Filters inside Map View */}
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)} 
                className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50"
              >
                <option value="">All States</option>
                {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
              <input 
                type="text" 
                placeholder="Enter City (e.g. Gorakhpur)" 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)} 
                className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50" 
              />
              <button onClick={handleMapSearch} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-md">
                Search
              </button>
              </div>

              {/* Advanced Map Filters */}
              <div className="flex flex-col md:flex-row items-center gap-6 pt-4 border-t border-gray-100">
                 <div className="flex-1 w-full">
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                      <span>Search Radius</span>
                      <span>{searchRadius} km</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      value={searchRadius} 
                      onChange={(e) => setSearchRadius(Number(e.target.value))} 
                      className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                 </div>
                 <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300" />
                      <span className="text-sm font-bold text-gray-700">Veg Only</span>
                    </label>
                 </div>
              </div>
            </div>

             <div className="grid grid-cols-1 gap-6">
                {/* Real Donations First */}
                {realDonations.map(res => (
                  <div key={res.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col sm:flex-row">
                    <div className="h-40 sm:h-auto sm:w-40 bg-gray-200 relative">
                      <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=500&q=60" alt="Food" className="w-full h-full object-cover" />
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md animate-pulse">Live</span>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-gray-800">{res.foodType}</h3>
                        <span className="text-xs font-bold text-gray-400">0.5 km</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {res.location}</p>
                      
                      <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1"><ClockIcon className="w-3 h-3 text-orange-500" /> 2h left</div>
                        <div className="flex items-center gap-1"><CheckBadgeIcon className="w-3 h-3 text-blue-500" /> Verified</div>
                      </div>

                      <div className="flex gap-2">
                      <button onClick={() => handleViewOnMap(res)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold hover:bg-blue-100 transition-all text-xs">🗺 Map</button>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(res.location)}`} target="_blank" className="flex-1 text-center border border-primary text-primary py-2 rounded-lg font-bold hover:bg-green-50 text-xs">
                        📍 Navigate
                      </a>
                      {user?.userType === 'ngo' && (
                        <button onClick={() => setVerifyModal(res)} className="flex-1 bg-primary text-white py-2 rounded-lg font-bold shadow-lg hover:bg-green-600 text-xs">
                          ✅ Verify
                        </button>
                      )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredRestaurants.map(res => (
                  <div key={res._id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col sm:flex-row">
                    <div className="h-40 sm:h-auto sm:w-40 bg-gray-200 relative">
                      <img src={res.photoURL || `https://source.unsplash.com/random/500x300/?restaurant,food&sig=${res._id}`} alt="Restaurant" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{res.organizationName || res.name || 'Restaurant'}</h3>
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {res.address || 'Location not added'}</p>
                      <div className="bg-orange-50 p-2 rounded-lg mb-3 inline-block">
                        <p className="text-[10px] font-bold text-orange-600 uppercase">Hours: {res.workingHours || 'N/A'}</p>
                      </div>
                      
                      {res.lat && res.lng ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleViewOnMap(res)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold hover:bg-blue-100 transition-all text-xs">🗺 Map</button>
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lng}`} target="_blank" className="flex-1 text-center border border-primary text-primary py-2 rounded-lg font-bold hover:bg-green-50 text-xs flex items-center justify-center gap-1">📍 Navigate</a>
                        </div>
                      ) : (
                        <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                          <p className="text-red-600 text-[10px] font-bold flex items-center gap-1 mb-1">
                            <ExclamationTriangleIcon className="w-3 h-3" /> No Map Loc
                          </p>
                          <a href={`tel:${res.phone}`} className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition-all"><PhoneIcon className="w-3 h-3" /> Call</a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>

        {/* --- LIST VIEW (Grid Layout) --- */}
        <div className={view === 'list' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'hidden'}>
          {realDonations.map(res => (
            <div key={res.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
              <div className="h-40 bg-gray-200 relative">
                <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=500&q=60" alt="Food" className="w-full h-full object-cover" />
                <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">Live</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{res.foodType}</h3>
                  <span className="text-xs font-bold text-gray-400">0.5 km</span>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {res.location}</p>
                
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1"><ClockIcon className="w-4 h-4 text-orange-500" /> 2h left</div>
                  <div className="flex items-center gap-1"><CheckBadgeIcon className="w-4 h-4 text-blue-500" /> Verified</div>
                </div>

                <div className="flex gap-2">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(res.location)}`} target="_blank" className="text-center border border-primary text-primary py-2 rounded-xl font-bold hover:bg-green-50">
                  📍 Navigate
                </a>
                {user?.userType === 'ngo' && (
                  <button onClick={() => setVerifyModal(res)} className="flex-1 bg-primary text-white py-2 rounded-xl font-bold shadow-lg hover:bg-green-600">
                    ✅ Verify & Rate
                  </button>
                )}
                </div>
              </div>
            </div>
          ))}
          {filteredRestaurants.map(res => (
            <div key={res._id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
              <div className="h-40 bg-gray-200 relative">
                 <img src={res.photoURL || `https://source.unsplash.com/random/500x300/?restaurant,food&sig=${res._id}`} alt="Restaurant" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{res.organizationName || res.name || 'Restaurant'}</h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {res.address || 'Location not added'}</p>
                <div className="bg-orange-50 p-3 rounded-xl mb-4">
                  <p className="text-xs font-bold text-orange-600 uppercase mb-1">Working Hours</p>
                  <p className="font-medium text-gray-800">{res.workingHours || 'Not specified'}</p>
                </div>
                
                {res.lat && res.lng ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleViewOnMap(res)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all text-sm">🗺 View on Map</button>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lng}`} target="_blank" className="flex-1 text-center border border-primary text-primary py-2 rounded-xl font-bold hover:bg-green-50 text-sm flex items-center justify-center gap-1">📍 Navigate</a>
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <p className="text-red-600 text-xs font-bold flex items-center gap-1 mb-2">
                      <ExclamationTriangleIcon className="w-4 h-4" /> Location not on map
                    </p>
                    <p className="text-sm text-gray-700 font-medium mb-1">{res.address || 'Address not available'}</p>
                    <p className="text-sm text-gray-500 font-mono mb-3">{res.phone}</p>
                    <a href={`tel:${res.phone}`} className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-all"><PhoneIcon className="w-4 h-4" /> Call Hotel</a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
            {/* --- 3. NGO FINDER --- */}
            <div className={view === 'ngos' ? 'block' : 'hidden'}>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 gap-4 mb-8">
                <select onChange={(e) => setFilterState(e.target.value)} className="p-3 border rounded-xl outline-none">
                  <option value="">Select State</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Bihar">Bihar</option>
                </select>
                <input type="text" placeholder="District..." onChange={(e) => setFilterDistrict(e.target.value)} className="p-3 border rounded-xl outline-none"/>
                <input type="text" placeholder="City/Village..." onChange={(e) => setSearchCity(e.target.value)} className="p-3 border rounded-xl outline-none"/>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {filteredNgos.map(ngo => (
                  <div key={ngo._id} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600">
                      {ngo.name ? ngo.name[0] : 'N'}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-800">{ngo.organizationName || ngo.name}</h3>
                        <CheckBadgeIcon className="w-5 h-5 text-blue-500" title="Verified NGO" />
                      </div>
                      <p className="text-gray-500 text-sm mb-3">{ngo.address || 'Location not provided'}</p>
                      <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-medium text-gray-600">
                        <span>❤️ {ngo.points || 0} Points</span>
                        <span>⭐ {ngo.rating ? ngo.rating.toFixed(1) : '0.0'} ({ngo.ratingCount || 0})</span>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedNgo(ngo); setIsModalOpen(true); setIsSuccess(false); }} className="bg-purple-50 text-purple-600 p-3 rounded-xl hover:bg-purple-100 transition-all">
                      <ChatBubbleLeftRightIcon className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* --- 4. STORIES --- */}
            <div className={view === 'stories' ? 'grid grid-cols-1 gap-8' : 'hidden'}>
              {successStories.map(story => (
                <div key={story.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                  <div className="h-48 bg-gray-200">
                    <img src={`https://source.unsplash.com/random/600x400/?community,food&sig=${story.id}`} alt="Story" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{story.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">"{story.content}"</p>
                    <div className="flex justify-between items-center border-t pt-4">
                      <p className="text-sm font-bold text-primary">By {story.author}</p>
                      <button className="text-sm font-bold text-gray-400 hover:text-gray-600">Read More →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- 5. VOLUNTEERS (NEW) --- */}
            <div className={view === 'volunteers' ? 'grid grid-cols-1 gap-6' : 'hidden'}>
              {partners.volunteers.map(vol => (
                <div key={vol._id} className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-orange-500 hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase">{vol.role || 'Volunteer'}</span>
                    <span className="text-xs font-bold text-gray-400">{new Date(vol.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{vol.volunteerName}</h3>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><MapPinIcon className="w-4 h-4" /> {vol.city || 'City not specified'}</p>
                  <p className="text-sm text-gray-500 mb-6 flex items-center gap-2"><UserGroupIcon className="w-4 h-4" /> Vehicle: {vol.vehicle || 'No'}</p>
                  <button onClick={() => { setSelectedVolunteer(vol); setShowConnectModal(true); }} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all">Connect</button>
                </div>
              ))}
            </div>
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

        {/* --- CONNECT MODAL (Volunteer) --- */}
        {showConnectModal && selectedVolunteer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-popIn relative">
              <button onClick={() => setShowConnectModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
                  👤
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-1">{selectedVolunteer.volunteerName}</h3>
                <p className="text-gray-500 font-medium text-sm mb-8">{selectedVolunteer.role || 'Volunteer'}</p>
                
                <div className="space-y-4">
                  <a href={`tel:${selectedVolunteer.volunteerPhone}`} className="flex items-center justify-center gap-3 w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg">
                    <FaPhone className="text-lg" /> Call Now
                  </a>
                  <a href={`https://wa.me/${selectedVolunteer.volunteerPhone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg">
                    <FaWhatsapp className="text-2xl" /> WhatsApp
                  </a>
                </div>
                
                <p className="text-xs text-gray-400 mt-6 font-mono bg-gray-50 py-2 rounded-lg">{selectedVolunteer.volunteerPhone}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- VERIFY MODAL --- */}
        {verifyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-bounceIn">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Verify Donation</h2>
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Quality Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={verifyForm.rating} onChange={e => setVerifyForm({...verifyForm, rating: e.target.value})} className="w-full p-3 border rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Review / Note</label>
                  <textarea value={verifyForm.review} onChange={e => setVerifyForm({...verifyForm, review: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Food quality was..." required />
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 text-center">
                  <label className="block text-sm font-bold text-gray-500 mb-2">Photo Proof (Camera Only)</label>
                  
                  {!isCameraOpen && !verifyForm.photo && (
                    <button type="button" onClick={startCamera} className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-600">
                      📸 Open Camera
                    </button>
                  )}

                  {isCameraOpen && (
                    <div className="relative overflow-hidden rounded-xl bg-black">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover"></video>
                      <button type="button" onClick={capturePhoto} className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black w-12 h-12 rounded-full border-4 border-gray-300 shadow-lg"></button>
                      <button type="button" onClick={stopCamera} className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-1">✕</button>
                    </div>
                  )}

                  {verifyForm.photo && (
                    <div className="relative">
                      <img src={verifyForm.photo} alt="Proof" className="w-full h-48 object-cover rounded-xl" />
                      <button type="button" onClick={() => setVerifyForm(prev => ({ ...prev, photo: '' }))} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Retake</button>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setVerifyModal(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">Submit Verification</button>
                </div>
              </form>
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