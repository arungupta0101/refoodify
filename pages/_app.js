import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import { SessionProvider } from "next-auth/react"

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </AuthProvider>
    </SessionProvider>
  );
}

export default MyApp;