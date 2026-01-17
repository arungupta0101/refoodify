import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from "next-auth/react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      // Agar NextAuth se login hai
      setUser({ ...session.user, uid: session.user.uid || session.user.id });
    } else {
      // Agar Email/Password se login hai (LocalStorage)
      const storedUser = localStorage.getItem('refoodify_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [session, status]);

  const login = (userData) => {
    // Map _id to uid for compatibility
    const userWithUid = { ...userData, uid: userData._id };
    setUser(userWithUid);
    localStorage.setItem('refoodify_user', JSON.stringify(userWithUid));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('refoodify_user');
    signOut({ redirect: false }); // NextAuth logout
    router.push('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}