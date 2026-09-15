import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import {
  UserIcon, BuildingStorefrontIcon, HeartIcon as HeartIconOutline, BellIcon, Cog6ToothIcon, ArrowRightIcon,
  MapPinIcon, CheckCircleIcon, XCircleIcon, PencilIcon, CameraIcon, ArrowPathIcon, TrashIcon,
  ChartBarIcon, CalendarDaysIcon, UsersIcon, DocumentTextIcon, ShieldCheckIcon, SunIcon, MoonIcon,
  ArrowTrendingUpIcon, InboxIcon, ExclamationTriangleIcon, FlagIcon, TruckIcon, BuildingOfficeIcon,
  WrenchScrewdriverIcon, ComputerDesktopIcon, LifebuoyIcon, ArrowLeftOnRectangleIcon, BanknotesIcon,
  ScaleIcon, ClockIcon, StarIcon, ChatBubbleLeftRightIcon, PhoneIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon,
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationCircleIcon as ExclamationCircleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
} from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

// Helper to format numbers
const formatNumber = (num) => num > 999 ? `${(num / 1000).toFixed(1)}k` : num;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getDonationWeight = (donation) => {
  if (!donation) return 0;
  const amount = toNumber(donation.amount);
  if (amount > 0) return amount;

  const quantityMatch = String(donation.quantity || '').match(/\d+(?:\.\d+)?/);
  if (quantityMatch) return toNumber(quantityMatch[0]);

  return 1;
};

const buildDailySeries = (records = [], valueSelector = () => 1, days = 7) => {
  const today = new Date();
  const buckets = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    buckets.push({ key, name: date.toLocaleDateString('en-US', { weekday: 'short' }), value: 0 });
  }

  records.forEach((record) => {
    if (!record?.createdAt) return;
    const key = new Date(record.createdAt).toISOString().slice(0, 10);
    const bucket = buckets.find((entry) => entry.key === key);
    if (bucket) bucket.value += toNumber(valueSelector(record));
  });

  return buckets.map(({ key, ...bucket }) => bucket);
};

const getStoredBadges = (profile, donations = []) => {
  const badges = Array.isArray(profile?.dashboardData?.badges) ? [...profile.dashboardData.badges] : [];
  if (donations.some((donation) => donation.status === 'completed')) badges.push('First Donation');
  if (donations.filter((donation) => donation.status === 'completed').length >= 5) badges.push('Community Helper');
  if (toNumber(profile?.points) >= 500) badges.push('Green Contributor');
  if (donations.length >= 3) badges.push('Monthly Streak');
  return [...new Set(badges)];
};


