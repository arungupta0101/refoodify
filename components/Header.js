import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MapPinIcon, Bars3Icon, XMarkIcon, ChevronDownIcon, UserCircleIcon, SunIcon, MoonIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const mainLinks = [
    { name: 'Donate', path: '/donate' },
    { name: 'Find Food', path: '/find-food' },
  ];

  const dropdowns = [
    {
      title: 'Partners',
      items: [
        { name: 'Restaurant', path: '/restaurant' },
        { name: 'Inventory', path: '/inventory' },
        { name: 'Campaigns', path: '/campaigns' },
      ]
    },
    {
      title: 'Community',
      items: [
        { name: 'Community Feed', path: '/community' },
        { name: 'Events', path: '/events' },
        { name: 'Blog', path: '/blog' },
        { name: 'Leaderboard', path: '/leaderboard' },
        { name: 'Donation Wall', path: '/donation-wall' },
        { name: 'Volunteer Tasks', path: '/volunteer-tasks' },
        { name: 'Rewards', path: '/rewards' },
      ]
    },
    {
      title: 'More',
      items: [
        { name: 'About', path: '/about' },
        { name: 'Carbon Calculator', path: '/carbon-calculator' },
        { name: 'Support', path: '/support' },
      ]
    }
  ];

  const toggleMobileDropdown = (title) => {
    if (mobileDropdown === title) {
      setMobileDropdown(null);
    } else {
      setMobileDropdown(title);
    }
  };

  return (
    <header className="bg-gradient-to-r from-primary to-secondary dark:from-gray-900 dark:to-gray-800 shadow-lg sticky top-0 z-50 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo */}
          <Link href="/" className="text-3xl font-bold text-white hover:text-light transition duration-300 transform hover:scale-105 flex items-center gap-2">
            <span>🌱</span> Refoodify
          </Link>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Main Links */}
            {mainLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path} 
                className={`text-white font-medium hover:text-light transition duration-300 relative group ${router.pathname === link.path ? 'text-light font-bold' : ''}`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-light transition-all duration-300 ${router.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            ))}

            {/* Dropdowns */}
            {dropdowns.map((group) => (
              <div key={group.title} className="relative group">
                <button className="flex items-center text-white font-medium hover:text-light transition duration-300 gap-1 focus:outline-none py-2">
                  {group.title}
                  <ChevronDownIcon className="h-4 w-4 transition-transform group-hover:rotate-180" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute left-0 mt-0 w-48 bg-white rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50 border border-gray-100">
                  {group.items.map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.path}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Right Icons & Hamburger */}
          <div className="flex items-center space-x-4">
            {/* Install App Button (Visible only if installable) */}
            {deferredPrompt && (
              <button onClick={handleInstallClick} className="hidden lg:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm font-bold transition-all border border-white/30">
                <ArrowDownTrayIcon className="h-4 w-4" /> Install App
              </button>
            )}

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="text-white hover:text-light transition duration-300 p-1" aria-label="Toggle Dark Mode">
              {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>

            {/* Profile Link (Desktop) */}
            <Link href="/profile" className="hidden lg:block text-white hover:text-light transition duration-300" title="Profile">
              <UserCircleIcon className="h-7 w-7" />
            </Link>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden lg:block">
              {user ? (
                <button onClick={logout} className="text-sm font-bold text-white border border-white/30 bg-white/10 px-5 py-2 rounded-full hover:bg-white hover:text-primary transition duration-300 backdrop-blur-sm">
                  Logout
                </button>
              ) : (
                <Link href="/login" className="text-sm font-bold text-primary bg-white px-6 py-2 rounded-full hover:bg-light transition duration-300 shadow-md">
                  Login
                </Link>
              )}
            </div>

            {/* Hamburger Button (Only Mobile) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-1 focus:outline-none"
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-8 w-8" /> : <Bars3Icon className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-xl border-t border-gray-100 animate-fadeIn absolute w-full left-0 top-full max-h-[90vh] overflow-y-auto">
          <div className="px-4 pt-4 pb-6 space-y-2">
            
            {/* Mobile Install Button */}
            {deferredPrompt && (
              <button onClick={handleInstallClick} className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl font-bold mb-4 border border-green-200">
                <ArrowDownTrayIcon className="h-5 w-5" /> Install Refoodify App
              </button>
            )}
            
            {/* Main Links Mobile */}
            {mainLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  router.pathname === link.path ? 'bg-green-50 text-primary' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Dropdowns (Accordions) */}
            {dropdowns.map((group) => (
              <div key={group.title} className="border-b border-gray-100 last:border-0">
                <button 
                  onClick={() => toggleMobileDropdown(group.title)}
                  className="w-full flex justify-between items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  {group.title}
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${mobileDropdown === group.title ? 'rotate-180' : ''}`} />
                </button>
                
                {mobileDropdown === group.title && (
                  <div className="pl-4 pb-2 space-y-1 bg-gray-50/50 rounded-b-xl">
                    {group.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-primary font-medium"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Profile & Auth */}
            <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <Link 
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all"
              >
                <UserCircleIcon className="h-5 w-5" /> Profile
              </Link>
              
              {user ? (
                <button 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                  className="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all"
                >
                  Logout
                </button>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-primary text-white font-bold text-center hover:bg-green-600 transition-all shadow-md"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}