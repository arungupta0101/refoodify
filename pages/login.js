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
    // Check if the user is returning from an email link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      signInWithEmailLink(auth, email, window.location.href)
        .then(async (result) => {
          // Check if user document exists, if not create it via API
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
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user in database via API
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
      // Check if email exists via API
      const response = await fetch(`/api/check-user?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (!data.exists) {
        toast.error('Account not found. Please register your account first.');
        return;
      }
      
      // Email exists, send reset email
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
        <h1 className="text-3xl font-bold mb-8 text-center">Sign In</h1>

        {/* Auth Method Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setAuthMethod('password')}
            className={`flex-1 py-2 px-4 rounded-md transition ${authMethod === 'password' ? 'bg-primary text-white' : 'text-gray-600'}`}
          >
            Password
          </button>
          <button
            onClick={() => setAuthMethod('emailLink')}
            className={`flex-1 py-2 px-4 rounded-md transition ${authMethod === 'emailLink' ? 'bg-primary text-white' : 'text-gray-600'}`}
          >
            Email Link
          </button>
        </div>

        {authMethod === 'password' ? (
          <>
            <h2 className="text-xl font-semibold mb-4 text-center">{isRegister ? 'Create Account' : 'Sign In'}</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded"
                required
              />
              {isRegister && (
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full p-3 border rounded"
                >
                  <option value="user">User</option>
                  <option value="donor">Donor</option>
                  <option value="ngo">NGO</option>
                </select>
              )}
              <button type="submit" className="w-full bg-primary text-white p-3 rounded">
                {isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            <div className="mt-4 text-center space-y-2">
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-primary underline"
              >
                {isRegister ? 'Already have an account? Sign In' : 'Need an account? Create one'}
              </button>
              {!isRegister && (
                <div>
                  <button
                    onClick={handleForgotPassword}
                    className="text-sm text-gray-600 underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4 text-center">Passwordless Sign In</h2>
            <form onSubmit={handleEmailLinkSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded"
                required
              />
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full p-3 border rounded"
              >
                <option value="user">User</option>
                <option value="donor">Donor</option>
                <option value="ngo">NGO</option>
              </select>
              <button type="submit" className="w-full bg-primary text-white p-3 rounded">
                Send Sign-In Link
              </button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-600">
              Check your email for a secure sign-in link. No password needed!
            </p>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}