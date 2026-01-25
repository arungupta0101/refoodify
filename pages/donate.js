import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { 
  HeartIcon, 
  CurrencyRupeeIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon, 
  MapPinIcon, 
  ClockIcon, 
  PhotoIcon,
  CheckBadgeIcon,
  TruckIcon,
  TrophyIcon,
  FireIcon,
  CalendarDaysIcon,
  HandThumbUpIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

export default function Donate() {
  const { user } = useAuth();
  const router = useRouter();
  const [donationType, setDonationType] = useState('food');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userStats, setUserStats] = useState({ peopleFed: 0, foodSaved: 0, co2Reduced: 0 });
  const [emergencyNeeds, setEmergencyNeeds] = useState([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);

  // Safety Checks State
  const [safetyChecks, setSafetyChecks] = useState({
    fresh: false,
    notExpired: false
  });

  const [formData, setFormData] = useState({
    foodType: 'Veg', 
    foodItem: '',
    quantity: '', 
    location: '', 
    expiryDate: '',
    amount: '', 
    volunteerName: '', 
    volunteerEmail: '', 
    volunteerPhone: '',
    // Extra fields for UI (may not be persisted by backend yet)
    city: '',
    vehicle: 'no',
    availability: '',
    role: 'pickup'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    if (user) {
      setCurrentPoints(user.points || 0);
      const fetchData = async () => {
        try {
          // 1. Fetch User Stats
          const statsRes = await fetch(`/api/donations?userId=${user.uid}`);
          if (statsRes.ok) {
            const data = await statsRes.json();
            const foodDonations = data.filter(d => d.type === 'food').length;
            setUserStats({
              peopleFed: foodDonations * 5,
              foodSaved: foodDonations * 2,
              co2Reduced: foodDonations * 1
            });
          }

          // 2. Fetch User Profile for Address & Filter Emergency Needs
          const profileRes = await fetch(`/api/user/profile?uid=${user.uid}`);
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (profile.points !== undefined) setCurrentPoints(profile.points);
            const userAddress = profile.address ? profile.address.toLowerCase() : '';

            if (userAddress) {
              const emergencyRes = await fetch('/api/emergency');
              if (emergencyRes.ok) {
                const needs = await emergencyRes.json();
                if (Array.isArray(needs)) {
                  // Filter: Show only if user address matches need location (Case Insensitive)
                  const filtered = needs.filter(need => {
                    const needLoc = need.location ? need.location.toLowerCase() : '';
                    return needLoc && (userAddress.includes(needLoc) || needLoc.includes(userAddress));
                  });
                  setEmergencyNeeds(filtered);
                }
              }
            } else {
              setEmergencyNeeds([]); // No address, no emergency shown
            }
          }
        } catch (err) {
          console.error("Failed to fetch data", err);
        }
      };
      fetchData();
    } else {
      setEmergencyNeeds([]);
    }
  }, [user]);

  // Offline Sync Effect
  useEffect(() => {
    const syncOfflineDonations = async () => {
      if (navigator.onLine && user) {
        const offlineDonations = JSON.parse(localStorage.getItem('offline_donations') || '[]');
        if (offlineDonations.length > 0) {
          const toastId = toast.loading(`Syncing ${offlineDonations.length} offline donations...`);
          let successCount = 0;
          const remaining = [];
          
          for (const donation of offlineDonations) {
            try {
               const res = await fetch('/api/donations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(donation)
               });
               if (res.ok) successCount++;
               else remaining.push(donation);
            } catch (e) {
               remaining.push(donation);
            }
          }

          localStorage.setItem('offline_donations', JSON.stringify(remaining));
          if (successCount > 0) toast.success(`Synced ${successCount} donations!`, { id: toastId });
          else if (remaining.length === 0) toast.dismiss(toastId);
        }
      }
    };
    window.addEventListener('online', syncOfflineDonations);
    syncOfflineDonations();
    return () => window.removeEventListener('online', syncOfflineDonations);
  }, [user]);

  const generateReferenceNumber = () => `REF-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser.");
      return;
    }

    // Show guide immediately
    setIsListening(true);
    setShowVoiceGuide(true);
    setTimeout(() => setShowVoiceGuide(false), 8000);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onend = () => { setIsListening(false); setShowVoiceGuide(false); };
    recognition.onerror = () => { setIsListening(false); setShowVoiceGuide(false); };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      toast.success(`Heard: "${transcript}"`);
      processVoiceCommand(transcript);
    };

    recognition.start();
  };

  const processVoiceCommand = (text) => {
    const lower = text.toLowerCase();
    let updates = {};

    // Hindi Number Mapping
    const hindiNumbers = {
      'ek': '1', 'do': '2', 'teen': '3', 'char': '4', 'paanch': '5', 'che': '6', 'chah': '6', 'saat': '7', 'aath': '8', 'nau': '9', 'das': '10',
      'gyarah': '11', 'barah': '12', 'bees': '20', 'pachas': '50', 'sau': '100'
    };

    let processedText = lower;
    Object.keys(hindiNumbers).forEach(key => {
        processedText = processedText.replace(new RegExp(`\\b${key}\\b`, 'g'), hindiNumbers[key]);
    });
    
    // 1. Extract Quantity (e.g., "10 plates", "5 kg")
    const qtyMatch = processedText.match(/(\d+)\s*(plates?|kg|meals?|packets?|servings?|people|logo|thali)?/);
    let textWithoutQty = processedText;
    if (qtyMatch) {
      updates.quantity = `${qtyMatch[1]} ${qtyMatch[2] || ''}`.trim();
      textWithoutQty = textWithoutQty.replace(qtyMatch[0], '').trim();
    }

    // 2. Extract Location (after "near", "in", "at")
    // Hindi: "Gorakhpur me" -> capture "Gorakhpur"
    const hindiLocMatch = textWithoutQty.match(/(.+?)\s+(?:me|mein|ke\s+pass)/);
    const engLocMatch = textWithoutQty.match(/(?:near|in|at)\s+(.+)/);

    let locRaw = hindiLocMatch ? hindiLocMatch[1] : (engLocMatch ? engLocMatch[1] : '');

    if (locRaw) {
      locRaw = locRaw.replace(/(?:donate|kro|karna|hai|chahiye|bhejo|ka|ki).*/g, '').trim();
      updates.location = locRaw.replace(/[.,!]*$/, '');
      updates.city = updates.location.split(' ')[0];
    }

    // 3. Extract Food Item (Heuristic: Remove quantity and location keywords)
    let desc = processedText;
    if (qtyMatch) desc = desc.replace(qtyMatch[0], '');
    if (updates.location) desc = desc.replace(updates.location, '');
    desc = desc.replace(/donate|i want to|please|food|is|near|in|at|me|mein|ke pass|kro|karna|hai|ko|chahiye|bhejo|ka|ki/g, '').trim();
    desc = desc.replace(/\d+/g, '').trim();
    if (desc) updates.foodItem = desc.charAt(0).toUpperCase() + desc.slice(1);

    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first');
      return router.push('/login');
    }

    if (donationType === 'food' && (!safetyChecks.fresh || !safetyChecks.notExpired)) {
      toast.error('Please confirm food safety checks.');
      return;
    }

    setIsSubmitting(true);

    // Offline Handling
    if (!navigator.onLine) {
        let payload = {};
        if (donationType === 'volunteer') {
            const refNum = generateReferenceNumber();
            payload = { ...formData, userId: user.uid, referenceNumber: refNum, type: 'volunteer' };
            setReferenceNumber(refNum);
            setShowSuccessModal(true);
        } else {
            const typeToSend = donationType === 'emergency' ? 'food' : donationType;
            payload = { ...formData, donorId: user.uid, type: typeToSend, isEmergency: donationType === 'emergency' };
        }

        const offlineDonations = JSON.parse(localStorage.getItem('offline_donations') || '[]');
        offlineDonations.push(payload);
        localStorage.setItem('offline_donations', JSON.stringify(offlineDonations));
        
        setIsSubmitting(false);
        toast.success('Saved offline! Will sync when internet returns.');
        return;
    }

    try {
      console.log("Submitting donation for User UID:", user.uid);
      if (donationType === 'volunteer') {
        const refNum = generateReferenceNumber();
        const res = await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, userId: user.uid, referenceNumber: refNum, type: 'volunteer' })
        });
        if (!res.ok) throw new Error('Failed to register');
        const data = await res.json();
        setReferenceNumber(refNum);
        setShowSuccessModal(true);
        if (data.pointsEarned) {
          toast.success(`You earned ${data.pointsEarned} points!`);
          setCurrentPoints(prev => prev + data.pointsEarned);
        }
      } else {
        // Food/Money Logic
        const typeToSend = donationType === 'emergency' ? 'food' : donationType; // Fallback or specific
        
        const res = await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, donorId: user.uid, type: typeToSend, isEmergency: donationType === 'emergency' })
        });
        if (!res.ok) throw new Error('Failed to donate');
        const data = await res.json();
        toast.success(`${donationType} donation successful!`);
        if (data.pointsEarned) {
          toast.success(`You earned ${data.pointsEarned} points!`);
          setCurrentPoints(prev => prev + data.pointsEarned);
        }
      }
    } catch (error) {
      console.error("Donation Submission Error:", error);
      toast.error('Submission failed. Check Console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'food', label: 'Donate Food', icon: <HeartIcon className="w-5 h-5" />, color: 'bg-green-500', activeColor: 'ring-green-500 text-green-600 bg-green-50' },
    { id: 'money', label: 'Donate Money', icon: <CurrencyRupeeIcon className="w-5 h-5" />, color: 'bg-blue-500', activeColor: 'ring-blue-500 text-blue-600 bg-blue-50' },
    { id: 'emergency', label: 'Emergency Help', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'bg-red-500', activeColor: 'ring-red-500 text-red-600 bg-red-50' },
    { id: 'volunteer', label: 'Join as Volunteer', icon: <UserGroupIcon className="w-5 h-5" />, color: 'bg-orange-500', activeColor: 'ring-orange-500 text-orange-600 bg-orange-50' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* 🔝 Top Action Tabs Section */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">Make a Difference Today</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDonationType(tab.id)}
                  className={`flex items-center justify-center gap-2 py-4 px-6 rounded-full font-bold transition-all duration-300 shadow-sm hover:shadow-md ${
                    donationType === tab.id 
                      ? `${tab.activeColor} ring-2 ring-offset-2` 
                      : 'bg-white text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Forms */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative">
                
                {/* 🍱 Food Donation Section */}
                {(donationType === 'food' || donationType === 'emergency') && (
                  <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                      <div className={`p-3 rounded-xl ${donationType === 'emergency' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {donationType === 'emergency' ? <ExclamationTriangleIcon className="w-8 h-8" /> : <HeartIcon className="w-8 h-8" />}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800">{donationType === 'emergency' ? 'Emergency Relief' : 'Donate Surplus Food'}</h2>
                        <p className="text-gray-500 text-sm">Share your meal, share the love.</p>
                      </div>
                      <div className="relative flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => setVoiceLang(voiceLang === 'en-US' ? 'hi-IN' : 'en-US')}
                          className="text-xs font-bold px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                          title="Switch Language"
                        >
                          {voiceLang === 'en-US' ? 'EN' : 'HI'}
                        </button>
                        <button type="button" onClick={startListening} className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400' : 'bg-gray-100 text-gray-600 hover:bg-green-500 hover:text-white'}`} title="Voice Fill">
                          <MicrophoneIcon className="w-6 h-6" />
                        </button>
                        {showVoiceGuide && (
                          <div className="absolute bottom-full mb-2 right-0 w-64 bg-gray-900 text-white text-xs p-3 rounded-xl shadow-xl z-50 animate-bounceIn">
                            <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-gray-900 rotate-45"></div>
                            <p className="font-bold mb-1">🎤 Try saying:</p>
                            <p className="italic text-gray-300 mb-1">"{voiceLang === 'en-US' ? 'Donate 5kg Rice in Delhi' : 'Char plate rice Gorakhpur me donate kro'}"</p>
                            <p className="text-[10px] text-gray-400">Listening...</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Food Type Toggle */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Food Type</label>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                          {['Veg', 'Non-Veg'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData({...formData, foodType: type})}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.foodType === type ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Food Item Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Food Item</label>
                        <input 
                          type="text" 
                          name="foodItem" 
                          placeholder="e.g. Rice, Curry, Bread" 
                          value={formData.foodItem}
                          onChange={handleChange} 
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Quantity (People/Kg)</label>
                        <input 
                          type="text" 
                          name="quantity" 
                          value={formData.quantity}
                          placeholder="e.g. 50 meals or 10kg" 
                          onChange={handleChange} 
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                          required 
                        />
                      </div>

                      {/* Freshness Time */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Freshness / Expiry</label>
                        <div className="relative">
                          <ClockIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <input 
                            type="datetime-local" 
                            name="expiryDate" 
                            value={formData.expiryDate}
                            onChange={handleChange} 
                            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            required 
                          />
                        </div>
                      </div>

                      {/* City (For NGO Notification) */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">City</label>
                        <input type="text" name="city" value={formData.city} placeholder="e.g. Gorakhpur" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" required />
                      </div>

                      {/* Pickup Address */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Pickup Location</label>
                        <div className="relative">
                          <MapPinIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <input 
                            type="text" 
                            name="location" 
                            value={formData.location}
                            placeholder="Enter full address" 
                            onChange={handleChange} 
                            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            required 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <PhotoIcon className="w-6 h-6" />
                      </div>
                      <p className="text-gray-600 font-medium">Drag & Drop food images here</p>
                      <p className="text-xs text-gray-400 mt-1">or click to browse (Optional)</p>
                    </div>

                    {/* Safety Checkboxes */}
                    <div className="bg-green-50 p-4 rounded-xl space-y-3">
                      <h3 className="font-bold text-green-800 text-sm uppercase tracking-wide mb-2">Food Safety Confirmation</h3>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={safetyChecks.fresh}
                          onChange={(e) => setSafetyChecks({...safetyChecks, fresh: e.target.checked})}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300" 
                        />
                        <span className="text-gray-700 text-sm">Food is fresh, hygienic, and packed properly.</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={safetyChecks.notExpired}
                          onChange={(e) => setSafetyChecks({...safetyChecks, notExpired: e.target.checked})}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300" 
                        />
                        <span className="text-gray-700 text-sm">Food is within consumption time limits.</span>
                      </label>
                    </div>

                    <button type="submit" className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all ${donationType === 'emergency' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'}`}>
                      {donationType === 'emergency' ? 'Send Emergency Help' : 'Donate Now'}
                    </button>
                  </form>
                )}

                {/* 💰 Donate Money Section */}
                {donationType === 'money' && (
                  <div className="space-y-8 animate-fadeIn text-center">
                    <div className="flex flex-col items-center gap-3 mb-6 border-b pb-4">
                      <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                        <CurrencyRupeeIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Support Financially</h2>
                        <p className="text-gray-500 text-sm">Your contribution fuels our logistics.</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                        <h3 className="text-2xl font-bold text-blue-800 mb-4">Feature Coming Soon! 🚀</h3>
                        <p className="text-gray-600 mb-6">
                            We are currently integrating a secure payment gateway. <br/>
                            In the meantime, you can support us by scanning the QR code below.
                        </p>
                        
                        <div className="bg-white p-4 inline-block rounded-2xl shadow-lg border border-gray-200 mb-4">
                            <img src="/qr.jpg" alt="Donate QR Code" className="w-64 h-64 object-contain" />
                        </div>
                        <p className="text-sm font-bold text-gray-500">Scan with any UPI App</p>
                    </div>
                  </div>
                )}

                {/* 🤝 Volunteer Registration Section */}
                {donationType === 'volunteer' && (
                  <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                      <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                        <HandThumbUpIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Join the Force</h2>
                        <p className="text-gray-500 text-sm">Become a hero in your community.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Full Name</label>
                        <input type="text" name="volunteerName" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Mobile Number</label>
                        <input type="tel" name="volunteerPhone" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">Email Address</label>
                        <input type="email" name="volunteerEmail" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">City / Area</label>
                        <input type="text" name="city" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600">Preferred Role</label>
                      <select name="role" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                        <option value="pickup">Food Pickup & Delivery</option>
                        <option value="distribution">Food Distribution</option>
                        <option value="awareness">Awareness Campaign</option>
                        <option value="emergency">Emergency Response</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-xl">
                      <TruckIcon className="w-6 h-6 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700">Do you have a vehicle?</p>
                        <p className="text-xs text-gray-500">Helps in faster pickups.</p>
                      </div>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="vehicle" value="yes" onChange={handleChange} className="text-orange-600 focus:ring-orange-500" />
                          <span className="text-sm font-medium">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="vehicle" value="no" onChange={handleChange} className="text-orange-600 focus:ring-orange-500" defaultChecked />
                          <span className="text-sm font-medium">No</span>
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 hover:shadow-xl transform hover:-translate-y-1 transition-all">
                      Join as Volunteer
                    </button>
                  </form>
                )}

              </div>
            </div>

            {/* 📊 Right Side Info Panel */}
            <div className="space-y-6">
              
              {!user ? (
                <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserGroupIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-xl mb-3">Track Your Impact</h3>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    Login to view your donation history, earned points, and badges. Join the community to make a bigger difference!
                  </p>
                  <button 
                    onClick={() => router.push('/login')} 
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-all"
                  >
                    Login to View Stats
                  </button>
                </div>
              ) : (
                <>
                  {/* Impact Card */}
                  <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <CheckBadgeIcon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">Your Impact</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 text-sm font-medium">People Fed</span>
                      <span className="text-green-600 font-bold text-xl">{userStats.peopleFed}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 text-sm font-medium">Food Saved</span>
                      <span className="text-blue-600 font-bold text-xl">{userStats.foodSaved}kg</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500 text-sm font-medium">CO₂ Reduced</span>
                      <span className="text-gray-800 font-bold text-xl">{userStats.co2Reduced}kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Rewards Card */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-lg p-6 border border-yellow-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-yellow-200 rounded-lg text-yellow-700">
                        <TrophyIcon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">Rewards</h3>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm font-bold text-gray-600 mb-1">
                        <span>Points</span>
                        <span>{currentPoints} / 1000</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                        <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${Math.min(currentPoints / 10, 100)}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Earn 50 more points to unlock Silver Badge!</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full">Bronze</span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-500 text-xs font-bold rounded-full opacity-50">Silver</span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-500 text-xs font-bold rounded-full opacity-50">Gold</span>
                    </div>
                  </div>

                  {/* Point Rules Card */}
                  <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
                    <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                        <span>✨</span> Earning Rules
                    </h4>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                            <span className="text-gray-600 font-medium text-sm">Donate Food</span> 
                            <span className="font-bold text-green-600 bg-white px-2 py-1 rounded-lg shadow-sm text-xs">+10 pts</span>
                        </li>
                        <li className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                            <span className="text-gray-600 font-medium text-sm">Emergency Help</span> 
                            <span className="font-bold text-red-600 bg-white px-2 py-1 rounded-lg shadow-sm text-xs">+20 pts</span>
                        </li>
                        <li className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                            <span className="text-gray-600 font-medium text-sm">Donate Money</span> 
                            <span className="font-bold text-blue-600 bg-white px-2 py-1 rounded-lg shadow-sm text-xs">1 pt / ₹10</span>
                        </li>
                         <li className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                            <span className="text-gray-600 font-medium text-sm">Volunteer</span> 
                            <span className="font-bold text-orange-600 bg-white px-2 py-1 rounded-lg shadow-sm text-xs">+20 pts</span>
                        </li>
                    </ul>
                  </div>

                  {/* Volunteer Impact (Only visible if volunteer tab active) */}
                  {donationType === 'volunteer' && (
                    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 animate-fadeIn">
                      <h3 className="font-bold text-gray-800 text-lg mb-4">Volunteer Stats</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-orange-50 rounded-xl">
                          <p className="text-2xl font-bold text-orange-600">12</p>
                          <p className="text-xs text-gray-500">Drives</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-xl">
                          <p className="text-2xl font-bold text-orange-600">48</p>
                          <p className="text-xs text-gray-500">Hours</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>

          {/* ⬇ Bottom Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Quick Donate Money Card */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Instant Impact</h3>
                <p className="text-gray-500 text-sm mb-6">Even ₹100 can feed a family for a day.</p>
                <div className="flex gap-3 mb-6">
                  {[100, 500, 1000].map(amt => (
                    <button key={amt} onClick={() => { setDonationType('money'); setFormData({...formData, amount: amt}); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="flex-1 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all">
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => { setDonationType('money'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="w-full py-3 border-2 border-blue-500 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all">
                Donate Money
              </button>
            </div>

            {/* Emergency Help Card */}
            <div className="bg-red-50 rounded-3xl shadow-lg p-8 border border-red-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FireIcon className="w-32 h-32 text-red-600" />
              </div>
              <div className="relative z-10">
                {emergencyNeeds.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase animate-pulse">Urgent</span>
                      <span className="text-red-600 font-bold text-sm">{emergencyNeeds[0].title}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{emergencyNeeds[0].requiredMeals} Meals Needed Immediately</h3>
                    <p className="text-gray-600 text-sm mb-6">{emergencyNeeds[0].description}</p>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">
                          {Math.max(0, Math.ceil((new Date(emergencyNeeds[0].expiresAt) - new Date()) / (1000 * 60 * 60)))}
                        </p>
                        <p className="text-xs text-gray-500">Hours Left</p>
                      </div>
                      <div className="h-8 w-[1px] bg-gray-300"></div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{emergencyNeeds[0].raisedMeals}</p>
                        <p className="text-xs text-gray-500">Meals Raised</p>
                      </div>
                    </div>

                    <button onClick={() => { setDonationType('emergency'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all">
                      Help Now
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Emergency Needs</h3>
                    <p className="text-gray-600 text-sm">Currently, there are no urgent SOS requests. You can still donate food or money to help!</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* --- 🍔 FOOD LOADING MODAL --- */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="text-6xl animate-spin duration-[3000ms]">🥗</div>
            <div className="absolute -top-6 -left-6 text-4xl animate-bounce">🍎</div>
            <div className="absolute -bottom-6 -right-6 text-4xl animate-bounce delay-150">🥪</div>
          </div>
          <h2 className="mt-8 text-2xl font-bold text-gray-800 animate-pulse">Processing your kindness...</h2>
          <p className="text-gray-500">Connecting to Refoodify servers</p>
        </div>
      )}

      {/* --- 🎉 SUCCESS MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white p-8 rounded-[2rem] text-center max-w-sm w-full animate-popIn shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">Welcome Aboard!</h2>
            <p className="text-gray-600 mb-6">You are now a registered volunteer.</p>
            <div className="bg-orange-50 p-4 rounded-2xl border-2 border-dashed border-orange-200 mb-8">
              <p className="text-xs text-orange-600 font-bold uppercase mb-1">Volunteer ID</p>
              <span className="text-2xl font-mono font-black text-gray-800 tracking-wider">{referenceNumber}</span>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all">Start Helping</button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-popIn { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounceIn { animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      `}</style>
      <Footer />
    </>
  );
}