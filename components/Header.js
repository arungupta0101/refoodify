import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MapPinIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    { name: 'Donate', path: '/donate' },
    { name: 'Find Food', path: '/find-food' },
    { name: 'Restaurant', path: '/restaurant' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'About', path: '/about' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <header className="bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo */}
          <Link href="/" className="text-3xl font-bold text-white hover:text-light transition duration-300 transform hover:scale-105">
            Refoodify
          </Link>

          {/* Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path} 
                className="text-white hover:text-light transition duration-300 relative group"
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-light transition-all duration-300 ${router.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            ))}
          </nav>

          {/* Right Icons & Hamburger */}
          <div className="flex items-center space-x-4">
            <MapPinIcon className="hidden sm:block h-6 w-6 text-white hover:text-light transition duration-300 cursor-pointer" />
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:block">
              {user ? (
                <button onClick={logout} className="text-white border border-white px-4 py-1 rounded-full hover:bg-white hover:text-primary transition duration-300">
                  Logout
                </button>
              ) : (
                <Link href="/login" className="text-white border border-white px-4 py-1 rounded-full hover:bg-white hover:text-primary transition duration-300">
                  Login
                </Link>
              )}
            </div>

            {/* Hamburger Button (Only Mobile) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-1 focus:outline-none"
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-8 w-8" /> : <Bars3Icon className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary shadow-inner border-t border-white/10 animate-fadeIn">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded-xl text-base font-medium transition-all ${
                  router.pathname === link.path ? 'bg-white text-primary shadow-lg' : 'text-white hover:bg-secondary/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/20">
              {user ? (
                <button 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                  className="w-full text-left px-3 py-3 text-white font-bold"
                >
                  Logout
                </button>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-3 text-white font-bold"
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