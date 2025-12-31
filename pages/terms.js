import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>
        <p className="text-gray-600 mb-6">
          By using Refoodify, you agree to these terms. We are not responsible for food safety; donors must ensure donations are safe.
        </p>
        <p className="text-gray-600">
          For full terms, please read our detailed policy. Contact us for questions.
        </p>
      </main>
      <Footer />
    </>
  );
}