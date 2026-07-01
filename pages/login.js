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
    <div className="min-h-screen flex items-center justify-center p-4 pt-28">
      <div className="relative w-full max-w-6xl">
        <div className="absolute -top-40 -left-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -z-10" />

        <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 shadow-2xl backdrop-blur-lg lg:grid-cols-2 dark:border-slate-800 dark:bg-slate-950/80">
        
          <div className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:block lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.22),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.25),rgba(2,6,23,0.9))]" />
            <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1600&q=80" alt="Food rescue" className="absolute inset-0 h-full w-full object-cover opacity-25" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white">
                <span>Refoodify</span>
              </Link>
              <div className="max-w-md py-12">
                <span className="page-kicker mb-5 border-white/15 bg-white/10 text-white/90">Secure access</span>
                <h2 className="text-4xl font-black tracking-tight text-white lg:text-5xl">Welcome back.</h2>
                <p className="mt-5 text-base leading-7 text-slate-200 lg:text-lg">
                  Continue managing donations, food rescue operations, and community impact from a trusted control center.
                </p>
              </div>
              <p className="text-sm text-slate-300">© {new Date().getFullYear()} Refoodify. Designed for modern food rescue teams.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <div className="mb-8 text-center md:text-left">
              <h3 className="section-heading text-3xl font-bold">Welcome Back</h3>
              <p className="section-copy mt-3 text-base">Enter your details to continue with the platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="premium-button w-full"
              >
                {isLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-sm font-medium text-slate-400">Or continue with</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="premium-button-secondary w-full"
              >
                <FaGoogle className="text-red-500" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="premium-button-secondary w-full"
              >
                <FaFacebook className="text-blue-600" />
                Facebook
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link href="/signup" className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200">
                  Create Account
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

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setShowErrorModal(false)}>
          <div className="premium-card relative w-full max-w-sm p-8 text-center animate-bounceIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowErrorModal(false)} className="absolute right-4 top-4 text-2xl font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
              <XMarkIcon className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">Login Failed</h3>
            <p className="mb-8 leading-relaxed text-slate-500 dark:text-slate-400">
              {errorMessage}
            </p>
            <button 
              onClick={() => setShowErrorModal(false)} 
              className="premium-button w-full bg-red-600 hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="premium-card relative w-full max-w-md p-8 animate-bounceIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setShowForgotModal(false); setForgotStep(1); }} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XMarkIcon className="h-6 w-6" /></button>
            
            <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Follow the steps to recover your account.</p>

            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="field-label">Enter Email</label>
                  <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="premium-input px-4 py-3" placeholder="you@example.com" />
                </div>
                  <button type="submit" disabled={isLoading} className="premium-button w-full">
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="field-label">Enter OTP</label>
                  <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} className="premium-input px-4 py-3 text-center text-xl tracking-[0.35em]" placeholder="123456" />
                </div>
                  <button type="submit" disabled={isLoading} className="premium-button w-full">
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                  <button type="button" onClick={() => setForgotStep(1)} className="mt-2 w-full text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Back</button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="field-label">New Password</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="premium-input px-4 py-3" placeholder="••••••••" />
                </div>
                <div>
                  <label className="field-label">Confirm Password</label>
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="premium-input px-4 py-3" placeholder="••••••••" />
                </div>
                  <button type="submit" disabled={isLoading} className="premium-button w-full">
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

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