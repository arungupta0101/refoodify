import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRightIcon, MapPinIcon, TrendingUpIcon, Users2Icon, Utensils, Leaf, CheckCircle, ArrowRight, ChevronDown } from 'lucide-react';
import WelcomeScreen from '../components/WelcomeScreen';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ meals: 0, donors: 0, ngos: 0, co2: 0 });
  const [showWelcome, setShowWelcome] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [countMeals, setCountMeals] = useState(0);
  const [countDonors, setCountDonors] = useState(0);
  const [countNgos, setCountNgos] = useState(0);

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('refoodify_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
    setIsChecking(false);

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.meals !== undefined) {
          setStats(data);
          animateCountUp(data.meals, setCountMeals);
          animateCountUp(data.donors, setCountDonors);
          animateCountUp(data.ngos, setCountNgos);
        }
      })
      .catch(err => console.error("Failed to fetch stats", err));

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

  const animateCountUp = (target, setter) => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(Math.floor(current));
      }
    }, duration / steps);
  };

  const handleWelcomeComplete = () => {
    sessionStorage.setItem('refoodify_welcome_seen', 'true');
    setShowWelcome(false);
  };

  if (isChecking) return null;

  const faqs = [
    {
      q: "How do I donate food as a restaurant?",
      a: "Sign up as a restaurant partner, list your surplus food in the inventory system, and our volunteers will handle pickup within 2 hours. It's that simple."
    },
    {
      q: "Is the donated food safe to consume?",
      a: "Absolutely. All donated food is verified for freshness and safety. We only accept food that meets our quality standards and regulatory requirements."
    },
    {
      q: "What areas does Refoodify cover?",
      a: "We currently operate in 45+ cities across India. Check our map to find nearby NGOs and restaurants in your area."
    },
    {
      q: "Can individuals donate food?",
      a: "Yes! Households can donate excess food through our app. Simply list what you have, and nearby volunteers will arrange pickup."
    },
    {
      q: "How do NGOs request food?",
      a: "NGOs can specify their requirements by location, quantity, and dietary needs. Our system matches them with available donors in real-time."
    }
  ];

  return (
    <>
      <Head>
        <title>Refoodify - Every Meal Saved Changes a Life</title>
        <meta name="description" content="Connect donors with NGOs to reduce food waste and fight hunger across India." />
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
          <main className="min-h-screen w-full overflow-x-hidden">

            {/* ===== HERO SECTION: SPLIT LAYOUT ===== */}
            <section className="relative h-screen flex items-center overflow-hidden pt-24 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-40 left-10 w-72 h-72 bg-emerald-300/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-300/5 rounded-full blur-3xl"></div>
              </div>

              <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-20 px-4 lg:px-8 py-20">
                
                {/* LEFT: HEADLINE + CTAs + LOGOS */}
                <motion.div 
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col justify-center space-y-8"
                >
                  <div className="space-y-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Food Rescue Network</p>
                    <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight text-slate-900 dark:text-white">
                      Every Meal Saved Can Change a Life.
                    </h1>
                    <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                      Connect surplus food with those who need it. Real-time matching, verified donors, immediate impact.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link 
                      href="/donate" 
                      className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all hover:-translate-y-1"
                    >
                      Donate Food <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Link>
                    <Link 
                      href="/find-food" 
                      className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                    >
                      Find Nearby NGOs <MapPinIcon className="w-5 h-5 ml-2" />
                    </Link>
                  </div>

                  <div className="pt-8 space-y-6">
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Trusted by</p>
                    <div className="flex flex-wrap gap-6 lg:gap-8">
                      {['Feeding India', 'Akshaya Patra', 'Taj Hotels', 'Google.org'].map((name, i) => (
                        <div key={i} className="px-4 py-2 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* RIGHT: 3D ILLUSTRATION + FLOATING CARDS */}
                <motion.div 
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative h-96 lg:h-full hidden lg:flex items-center justify-center"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Central illustration */}
                    <motion.div 
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute inset-0 flex items-center justify-center z-0"
                    >
                      <div className="relative w-72 h-72 rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop&q=80"
                          alt="Food Donation Illustration"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    </motion.div>

                    {/* Floating stats cards */}
                    <motion.div 
                      animate={{ y: [0, -40, 0], rotate: [-5, 0, -5] }}
                      transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                      className="absolute -top-20 -right-20 lg:top-10 lg:right-0 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 z-10"
                    >
                      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Meals Saved</p>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{countMeals.toLocaleString()}</p>
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, 30, 0], rotate: [5, 0, 5] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                      className="absolute bottom-20 -left-16 lg:bottom-10 lg:left-0 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 z-10"
                    >
                      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Restaurants</p>
                      <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{countDonors}</p>
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, -30, 0], rotate: [-3, 0, -3] }}
                      transition={{ duration: 4.5, repeat: Infinity, delay: 1.5 }}
                      className="absolute -bottom-10 right-10 lg:bottom-5 lg:right-20 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-slate-700 z-10"
                    >
                      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Verified NGOs</p>
                      <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{countNgos}</p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* ===== IMPACT DASHBOARD SECTION ===== */}
            <section className="relative py-24 lg:py-32 px-4 bg-white dark:bg-slate-950">
              <div className="max-w-6xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="text-center mb-16 lg:mb-24"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-4">Real-Time Progress</p>
                  <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Our Impact, Live</h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Tracking every meal, every donation, every life changed.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: Utensils, label: 'Meals Delivered', value: countMeals, unit: '', color: 'emerald' },
                    { icon: Users2Icon, label: 'Active Restaurants', value: countDonors, unit: '', color: 'blue' },
                    { icon: TrendingUpIcon, label: 'Verified NGOs', value: countNgos, unit: '', color: 'purple' },
                    { icon: Leaf, label: 'CO₂ Reduced', value: Math.floor((countMeals || 0) * 2.5), unit: 'kg', color: 'green' }
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    const baseColors = {
                      emerald: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800',
                      blue: 'from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800',
                      purple: 'from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800',
                      green: 'from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800'
                    };
                    const iconColors = {
                      emerald: 'text-emerald-600 dark:text-emerald-400',
                      blue: 'text-blue-600 dark:text-blue-400',
                      purple: 'text-purple-600 dark:text-purple-400',
                      green: 'text-green-600 dark:text-green-400'
                    };
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.15 }}
                        viewport={{ once: true }}
                        className={`relative rounded-3xl border p-8 bg-gradient-to-br ${baseColors[stat.color]}`}
                      >
                        <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-6 ${stat.color === 'emerald' ? 'bg-emerald-600/10' : stat.color === 'blue' ? 'bg-blue-600/10' : stat.color === 'purple' ? 'bg-purple-600/10' : 'bg-green-600/10'}`}>
                          <Icon className={`w-7 h-7 ${iconColors[stat.color]}`} />
                        </div>
                        <p className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-2">
                          {stat.value.toLocaleString()}
                          {stat.unit && <span className="text-2xl ml-2">{stat.unit}</span>}
                        </p>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ===== HOW IT WORKS: TIMELINE ===== */}
            <section className="relative py-24 lg:py-32 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
              <div className="max-w-6xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="text-center mb-16 lg:mb-24"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-4">The Process</p>
                  <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">How Refoodify Works</h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Four simple steps from surplus to service.</p>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
                  {[
                    { step: 1, title: 'Donate', desc: 'Restaurants & households list surplus food with details.' },
                    { step: 2, title: 'Accept', desc: 'Nearby NGOs receive real-time notifications.' },
                    { step: 3, title: 'Pickup', desc: 'Our volunteer network arranges immediate collection.' },
                    { step: 4, title: 'Delivered', desc: 'Food reaches those in need within hours.' }
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.15 }}
                        viewport={{ once: true }}
                        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 h-full relative group hover:border-emerald-400 dark:hover:border-emerald-600 transition-all"
                      >
                        <div className="absolute top-0 left-0 w-16 h-16 -translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-black text-2xl border-4 border-white dark:border-slate-950">
                          {item.step}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 pt-6">{item.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300">{item.desc}</p>
                      </motion.div>
                      {i < 3 && (
                        <div className="hidden md:block absolute top-24 -right-6 lg:-right-8 text-slate-300 dark:text-slate-700">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ===== FEATURES: ALTERNATING LAYOUT ===== */}
            <section className="relative py-24 lg:py-32 px-4 bg-white dark:bg-slate-950">
              <div className="max-w-6xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="text-center mb-16 lg:mb-24"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-4">Capabilities</p>
                  <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Built for Impact</h2>
                </motion.div>

                {[
                  { title: 'Real-Time Matching', desc: 'AI-powered matching connects surplus food with nearest NGOs instantly.', icon: TrendingUpIcon, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=500&fit=crop&q=80', imageAlt: 'Real-time matching dashboard' },
                  { title: 'Transparent Tracking', desc: 'From pickup to delivery, track every meal and verify impact in real-time.', icon: MapPinIcon, image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=500&fit=crop&q=80', imageAlt: 'Tracking and analytics' },
                  { title: 'Verified Network', desc: 'All donors and recipients are verified, ensuring food safety and trustworthiness.', icon: CheckCircle, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=500&fit=crop&q=80', imageAlt: 'Verified network' }
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true, amount: 0.3 }}
                      className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 lg:py-20 border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${feature.image === 'right' ? 'lg:[&>div:first-child]:order-2' : ''}`}
                    >
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
                      </div>
                      <div className="relative h-80 lg:h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800/30 shadow-xl">
                        <Image
                          src={feature.image}
                          alt={feature.imageAlt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* ===== SUCCESS STORIES ===== */}
            <section className="relative py-24 lg:py-32 px-4 bg-slate-50 dark:bg-slate-900">
              <div className="max-w-6xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="text-center mb-16 lg:mb-24"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-4">Impact Stories</p>
                  <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Real Lives, Real Change</h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { city: 'Delhi', impact: '2.4K Meals', story: 'Local restaurant chain redirected 2,400 meals in Q3, impacting 1,200+ families.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop&q=80' },
                    { city: 'Mumbai', impact: '5.1K Meals', story: 'Partnership with premium catering business saved premium meals daily.', image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=400&fit=crop&q=80' },
                    { city: 'Bangalore', impact: '1.8K Meals', story: 'College collaboration reduced waste while feeding students in need.', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop&q=80' }
                  ].map((story, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: i * 0.15 }}
                      viewport={{ once: true }}
                      className="group rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-xl transition-all"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-blue-500 overflow-hidden">
                        <Image
                          src={story.image}
                          alt={story.city}
                          fill
                          className="object-cover"
                        />
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-tr from-emerald-600/60 to-transparent"
                        ></motion.div>
                      </div>
                      <div className="p-8">
                        <p className="text-sm uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mb-2">{story.city}</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{story.impact}</h3>
                        <p className="text-slate-600 dark:text-slate-300">{story.story}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ===== COMPARISON: TRADITIONAL VS REFOODIFY ===== */}
            <section className="relative py-24 lg:py-32 px-4 bg-white dark:bg-slate-950">
              <div className="max-w-5xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="text-center mb-16 lg:mb-24"
                >
                  <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Why Choose Refoodify?</h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                  <motion.div 
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="rounded-3xl border-2 border-red-200 dark:border-red-900/30 p-8 lg:p-12 bg-red-50/50 dark:bg-red-950/10"
                  >
                    <p className="text-xs uppercase tracking-wider font-bold text-red-600 dark:text-red-400 mb-4">Traditional Disposal</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Waste & Loss</h3>
                    <ul className="space-y-4">
                      {['Food sent to landfill', 'Environmental guilt', 'Zero social impact', 'Costly disposal', 'Hidden waste'].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                          <span className="text-red-500 font-bold mt-1">✕</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="rounded-3xl border-2 border-emerald-400 dark:border-emerald-600/50 p-8 lg:p-12 bg-emerald-50/50 dark:bg-emerald-950/10 shadow-xl shadow-emerald-600/10"
                  >
                    <p className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mb-4">Refoodify Impact</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Meals & Change</h3>
                    <ul className="space-y-4">
                      {['Food reaches those in need', 'Real environmental impact', 'CSV impact reports', 'Tax deductible donations', 'Community building'].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* ===== FAQ ACCORDION ===== */}
            <section className="relative py-24 lg:py-32 px-4 bg-slate-50 dark:bg-slate-900">
              <div className="max-w-3xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="text-center mb-16"
                >
                  <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6">Questions?</h2>
                </motion.div>

                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8 text-left hover:border-emerald-400 dark:hover:border-emerald-600 transition-all text-slate-900 dark:text-white"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-lg lg:text-xl font-bold">{faq.q}</h3>
                          <motion.div animate={{ rotate: expandedFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                          </motion.div>
                        </div>
                        <motion.div
                          animate={{ height: expandedFaq === i ? 'auto' : 0, opacity: expandedFaq === i ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">{faq.a}</p>
                        </motion.div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ===== FINAL CTA ===== */}
            <section className="relative py-24 lg:py-32 px-4 bg-gradient-to-br from-slate-900 to-slate-950 dark:from-black dark:to-slate-950 overflow-hidden">
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, amount: 0.5 }}
                className="max-w-3xl mx-auto text-center"
              >
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-6 leading-tight">
                  Ready to Feed Someone Today?
                </h2>
                <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">Join thousands of donors, volunteers, and NGOs making a real difference.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/donate" 
                    className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all hover:-translate-y-1"
                  >
                    Donate Food <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                  <Link 
                    href="/find-food" 
                    className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-white text-white font-bold text-lg hover:bg-white/10 transition-all"
                  >
                    Become a Partner <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </motion.div>
            </section>

          </main>
          <Footer />
        </>
      )}
    </>
  );
}