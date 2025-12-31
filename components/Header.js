import Link from 'next/link';
import { MapPinIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-3xl font-bold text-white hover:text-light transition duration-300 transform hover:scale-105">
            Refoodify
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/donate" className="text-white hover:text-light transition duration-300 relative group">
              Donate
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-light transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/find-food" className="text-white hover:text-light transition duration-300 relative group">
              Find Food
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-light transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/restaurant" className="text-white hover:text-light transition duration-300 relative group">
              Restaurant
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-light transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/inventory" className="text-white hover:text-light transition duration-300 relative group">
              Inventory
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-light transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/profile" className="text-white hover:text-light transition duration-300 relative group">
              Profile
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-light transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <MapPinIcon className="h-6 w-6 text-white hover:text-light transition duration-300 cursor-pointer" />
            {user ? (
              <button onClick={logout} className="text-white hover:text-light transition duration-300">
                Logout
              </button>
            ) : (
              <Link href="/login" className="text-white hover:text-light transition duration-300">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}