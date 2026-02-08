import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto pt-24 pb-12 px-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="space-y-6 text-gray-800">
          <div>
            <h2 className="text-xl font-bold mb-2">1. Introduction</h2>
            <p>Welcome to Refoodify. We respect your privacy and are committed to protecting your personal data.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">2. Data We Collect</h2>
            <p>We may collect personal identification information such as Name, Email address, Phone number, and Location data when you use our services to facilitate food donations.</p>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">3. Data Deletion</h2>
            <p>You have the right to request the deletion of your personal data. You can delete your account directly from your Profile page using the "Delete Account" button, or contact us at admin@refoodify.com.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}