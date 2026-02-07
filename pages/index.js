import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { UsersIcon, HeartIcon, BuildingStorefrontIcon, ArrowRightIcon, GlobeAmericasIcon, BoltIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import StatCard from '../components/StatCard';
import TestimonialSlider from '../components/TestimonialSlider';
import CTA from '../components/CTA';
import WelcomeScreen from '../components/WelcomeScreen';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ meals: 0, donors: 0, ngos: 0 });
  const [showWelcome, setShowWelcome] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check session storage for welcome screen
    const hasSeenWelcome = sessionStorage.getItem('refoodify_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
    setIsChecking(false);

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.meals !== undefined) setStats(data);
      })
      .catch(err => console.error("Failed to fetch stats", err));

    // Daily Check-in Logic
    if (user) {
      fetch('/api/user/daily-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      })
      .then(res => res.json())
      .then(data => {
        if (data.pointsAdded > 0) toast.success(data.message, { icon: '🌟' });
      });
    }
  }, []);

  const handleSOS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        toast.success(`🚨 SOS Alert Sent! Location: ${latitude}, ${longitude}`);
        // In production, send to emergency contacts via API
      });
    } else {
      toast.error('Geolocation not supported.');
    }
  };

  const handleWelcomeComplete = () => {
    sessionStorage.setItem('refoodify_welcome_seen', 'true');
    setShowWelcome(false);
  };

  if (isChecking) return null; // Prevent flash

  return (
    <>
      <Head>
        <title>Refoodify - Save Food, Save Lives</title>
        <meta name="description" content="Connect donors with NGOs to reduce food waste." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Refoodify",
            "url": "https://refoodify.com",
          })}
        </script>
      </Head>

      {showWelcome ? (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      ) : (
      <>
      <Header />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen font-sans selection:bg-green-100 selection:text-green-900 relative overflow-hidden"
      >
        
        {/* ===== HERO SECTION ===== */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden"
        >
          <div className="absolute inset-0 -z-10">
             {/* Additional Hero Accents */}
             <div className="absolute top-20 right-10 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl animate-bounce-slow"></div>
             <div className="absolute bottom-20 left-10 w-24 h-24 bg-green-400/20 rounded-full blur-2xl animate-bounce-slow animation-delay-2000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-green-200/50 mb-8 hover:bg-white/80 transition-colors cursor-default shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Live Food Rescue Network</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              From Surplus to Service <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Save Food, Save Lives</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Bridging the gap between abundance and need. We connect restaurants and households with local NGOs to ensure no meal goes to waste.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/donate" className="w-full sm:w-auto px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-green-600/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Donate Now <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link href="/find-food" className="w-full sm:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5">
                Find Free Food
              </Link>
              <Link href="/inventory" className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl transition-all">
                View Stock
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ===== REAL-TIME IMPACT DASHBOARD ===== */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="relative z-10 -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BoltIcon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Live Impact Dashboard</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Live Updates</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={HeartIcon} 
                value={stats.meals} 
                title="Meals Delivered" 
                unit="" 
                accent="emerald" 
              />
              <StatCard 
                icon={UsersIcon} 
                value={stats.donors} 
                title="Active Donors" 
                unit="" 
                accent="blue" 
              />
              <StatCard 
                icon={BuildingStorefrontIcon} 
                value={stats.ngos} 
                title="Partnered NGOs" 
                unit="" 
                accent="purple" 
              />
              <StatCard 
                icon={ArchiveBoxIcon} 
                value={Math.floor((stats.meals || 0) * 0.5)} 
                title="Food Saved" 
                unit="kg" 
                accent="orange" 
              />
            </div>
          </div>
        </motion.section>

        {/* ===== WHY REFOODIFY MATTERS ===== */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="py-24 px-4 max-w-7xl mx-auto relative"
        >
          {/* Background decoration for this section */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
             <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-green-50/50 rounded-full blur-3xl opacity-50"></div>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Refoodify Matters</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">The scale of food waste is massive, but so is our potential to solve it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GlobeAmericasIcon className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-2">1.3B</h3>
              <p className="text-sm font-bold text-red-500 uppercase tracking-wide mb-3">Tons Food Wasted</p>
              <p className="text-gray-500 leading-relaxed">Globally every year. This is the scale of the problem we are working to reduce.</p>
            </div>

            <div className="group p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-100 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UsersIcon className="w-7 h-7 text-orange-500" />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-2">828M</h3>
              <p className="text-sm font-bold text-orange-500 uppercase tracking-wide mb-3">People Facing Hunger</p>
              <p className="text-gray-500 leading-relaxed">Millions of people face food insecurity — connecting surplus food helps close this gap.</p>
            </div>

            <div className="group p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BoltIcon className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-2">30%</h3>
              <p className="text-sm font-bold text-green-500 uppercase tracking-wide mb-3">Waste Reduction Goal</p>
              <p className="text-gray-500 leading-relaxed">Our target to reduce food waste by 2030 — achievable through partnerships and technology.</p>
            </div>
          </div>
        </motion.section>

        {/* ===== COMMUNITY VOICES ===== */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="py-24 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-green-200/50 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Community Voices</h2>
              <p className="text-gray-600">Hear from the heroes making a difference.</p>
            </div>
            <TestimonialSlider />
          </div>
        </motion.section>

        {/* ===== CTA SECTION ===== */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
          className="py-12 px-4 relative z-10"
        >
          <CTA />
        </motion.div>
      </motion.main>

      <Footer />
      </>
      )}
    </>
  );
}