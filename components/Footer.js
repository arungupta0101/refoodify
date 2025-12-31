import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <HeartIcon className="h-8 w-8 text-primary mr-2" />
              <h3 className="text-2xl font-bold text-white">Refoodify</h3>
            </div>
            <p className="text-gray-300 mb-4">Connecting surplus food with those in need. Together, we can reduce waste and fight hunger.</p>
            <p className="text-sm text-gray-400">© 2025 Refoodify. All rights reserved.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-300 hover:text-primary transition duration-300">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-primary transition duration-300">Contact</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-primary transition duration-300">FAQ</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-primary transition duration-300">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Get Involved</h4>
            <ul className="space-y-2">
              <li><Link href="/donate" className="text-gray-300 hover:text-primary transition duration-300">Donate Food</Link></li>
              <li><Link href="/find-food" className="text-gray-300 hover:text-primary transition duration-300">Find Food</Link></li>
              <li><Link href="/inventory" className="text-gray-300 hover:text-primary transition duration-300">Manage Inventory</Link></li>
              <li><Link href="/profile" className="text-gray-300 hover:text-primary transition duration-300">Join as NGO</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">Made with ❤️ for a better world</p>
        </div>
      </div>
    </footer>
  );
}