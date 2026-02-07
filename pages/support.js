import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { HeartIcon, ShareIcon, UserGroupIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

export default function Support() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black text-gray-800 mb-4">Support Our Mission</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your contribution helps us feed the hungry and reduce food waste. Every bit counts.
            </p>
          </div>

          {/* Main Donation Section */}
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* QR Code Side */}
              <div className="p-10 bg-gradient-to-br from-primary/10 to-green-100 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-4 rounded-2xl shadow-lg mb-6">
                  {/* QR Code Image */}
                  <div className="relative w-64 h-64">
                    <Image 
                      src="/qr.jpg" 
                      alt="Donation QR Code" 
                      layout="fill"
                      objectFit="contain"
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Scan to Donate</h3>
                <p className="text-gray-600 font-medium">UPI / Wallet Apps</p>
              </div>

              {/* Instructions Side */}
              <div className="p-10 flex flex-col justify-center">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <CurrencyRupeeIcon className="w-8 h-8 text-primary" />
                    Financial Support
                  </h2>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <div>
                        <h4 className="font-bold text-gray-800">Scan & Pay</h4>
                        <p className="text-gray-600 text-sm">Use any UPI app to scan the QR code and donate any amount.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <div>
                        <h4 className="font-bold text-gray-800">Add Note</h4>
                        <p className="text-gray-600 text-sm">It is mandatory to write <span className="font-bold text-primary">"For Refoodify"</span> in the payment note/remarks.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <div>
                        <h4 className="font-bold text-gray-800">Get Certified</h4>
                        <p className="text-gray-600 text-sm">Follow us on social media and DM us your <strong>Payment Screenshot</strong> & <strong>Email ID</strong>.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                  <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                    🏆 Social Work Certificate
                  </h4>
                  <p className="text-sm text-orange-700 mb-2">
                    As a token of appreciation, we provide a certificate for your contribution towards society.
                  </p>
                  <p className="text-xs text-orange-600 font-bold">
                    * Certificate will be sent to your email within 3 to 7 days after verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Other Ways to Support */}
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Other Ways to Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Volunteer */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Become a Volunteer</h3>
              <p className="text-gray-600 mb-6">
                Join our ground team to help collect and distribute food in your area.
              </p>
              <a href="/donate" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all">
                Join Now
              </a>
            </div>

            {/* Donate Food */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Donate Surplus Food</h3>
              <p className="text-gray-600 mb-6">
                Have extra food from a party or restaurant? Don't throw it away.
              </p>
              <a href="/donate" className="inline-block bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-all">
                Donate Food
              </a>
            </div>

            {/* Spread the Word */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShareIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Spread the Word</h3>
              <p className="text-gray-600 mb-6">
                Share our mission with your friends and family. Awareness is powerful.
              </p>
              <div className="flex justify-center gap-4">
                <a href="https://instagram.com" target="_blank" className="text-gray-400 hover:text-primary font-bold">Instagram</a>
                <a href="https://twitter.com" target="_blank" className="text-gray-400 hover:text-primary font-bold">Twitter</a>
                <a href="https://linkedin.com" target="_blank" className="text-gray-400 hover:text-primary font-bold">LinkedIn</a>
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}