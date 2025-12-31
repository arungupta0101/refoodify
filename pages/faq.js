import Header from '../components/Header';
import Footer from '../components/Footer';

export default function FAQ() {
  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">How do I donate food?</h3>
            <p className="text-gray-600">Go to the Donate page, fill out the form with details like quantity and pickup time, and submit.</p>
          </div>
          <div>
            <h3 className="font-semibold">Is the app free?</h3>
            <p className="text-gray-600">Yes, Refoodify is free for all users.</p>
          </div>
          {/* Add more FAQs */}
        </div>
      </main>
      <Footer />
    </>
  );
}