import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { UsersIcon, HeartIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleSOS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        toast.success(`SOS sent! Location: ${latitude}, ${longitude}`);
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
              <span className="inline-block bg-gradient-to-r from-accent to-warm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-bounce-slow">
                🌱 Fighting Food Waste Together
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-8 fade-in leading-tight">
              From Surplus to Service — Save Food, Save Lives.
            </h1>
            <p className="text-xl md:text-3xl text-gray-700 mb-12 leading-relaxed max-w-4xl mx-auto slide-in-left">
              Connect restaurants, hotels, and households with NGOs to donate surplus food and manage inventory smartly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-6 sm:space-y-0 sm:space-x-8 mb-12">
              <Link href="/donate" className="group bg-gradient-to-r from-primary to-secondary text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 glow relative overflow-hidden">
                <span className="relative z-10">🍽️ Donate Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/find-food" className="group bg-gradient-to-r from-warm to-accent text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 relative overflow-hidden">
                <span className="relative z-10">🔍 Find Free Food</span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-warm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/inventory" className="group bg-white text-gray-800 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 border-2 border-primary hover:border-secondary relative overflow-hidden">
                <span className="relative z-10">📊 View Your Stock</span>
                <div className="absolute inset-0 bg-gradient-to-r from-lightGreen to-lightOrange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-20 left-10 animate-float">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                🍎
              </div>
            </div>
            <div className="absolute top-40 right-20 animate-float" style={{animationDelay: '2s'}}>
              <div className="w-12 h-12 bg-gradient-to-r from-warm to-accent rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                🥕
              </div>
            </div>
            <div className="absolute bottom-32 left-20 animate-float" style={{animationDelay: '4s'}}>
              <div className="w-14 h-14 bg-gradient-to-r from-accent to-info rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                🍞
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-white via-lightGreen to-white relative">
          <div className="absolute inset-0 pattern-grid opacity-10"></div>
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 slide-in-left">Our Impact</h2>
              <p className="text-xl text-gray-600 slide-in-right">Making a difference, one meal at a time</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
              <div className="group bg-gradient-to-br from-white to-lightGreen p-10 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-500 slide-in-left relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <HeartIcon className="h-16 w-16 text-primary mx-auto mb-6 group-hover:animate-bounce" />
                  <h3 className="text-5xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">10,000+</h3>
                  <p className="text-gray-700 font-semibold text-lg">Meals Saved</p>
                  <div className="mt-4 w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
                </div>
              </div>
              <div className="group bg-gradient-to-br from-white to-lightOrange p-10 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-500 slide-in-right relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-warm/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <UsersIcon className="h-16 w-16 text-warm mx-auto mb-6 group-hover:animate-bounce" />
                  <h3 className="text-5xl font-bold text-warm mb-3 group-hover:text-accent transition-colors">500+</h3>
                  <p className="text-gray-700 font-semibold text-lg">Donors</p>
                  <div className="mt-4 w-16 h-1 bg-gradient-to-r from-warm to-accent mx-auto rounded-full"></div>
                </div>
              </div>
              <div className="group bg-gradient-to-br from-white to-lightBlue p-10 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-500 slide-in-left relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <BuildingStorefrontIcon className="h-16 w-16 text-info mx-auto mb-6 group-hover:animate-bounce" />
                  <h3 className="text-5xl font-bold text-info mb-3 group-hover:text-primary transition-colors">200+</h3>
                  <p className="text-gray-700 font-semibold text-lg">NGOs</p>
                  <div className="mt-4 w-16 h-1 bg-gradient-to-r from-info to-primary mx-auto rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Awareness Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-lightOrange to-lightGreen relative">
          <div className="absolute inset-0 pattern-waves opacity-10"></div>
          <div className="relative max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-8 slide-in-left">Food Wastage Awareness</h2>
            <p className="text-xl text-gray-700 mb-12 max-w-4xl mx-auto slide-in-right">
              Every year, billions of tons of food are wasted globally. At Refoodify, our mission is to connect surplus food with those in need, reducing waste and fighting hunger simultaneously.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <h3 className="text-2xl font-bold text-primary mb-4">1.3 Billion Tons</h3>
                <p className="text-gray-600">Food wasted annually worldwide</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <h3 className="text-2xl font-bold text-warm mb-4">828 Million</h3>
                <p className="text-gray-600">People suffering from hunger</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-2xl">
                <h3 className="text-2xl font-bold text-accent mb-4">30%</h3>
                <p className="text-gray-600">Reduction in waste through our platform</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-6 sm:space-y-0 sm:space-x-8">
              <Link href="/donate" className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300">
                Join the Fight Against Waste
              </Link>
              <Link href="/about" className="bg-white text-gray-800 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 border-2 border-primary">
                Learn Our Impact
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-lightGreen to-white relative">
          <div className="absolute inset-0 bg-food-donation bg-cover bg-center opacity-5"></div>
          <div className="relative max-w-7xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 text-primary slide-in-left">What People Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="group bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 slide-in-left relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Restaurant Owner" className="w-16 h-16 rounded-full object-cover border-4 border-primary" />
                    <div className="ml-4">
                      <p className="font-bold text-gray-800 text-lg">Marcus Johnson</p>
                      <p className="text-sm text-gray-500">Restaurant Owner • New York</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed">"Refoodify made donating surplus food effortless. We've reduced waste by 40% and helped feed hundreds in our community!"</p>
                </div>
              </div>
              <div className="group bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 slide-in-right relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-warm/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="NGO Volunteer" className="w-16 h-16 rounded-full object-cover border-4 border-warm" />
                    <div className="ml-4">
                      <p className="font-bold text-gray-800 text-lg">Sarah Chen</p>
                      <p className="text-sm text-gray-500">NGO Volunteer • California</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed">"Thanks to Refoodify, we receive fresh donations regularly. It's transformed how we serve our community."</p>
                </div>
              </div>
              <div className="group bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 slide-in-left relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Hotel Manager" className="w-16 h-16 rounded-full object-cover border-4 border-info" />
                    <div className="ml-4">
                      <p className="font-bold text-gray-800 text-lg">David Rodriguez</p>
                      <p className="text-sm text-gray-500">Hotel Manager • Texas</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                  </div>
                  <p className="text-gray-700 italic text-lg leading-relaxed">"The inventory management feature is amazing. We track everything perfectly and donate smarter than ever."</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* SOS Button - Sticky on Mobile */}
      <button
        onClick={handleSOS}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-full shadow-2xl md:hidden hover:shadow-3xl transform hover:scale-125 transition-all duration-300 glow animate-pulse-slow relative overflow-hidden group"
        aria-label="Emergency SOS"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
        <span className="relative z-10 text-xl font-bold flex items-center justify-center">
          🚨 SOS
        </span>
        <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-red-500 rounded-full opacity-30 group-hover:opacity-50 animate-ping"></div>
      </button>
    </>
  );
}