import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

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
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="page-kicker justify-center mb-4">Support</p>
            <h1 className="section-heading">Frequently Asked Questions</h1>
            <p className="section-copy max-w-2xl mx-auto mt-4">Find answers to common questions. If you can't find what you're looking for, you can report an issue manually.</p>
          </div>

          <div className="premium-card p-0 overflow-hidden">
          {/* Header */}
          <div className="p-8 space-y-6">
            {step === 'bot' ? (
              <div className="space-y-3 animate-fadeIn">
                {botData.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all">
                    <button 
                      onClick={() => setSelectedFaq(selectedFaq === item.id ? null : item.id)}
                      className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {item.q}
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${selectedFaq === item.id ? 'rotate-180' : ''}`} />
                    </button>
                    {selectedFaq === item.id && (
                      <div className="animate-slideDown border-t border-emerald-100 bg-emerald-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{item.a}</div>
                    )}
                  </div>
                ))}

                <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="mb-4 font-medium text-slate-500 dark:text-slate-400">Problem not listed?</p>
                  <button 
                    onClick={() => setStep('manual')}
                    className="premium-button-secondary bg-white"
                  >
                    Report a Bug / Other Issue
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-6 animate-fadeIn">
                <button onClick={() => setStep('bot')} className="text-sm font-bold text-emerald-700 dark:text-emerald-300 hover:underline">← Back to FAQ</button>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Describe the problem</h2>
                
                <textarea 
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="Tell us what's wrong..."
                  className="premium-textarea h-32 px-4 py-3"
                  required
                />

                <div className="space-y-2">
                  <label className="ml-1 text-sm font-bold uppercase text-slate-500">Attach screenshot (optional)</label>
                  <input 
                    type="file" 
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    accept="image/*"
                    className="w-full cursor-pointer text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/50 dark:file:text-emerald-300 dark:hover:file:bg-emerald-900"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="premium-button w-full"
                >
                  {loading ? 'Sending to Admin...' : 'Send Report'}
                </button>
              </form>
            )}
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}