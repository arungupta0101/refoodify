import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { UsersIcon, HeartIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import DevPopup from '../components/DevPopup'; // Popup Component Import kiya

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ meals: 0, donors: 0, ngos: 0 });

  useEffect(() => {
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

      {/* --- ADDED POPUP --- */}
      <DevPopup /> 

      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-lightGreen via-white to-lightOrange relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-5"></div>
        
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 text-center min-h-screen flex items-center">
          <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20"></div>
          <div className="relative max-w-6xl mx-auto">
            <div className="mb-8">
              <span className="inline-block bg-gradient-to-r from-accent to-warm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-bounce-slow shadow-lg">
                🌱 Fighting Food Waste Together
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-8 fade-in leading-tight">
              From Surplus to Service — Save Food, Save Lives.
            </h1>
            <p className="text-xl md:text-3xl text-gray-700 mb-12 leading-relaxed max-w-4xl mx-auto slide-in-left">
              Refoodify connects restaurants, hotels, and households with NGOs to donate surplus food and manage inventory smartly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 mb-12">
              <Link href="/donate" className="group bg-gradient-to-r from-primary to-secondary text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 glow relative overflow-hidden text-center w-full sm:w-auto">
                <span className="relative z-10">🍽️ Donate Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/find-food" className="group bg-gradient-to-r from-warm to-accent text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 relative overflow-hidden text-center w-full sm:w-auto">
                <span className="relative z-10">🔍 Find Free Food</span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-warm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/inventory" className="group bg-white text-gray-800 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 border-2 border-primary hover:border-secondary relative overflow-hidden text-center w-full sm:w-auto">
                <span className="relative z-10">📊 View Stock</span>
                <div className="absolute inset-0 bg-gradient-to-r from-lightGreen to-lightOrange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
            
            {/* Floating Elements (Visual Polish) */}
            <div className="absolute top-20 left-10 animate-float hidden lg:block">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-xl border-t-4 border-primary">🍎</div>
            </div>
            <div className="absolute top-40 right-20 animate-float hidden lg:block" style={{animationDelay: '2s'}}>
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-xl border-t-4 border-warm">🥕</div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
          <div className="absolute inset-0 pattern-grid opacity-5"></div>
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Real-Time Impact</h2>
              <p className="text-xl text-gray-600">Connecting Gorakhpur and beyond through kindness.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="group bg-gradient-to-br from-white to-lightGreen p-10 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                <HeartIcon className="h-16 w-16 text-primary mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-5xl font-bold text-primary mb-3">{stats.meals}</h3>
                <p className="text-gray-600 font-medium">Meals Delivered</p>
              </div>
              <div className="group bg-gradient-to-br from-white to-lightOrange p-10 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                <UsersIcon className="h-16 w-16 text-warm mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-5xl font-bold text-warm mb-3">{stats.donors}</h3>
                <p className="text-gray-600 font-medium">Active Donors</p>
              </div>
              <div className="group bg-gradient-to-br from-white to-blue-50 p-10 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                <BuildingStorefrontIcon className="h-16 w-16 text-info mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-5xl font-bold text-info mb-3">{stats.ngos}</h3>
                <p className="text-gray-600 font-medium">Partnered NGOs</p>
              </div>
            </div>
          </div>
        </section>

        {/* Awareness Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">Why Refoodify Matters?</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto">
              Every year, billions of tons of food are wasted while millions suffer from hunger. We bridge this gap.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-3xl shadow-lg border-b-4 border-primary">
                <h3 className="text-2xl font-bold text-primary mb-2">1.3B Tons</h3>
                <p className="text-gray-500 text-sm uppercase font-bold tracking-wider">Food Wasted Yearly</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border-b-4 border-warm">
                <h3 className="text-2xl font-bold text-warm mb-2">828 Million</h3>
                <p className="text-gray-500 text-sm uppercase font-bold tracking-wider">People Facing Hunger</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border-b-4 border-accent">
                <h3 className="text-2xl font-bold text-accent mb-2">30%</h3>
                <p className="text-gray-500 text-sm uppercase font-bold tracking-wider">Waste Reduction Goal</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 text-gray-800">Community Voices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Card 1 */}
              <div className="bg-gray-50 p-8 rounded-3xl shadow-lg relative border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl">👨‍🍳</div>
                  <div className="ml-4">
                    <p className="font-bold text-gray-800">Harshit Diwedi</p>
                    <p className="text-xs text-primary font-bold">Restaurant Owner</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"Refoodify made donating surplus food effortless. We've reduced waste by 40% and helped feed hundreds!"</p>
              </div>
              {/* Card 2 */}
              <div className="bg-gray-50 p-8 rounded-3xl shadow-lg relative border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-warm/20 flex items-center justify-center text-2xl">🤝</div>
                  <div className="ml-4">
                    <p className="font-bold text-gray-800">Beauty Mishra</p>
                    <p className="text-xs text-warm font-bold">NGO Volunteer</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"Thanks to Refoodify, we receive fresh donations regularly. It's transformed how we serve our community."</p>
              </div>
              {/* Card 3 */}
              <div className="bg-gray-50 p-8 rounded-3xl shadow-lg relative border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-info/20 flex items-center justify-center text-2xl">🏢</div>
                  <div className="ml-4">
                    <p className="font-bold text-gray-800">Nilesh Prajapati</p>
                    <p className="text-xs text-info font-bold">Hotel Manager</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"The inventory management feature is amazing. We track everything perfectly and donate smarter than ever."</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* SOS Button */}
      <button
        onClick={handleSOS}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-full shadow-2xl md:hidden hover:shadow-3xl transform hover:scale-125 transition-all duration-300 animate-pulse relative z-50 group"
        aria-label="Emergency SOS"
      >
        <span className="relative z-10 text-xl font-bold">🚨 SOS</span>
        <div className="absolute -inset-1 bg-red-400 rounded-full opacity-30 animate-ping"></div>
      </button>
    </>
  );
}