import Header from '../components/Header';
import Footer from '../components/Footer';

export default function DataDeletion() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto py-12 px-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">User Data Deletion Instructions</h1>
        
        <section className="space-y-4 text-gray-800">
          <p>If you wish to delete your account and all associated data from Refoodify, you can follow these steps:</p>
          
          <ol className="list-decimal list-inside space-y-2 ml-4 bg-gray-50 p-6 rounded-xl">
            <li>Log in to your <strong>Refoodify</strong> account.</li>
            <li>Go to your <strong>Profile</strong> page.</li>
            <li>Scroll down to the <strong>Danger Zone</strong> section.</li>
            <li>Click on the <strong>Delete My Account</strong> button.</li>
            <li>Confirm the action in the popup dialog.</li>
          </ol>
          
          <p className="mt-4">Alternatively, you can contact us at <strong>admin@refoodify.com</strong> with your registered email address to request data deletion. We will process your request within 7 days.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}