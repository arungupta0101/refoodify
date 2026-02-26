import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { signIn } from "next-auth/react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: API endpoint not found or returned non-JSON");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Force Admin Role for specific email (Prototype Fix)
      if (email === 'admin@refoodify.com') {
        data.user.userType = 'admin';
      }

      login(data.user);
      toast.success('Logged in successfully!');
      router.push('/profile');
    } catch (error) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
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

  // Forgot Password Handlers
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      setForgotStep(2);
    } catch (error) {
      toast.error(error.message);
    } finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('OTP Verified!');
      setForgotStep(3);
    } catch (error) {
      toast.error(error.message);
    } finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Password Reset Successfully! Please Login.');
      setShowForgotModal(false);
      setForgotStep(1);
    } catch (error) {
      toast.error(error.message);
    } finally { setIsLoading(false); }
  };

  return (
    <>
    <Header />
    <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-green-50 via-orange-50 to-green-100 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row m-4 z-10 relative">
        
        {/* Left Side - Image/Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-primary to-green-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10">
            <Link href="/" className="text-3xl font-black tracking-tight flex items-center gap-2">
              <span>🌱</span> Refoodify
            </Link>
            <div className="mt-12">
              <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-green-100 text-lg leading-relaxed">
                Join our mission to reduce food waste and feed the hungry. Every login brings us closer to a hunger-free world.
              </p>
            </div>
          </div>
          <div className="relative z-10 mt-12">
            <p className="text-sm text-green-200">© 2024 Refoodify Inc.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h3 className="text-2xl font-bold text-gray-800">Sign In</h3>
            <p className="text-gray-500 mt-2">Please enter your details to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
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
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium text-gray-700 bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
              <div className="flex justify-end">
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs font-bold text-primary hover:text-green-700">Forgot Password?</button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In'
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
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                Create Account
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

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowErrorModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounceIn relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowErrorModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XMarkIcon className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Login Failed</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button 
              onClick={() => setShowErrorModal(false)} 
              className="w-full bg-red-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-bounceIn relative">
            <button onClick={() => { setShowForgotModal(false); setForgotStep(1); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h3>
            <p className="text-gray-500 mb-6 text-sm">Follow the steps to recover your account.</p>

            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-600">Enter Email</label>
                  <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all">
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-600">Enter OTP</label>
                  <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50 text-center tracking-widest text-xl" placeholder="123456" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all">
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" onClick={() => setForgotStep(1)} className="w-full text-gray-500 text-sm font-bold mt-2">Back</button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-600">New Password</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600">Confirm Password</label>
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-all">
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

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
        .animation-delay-4000 {
          animation-delay: 4s;
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