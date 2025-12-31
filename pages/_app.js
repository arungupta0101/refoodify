// import '../styles/globals.css';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from '../contexts/AuthContext';

import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default MyApp;