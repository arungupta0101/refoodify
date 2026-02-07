import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { TrophyIcon } from '@heroicons/react/24/solid';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: '', address: '', city: '', state: '', pincode: '', email: '', phone: '', bio: '', photoURL: '',
    fssai: '', workingHours: '', registrationNumber: '', coverageArea: '', organizationName: ''
  });
  const [donations, setDonations] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ title: '', description: '', requiredMeals: '', location: '', durationHours: '24' });
  const [referralInput, setReferralInput] = useState('');

  // New States for NGO Pickup & Donor Rating
  const [nearbyDonations, setNearbyDonations] = useState([]);
  const [showRateNgoModal, setShowRateNgoModal] = useState(false);
  const [rateNgoForm, setRateNgoForm] = useState({ id: null, rating: 5, review: '' });
  const [verifyModal, setVerifyModal] = useState(null);
  const [verifyForm, setVerifyForm] = useState({ rating: 5, review: '', photo: '' });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
    setIsAdmin(user.userType === 'admin' || user.email === 'admin@refoodify.com');
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Fetch Profile
      const profileRes = await fetch(`/api/user/profile?uid=${user.uid}`);
      let profileData = null;
      // Fetch Donations for Stats
      const donationRes = await fetch(`/api/donations?userId=${user.uid}`);
      // Fetch Notifications
      const notifRes = await fetch(`/api/notifications?userId=${user.uid}`);
      
      if (profileRes.ok) {
        profileData = await profileRes.json();
        setProfile(profileData);
        
        // Intelligent Address Parsing
        // If 'street' is saved, use it. Otherwise, try to extract street from full address if it contains city/state.
        let streetAddress = profileData.street || profileData.address || '';
        if (!profileData.street && profileData.address && profileData.city) {
           // Attempt to strip city and following parts if address was concatenated
           const cityIndex = profileData.address.lastIndexOf(`, ${profileData.city}`);
           if (cityIndex !== -1) {
             streetAddress = profileData.address.substring(0, cityIndex);
           }
        }

        setEditForm({ 
          name: profileData.name || '', 
          address: streetAddress, 
          city: profileData.city || '',
          state: profileData.state || '',
          pincode: profileData.pincode || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          photoURL: profileData.photoURL || '',
          fssai: profileData.fssai || '',
          workingHours: profileData.workingHours || '',
          registrationNumber: profileData.registrationNumber || '',
          coverageArea: profileData.coverageArea || '',
          organizationName: profileData.organizationName || ''
        });
      }

      let donationData = [];
      if (donationRes.ok) {
        donationData = await donationRes.json();
        setDonations(donationData);
      }

      if (notifRes.ok) {
        setNotifications(await notifRes.json());
      }

      // NGO: Fetch Nearby Donations
      const currentUserType = profileData?.userType || user.userType;

      if (currentUserType === 'ngo') {
        const availRes = await fetch(`/api/get-available-donations?ngoId=${user.uid}`);
        if (availRes.ok) {
          const allDonations = await availRes.json();
          // Simple filter: Check if donation location contains user's city/address keywords
          // For prototype, we show all or filter loosely
          const userLoc = (user.address || '').toLowerCase();
          const filtered = allDonations.filter(d => 
            userLoc && d.location && (d.location.toLowerCase().includes(userLoc) || userLoc.includes(d.location.toLowerCase()))
          );
          // Fallback: Show all if no address match found (for demo purposes)
          setNearbyDonations(filtered.length > 0 ? filtered : allDonations);
        }
      }

      // Donor: Check for unrated completed donations
      const unrated = donationData.find(d => d.status === 'completed' && d.ngoId && !d.donorRating);
      if (unrated) {
        setRateNgoForm(prev => ({ ...prev, id: unrated._id || unrated.id }));
        setShowRateNgoModal(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, photoURL: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Construct full address for DB (Street, City, State, Pincode)
      const fullAddress = [
        editForm.address,
        editForm.city,
        editForm.state,
        editForm.pincode
      ].filter(part => part && part.trim() !== '').join(', ');

      const payload = {
        ...editForm,
        address: fullAddress, // Save combined address for maps/display
        street: editForm.address // Save street separately to preserve it
      };

      const res = await fetch(`/api/user/profile?uid=${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
        toast.success('Profile updated!');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSOS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        toast.success(`🚨 SOS Alert Sent! Help is on the way to ${position.coords.latitude}, ${position.coords.longitude}`);
      });
    } else {
      toast.error('Geolocation not supported.');
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (e) { console.error(e); }
  };

  const handleRefreshStatus = async (donationId) => {
    const loadingToast = toast.loading("Checking status...");
    try {
      const res = await fetch(`/api/donations?userId=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
        
        const updatedDonation = data.find(d => (d._id === donationId || d.id === donationId));
        
        if (updatedDonation) {
            if (updatedDonation.status === 'completed') {
                toast.success("Donation collected! Please rate the NGO.", { id: loadingToast });
                if (!updatedDonation.donorRating) {
                    setRateNgoForm(prev => ({ ...prev, id: updatedDonation._id || updatedDonation.id }));
                    setShowRateNgoModal(true);
                }
            } else {
                toast.success(`Status: ${updatedDonation.status}`, { id: loadingToast });
            }
        } else {
            toast.dismiss(loadingToast);
        }
      }
    } catch (error) {
      toast.error("Failed to refresh", { id: loadingToast });
    }
  };

  const handleNotificationClick = (n) => {
    markAsRead(n._id);
    if (n.message && (n.message.toLowerCase().includes('verified') || n.message.toLowerCase().includes('completed'))) {
       const unrated = donations.find(d => d.status === 'completed' && d.ngoId && !d.donorRating);
       if (unrated) {
         setRateNgoForm(prev => ({ ...prev, id: unrated._id || unrated.id }));
         setShowRateNgoModal(true);
         setShowNotifications(false);
       }
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const res = await fetch(`/api/user/profile?uid=${user.uid}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          toast.success("Account deleted successfully");
          logout();
        } else {
          throw new Error("Failed to delete account");
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...emergencyForm,
          ngoId: user.uid,
          ngoName: user.name || editForm.organizationName || 'NGO'
        })
      });
      if (!res.ok) throw new Error('Failed to post');
      toast.success('Emergency Alert Broadcasted!');
      setShowEmergencyModal(false);
      setEmergencyForm({ title: '', description: '', requiredMeals: '', location: '', durationHours: '24' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRateNgoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rate-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: rateNgoForm.id, rating: rateNgoForm.rating, review: rateNgoForm.review })
      });
      if (!res.ok) throw new Error('Failed to submit rating');
      toast.success('Thank you for your feedback!');
      setShowRateNgoModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!confirm("Are you sure you want to delete this donation request?")) return;
    try {
      const res = await fetch(`/api/donations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Donation request deleted");
        fetchProfile();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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
          donationId: verifyModal.id || verifyModal._id,
          ngoId: user.uid,
          ...verifyForm
        })
      });
      if (!res.ok) throw new Error('Verification failed');
      toast.success('Donation Verified & Rated!');
      setVerifyModal(null);
      setVerifyForm({ rating: 5, review: '', photo: '' });
      fetchProfile(); // Refresh data
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRedeemReferral = async () => {
    if (!referralInput.trim()) return;
    try {
      const res = await fetch('/api/user/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, code: referralInput })
      });
      const data = await res.json();
      if (res.ok) toast.success(data.message);
      else toast.error(data.message);
    } catch (e) { toast.error('Failed to redeem'); }
  };

  const handleIgnoreDonation = async (donationId) => {
    if (!confirm("Are you sure you want to ignore this request? It will be removed from your list.")) return;
    try {
      await fetch('/api/ignore-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, ngoId: user.uid })
      });
      setNearbyDonations(prev => prev.filter(d => d.id !== donationId && d._id !== donationId));
      toast.success("Request removed.");
    } catch (e) { toast.error("Failed to ignore"); }
  };

  const handleBookDonation = async (donationId) => {
    try {
      const res = await fetch('/api/book-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, ngoId: user.uid })
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchProfile(); }
      else { toast.error(data.message); }
    } catch (e) { toast.error("Booking failed"); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return null;

  const displayProfile = profile || user || {};
  const userType = displayProfile.userType || 'user';

  // Robust Level Calculation
  const points = Number(displayProfile.points) || 0;
  
  const getLevelInfo = (pts, type) => {
    if (type === 'ngo') {
      if (pts >= 4000) return { name: 'Gold', next: 10000 };
      if (pts >= 2000) return { name: 'Silver', next: 4000 };
      if (pts >= 800) return { name: 'Bronze', next: 2000 };
      return { name: 'Starter', next: 800 };
    } else if (type === 'restaurant') {
      if (pts >= 3000) return { name: 'Gold', next: 10000 };
      if (pts >= 1500) return { name: 'Silver', next: 3000 };
      if (pts >= 500) return { name: 'Bronze', next: 1500 };
      return { name: 'New', next: 500 };
    } else {
      if (pts >= 3000) return { name: 'Gold', next: 10000 };
      if (pts >= 1500) return { name: 'Silver', next: 3000 };
      if (pts >= 500) return { name: 'Bronze', next: 1500 };
      return { name: 'New', next: 500 };
    }
  };

  const levelInfo = getLevelInfo(points, userType);
  const levelName = levelInfo.name;
  const progress = Math.min((points / levelInfo.next) * 100, 100);
  
  // Generate Referral Code if missing (Simple logic for display)
  const myReferralCode = displayProfile.referralCode || (displayProfile.name ? displayProfile.name.substring(0, 4).toUpperCase() + Math.floor(Math.random() * 1000) : 'USER123');

  return (
    <>
      <Header />
      <main className="min-h-screen pb-12">
        {/* Cover Banner */}
        <div className="h-48 bg-gradient-to-r from-primary to-green-400"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
          <div className="bg-white rounded-3xl shadow-xl relative">
            {displayProfile.status === 'Pending' && (
              <div className="bg-yellow-100 text-yellow-800 p-3 text-center font-bold text-sm rounded-t-3xl border-b border-yellow-200">
                ⚠️ Your account is pending verification. Some features may be limited until Admin approval.
              </div>
            )}
            {/* Profile Header */}
            <div className="p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-end gap-6 border-b border-gray-100 pb-8 relative">
              
              {/* Notification & Help Buttons (Top Right) */}
              {!isAdmin && (
              <div className="absolute top-4 right-4 flex gap-3 z-20">
                <button onClick={() => router.push('/faq')} className="bg-white p-3 rounded-full shadow-md hover:bg-gray-50 text-gray-600" title="Help & Support">
                  ❓
                </button>
                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="bg-white p-3 rounded-full shadow-md hover:bg-gray-50 text-gray-600 relative">
                    🔔
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Notifications</div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? <p className="p-4 text-center text-gray-400 text-sm">No notifications</p> : notifications.map(n => (
                          <div key={n._id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b text-sm cursor-pointer hover:bg-gray-50 ${n.read ? 'opacity-60' : 'bg-blue-50'}`}>{n.message} <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</div></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}

              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-400">
                  {isEditing && editForm.photoURL ? (
                    <img src={editForm.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : displayProfile.photoURL ? (
                    <img src={displayProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    displayProfile.name ? displayProfile.name[0].toUpperCase() : 'U'
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold">Change</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-black text-gray-800">{displayProfile.name || 'User Name'}</h1>
                <p className="text-gray-500 font-medium">{displayProfile.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide">
                    {userType}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide ${displayProfile.status === 'Banned' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {displayProfile.status || 'Active'}
                  </span>
                  {!isAdmin && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide flex items-center gap-1">
                      ⭐ {displayProfile.rating ? displayProfile.rating.toFixed(1) : '0.0'} 
                      <span className="opacity-70">({displayProfile.ratingCount || 0})</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {isAdmin && (
                  <button 
                    onClick={() => router.push('/admin-dashboard')}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all mb-2"
                  >
                    Admin Dashboard
                  </button>
                )}
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-600">Save Changes</button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Dashboard */}
            {!isAdmin && (
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/50">
                <div className="p-6 text-center">
                  <p className="text-3xl font-black text-primary">{donations.length}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Donations</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-3xl font-black text-orange-500">{points}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Points Earned</p>
                </div>
                <div className="p-6 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-blue-500">{levelName}</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1"><div className="bg-blue-500 h-full rounded-full" style={{width: `${progress}%`}}></div></div>
                  </div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Current Level</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-3xl font-black text-purple-500">{userType === 'restaurant' ? '12kg' : '100%'}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{userType === 'restaurant' ? 'Waste Saved' : 'Impact Score'}</p>
                </div>
              </div>
            )}

            {/* Referral Section */}
            {!isAdmin && (
              <div className="p-6 bg-orange-50 border-b border-orange-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-orange-800">Invite & Earn</h4>
                  <p className="text-sm text-orange-700">Share code <span className="font-mono font-black bg-white px-2 py-1 rounded border border-orange-200 select-all">{myReferralCode}</span> to earn 100 pts!</p>
                </div>
                {!displayProfile.referredBy && (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Friend's Code" 
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value)}
                      className="p-2 rounded-lg border border-orange-200 text-sm outline-none focus:ring-2 ring-orange-400"
                    />
                    <button onClick={handleRedeemReferral} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600">Redeem</button>
                  </div>
                )}
              </div>
            )}

            {/* Content Area */}
            <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Left Column: Personal Info */}
              <div className="md:col-span-1 space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Personal Details</h3>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                      <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" placeholder="+91..." />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">Street Address</label>
                      <input type="text" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" placeholder="House/Flat No, Street" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">City</label>
                        <input type="text" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Pincode</label>
                        <input type="text" value={editForm.pincode} onChange={(e) => setEditForm({...editForm, pincode: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">State</label>
                      <select value={editForm.state} onChange={(e) => setEditForm({...editForm, state: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-medium">
                        <option value="">Select State</option>
                        {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </div>
                    
                    {/* Restaurant Specific Fields */}
                    {userType === 'restaurant' && (
                      <>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">FSSAI License No.</label>
                          <input type="text" value={editForm.fssai} onChange={(e) => setEditForm({...editForm, fssai: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">Working Hours</label>
                          <input type="text" value={editForm.workingHours} onChange={(e) => setEditForm({...editForm, workingHours: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" placeholder="e.g. 9 AM - 10 PM" />
                        </div>
                      </>
                    )}

                    {/* NGO Specific Fields */}
                    {userType === 'ngo' && (
                      <>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">Registration No.</label>
                          <input type="text" value={editForm.registrationNumber} onChange={(e) => setEditForm({...editForm, registrationNumber: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">Coverage Area</label>
                          <input type="text" value={editForm.coverageArea} onChange={(e) => setEditForm({...editForm, coverageArea: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-medium" />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                      <p className="font-medium text-gray-700">{displayProfile.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Address</p>
                      <p className="font-medium text-gray-700">{[displayProfile.address, displayProfile.city, displayProfile.state, displayProfile.pincode].filter(Boolean).join(', ') || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Account ID</p>
                      <p className="font-mono text-xs text-gray-500 bg-gray-100 p-2 rounded inline-block">{user.uid}</p>
                    </div>
                    
                    {userType === 'restaurant' && (
                      <>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">FSSAI License</p>
                          <p className="font-medium text-gray-700">{displayProfile.fssai || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Working Hours</p>
                          <p className="font-medium text-gray-700">{displayProfile.workingHours || 'Not provided'}</p>
                        </div>
                      </>
                    )}
                    {userType === 'ngo' && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Coverage Area</p>
                        <p className="font-medium text-gray-700">{displayProfile.coverageArea || 'Not provided'}</p>
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Right Column: Bio & Activity */}
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">About Me</h3>
                  {isEditing ? (
                    <textarea value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-xl font-medium h-32" placeholder="Tell us about yourself..." />
                  ) : (
                    <p className="text-gray-600 leading-relaxed italic">
                      {displayProfile.bio || "No bio added yet. Click edit to tell your story!"}
                    </p>
                  )}
                </div>

                {/* Quick Actions Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {userType === 'user' && (
                      <button onClick={handleSOS} className="bg-red-500 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">🚨</span>
                        <span>Emergency SOS</span>
                      </button>
                    )}
                    
                    {userType === 'restaurant' && (
                      <button onClick={() => router.push('/restaurant')} className="bg-orange-500 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">🍲</span>
                        <span>Add Surplus Food</span>
                      </button>
                    )}

                    {userType === 'ngo' && (
                      <button onClick={() => router.push('/find-food')} className="bg-blue-500 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">🔍</span>
                        <span>Find Food</span>
                      </button>
                    )}
                    {userType === 'ngo' && (
                      <button onClick={() => setShowEmergencyModal(true)} className="bg-red-500 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">📢</span>
                        <span>Post Emergency</span>
                      </button>
                    )}

                    {!isAdmin && (
                      <button onClick={() => router.push('/donate')} className="bg-green-500 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-green-600 transition-all flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">🤝</span>
                        <span>Donate Now</span>
                      </button>
                    )}

                    <button onClick={logout} className="bg-gray-800 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex flex-col items-center justify-center gap-2">
                      <span className="text-2xl">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-red-600 border-b border-red-100 pb-2 mb-4">Danger Zone</h3>
                  <button onClick={handleDeleteAccount} className="w-full bg-red-50 text-red-600 p-4 rounded-xl font-bold shadow-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100">
                    <span className="text-xl">🗑️</span>
                    <span>Delete My Account</span>
                  </button>
                  <p className="text-xs text-gray-400 mt-2 text-center">This action is permanent and cannot be undone.</p>
                </div>

                {/* NGO: Incoming Donations Section */}
                {userType === 'ngo' && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Incoming Food Requests</h3>
                    {nearbyDonations.length > 0 ? (
                      <div className="space-y-4">
                        {nearbyDonations.map(donation => (
                          <div key={donation.id} className="bg-white p-5 rounded-2xl shadow-md border border-green-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-gray-800">{donation.foodType}</h4>
                                <p className="text-sm text-gray-500">{donation.quantity} • {donation.location}</p>
                              </div>
                              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Available</span>
                            </div>
                            <div className="flex gap-3 mt-3">
                              {donation.status === 'accepted' && donation.ngoId === user.uid ? (
                                <>
                                  <button onClick={() => router.push(`/chat?withUser=${donation.donorId}&name=${donation.donorName || 'Restaurant'}`)} className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-600">💬 Chat</button>
                                  <button onClick={() => setVerifyModal(donation)} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-green-600">Verify Pickup</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleBookDonation(donation.id || donation._id)} className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-bold hover:bg-green-600 shadow-md">Accept & Book</button>
                                  <button onClick={() => handleIgnoreDonation(donation.id || donation._id)} className="bg-gray-200 text-gray-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-gray-300" title="Ignore Request">✕</button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No active donations nearby.</p>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Recent Activity</h3>
                  {donations.length > 0 ? (
                    <div className="space-y-3">
                      {donations.slice(0, 3).map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div>
                            <p className="font-bold text-gray-800 capitalize">{d.type} Donation</p>
                            <p className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${d.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {d.status || 'Pending'}
                            </span>
                            {d.status === 'accepted' && (
                                <button 
                                  onClick={() => d.ngoId ? router.push(`/chat?withUser=${d.ngoId}&name=${d.ngoName || 'NGO'}`) : toast.error("NGO details syncing...")} 
                                  className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition-colors" 
                                  title="Chat with NGO"
                                >
                                  💬
                                </button>
                            )}
                            {d.status === 'pending' && (
                              <>
                                <button onClick={() => handleRefreshStatus(d._id || d.id)} className="text-blue-500 hover:bg-blue-50 p-1 rounded-full mr-1" title="Refresh Status">
                                  🔄
                                </button>
                                <button onClick={() => handleDeleteDonation(d._id)} className="text-red-500 hover:bg-red-50 p-1 rounded-full" title="Delete Request">
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {donations.length > 3 && <p className="text-center text-sm text-primary font-bold cursor-pointer">View All Activity</p>}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <p className="text-gray-400 font-medium">No donations yet. Start your journey!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-popIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">📢 Post Emergency Need</h2>
            <form onSubmit={handleEmergencySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Title</label>
                <input type="text" required value={emergencyForm.title} onChange={e => setEmergencyForm({...emergencyForm, title: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="e.g. Flood Relief" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Description</label>
                <textarea required value={emergencyForm.description} onChange={e => setEmergencyForm({...emergencyForm, description: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="Details about the situation..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Meals Needed</label>
                  <input type="number" required value={emergencyForm.requiredMeals} onChange={e => setEmergencyForm({...emergencyForm, requiredMeals: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">Duration (Hrs)</label>
                  <input type="number" required value={emergencyForm.durationHours} onChange={e => setEmergencyForm({...emergencyForm, durationHours: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Location</label>
                <input type="text" required value={emergencyForm.location} onChange={e => setEmergencyForm({...emergencyForm, location: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="Area/City" />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEmergencyModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
                <button type="submit" className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 shadow-lg">Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate NGO Modal (For Donors) */}
      {showRateNgoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-popIn text-center">
            <div className="text-5xl mb-4">🚚</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Thanks for your Donation!</h2>
            <p className="text-gray-500 mb-6 text-sm">Your food was successfully collected. Please rate the NGO to help us improve.</p>
            
            <form onSubmit={handleRateNgoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rate NGO (1-5)</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button type="button" key={star} onClick={() => setRateNgoForm({...rateNgoForm, rating: star})} className={`text-3xl transition-transform hover:scale-110 ${rateNgoForm.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                  ))}
                </div>
              </div>
              <textarea required value={rateNgoForm.review} onChange={e => setRateNgoForm({...rateNgoForm, review: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50 text-sm" placeholder="How was the pickup process?" rows="3" />
              
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-600">Submit Rating</button>
            </form>
          </div>
        </div>
      )}

      {/* Verify Donation Modal (For NGOs) */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-popIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Verify & Rate Donation</h2>
            <p className="text-sm text-gray-500 mb-4">Please take a photo of the food to verify pickup.</p>
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Quality Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button type="button" key={star} onClick={() => setVerifyForm({...verifyForm, rating: star})} className={`text-3xl transition-transform hover:scale-110 ${verifyForm.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Review / Note</label>
                <textarea value={verifyForm.review} onChange={e => setVerifyForm({...verifyForm, review: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="Food quality was..." required />
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
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setVerifyModal(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
                <button type="submit" className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 shadow-lg">Verify & Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}