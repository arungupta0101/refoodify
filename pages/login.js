import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Login() {
  const [authMethod, setAuthMethod] = useState('password'); // 'password' or 'emailLink'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [userType, setUserType] = useState('user'); // user, donor, ngo
  const router = useRouter();

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      signInWithEmailLink(auth, email, window.location.href)
        .then(async (result) => {
          const response = await fetch('/api/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: result.user.uid,
              email,
              userType: window.localStorage.getItem('userType') || 'user',
            }),
          });
          
          window.localStorage.removeItem('emailForSignIn');
          window.localStorage.removeItem('userType');
          toast.success('Successfully signed in!');
          router.push('/profile');
        })
        .catch((error) => {
          toast.error('Sign-in failed: ' + error.message);
        });
    }
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // --- HARDCODED ADMIN CHECK ---
    if (email === 'arunjacker0101@gmail.com' && password === 'Arun@12345') {
      toast.success('Welcome Admin, Arun!');
      localStorage.setItem('isAdmin', 'true'); // Store admin session
      router.push('/admin-dashboard');
      return;
    }

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const response = await fetch('/api/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: userCredential.user.uid,
            email,
            userType,
          }),
        });
        
        if (!response.ok) throw new Error('Failed to create user');
        toast.success('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');
      }
      router.push('/profile');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEmailLinkSubmit = async (e) => {
    e.preventDefault();
    const actionCodeSettings = {
      url: 'http://localhost:3000/login',
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      window.localStorage.setItem('userType', userType);
      toast.success('Sign-in link sent to your email!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }
    try {
      const response = await fetch(`/api/check-user?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (!data.exists) {
        toast.error('Account not found. Please register first.');
        return;
      }
      
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">Refoodify Portal</h1>

        {/* Auth Method Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-xl p-1 shadow-inner">
          <button
            onClick={() => setAuthMethod('password')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${authMethod === 'password' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:text-primary'}`}
          >
            Password
          </button>
          <button
            onClick={() => setAuthMethod('emailLink')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${authMethod === 'emailLink' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:text-primary'}`}
          >
            Email Link
          </button>
        </div>

        {authMethod === 'password' ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
              {isRegister ? 'Join Refoodify' : 'Welcome Back'}
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
              {isRegister && (
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all bg-white"
                >
                  <option value="user">Individual User</option>
                  <option value="donor">Food Donor / Restaurant</option>
                  <option value="ngo">NGO / Charity</option>
                </select>
              )}
              <button type="submit" className="w-full bg-primary text-white p-3 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transform active:scale-95 transition-all">
                {isRegister ? 'Register' : 'Login'}
              </button>
            </form>
            <div className="mt-6 text-center space-y-3">
              <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-primary hover:underline font-medium">
                {isRegister ? 'Already have an account? Sign In' : 'New to Refoodify? Create an account'}
              </button>
              {!isRegister && (
                <div>
                  <button onClick={handleForgotPassword} className="text-xs text-gray-400 hover:text-gray-600">
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Magic Link Sign-In</h2>
            <form onSubmit={handleEmailLinkSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all bg-white"
              >
                <option value="user">User</option>
                <option value="donor">Donor</option>
                <option value="ngo">NGO</option>
              </select>
              <button type="submit" className="w-full bg-primary text-white p-3 rounded-xl font-bold shadow-lg">
                Send Magic Link
              </button>
            </form>
            <p className="text-center mt-6 text-xs text-gray-400 leading-relaxed">
              We'll send a link to your inbox that logs you in automatically. No password needed!
            </p>
          </div>
        )}
      </main>
      
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Footer />
    </>
  );
}