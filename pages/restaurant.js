import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { 
  BuildingStorefrontIcon, 
  MapPinIcon, 
  UserIcon, 
  PhoneIcon, 
  ClockIcon, 
  DocumentTextIcon, 
  PhotoIcon, 
  CheckCircleIcon,
  ArrowUpTrayIcon,
  CursorArrowRaysIcon,
  TruckIcon,
  HeartIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

export default function Restaurant() {
  const { user } = useAuth();
  const { setIsLoading } = useLoading(); // Global Loader Hook
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [donations, setDonations] = useState([]);
  
  // Separate forms for Registration and Donation
  const [regForm, setRegForm] = useState({
    name: '',
    location: '',
    ownerName: '',
    contactNumber: '',
    foodTypeOffered: 'Both',
    operatingHours: '',
  });
  const [donateForm, setDonateForm] = useState({
    foodType: 'Veg',
    quantity: '',
    expiryDate: '',
  });
  
  // File Upload States
  const [fssaiFile, setFssaiFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [fssaiPreview, setFssaiPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Safety Checks
  const [safetyChecks, setSafetyChecks] = useState({
    safety: false,
    hygiene: false,
    legal: false
  });

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser.");
      return;
    }

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

    const hindiNumbers = {
      'ek': '1', 'do': '2', 'teen': '3', 'char': '4', 'paanch': '5', 'che': '6', 'chah': '6', 'saat': '7', 'aath': '8', 'nau': '9', 'das': '10',
      'gyarah': '11', 'barah': '12', 'bees': '20', 'pachas': '50', 'sau': '100'
    };

    let processedText = lower;
    Object.keys(hindiNumbers).forEach(key => {
        processedText = processedText.replace(new RegExp(`\\b${key}\\b`, 'g'), hindiNumbers[key]);
    });
    
    const qtyMatch = processedText.match(/(\d+)\s*(plates?|kg|meals?|packets?|servings?|people|logo|thali)?/);
    if (qtyMatch) {
      updates.quantity = `${qtyMatch[1]} ${qtyMatch[2] || ''}`.trim();
      processedText = processedText.replace(qtyMatch[0], '').trim();
    }

    let desc = processedText.replace(/donate|list|add|food|is|kro|karna|hai|ko|chahiye|bhejo|ka|ki|expiry|date/g, '').trim();
    if (desc) updates.foodType = desc.charAt(0).toUpperCase() + desc.slice(1);

    setDonateForm(prev => ({ ...prev, ...updates }));
  };

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
      // Simplified check for now, assuming if user is type restaurant they are registered or we check API
      // For this prototype, we'll assume true if they have the userType, or check via API
      setIsRegistered(user.userType === 'restaurant' || user.userType === 'donor');
    } catch (error) {
      setIsRegistered(false);
    }
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      const loadingToast = toast.loading("Detecting location...");
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          toast.dismiss(loadingToast);
          if (data && data.display_name) {
            setRegForm(prev => ({ ...prev, location: data.display_name }));
            toast.success("Address detected!");
          } else {
            throw new Error("Address not found");
          }
        } catch (error) {
          toast.dismiss(loadingToast);
          setRegForm(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
          toast.success("Location detected (Coordinates)");
        }
      }, () => {
        toast.dismiss(loadingToast);
        toast.error("Location access denied");
      });
    } else {
      toast.error("Geolocation not supported");
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await fetch(`/api/donations?userId=${user.uid}`);
      const data = await res.json();
      setDonations(Array.isArray(data) ? data : data.donations || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([]);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'fssai') {
          setFssaiFile(file);
          setFssaiPreview(reader.result);
        } else {
          setImageFile(file);
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!safetyChecks.safety || !safetyChecks.hygiene || !safetyChecks.legal) {
      toast.error("Please accept all safety & legal guidelines.");
      return;
    }
    setIsLoading(true); // Show Global Loader
    try {
      console.log("Registering restaurant for User UID:", user.uid);
      const res = await fetch(`/api/user/profile?uid=${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...regForm, userType: 'restaurant', status: 'Active' })
      });

      if (res.ok) {
        setIsRegistered(true);
        toast.success('Restaurant registered successfully!');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error("Restaurant Registration Error:", error);
      toast.error('Registration failed');
    } finally {
      setIsLoading(false); // Hide Global Loader
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show Global Loader
    try {
      console.log("Restaurant donating for User UID:", user.uid);
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Merge registration location with donation details
        body: JSON.stringify({ 
          ...donateForm, 
          location: regForm.location, // Use registered location
          donorId: user.uid, 
          type: 'food', 
          status: 'available' 
        })
      });
      if (!res.ok) throw new Error('Failed');
      setDonateForm({ foodType: 'Veg', quantity: '', expiryDate: '' });
      fetchDonations();
      toast.success('Donation listed!');
    } catch (error) {
      console.error("Restaurant Donation Error:", error);
      toast.error('Donation failed');
    } finally {
      setIsLoading(false); // Hide Global Loader
    }
  };

  if (!user) return <div>Please login</div>;

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20">
        {/* Hero / Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 px-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400 opacity-10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
             <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Restaurant Partner Portal</h1>
                        <p className="text-emerald-100 text-lg max-w-xl">Turn your surplus food into smiles. Manage donations, track impact, and earn green rewards.</p>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="bg-white text-emerald-600 p-3 rounded-xl shadow-sm">
                                    <TrophyIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-emerald-200 tracking-wider">Impact Score</p>
                                    <p className="text-2xl font-black">Top 5%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        {user.userType === 'ngo' ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-800">Access Restricted</h2>
              <p className="text-red-700">NGO accounts cannot register as restaurants.</p>
            </div>
          </div>
        ) : !isRegistered ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 📋 Registration Card */}
            <div className="lg:col-span-2">
              <form onSubmit={handleRegister} className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-green-400"></div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-green-50 rounded-2xl text-primary">
                    <BuildingStorefrontIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Register Your Restaurant</h2>
                    <p className="text-gray-500 text-sm">Join Refoodify and donate surplus food easily</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Restaurant Name</label>
                      <div className="relative">
                        <BuildingStorefrontIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          required 
                          value={regForm.name}
                          onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                          placeholder="e.g. Tasty Bites"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Owner Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          required 
                          value={regForm.ownerName}
                          onChange={(e) => setRegForm({...regForm, ownerName: e.target.value})}
                          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                          placeholder="Full Name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact & Hours */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Contact Number</label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                          type="tel" 
                          required 
                          value={regForm.contactNumber}
                          onChange={(e) => setRegForm({...regForm, contactNumber: e.target.value})}
                          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Operating Hours</label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          required 
                          value={regForm.operatingHours}
                          onChange={(e) => setRegForm({...regForm, operatingHours: e.target.value})}
                          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                          placeholder="e.g. 10 AM - 11 PM"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Food Type Toggle */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-2 block">Food Type Offered</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      {['Veg', 'Non-Veg', 'Both'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setRegForm({...regForm, foodTypeOffered: type})}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${regForm.foodTypeOffered === type ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 🗺 Location UX Upgrade */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Location</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPinIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          required 
                          value={regForm.location}
                          onChange={(e) => setRegForm({...regForm, location: e.target.value})}
                          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                          placeholder="Enter full address"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={handleLocationDetect}
                        className="bg-blue-50 text-blue-600 px-4 rounded-xl font-bold hover:bg-blue-100 transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        <CursorArrowRaysIcon className="w-5 h-5" /> Detect
                      </button>
                    </div>
                    {/* Small Map Preview Placeholder */}
                    <div className="mt-3 h-32 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm font-medium">
                      <MapPinIcon className="w-5 h-5 mr-2" /> Map Preview
                    </div>
                  </div>

                  {/* 📸 Media Upload Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-all relative group">
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-24 object-cover rounded-lg mx-auto" />
                      ) : (
                        <>
                          <PhotoIcon className="w-10 h-10 text-gray-300 mx-auto mb-2 group-hover:text-primary transition-colors" />
                          <p className="text-xs font-bold text-gray-500">Upload Restaurant Photo</p>
                        </>
                      )}
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-all relative group">
                      <input type="file" accept="application/pdf,image/*" onChange={(e) => handleFileChange(e, 'fssai')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {fssaiPreview ? (
                        <div className="flex flex-col items-center justify-center h-24 text-green-600">
                          <CheckCircleIcon className="w-10 h-10 mb-1" />
                          <span className="text-xs font-bold">File Selected</span>
                        </div>
                      ) : (
                        <>
                          <DocumentTextIcon className="w-10 h-10 text-gray-300 mx-auto mb-2 group-hover:text-primary transition-colors" />
                          <p className="text-xs font-bold text-gray-500">Upload FSSAI License</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ✅ Verification & Safety Section */}
                  <div className="bg-green-50 p-5 rounded-xl space-y-3">
                    <h3 className="text-sm font-bold text-green-800 uppercase tracking-wide mb-1">Safety & Compliance</h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={safetyChecks.safety} onChange={(e) => setSafetyChecks({...safetyChecks, safety: e.target.checked})} className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                      <span className="text-sm text-gray-700 font-medium">I accept Food Safety Guidelines</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={safetyChecks.hygiene} onChange={(e) => setSafetyChecks({...safetyChecks, hygiene: e.target.checked})} className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                      <span className="text-sm text-gray-700 font-medium">Hygiene standards are maintained</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={safetyChecks.legal} onChange={(e) => setSafetyChecks({...safetyChecks, legal: e.target.checked})} className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                      <span className="text-sm text-gray-700 font-medium">I agree to Legal Compliance</span>
                    </label>
                  </div>

                  {/* 🚀 CTA Button */}
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                      <>
                        <span>Register Restaurant & Start Donating</span>
                        <ArrowUpTrayIcon className="w-5 h-5" />
                      </>
                  </button>
                </div>
              </form>

              {/* 📊 Dashboard Preview Section */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center opacity-70 hover:opacity-100 transition-opacity">
                  <TruckIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">0</p>
                  <p className="text-xs text-gray-500 font-bold uppercase">Pickups</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center opacity-70 hover:opacity-100 transition-opacity">
                  <HeartIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">0kg</p>
                  <p className="text-xs text-gray-500 font-bold uppercase">Donated</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center opacity-70 hover:opacity-100 transition-opacity">
                  <UserIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">0</p>
                  <p className="text-xs text-gray-500 font-bold uppercase">NGOs</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center opacity-70 hover:opacity-100 transition-opacity">
                  <TrophyIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">New</p>
                  <p className="text-xs text-gray-500 font-bold uppercase">Badge</p>
                </div>
              </div>
            </div>

            {/* Right Side: Info / Benefits */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-gradient-to-br from-primary to-green-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <h3 className="text-2xl font-bold mb-4">Why Join?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded-full"><CheckCircleIcon className="w-5 h-5" /></div>
                    <p className="font-medium">Reduce food waste & save costs</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded-full"><CheckCircleIcon className="w-5 h-5" /></div>
                    <p className="font-medium">Earn Green Badges & Rewards</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded-full"><CheckCircleIcon className="w-5 h-5" /></div>
                    <p className="font-medium">Tax benefits for donations</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded-full"><CheckCircleIcon className="w-5 h-5" /></div>
                    <p className="font-medium">Help feed the hungry</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><HeartIcon className="w-8 h-8" /></div>
                <div>
                  <p className="text-3xl font-black text-gray-800">{donations.length}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase">Donations</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><TruckIcon className="w-8 h-8" /></div>
                <div>
                  <p className="text-3xl font-black text-gray-800">{donations.filter(d => d.status === 'completed').length}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase">Pickups</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><FireIcon className="w-8 h-8" /></div>
                <div>
                  <p className="text-3xl font-black text-gray-800">{donations.length * 5}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase">Meals Served</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary to-emerald-600 p-6 rounded-3xl shadow-lg text-white flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black">Gold</p>
                  <p className="text-xs opacity-80 font-bold uppercase">Current Badge</p>
                </div>
                <TrophyIcon className="w-12 h-12 opacity-80" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Donation Form */}
            <div className="lg:col-span-2">
            <form onSubmit={handleDonate} className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-green-400"></div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-yellow-500" /> List Surplus Food
                  </h2>
                  <p className="text-gray-500 text-sm">Quickly list food for NGOs to pickup.</p>
                </div>
                {/* Voice Controls */}
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
                    <div className="absolute top-full mt-2 right-0 w-64 bg-gray-900 text-white text-xs p-3 rounded-xl shadow-xl z-50 animate-bounceIn">
                      <div className="absolute top-[-6px] right-4 w-3 h-3 bg-gray-900 rotate-45"></div>
                      <p className="font-bold mb-1">🎤 Try saying:</p>
                      <p className="italic text-gray-300 mb-1">"{voiceLang === 'en-US' ? '50 meals of Rice and Curry' : '50 plate chawal daal'}"</p>
                      <p className="text-[10px] text-gray-400">Listening...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Food Type</label>
                  <input
                    type="text"
                    value={donateForm.foodType}
                    onChange={(e) => setDonateForm({...donateForm, foodType: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                    placeholder="e.g. Rice & Curry"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Quantity</label>
                  <input
                    type="text"
                    value={donateForm.quantity}
                    onChange={(e) => setDonateForm({...donateForm, quantity: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                    placeholder="e.g. 10 kg or 20 packs"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Expiry Date</label>
                  <input
                    type="date"
                    value={donateForm.expiryDate}
                    onChange={(e) => setDonateForm({...donateForm, expiryDate: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                List Donation
              </button>
            </form>
            </div>

            {/* History List */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ClockIcon className="w-6 h-6 text-primary" /> Donation History
              </h2>
              {donations.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                      <div>
                        <p className="font-bold text-gray-800">{donation.foodType}</p>
                        <p className="text-sm text-gray-500">{donation.quantity} • {new Date(donation.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          donation.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {donation.status || 'Active'}
                        </span>
                        {donation.status === 'accepted' && (
                          <button 
                            onClick={() => donation.ngoId ? router.push(`/chat?withUser=${donation.ngoId}&name=${donation.ngoName || 'NGO'}`) : toast.error("Waiting for NGO details...")} 
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-600"
                          >
                            💬 Chat
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p>No donations listed yet.</p>
                </div>
              )}
            </div>
            </div>
          </>
        )}
        </div>
      </main>
      <Footer />
      <style jsx>{`
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounceIn { animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      `}</style>
    </>
  );
}