export default function Profile() {
  const { user, logout, loading: authLoading } = useAuth() || {};
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', address: '', city: '', state: '', pincode: '', email: '', phone: '', bio: '', photoURL: '',
    fssai: '', workingHours: '', registrationNumber: '', coverageArea: '', organizationName: ''
  });
  const [donations, setDonations] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ title: '', description: '', requiredMeals: '', location: '', durationHours: '24' });
  const [referralInput, setReferralInput] = useState('');

  // New States for NGO Pickup & Donor Rating
  const [nearbyDonations, setNearbyDonations] = useState([]);
  const [nearbyNgos, setNearbyNgos] = useState([]);
  const [partnerRestaurants, setPartnerRestaurants] = useState([]);
  const [partnerVolunteers, setPartnerVolunteers] = useState([]);
  const [communityLeaderboard, setCommunityLeaderboard] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminReports, setAdminReports] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminRestaurants, setAdminRestaurants] = useState([]);
  const [adminNgos, setAdminNgos] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [selectedLiveMarker, setSelectedLiveMarker] = useState(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [showRateNgoModal, setShowRateNgoModal] = useState(false);
  const [rateNgoForm, setRateNgoForm] = useState({ id: null, rating: 5, review: '' });
  const [verifyModal, setVerifyModal] = useState(null);
  const [verifyForm, setVerifyForm] = useState({ rating: 5, review: '', photo: '' });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const photoInputRef = useRef(null);


  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
  ];

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
    setIsAdmin(user.userType === 'admin' || user.email === 'admin@refoodify.com');
  }, [user, authLoading]);

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
      const normalizedRole = currentUserType === 'donor' ? 'user' : currentUserType;

      if (normalizedRole === 'ngo') {
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

      if (normalizedRole === 'user') {
        const [ngoRes, rankingRes] = await Promise.all([
          fetch('/api/leaderboard?type=ngo&sortBy=rating'),
          fetch('/api/leaderboard?type=all&sortBy=points')
        ]);

        if (ngoRes.ok) {
          const ngos = await ngoRes.json();
          const userCity = (profileData?.city || user.city || '').toLowerCase();
          const filteredNgos = userCity
            ? ngos.filter((ngo) => {
              const searchText = `${ngo.name || ''} ${ngo.organizationName || ''}`.toLowerCase();
              return searchText.includes(userCity) || userCity.includes(searchText);
            })
            : ngos;
          setNearbyNgos((filteredNgos.length > 0 ? filteredNgos : ngos).slice(0, 6));
        }

        if (rankingRes.ok) {
          setCommunityLeaderboard((await rankingRes.json()).slice(0, 5));
        }
      }

      if (normalizedRole === 'restaurant') {
        const [ngoRes, rankingRes, inventoryRes, expiryRes] = await Promise.all([
          fetch('/api/leaderboard?type=ngo&sortBy=rating'),
          fetch('/api/leaderboard?type=all&sortBy=points'),
          fetch(`/api/get-inventory?userId=${user.uid}`),
          fetch(`/api/get-expiry-alerts?userId=${user.uid}`)
        ]);

        if (ngoRes.ok) {
          setNearbyNgos((await ngoRes.json()).slice(0, 4));
        }
        if (rankingRes.ok) {
          setCommunityLeaderboard((await rankingRes.json()).slice(0, 5));
        }
        if (inventoryRes.ok) {
          setInventoryItems(await inventoryRes.json());
        }
        if (expiryRes.ok) {
          setExpiryAlerts(await expiryRes.json());
        }
      }

      if (normalizedRole === 'ngo') {
        const [restaurantRes, rankingRes, partnersRes] = await Promise.all([
          fetch('/api/leaderboard?type=restaurant&sortBy=rating'),
          fetch('/api/leaderboard?type=all&sortBy=points'),
          fetch('/api/partners')
        ]);

        if (restaurantRes.ok) {
          setPartnerRestaurants((await restaurantRes.json()).slice(0, 6));
        }
        if (rankingRes.ok) {
          setCommunityLeaderboard((await rankingRes.json()).slice(0, 5));
        }
        if (partnersRes.ok) {
          const partnersData = await partnersRes.json();
          setPartnerVolunteers((partnersData?.volunteers || []).slice(0, 6));
        }
      }

      if (normalizedRole === 'admin') {
        const [dashboardRes, reportsRes, usersRes, restaurantsRes, ngosRes, statsRes, donationsRes, inventoryRes] = await Promise.all([
          fetch('/api/admin?type=dashboard'),
          fetch('/api/reports'),
          fetch('/api/admin?type=users'),
          fetch('/api/admin?type=restaurants'),
          fetch('/api/admin?type=ngos'),
          fetch('/api/stats'),
          fetch('/api/get-donations?scope=all'),
          fetch('/api/get-inventory?scope=all')
        ]);

        if (dashboardRes.ok) setAdminStats(await dashboardRes.json());
        if (reportsRes.ok) setAdminReports(await reportsRes.json());
        if (usersRes.ok) setAdminUsers((await usersRes.json()).slice(0, 10));
        if (restaurantsRes.ok) setAdminRestaurants((await restaurantsRes.json()).slice(0, 8));
        if (ngosRes.ok) setAdminNgos((await ngosRes.json()).slice(0, 8));
        if (statsRes.ok) setPlatformStats(await statsRes.json());
        if (donationsRes.ok) setAllDonations(await donationsRes.json());
        if (inventoryRes.ok) setInventoryItems(await inventoryRes.json());
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

  const handleOpenDonationChat = (donation) => {
    const chatUserId = donation?.donorId || donation?.userId || donation?.creatorId;
    const chatName = donation?.donorName || donation?.organizationName || donation?.restaurantName || donation?.foodType || 'Chat';

    if (!chatUserId) {
      toast.error('Chat is not available for this request yet.');
      return;
    }

    router.push({
      pathname: '/chat',
      query: { withUser: chatUserId, name: chatName }
    });
  };

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center font-bold text-slate-600 dark:text-slate-300">Loading profile...</div>;
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

  const RoleShell = ({ eyebrow, title, subtitle, actions, children, showIdentityActions = true, showIdentityAvatar = true }) => (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {title && <title>{title} | Refoodify</title>}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </Head>
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-12">
        <div className="section-shell space-y-8">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl space-y-4">
              <div className="page-kicker">{eyebrow}</div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {showIdentityAvatar && (
                  <button type="button" onClick={handleAvatarClick} className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-2xl font-semibold text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5">
                    {displayProfile.photoURL ? <img src={displayProfile.photoURL} alt="Profile" className="h-full w-full object-cover" /> : (displayProfile.name || 'U').slice(0, 1).toUpperCase()}
                  </button>
                )}
                <div className="space-y-2">
                  <div>
                    <h1 className="page-title text-4xl font-black sm:text-5xl">{title}</h1>
                    <p className="page-subtitle mt-3 max-w-2xl text-sm sm:text-base">{subtitle}</p>
                  </div>
                  {showIdentityActions && (
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" onClick={openPhotoPicker} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Change Photo</button>
                      <span className="text-slate-300">|</span>
                      <button type="button" onClick={() => setIsEditing(true)} className="text-sm font-semibold text-slate-700 hover:text-slate-900">Edit Profile</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">{actions}</div>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {children}
        </div>
      </main>
      <SharedModals />
      <Footer />
    </>
  );

  const SurfaceCard = ({ className = '', children }) => (
    <section className={`surface-card ${className}`}>{children}</section>
  );

  const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );

  const StatTile = ({ label, value, hint, accent = 'text-slate-900', badge }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
          {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
        </div>
        {badge}
      </div>
    </div>
  );

  const StatusPill = ({ children, tone = 'green' }) => {
    const palette = {
      green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      slate: 'bg-slate-50 text-slate-700 border-slate-200',
      red: 'bg-red-50 text-red-700 border-red-200'
    };
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${palette[tone] || palette.green}`}>{children}</span>;
  };

  const EmptyState = ({ label }) => <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">{label}</div>;

  const openPhotoPicker = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const handleAvatarClick = () => {
    setShowPhotoPreview(true);
  };

  const SharedModals = () => (
    <>
      {showPhotoPreview && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Photo</h2>
                <p className="mt-1 text-sm text-slate-500">Preview and edit your avatar.</p>
              </div>
              <button type="button" onClick={() => setShowPhotoPreview(false)} className="premium-button-ghost min-h-0 px-3 py-2">Close</button>
            </div>
            <div className="mt-5 flex flex-col items-center gap-5 text-center">
              <button type="button" onClick={openPhotoPicker} className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-5xl font-semibold text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5">
                {displayProfile.photoURL ? <img src={displayProfile.photoURL} alt="Profile" className="h-full w-full object-cover" /> : (displayProfile.name || 'U').slice(0, 1).toUpperCase()}
              </button>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-900">{displayProfile.name || 'Profile'}</p>
                <p className="text-sm text-slate-500">Click the photo to change it.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button type="button" onClick={openPhotoPicker} className="premium-button-secondary min-h-0 px-4 py-2">Change Photo</button>
                <button type="button" onClick={() => setIsEditing(true)} className="premium-button min-h-0 px-4 py-2">Edit Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEmergencyModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-popIn w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-white">📢 Post Emergency Need</h2>
            <form onSubmit={handleEmergencySubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-500 dark:text-slate-400">Title</label>
                <input type="text" required value={emergencyForm.title} onChange={(e) => setEmergencyForm({ ...emergencyForm, title: e.target.value })} className="premium-input" placeholder="e.g. Flood Relief" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-500">Description</label>
                <textarea required value={emergencyForm.description} onChange={(e) => setEmergencyForm({ ...emergencyForm, description: e.target.value })} className="premium-textarea" placeholder="Details about the situation..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-500">Meals Needed</label>
                  <input type="number" required value={emergencyForm.requiredMeals} onChange={(e) => setEmergencyForm({ ...emergencyForm, requiredMeals: e.target.value })} className="premium-input" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-500">Duration (Hrs)</label>
                  <input type="number" required value={emergencyForm.durationHours} onChange={(e) => setEmergencyForm({ ...emergencyForm, durationHours: e.target.value })} className="premium-input" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-500">Location</label>
                <input type="text" required value={emergencyForm.location} onChange={(e) => setEmergencyForm({ ...emergencyForm, location: e.target.value })} className="premium-input" placeholder="Area/City" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEmergencyModal(false)} className="premium-button-secondary flex-1">Cancel</button>
                <button type="submit" className="premium-button flex-1">Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRateNgoModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-popIn w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-slate-900">
            <div className="mb-4 text-5xl">🚚</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white">Thanks for your Donation!</h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Your food was successfully collected. Please rate the NGO to help us improve.</p>
            <form onSubmit={handleRateNgoSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Rate NGO (1-5)</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setRateNgoForm({ ...rateNgoForm, rating: star })} className={`text-3xl transition-transform hover:scale-110 ${rateNgoForm.rating >= star ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600'}`}>★</button>
                  ))}
                </div>
              </div>
              <textarea required value={rateNgoForm.review} onChange={(e) => setRateNgoForm({ ...rateNgoForm, review: e.target.value })} className="premium-textarea text-sm" placeholder="How was the pickup process?" rows="3" />
              <button type="submit" className="premium-button w-full">Submit Rating</button>
            </form>
          </div>
        </div>
      )}

      {verifyModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="animate-popIn w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-white">Verify & Rate Donation</h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Please take a photo of the food to verify pickup.</p>
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-500 dark:text-slate-400">Quality Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setVerifyForm({ ...verifyForm, rating: star })} className={`text-3xl transition-transform hover:scale-110 ${verifyForm.rating >= star ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-500 dark:text-slate-400">Review / Note</label>
                <textarea value={verifyForm.review} onChange={(e) => setVerifyForm({ ...verifyForm, review: e.target.value })} className="premium-textarea" placeholder="Food quality was..." required />
              </div>
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                <label className="mb-2 block text-sm font-bold text-slate-500">Photo Proof (Camera Only)</label>
                {!isCameraOpen && !verifyForm.photo && (
                  <button type="button" onClick={startCamera} className="premium-button">Open Camera</button>
                )}
                {isCameraOpen && (
                  <div className="relative overflow-hidden rounded-xl bg-black">
                    <video ref={videoRef} autoPlay playsInline className="h-64 w-full object-cover" />
                    <button type="button" onClick={capturePhoto} className="absolute bottom-4 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full border-4 border-slate-300 bg-white shadow-lg" />
                    <button type="button" onClick={stopCamera} className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white">✕</button>
                  </div>
                )}
                {verifyForm.photo && (
                  <div className="relative">
                    <img src={verifyForm.photo} alt="Proof" className="h-48 w-full rounded-xl object-cover" />
                    <button type="button" onClick={() => setVerifyForm((prev) => ({ ...prev, photo: '' }))} className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">Retake</button>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setVerifyModal(null)} className="premium-button-secondary flex-1">Cancel</button>
                <button type="submit" className="premium-button flex-1">Verify & Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  const renderUserDashboard = () => (
    <RoleShell
      eyebrow="Community Member"
      title={`Welcome back, ${displayProfile.name || 'Member'}`}
      subtitle="Track personal impact, manage donations, and monitor your account activity in a clean, enterprise-style workspace."
      actions={[
        <button key="faq" onClick={() => router.push('/faq')} className="premium-button-secondary">Help Center</button>,
        <button key="donate" onClick={() => router.push('/donate')} className="premium-button">Donate Now</button>
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-12">
        <SurfaceCard className="xl:col-span-8">
          <SectionHeader
            title="Profile Overview"
            subtitle="Your account, role, and status at a glance"
            action={<button onClick={() => setIsEditing((value) => !value)} className="premium-button-ghost min-h-0 px-4 py-2">{isEditing ? 'Close Edit' : 'Edit Profile'}</button>}
          />
          <div className="grid gap-6 p-6 lg:grid-cols-[280px_1fr]">
            <div className="rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-center">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                  <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="58" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                    <circle cx="70" cy="70" r="58" stroke="#166534" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={`${Math.max(progress, 4) * 3.64} 364`} />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-3xl font-semibold text-slate-900">{Math.round(progress)}%</div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Impact</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-center">
                <h3 className="text-xl font-semibold text-slate-900">{displayProfile.status === 'Pending' ? 'Verification Pending' : 'Active Profile'}</h3>
                <p className="text-sm text-slate-500">{displayProfile.bio || 'Add a bio to complete your profile.'}</p>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"><span className="text-sm text-slate-500">Completion</span><span className="font-semibold text-slate-900">{Math.round((['name', 'email', 'phone', 'address', 'city', 'state', 'bio', 'photoURL'].filter((field) => Boolean(displayProfile[field])).length / 8) * 100)}%</span></div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"><span className="text-sm text-slate-500">Community Rank</span><span className="font-semibold text-slate-900">{(() => { const rankIndex = communityLeaderboard.findIndex((entry) => entry._id === displayProfile._id || entry.id === displayProfile.id); return rankIndex >= 0 ? `#${rankIndex + 1}` : '—'; })()}</span></div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"><span className="text-sm text-slate-500">Account ID</span><span className="font-mono text-xs text-slate-700">{user.uid}</span></div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile label="Meals Donated" value={donations.length * 5} hint="Lifetime contribution" accent="text-emerald-700" />
                <StatTile label="CO₂ Reduction" value={`${(donations.length * 1.8).toFixed(1)} t`} hint="Estimated environmental gain" accent="text-slate-900" />
                <StatTile label="Food Waste Reduced" value={`${(donations.length * 7).toFixed(0)} kg`} hint="Recovered through donations" accent="text-orange-700" />
                <StatTile label="Notifications" value={notifications.filter((item) => !item.read).length} hint="Unread updates" accent="text-slate-900" />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Achievement Badges</h3><StatusPill tone="orange">Active</StatusPill></div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {getStoredBadges(displayProfile, donations).map((badge) => <span key={badge} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{badge}</span>)}
                    {getStoredBadges(displayProfile, donations).length === 0 && <EmptyState label="No badges earned yet." />}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Upcoming Donation Reminders</h3><StatusPill tone="green">{donations.filter((donation) => donation.status !== 'completed').length} upcoming</StatusPill></div>
                  <div className="mt-4 space-y-3">
                    {donations.filter((donation) => donation.status !== 'completed').slice(0, 2).map((donation, index) => (
                      <div key={donation._id || donation.id || index} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{donation.type || 'Donation'} pickup</p>
                          <p className="text-xs text-slate-500">{donation.location || 'Scheduled reminder'}</p>
                        </div>
                        <button onClick={() => handleRefreshStatus(donation._id || donation.id)} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Refresh</button>
                      </div>
                    ))}
                    {donations.filter((donation) => donation.status !== 'completed').length === 0 && <EmptyState label="No reminders yet. Donated items will appear here." />}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Monthly Impact</h3><StatusPill tone="green">Live</StatusPill></div>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={buildDailySeries(donations, getDonationWeight)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#166534" strokeWidth={3} dot={{ r: 4, fill: '#166534' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Donation History Timeline</h3><button onClick={() => router.push('/donate')} className="text-sm font-semibold text-emerald-700">View All</button></div>
                  <div className="mt-4 space-y-4">
                    {donations.slice(0, 4).map((donation, index) => (
                      <div key={donation._id || donation.id || index} className="flex gap-4 rounded-xl border border-slate-200 p-4">
                        <div className="mt-1 h-3 w-3 rounded-full bg-emerald-600" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-medium text-slate-900">{donation.type || 'Donation'} donation</p>
                            <StatusPill tone={donation.status === 'completed' ? 'green' : 'orange'}>{donation.status || 'pending'}</StatusPill>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{donation.location || 'Tracked activity'}</p>
                        </div>
                      </div>
                    ))}
                    {donations.length === 0 && <EmptyState label="No donation history yet." />}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-5 xl:col-span-2">
                  <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Nearby NGOs</h3><StatusPill tone="green">Suggested</StatusPill></div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {(nearbyNgos.length > 0 ? nearbyNgos : communityLeaderboard).slice(0, 4).map((ngo, index) => (
                      <div key={ngo._id || ngo.id || index} className="rounded-xl border border-slate-200 p-4">
                        <p className="font-medium text-slate-900">{ngo.organizationName || ngo.name || 'NGO Partner'}</p>
                        <p className="mt-1 text-sm text-slate-500">Rating {Number(ngo.rating || 0).toFixed(1)} · {ngo.ratingCount || 0} reviews</p>
                      </div>
                    ))}
                    {nearbyNgos.length === 0 && communityLeaderboard.length === 0 && <EmptyState label="No nearby NGOs found yet." />}
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900">Account Settings</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <button onClick={() => setIsEditing(true)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"><span>Personal Information</span><span>›</span></button>
                    <button onClick={() => router.push('/profile')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"><span>Security & Privacy</span><span>›</span></button>
                    <button onClick={logout} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-red-600 hover:bg-red-50"><span>Sign Out</span><span>›</span></button>
                  </div>
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                      <StatusPill tone="slate">{notifications.filter((item) => !item.read).length} unread</StatusPill>
                    </div>
                    <div className="mt-3 space-y-2">
                      {notifications.slice(0, 3).map((notification) => (
                        <button key={notification._id} onClick={() => handleNotificationClick(notification)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50">
                          <p className="text-sm font-medium text-slate-900">{notification.message}</p>
                          <p className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleDateString()}</p>
                        </button>
                      ))}
                      {notifications.length === 0 && <EmptyState label="No notifications yet." />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">Quick Actions</h3><StatusPill tone="slate">Fast Access</StatusPill></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button onClick={handleSOS} className="premium-button-secondary justify-start">Emergency SOS</button>
                    <button onClick={() => router.push('/community')} className="premium-button-secondary justify-start">Community Feed</button>
                    <button onClick={() => router.push('/leaderboard')} className="premium-button-secondary justify-start">Ranking</button>
                    <button onClick={() => setShowNotifications((value) => !value)} className="premium-button-secondary justify-start">Notifications</button>
                  </div>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <h3 className="font-semibold text-red-700">Danger Zone</h3>
                  <p className="mt-2 text-sm text-red-700/80">Account deletion remains available from the same workflow.</p>
                  <button onClick={handleDeleteAccount} className="mt-4 premium-button min-h-0 bg-red-600 px-4 py-2 hover:bg-red-700">Delete My Account</button>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </RoleShell>
  );

  const renderRestaurantDashboard = () => (
    <RoleShell
      eyebrow="Restaurant Operations"
      title={displayProfile.organizationName || displayProfile.name || 'Kitchen Operations Dashboard'}
      subtitle="A premium kitchen control room for surplus tracking, pickup scheduling, staff coordination, and financial visibility."
      actions={[
        <button key="report" onClick={() => router.push('/report')} className="premium-button-secondary">Reports</button>,
        <button key="pickup" onClick={() => router.push('/restaurant')} className="premium-button">Quick Donation</button>
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-12">
        <SurfaceCard className="xl:col-span-8">
          <SectionHeader title="Waste Analytics" subtitle="Weekly flow and kitchen impact" action={<StatusPill tone="green">Live</StatusPill>} />
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={buildDailySeries(donations, getDonationWeight)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#166534" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-4">
              <StatTile label="Tax Credit Summary" value={formatNumber(Math.round(donations.reduce((sum, donation) => sum + toNumber(donation.amount), 0)))} hint="Stored donation amounts" accent="text-orange-700" />
              <StatTile label="Meals Logged" value={formatNumber(Math.round(donations.reduce((sum, donation) => sum + getDonationWeight(donation), 0)))} hint="All donations recorded" accent="text-slate-900" />
              <StatTile label="Waste Reduced" value={formatNumber(Math.round(donations.filter((donation) => donation.status === 'completed').reduce((sum, donation) => sum + getDonationWeight(donation), 0)))} hint="Completed transfers" accent="text-emerald-700" />
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-4">
          <SectionHeader title="Pickup Schedule" subtitle="Today’s active logistics" action={<StatusPill tone="orange">{donations.filter((donation) => donation.status !== 'completed').length} due</StatusPill>} />
          <div className="space-y-4 p-6">
            {donations.slice(0, 4).map((donation, index) => (
              <div key={donation._id || donation.id || index} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{donation.foodType || donation.type || 'Pickup'}</p>
                    <p className="text-sm text-slate-500">{donation.location || donation.quantity || 'Scheduled run'}</p>
                  </div>
                  <StatusPill tone={donation.status === 'completed' ? 'green' : 'orange'}>{donation.status || 'pending'}</StatusPill>
                </div>
              </div>
            ))}
            {donations.length === 0 && <EmptyState label="Pickup schedule will appear here once donations are created." />}
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-4">
          <SectionHeader title="Inventory Overview" subtitle="Food expiry and shelf management" action={<button onClick={() => router.push('/inventory')} className="text-sm font-semibold text-emerald-700">Inventory</button>} />
          <div className="space-y-3 p-6">
            {inventoryItems.slice(0, 3).map((row) => (
              <div key={row._id || row.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{row.name}</p>
                  <p className="text-sm text-slate-500">{row.quantity ? `${row.quantity}${row.unit ? ` ${row.unit}` : ''}` : row.note || 'Stored item'}</p>
                </div>
                <StatusPill tone={expiryAlerts.some((item) => item._id === row._id || item.id === row.id) ? 'orange' : 'green'}>{row.expiry || `${row.alertDays || 0} days`}</StatusPill>
              </div>
            ))}
            {inventoryItems.length === 0 && <EmptyState label="No inventory records stored yet." />}
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-8">
          <SectionHeader title="Donation History" subtitle="Completed transfers and tax credit records" action={<button onClick={() => router.push('/donation-wall')} className="text-sm font-semibold text-emerald-700">View All</button>} />
          <div className="grid gap-4 p-6 md:grid-cols-2">
            {donations.slice(0, 4).map((donation, index) => (
              <div key={donation._id || donation.id || index} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{donation.foodType || donation.type || 'Donation'}</p>
                  <StatusPill tone={donation.status === 'completed' ? 'green' : 'orange'}>{donation.status || 'pending'}</StatusPill>
                </div>
                <p className="mt-2 text-sm text-slate-500">{donation.location || 'Tracked transfer'}</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">Tax credit {formatNumber(Math.round(toNumber(donation.amount) || getDonationWeight(donation)))}</p>
              </div>
            ))}
            {donations.length === 0 && <EmptyState label="No donation history yet." />}
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-6">
          <SectionHeader title="Staff Management" subtitle="Team roles and coverage" />
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            {(Array.isArray(displayProfile.dashboardData?.staffMembers) ? displayProfile.dashboardData.staffMembers : []).map((member, index) => (
              <div key={member.id || member.name || index} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-medium text-slate-900">{member.name}</p>
                <p className="mt-1 text-sm text-slate-500">{member.role || member.title || 'Staff member'}</p>
              </div>
            ))}
            {(!displayProfile.dashboardData?.staffMembers || displayProfile.dashboardData.staffMembers.length === 0) && <EmptyState label="No staff records stored yet." />}
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-6">
          <SectionHeader title="Kitchen Performance Metrics" subtitle="Operational health and throughput" />
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            <StatTile label="Completed Donations" value={donations.filter((donation) => donation.status === 'completed').length} hint="Closed pickups" accent="text-emerald-700" />
            <StatTile label="Expiring Soon" value={expiryAlerts.length} hint="Inventory alerts" accent="text-slate-900" />
            <StatTile label="Inventory Items" value={inventoryItems.length} hint="Stored records" accent="text-orange-700" />
          </div>
        </SurfaceCard>
      </div>
    </RoleShell>
  );

  const renderNgoDashboard = () => {
    const markers = nearbyDonations
      .filter((donation) => donation.lat && donation.lng)
      .map((donation) => ({
        ...donation,
        type: 'donation',
        lat: Number(donation.lat),
        lng: Number(donation.lng)
      }));

    return (
      <RoleShell
        eyebrow="NGO Logistics"
        title={displayProfile.organizationName || displayProfile.name || 'Distribution Control Center'}
        subtitle="Coordinate pickups, monitor live requests, and manage food distribution from a logistics-first operating view."
        actions={[
          <button key="find" onClick={() => router.push('/find-food')} className="premium-button-secondary">Find Food</button>,
          <button key="emergency" onClick={() => setShowEmergencyModal(true)} className="premium-button">Post Emergency</button>
        ]}
      >
        <div className="grid gap-6 xl:grid-cols-12">
          <SurfaceCard className="xl:col-span-8">
            <SectionHeader title="Live Map" subtitle="Donation locations and pickup routes" action={<StatusPill tone="green">Real Time</StatusPill>} />
            <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="h-[520px] overflow-hidden rounded-2xl border border-slate-200">
                <Map
                  center={[26.7606, 83.3697]}
                  markers={markers}
                  selectedMarker={selectedLiveMarker}
                  setSelectedMarker={setSelectedLiveMarker}
                  radius={10}
                >
                  {selectedLiveMarker && (
                    <div className="min-w-[220px] p-2">
                      <p className="font-semibold text-slate-900">{selectedLiveMarker.foodType || selectedLiveMarker.type || 'Donation'}</p>
                      <p className="mt-1 text-sm text-slate-500">{selectedLiveMarker.location || 'Pickup location'}</p>
                      <button onClick={() => setVerifyModal(selectedLiveMarker)} className="mt-3 premium-button min-h-0 px-3 py-2 text-sm">Verify Pickup</button>
                    </div>
                  )}
                </Map>
              </div>

              <div className="space-y-4">
                <StatTile label="Warehouse Capacity" value={displayProfile.dashboardData?.warehouseCapacity || 'Not stored'} hint="Stored logistics data" accent="text-emerald-700" />
                <StatTile label="Volunteers Online" value={partnerVolunteers.length} hint="Available for pickup runs" accent="text-slate-900" />
                <StatTile label="Fleet Overview" value={partnerVolunteers.filter((volunteer) => volunteer.vehicle).length} hint="Vehicles assigned" accent="text-orange-700" />
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">Pickup Routes</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    {(displayProfile.dashboardData?.pickupRoutes || nearbyDonations.slice(0, 2).map((donation) => ({ name: donation.location || donation.foodType || 'Pickup route', status: donation.status || 'pending' }))).map((route, index) => (
                      <div key={route.id || route.name || index} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"><span>{route.name}</span><StatusPill tone={route.status === 'completed' ? 'green' : 'orange'}>{route.status || 'pending'}</StatusPill></div>
                    ))}
                    {(displayProfile.dashboardData?.pickupRoutes?.length || nearbyDonations.length) === 0 && <EmptyState label="No pickup routes stored yet." />}
                  </div>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="xl:col-span-4">
            <SectionHeader title="Live Donation Requests" subtitle="Accept, ignore, or verify immediately" action={<StatusPill tone="orange">{nearbyDonations.length}</StatusPill>} />
            <div className="space-y-4 p-6">
              {nearbyDonations.slice(0, 5).map((donation) => (
                <div key={donation.id || donation._id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{donation.foodType || 'Donation Request'}</p>
                      <p className="mt-1 text-sm text-slate-500">{donation.quantity || 'Fresh surplus'} · {donation.location || 'Nearby'}</p>
                    </div>
                    <StatusPill tone={donation.status === 'accepted' ? 'green' : 'orange'}>{donation.status || 'available'}</StatusPill>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {donation.status === 'accepted' && donation.ngoId === user.uid ? (
                      <>
                        <button onClick={() => setVerifyModal(donation)} className="premium-button w-full min-h-0 px-3 py-2 text-sm">Verify Pickup</button>
                        <button onClick={() => handleOpenDonationChat(donation)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                          Chat
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleBookDonation(donation.id || donation._id)} className="premium-button w-full min-h-0 px-3 py-2 text-sm">Accept</button>
                        <button onClick={() => handleOpenDonationChat(donation)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                          Chat
                        </button>
                        <button onClick={() => handleIgnoreDonation(donation.id || donation._id)} className="premium-button-secondary min-h-0 px-3 py-2 text-sm">Ignore</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {nearbyDonations.length === 0 && <EmptyState label="No live requests right now." />}
            </div>
          </SurfaceCard>

          <SurfaceCard className="xl:col-span-5">
            <SectionHeader title="Distribution Timeline" subtitle="Accepted transfers and queue status" />
            <div className="space-y-4 p-6">
              {donations.slice(0, 4).map((donation, index) => (
                <div key={donation._id || donation.id || index} className="flex gap-4 rounded-xl border border-slate-200 p-4">
                  <div className="mt-1 h-3 w-3 rounded-full bg-orange-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{donation.foodType || donation.type || 'Distribution'}</p>
                      <StatusPill tone={donation.status === 'completed' ? 'green' : 'orange'}>{donation.status || 'pending'}</StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{donation.location || 'Route tracked from partner source'}</p>
                  </div>
                </div>
              ))}
              {donations.length === 0 && <EmptyState label="Distribution timeline will appear after accepting requests." />}
            </div>
          </SurfaceCard>

          <SurfaceCard className="xl:col-span-3">
            <SectionHeader title="Notification Center" subtitle="Unread updates and system notices" action={<StatusPill tone="slate">{notifications.filter((item) => !item.read).length}</StatusPill>} />
            <div className="space-y-3 p-6">
              {notifications.slice(0, 5).map((notification) => (
                <button key={notification._id} onClick={() => handleNotificationClick(notification)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50">
                  <p className="text-sm font-medium text-slate-900">{notification.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                </button>
              ))}
              {notifications.length === 0 && <EmptyState label="No notifications yet." />}
            </div>
          </SurfaceCard>

          <SurfaceCard className="xl:col-span-4">
            <SectionHeader title="Partner Restaurants" subtitle="Active collaborators and supply sources" />
            <div className="space-y-3 p-6">
              {(partnerRestaurants.length > 0 ? partnerRestaurants : communityLeaderboard).slice(0, 5).map((restaurant, index) => (
                <div key={restaurant._id || restaurant.id || index} className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="font-medium text-slate-900">{restaurant.organizationName || restaurant.name || 'Restaurant Partner'}</p>
                  <p className="text-sm text-slate-500">Rating {Number(restaurant.rating || 0).toFixed(1)} · {restaurant.points || 0} pts</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="xl:col-span-3">
            <SectionHeader title="Quick Actions" subtitle="Fast controls" />
            <div className="grid gap-3 p-6">
              <button onClick={() => router.push('/find-food')} className="premium-button-secondary justify-start">Find Food</button>
              <button onClick={() => setShowEmergencyModal(true)} className="premium-button-secondary justify-start">Post Emergency</button>
              <button onClick={() => router.push('/chat')} className="premium-button-secondary justify-start">Open Chat</button>
              <button onClick={logout} className="premium-button-secondary justify-start">Logout</button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="xl:col-span-4">
            <SectionHeader title="Monthly Analytics" subtitle="Operational throughput" />
            <div className="p-6">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={[
                    { name: 'Collected', value: nearbyDonations.filter((donation) => donation.status === 'accepted' || donation.status === 'completed').length },
                    { name: 'Available', value: nearbyDonations.filter((donation) => !donation.status || donation.status === 'available' || donation.status === 'pending').length }
                  ]} dataKey="value" innerRadius={65} outerRadius={95} paddingAngle={4}>
                    <Cell fill="#166534" />
                    <Cell fill="#f97316" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SurfaceCard>
        </div>
      </RoleShell>
    );
  };

  const renderAdminDashboard = () => (
    <RoleShell
      eyebrow="Platform Command"
      title="Platform Overview"
      subtitle="Enterprise monitoring for platform health, verification queues, fraud review, and live operational activity."
      showIdentityActions={false}
      showIdentityAvatar={false}
      actions={[
        <button key="alerts" onClick={() => router.push('/report')} className="premium-button-secondary">Broadcast Alert</button>,
        <button key="export" onClick={() => router.push('/admin-dashboard')} className="premium-button">Admin Console</button>
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-12">
        <SurfaceCard className="xl:col-span-12">
          <SectionHeader
            title="Admin Profile"
            subtitle="Identity, access, and platform controls for the current administrator account."
            action={<button onClick={() => setIsEditing(true)} className="premium-button-secondary min-h-0 px-4 py-2">Edit Admin Profile</button>}
          />
          <div className="grid gap-6 p-6 lg:grid-cols-[320px_1fr_340px]">
            <div className="rounded-2xl border border-slate-200 p-6">
              <div className="flex flex-col items-center text-center">
                <button type="button" onClick={handleAvatarClick} className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-3xl font-semibold text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5">
                  {displayProfile.photoURL ? <img src={displayProfile.photoURL} alt="Admin profile" className="h-full w-full object-cover" /> : (displayProfile.name || 'A').slice(0, 1).toUpperCase()}
                </button>
                <div className="mt-4 min-w-0 space-y-1">
                  <h3 className="whitespace-normal break-words text-2xl font-semibold leading-tight text-slate-900">{displayProfile.name || 'Administrator'}</h3>
                  <p className="whitespace-normal break-words text-sm text-slate-500">{displayProfile.email}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap justify-center gap-2">
                  <StatusPill tone="green">Administrator</StatusPill>
                  <StatusPill tone={displayProfile.status === 'Banned' ? 'red' : 'slate'}>{displayProfile.status || 'Active'}</StatusPill>
                </div>
                <button onClick={() => setIsEditing(true)} className="premium-button-secondary min-h-0 px-4 py-2">Edit Profile</button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile label="Total Users" value={adminStats?.users ?? adminUsers.length} hint="Managed accounts" accent="text-slate-900" />
                <StatTile label="Restaurants" value={adminStats?.restaurants ?? adminRestaurants.length} hint="Verified supply nodes" accent="text-emerald-700" />
                <StatTile label="NGOs" value={adminStats?.ngos ?? adminNgos.length} hint="Verified partners" accent="text-orange-700" />
                <StatTile label="Open Reports" value={adminReports.length} hint="Moderation queue" accent="text-red-700" />
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Administrator Notes</h3>
                  <StatusPill tone="green">Live</StatusPill>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Account ID</p>
                    <p className="mt-2 font-mono text-xs text-slate-700">{user.uid}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Access Level</p>
                    <p className="mt-2 font-medium text-slate-900">Full platform control</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Admin Settings</h3>
                <StatusPill tone="slate">Access</StatusPill>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <button onClick={() => setIsEditing(true)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"><span>Edit Profile</span><span>›</span></button>
                <button onClick={() => router.push('/admin-dashboard')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"><span>Open Admin Console</span><span>›</span></button>
                <button onClick={() => router.push('/report')} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"><span>Review Reports</span><span>›</span></button>
                <button onClick={logout} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-red-600 hover:bg-red-50"><span>Sign Out</span><span>›</span></button>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-3"><SectionHeader title="Users" subtitle="Platform-wide" /><div className="p-6"><StatTile label="Total Users" value={adminStats?.users ?? adminUsers.length} hint="Registered accounts" accent="text-slate-900" /></div></SurfaceCard>
        <SurfaceCard className="xl:col-span-3"><SectionHeader title="Restaurants" subtitle="Verified supply nodes" /><div className="p-6"><StatTile label="Restaurants" value={adminStats?.restaurants ?? adminRestaurants.length} hint="Active partners" accent="text-emerald-700" /></div></SurfaceCard>
        <SurfaceCard className="xl:col-span-3"><SectionHeader title="NGOs" subtitle="Verified distribution partners" /><div className="p-6"><StatTile label="NGOs" value={adminStats?.ngos ?? adminNgos.length} hint="Operational groups" accent="text-orange-700" /></div></SurfaceCard>
        <SurfaceCard className="xl:col-span-3"><SectionHeader title="Fraud Reports" subtitle="Review queue" /><div className="p-6"><StatTile label="Reports" value={adminReports.length} hint="Pending or open" accent="text-red-700" /></div></SurfaceCard>

        <SurfaceCard className="xl:col-span-8">
          <SectionHeader title="Platform Analytics" subtitle="Health, throughput, and carbon offset" />
          <div className="grid gap-4 p-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="h-80 rounded-2xl border border-slate-200 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buildDailySeries([...(allDonations || []), ...(adminReports || []), ...(adminUsers || [])], () => 1)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#166534" strokeWidth={3} dot={{ r: 4, fill: '#166534' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <StatTile label="System Health" value={adminStats?.activeDonations ?? allDonations.filter((donation) => donation.status === 'available').length} hint="Live donations available" accent="text-emerald-700" />
              <StatTile label="Carbon Offset" value={platformStats?.meals ?? Math.round(allDonations.reduce((sum, donation) => sum + getDonationWeight(donation), 0))} hint="Meal-equivalent records" accent="text-slate-900" />
              <StatTile label="Active Logistics" value={adminReports.filter((report) => report.status !== 'Resolved').length} hint="Open reports to review" accent="text-orange-700" />
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-4">
          <SectionHeader title="System Health" subtitle="Critical service indicators" action={<StatusPill tone="green">Optimal</StatusPill>} />
          <div className="space-y-4 p-6">
            {[
              { label: 'Logistics Engine', value: `${adminStats?.activeDonations ?? 0} active` },
              { label: 'API Queue', value: `${adminReports.length} reports` },
              { label: 'Verified Partners', value: `${(adminRestaurants.length || 0) + (adminNgos.length || 0)} total` }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between"><span className="text-sm text-slate-500">{item.label}</span><span className="font-semibold text-slate-900">{item.value}</span></div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-4">
          <SectionHeader title="Verification Queue" subtitle="NGO and restaurant onboarding" action={<button onClick={() => router.push('/admin-dashboard')} className="text-sm font-semibold text-emerald-700">View All</button>} />
          <div className="space-y-3 p-6">
            {[...adminNgos.slice(0, 2), ...adminRestaurants.slice(0, 2)].map((entry, index) => (
              <div key={entry._id || entry.id || index} className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="font-medium text-slate-900">{entry.organizationName || entry.name || 'Verification item'}</p>
                <p className="text-sm text-slate-500">{entry.userType === 'ngo' ? 'Pending NGO status' : 'Restaurant verification'}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-4">
          <SectionHeader title="Fraud Reports" subtitle="Recent incidents and actions" />
          <div className="space-y-3 p-6">
            {adminReports.slice(0, 4).map((report, index) => (
              <div key={report._id || index} className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="font-medium text-slate-900">{report.issueType || 'Report'}</p>
                <p className="text-sm text-slate-500">{report.status || 'Pending'}</p>
              </div>
            ))}
            {adminReports.length === 0 && <EmptyState label="No open reports at the moment." />}
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-8">
          <SectionHeader title="Recent Platform Activity" subtitle="Interactive operational feed" />
          <div className="grid gap-4 p-6 lg:grid-cols-2">
            {adminUsers.slice(0, 6).map((entry, index) => (
              <div key={entry._id || index} className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="font-medium text-slate-900">{entry.name || entry.email || 'User'}</p>
                <p className="text-sm text-slate-500">{entry.userType || 'member'} · {entry.status || 'active'}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="xl:col-span-12">
          <SectionHeader title="Admin Quick Actions" subtitle="Core controls preserved" />
          <div className="grid gap-3 p-6 sm:grid-cols-2 xl:grid-cols-4">
            <button onClick={() => router.push('/admin-dashboard')} className="premium-button-secondary justify-start">Manage Platform</button>
            <button onClick={() => router.push('/report')} className="premium-button-secondary justify-start">Review Reports</button>
            <button onClick={() => router.push('/rewards')} className="premium-button-secondary justify-start">Rewards</button>
            <button onClick={logout} className="premium-button-secondary justify-start">Logout</button>
          </div>
        </SurfaceCard>
      </div>
    </RoleShell>
  );

  if (loading) return <div className="flex h-screen items-center justify-center bg-white text-slate-600">Loading...</div>;
  if (!user) return null;

  if (isEditing) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white pt-24 pb-12">
          <div className="section-shell">
            <SurfaceCard>
              <SectionHeader title="Edit Profile" subtitle="Update your account information without changing the rest of the workflow." action={<button onClick={() => setIsEditing(false)} className="premium-button-secondary min-h-0 px-4 py-2">Close</button>} />
              <div className="grid gap-6 p-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-2xl font-semibold text-slate-900">
                        {editForm.photoURL ? <img src={editForm.photoURL} alt="Profile" className="h-full w-full object-cover" /> : (editForm.name || displayProfile.name || 'U').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-900">Profile Photo</p>
                        <p className="text-xs text-slate-500">Upload a profile image for this account.</p>
                        <div className="flex gap-2">
                          <label className="premium-button-secondary min-h-0 cursor-pointer px-4 py-2">
                            Choose Photo
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </label>
                          {editForm.photoURL && <button type="button" onClick={() => setEditForm({ ...editForm, photoURL: '' })} className="premium-button-ghost min-h-0 px-4 py-2">Remove</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="field-label">Full Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="premium-input" />
                  </div>
                  <div>
                    <label className="field-label">Email</label>
                    <input type="text" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="premium-input" />
                  </div>
                  <div>
                    <label className="field-label">Phone Number</label>
                    <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="premium-input" placeholder="+91..." />
                  </div>
                  <div>
                    <label className="field-label">Street Address</label>
                    <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="premium-input" placeholder="House/Flat No, Street" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className="field-label">City</label><input type="text" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="premium-input" /></div>
                    <div><label className="field-label">Pincode</label><input type="text" value={editForm.pincode} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })} className="premium-input" /></div>
                  </div>
                  <div><label className="field-label">State</label><select value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} className="premium-select"><option value="">Select State</option>{indianStates.map((state) => <option key={state} value={state}>{state}</option>)}</select></div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="field-label">Bio</label>
                    <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="premium-textarea h-32" placeholder="Tell us about yourself..." />
                  </div>
                  {userType === 'restaurant' && <><div><label className="field-label">FSSAI License No.</label><input type="text" value={editForm.fssai} onChange={(e) => setEditForm({ ...editForm, fssai: e.target.value })} className="premium-input" /></div><div><label className="field-label">Working Hours</label><input type="text" value={editForm.workingHours} onChange={(e) => setEditForm({ ...editForm, workingHours: e.target.value })} className="premium-input" placeholder="e.g. 9 AM - 10 PM" /></div></>}
                  {userType === 'ngo' && <><div><label className="field-label">Registration No.</label><input type="text" value={editForm.registrationNumber} onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })} className="premium-input" /></div><div><label className="field-label">Coverage Area</label><input type="text" value={editForm.coverageArea} onChange={(e) => setEditForm({ ...editForm, coverageArea: e.target.value })} className="premium-input" /></div></>}
                  {!isAdmin && <div className="grid gap-3 sm:grid-cols-2"><button onClick={() => setIsEditing(false)} className="premium-button-secondary">Cancel</button><button onClick={handleSave} className="premium-button">Save Changes</button></div>}
                </div>
              </div>
            </SurfaceCard>
          </div>
        </main>
      </>
    );
  }

  const dashboardRole = isAdmin ? 'admin' : userType === 'restaurant' ? 'restaurant' : userType === 'ngo' ? 'ngo' : 'user';

  if (dashboardRole === 'admin') return renderAdminDashboard();
  if (dashboardRole === 'restaurant') return renderRestaurantDashboard();
  if (dashboardRole === 'ngo') return renderNgoDashboard();
  return renderUserDashboard();
}