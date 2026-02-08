import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Contact() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
        <form className="space-y-4">
          <input type="text" placeholder="Name" className="w-full p-3 border rounded" />
          <input type="email" placeholder="Email" className="w-full p-3 border rounded" />
          <textarea placeholder="Message" className="w-full p-3 border rounded" rows="5"></textarea>
          <button type="submit" className="bg-primary text-white px-6 py-3 rounded">Send</button>
        </form>
        <p className="mt-6 text-gray-600">Email: support@refoodify.com | Phone: +1-234-567-890</p>
      </main>
      <Footer />
    </>
  );
}