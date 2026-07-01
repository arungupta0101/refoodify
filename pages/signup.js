import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { EnvelopeIcon, LockClosedIcon, UserIcon, BuildingStorefrontIcon, HeartIcon, UserGroupIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { signIn } from "next-auth/react";

export default function Signup() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('user');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password Strength Validation
    if (password.length < 6) {
      toast.error('Password is too weak. Please use at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("API Error (Non-JSON):", text);
        throw new Error("Server error. Please check console for details.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Check for Admin Access (Strict check for specific credentials)
      if (email === 'admin@refoodify.com' && password === 'RefoodifyAdmin@2024!') {
        data.user.userType = 'admin';
        login(data.user);
        toast.success('Admin Account created!');
        router.push('/profile');
      } else {
        login(data.user);
        toast.success('Account created! Status: Pending Verification.');
        router.push('/profile');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Facebook') {
      setShowFacebookModal(true);
      return;
    }
    signIn(provider.toLowerCase(), { callbackUrl: '/profile' });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'restaurant': return <BuildingStorefrontIcon className="h-5 w-5" />;
      case 'ngo': return <UserGroupIcon className="h-5 w-5" />;
      case 'donor': return <HeartIcon className="h-5 w-5" />;
      default: return <UserIcon className="h-5 w-5" />;
    }
  };

  return (
    <>
    <Header />
    <div className="min-h-screen flex items-center justify-center p-4 pt-28">
      <div className="relative w-full max-w-6xl">
        <div className="absolute -top-40 -right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10" />

        <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 shadow-2xl backdrop-blur-lg lg:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/80">
        
          <div className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:block lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.22),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.25),rgba(2,6,23,0.9))]" />
            <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=80" alt="Community food" className="absolute inset-0 h-full w-full object-cover opacity-25" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white">
                <span>Refoodify</span>
              </Link>
              <div className="max-w-md py-12">
                <span className="page-kicker mb-5 border-white/15 bg-white/10 text-white/90">Create account</span>
                <h2 className="text-4xl font-black tracking-tight text-white lg:text-5xl">Start your journey.</h2>
                <p className="mt-5 text-base leading-7 text-slate-200 lg:text-lg">
                  Join the network that helps restaurants, NGOs, and communities move food where it’s needed most.
                </p>
              </div>
              <p className="text-sm text-slate-300">Trusted by teams building a more efficient food rescue system.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <div className="mb-8 text-center md:text-left">
              <h3 className="section-heading text-3xl font-bold">Create Your Account</h3>
              <p className="section-copy mt-3 text-base">Set up your organization or personal profile in a few steps.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['user', 'donor', 'ngo', 'restaurant'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`premium-card flex flex-col items-center justify-center gap-2 p-4 text-sm font-semibold capitalize transition-all hover:shadow-md ${
                      userType === type ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300' : 'text-slate-500 hover:-translate-y-0.5 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {getTypeIcon(type)}
                    {type}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="field-label">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="premium-input py-3.5 pl-11 pr-4"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="field-label">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="premium-input py-3.5 pl-11 pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <p className="ml-1 text-xs text-slate-400">Must be at least 6 characters</p>
              </div>

              <button type="submit" disabled={isLoading} className="premium-button w-full">
                {isLoading ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : 'Create Account'}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-sm font-medium text-slate-400">Or continue with</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => handleSocialLogin('Google')} className="premium-button-secondary w-full">
                <FaGoogle className="text-red-500" />
                Google
              </button>
              <button type="button" onClick={() => handleSocialLogin('Facebook')} className="premium-button-secondary w-full">
                <FaFacebook className="text-blue-600" />
                Facebook
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Facebook Coming Soon Modal */}
      {showFacebookModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setShowFacebookModal(false)}>
          <div className="premium-card relative w-full max-w-sm p-8 text-center animate-bounceIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowFacebookModal(false)} className="absolute right-4 top-4 text-2xl font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
              <FaFacebook className="text-blue-600 text-5xl" />
            </div>
            <h3 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">Coming Soon! 🚀</h3>
            <p className="mb-8 leading-relaxed text-slate-500 dark:text-slate-400">
              We are putting the finishing touches on Facebook Login. It will be available in the next update!
            </p>
            <button 
              onClick={() => setShowFacebookModal(false)} 
              className="premium-button w-full bg-blue-600 hover:bg-blue-700"
            >
              Okay, I'll wait!
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
    </>
  );
}