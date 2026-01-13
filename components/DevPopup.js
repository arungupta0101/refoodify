import { useState, useEffect } from 'react';

export default function DevelopmentPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check karein ki kya user ne pehle hi OK daba diya hai is session mein
    const isDismissed = sessionStorage.getItem('devPopupDismissed');
    if (!isDismissed) {
      setShowPopup(true);
    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    sessionStorage.setItem('devPopupDismissed', 'true');
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden animate-slideUp">
        {/* Animated Background Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full"></div>
        
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Under Development</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The website is under development. <br />The <strong>REFOODIFY</strong> final version will be available soon.<br /> We are currently working on making it perfect for you!<br /> Thank You😊
        </p>
        
        <button 
          onClick={handleClose}
          className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-secondary transition-all transform active:scale-95"
        >
          Got it, Thanks!
        </button>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}