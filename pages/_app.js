import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import { SessionProvider } from "next-auth/react"
import { LoadingProvider } from '../contexts/LoadingContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import GeminiChat from '../components/GeminiChat';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <ThemeProvider>
          <LoadingProvider>
                {/* Global Background Pattern */}
                <div className="fixed inset-0 -z-50 pointer-events-none">
                  {/* Responsive Background Image Logic */}
                  {/* Default (Mobile): mobile-bg.png | md (Desktop): desktop-bg.png */}
                  <div className="absolute inset-0 bg-[url('/mobile-bg.png')] md:bg-[url('/desktop-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed transition-all duration-500"></div>
                  {/* Optional: Light Overlay for text readability */}
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
                </div>
            <GeminiChat />
            <Component {...pageProps} />
            <Toaster position="top-right" />
          </LoadingProvider>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

export default MyApp;