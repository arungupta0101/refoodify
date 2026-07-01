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
            <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-500 dark:bg-slate-900 dark:text-slate-200">
              {/* Consistent Background from Homepage */}
              <div className="fixed inset-0 -z-10 h-full w-full">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20" />
                <div className="absolute bottom-0 left-0 -z-10">
                  <div className="absolute h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
                  <div className="absolute bottom-20 right-20 h-96 w-96 bg-blue-300/5 rounded-full blur-3xl" />
                </div>
              </div>
              <GeminiChat />
              <Component {...pageProps} />
              <Toaster position="top-right" />
            </div>
          </LoadingProvider>
        </ThemeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

export default MyApp;