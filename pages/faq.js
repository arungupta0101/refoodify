import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

export default function FAQ() {
  const { user } = useAuth();
  const [step, setStep] = useState('bot'); // 'bot' or 'manual'
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [bugDescription, setBugDescription] = useState('');

  // Fixed Bot Questions & Answers based on roles
  const botData = [
    { id: 1, q: "How to donate food?", a: "Go to the 'Donate' page, select 'Food', fill details, and submit. Our volunteer will contact you!" },
    { id: 2, q: "Points not increasing?", a: "Points are updated after the volunteer confirms the food pickup. Please wait 24-48 hours." },
    { id: 3, q: "How to become a volunteer?", a: "Use the 'Volunteer' tab on the Donate page and wait for admin approval." },
    { id: 4, q: "App is crashing/slow?", a: "Try clearing your browser cache or check your internet connection." },
  ];

const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!bugDescription) return toast.error("Please describe the issue");

    setLoading(true);
    const loadingToast = toast.loading("Sending report to Admin...");

    try {
      let screenshotUrl = "";

      if (screenshot) {
        const reader = new FileReader();
        reader.readAsDataURL(screenshot);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            screenshotUrl = reader.result;
            resolve();
          };
        });
      }

      await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: bugDescription, userEmail: user?.email, userId: user?.uid, screenshot: screenshotUrl })
      });

      toast.success("Report sent to Admin!", { id: loadingToast });
      setBugDescription('');
      setScreenshot(null);
      setStep('bot');
    } catch (error) {
      console.error("Firestore Error:", error);
      toast.error("Failed to send report. Check your connection.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-primary p-6 text-white text-center">
            <h1 className="text-2xl font-bold">Refoodify Support Bot 🤖</h1>
            <p className="text-orange-100 text-sm">How can we help you today?</p>
          </div>

          <div className="p-8">
            {step === 'bot' ? (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-gray-600 font-medium mb-4">Choose a common topic:</p>
                {botData.map((item) => (
                  <div key={item.id} className="border rounded-2xl overflow-hidden transition-all">
                    <button 
                      onClick={() => setSelectedFaq(selectedFaq === item.id ? null : item.id)}
                      className="w-full text-left p-4 hover:bg-orange-50 flex justify-between items-center font-semibold text-gray-700"
                    >
                      {item.q}
                      <span>{selectedFaq === item.id ? '−' : '+'}</span>
                    </button>
                    {selectedFaq === item.id && (
                      <div className="p-4 bg-orange-50 text-gray-600 text-sm border-t border-orange-100 animate-slideDown">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                  <p className="text-gray-500 mb-4 text-sm font-medium">Problem not listed? Report it manually.</p>
                  <button 
                    onClick={() => setStep('manual')}
                    className="bg-gray-800 text-white px-6 py-2 rounded-xl hover:bg-black transition-all"
                  >
                    Report a Bug / Other Issue
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-6 animate-fadeIn">
                <button onClick={() => setStep('bot')} className="text-sm text-primary font-bold">← Back to Bot</button>
                <h2 className="text-xl font-bold text-gray-800">Describe the problem</h2>
                
                <textarea 
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="Tell us what's wrong..."
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary h-32 outline-none"
                  required
                />

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase ml-1">Attach Screenshot (Optional)</label>
                  <input 
                    type="file" 
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-primary hover:file:bg-orange-100 cursor-pointer"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-orange-600 transition-all disabled:bg-gray-300"
                >
                  {loading ? 'Sending to Admin...' : 'Send Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
      <Footer />
    </>
  );
}