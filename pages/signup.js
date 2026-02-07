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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row m-4 z-10 relative">
        
        {/* Left Side - Image/Branding */}
        <div className="md:w-5/12 bg-gradient-to-br from-orange-500 to-red-500 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10">
            <Link href="/" className="text-3xl font-black tracking-tight flex items-center gap-2">
              <span>🍲</span> Refoodify
            </Link>
            <div className="mt-12">
              <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
              <p className="text-orange-100 text-lg leading-relaxed">
                Create an account to start donating, volunteering, or managing food resources. Together we can make a difference.
              </p>
            </div>
          </div>
          <div className="relative z-10 mt-12">
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-orange-500 bg-gray-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-orange-500 bg-white text-orange-600 flex items-center justify-center text-xs font-bold">+2k</div>
            </div>
            <p className="text-sm text-orange-100 mt-2">Join 2,000+ changemakers</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h3 className="text-2xl font-bold text-gray-800">Create Account</h3>
            <p className="text-gray-500 mt-2">Choose your role and get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Role Selection Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['user', 'donor', 'ngo', 'restaurant'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    userType === type 
                    ? 'border-orange-500 bg-orange-50 text-orange-600' 
                    : 'border-gray-100 text-gray-500 hover:border-orange-200 hover:bg-gray-50'
                  }`}
                >
                  {getTypeIcon(type)}
                  <span className="capitalize text-sm font-bold">{type}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center gap-2 w-full p-3 border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all group"
            >
              <FaGoogle className="text-red-500 text-xl group-hover:scale-110 transition-transform" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className="flex items-center justify-center gap-2 w-full p-3 border-2 border-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all group"
            >
              <FaFacebook className="text-blue-600 text-xl group-hover:scale-110 transition-transform" />
              <span>Facebook</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-orange-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Facebook Coming Soon Modal */}
      {showFacebookModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowFacebookModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounceIn relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowFacebookModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <FaFacebook className="text-blue-600 text-5xl" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Coming Soon! 🚀</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              We are putting the finishing touches on Facebook Login. It will be available in the next update!
            </p>
            <button 
              onClick={() => setShowFacebookModal(false)} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all"
            >
              Okay, I'll wait!
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
    </>
  );
}