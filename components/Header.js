import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bars3Icon, XMarkIcon, ChevronDownIcon, UserCircleIcon, SunIcon, MoonIcon, ArrowDownTrayIcon, HeartIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
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
    { name: 'Report Issue', path: '/report' },
  ];

  const dropdowns = [
    {
      title: 'Partners',
      items: [
        { name: 'Restaurant', path: '/restaurant' },
        { name: 'Inventory', path: '/inventory' },
        { name: 'AI Demand Prediction', path: '/demand-prediction' },
        { name: 'AI Surplus Prediction', path: '/surplus-prediction' },
        { name: 'AI Route Optimization', path: '/route-optimization' },
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

  const isActive = (path) => router.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-2xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="section-shell">
        <div className="flex h-20 items-center justify-between gap-4">

          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm transition-transform duration-300 group-hover:rotate-6 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <HeartIcon className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="block text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Refoodify</span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:block dark:text-slate-400">Food rescue network</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {mainLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive(link.path) ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
              >
                {isActive(link.path) && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-emerald-500" />}
                {link.name}
              </Link>
            ))}

            {dropdowns.map((group) => (
              <div key={group.title} className="relative group">
                <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white">
                  {group.title}
                  <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                <div className="absolute left-0 top-full z-50 mt-3 w-64 rounded-2xl border border-slate-200 bg-white/95 p-2 opacity-0 shadow-2xl backdrop-blur-xl invisible transition-all duration-200 translate-y-2 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-950/95">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.path}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-emerald-300"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {deferredPrompt && (
              <button onClick={handleInstallClick} className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all hover:-translate-y-0.5 hover:bg-emerald-100 lg:flex dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60">
                <ArrowDownTrayIcon className="h-4 w-4" /> Install App
              </button>
            )}

            <button onClick={toggleTheme} aria-label="Toggle theme" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-900/60 dark:hover:text-emerald-300">
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <div className="hidden items-center gap-3 pl-4 lg:flex">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="rounded-full border border-transparent p-1 transition-all hover:border-emerald-200 dark:hover:border-emerald-700">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-slate-500 dark:text-slate-300" />
                    )}
                  </Link>
                  <button onClick={logout} className="text-sm font-semibold text-slate-600 transition-colors hover:text-rose-500 dark:text-slate-300">
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="premium-button-secondary">
                  Login
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute left-0 top-full max-h-[90vh] w-full overflow-y-auto border-t border-slate-200 bg-white/95 shadow-2xl backdrop-blur-2xl animate-fadeIn dark:border-slate-800 dark:bg-slate-950/95">
          <div className="px-4 pb-6 pt-4 space-y-2">

            {deferredPrompt && (
              <button onClick={handleInstallClick} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <ArrowDownTrayIcon className="h-5 w-5" /> Install Refoodify App
              </button>
            )}

            {mainLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-base font-semibold transition-all ${isActive(link.path) ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {dropdowns.map((group) => (
              <div key={group.title} className="border-b border-slate-200 last:border-0 dark:border-slate-800">
                <button
                  onClick={() => toggleMobileDropdown(group.title)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  {group.title}
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${mobileDropdown === group.title ? 'rotate-180' : ''}`} />
                </button>

                {mobileDropdown === group.title && (
                  <div className="space-y-1 rounded-b-2xl bg-slate-50/80 pb-2 pl-4 dark:bg-slate-900/70">
                    {group.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-all hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <UserCircleIcon className="h-5 w-5" /> Profile
              </Link>

              {user ? (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 font-semibold text-rose-600 transition-all hover:-translate-y-0.5 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="premium-button text-center"
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