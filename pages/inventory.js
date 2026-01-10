import { useState, useRef, useEffect } from 'react';
import Quagga from 'quagga';
import { getAuth, onAuthStateChanged } from 'firebase/auth';  // Firebase Auth
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';  // Reusable modal
import toast from 'react-hot-toast';

export default function Inventory() {
  const [scanning, setScanning] = useState(false);
  const [user, setUser] = useState(null);  // Logged-in user
  const [isPremium, setIsPremium] = useState(false);  // Mock premium status
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);  // New modal for login prompt
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderItem, setReminderItem] = useState(null);
  const [inventory, setInventory] = useState([]);  // Stored items
  const scannerRef = useRef(null);

  // Firebase Auth listener
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Mock premium check (replace with real API call, e.g., check Firebase custom claims or DB)
        setIsPremium(currentUser.email === 'premium@example.com');  // Example: Check email or flag
      } else {
        // Optional: Auto-redirect to login if not authenticated (uncomment if needed)
        // window.location.href = '/login';
      }
    });

    // Load inventory from localStorage (demo; use MongoDB in production)
    const savedInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    setInventory(savedInventory);

    // Check for expiry reminders
    checkExpiryReminders(savedInventory);

    return () => {
      // Safer cleanup: Only stop Quagga if it's initialized and running
      try {
        if (Quagga && typeof Quagga.stop === 'function') {
          Quagga.stop();
        }
      } catch (error) {
        console.warn('Quagga cleanup error:', error);  // Log but don't crash
      }
    };
  }, []);

  const checkExpiryReminders = (items) => {
    const now = new Date();
    items.forEach((item) => {
      const expiryDate = new Date(item.expiry);
      const alertDate = new Date(expiryDate);
      alertDate.setDate(expiryDate.getDate() - item.alertDays);
      if (now >= alertDate && now < expiryDate) {
        setReminderItem(item);
        setShowReminderModal(true);
      }
    });
  };

  const startScan = () => {
    if (!user) {
      toast.error('Please log in to use this feature.');
      return;
    }
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    if (!scannerRef.current) {
      toast.error('Scanner not ready. Please try again.');
      return;
    }
    setScanning(true);
    setTimeout(() => {
      Quagga.init({
        inputStream: { 
          name: 'Live', 
          type: 'LiveStream', 
          target: scannerRef.current,
          constraints: { width: 640, height: 480 }
        },
        decoder: { readers: ['ean_reader', 'code_128_reader'] },
      }, (err) => {
        if (err) {
          console.error(err);
          toast.error('Camera access failed. Try manual entry.');
          setScanning(false);
          return;
        }
        Quagga.start();
        toast.success('Scanning started. Point camera at barcode.');
      });
      
      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        console.log('Scanned:', code);
        toast.success(`Scanned: ${code}`);
        // Auto-add to inventory (mock)
        addItem({ name: `Product ${code}`, expiry: '2024-12-31', note: '', alertDays: 2 });
        Quagga.stop();
        setScanning(false);
      });
    }, 100);
  };

  const stopScan = () => {
    try {
      Quagga.stop();
    } catch (error) {
      console.warn('Error stopping scan:', error);
    }
    setScanning(false);
    toast.info('Scanning stopped.');
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);  // Show login modal if not logged in
      return;
    }
    const formData = new FormData(e.target);
    const item = {
      name: formData.get('name'),
      expiry: formData.get('expiry'),
      note: formData.get('note'),
      alertDays: parseInt(formData.get('alertDays')),
    };
    addItem(item);
    e.target.reset();
  };

  const addItem = (item) => {
    const newInventory = [...inventory, item];
    setInventory(newInventory);
    localStorage.setItem('inventory', JSON.stringify(newInventory));
    toast.success('Item added!');
  };

  return (
    <>
      <Header />
      <main className="py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Smart Inventory</h1>
        {user ? (
          <p className="mb-4">Welcome, {user.displayName || user.email}! {isPremium ? '(Premium User)' : '(Free User)'}</p>
        ) : (
          <p className="mb-4 text-red-500">Please log in to access features.</p>
        )}

        <button 
          onClick={startScan} 
          className="bg-primary text-white px-6 py-3 rounded mb-4" 
          disabled={scanning}
        >
          {scanning ? 'Scanning...' : 'Scan Barcode'}
        </button>
        <button 
          onClick={stopScan} 
          className="bg-red-500 text-white px-6 py-3 rounded mb-4 ml-4" 
          disabled={!scanning}
        >
          Stop Scan
        </button>
        {scanning && (
          <div ref={scannerRef} className="w-full h-64 bg-gray-200 border rounded mb-4"></div>
        )}

        {/* Manual Entry Form */}
        <form onSubmit={handleManualSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4">Manual Product Entry</h3>
          <input 
            name="name" 
            type="text" 
            placeholder="Product Name" 
            className="w-full p-3 border rounded mb-4" 
            required 
          />
          <input 
            name="expiry" 
            type="date" 
            className="w-full p-3 border rounded mb-4" 
            required 
          />
          <textarea 
            name="note" 
            placeholder="Note (optional)" 
            className="w-full p-3 border rounded mb-4" 
          />
          <input 
            name="alertDays" 
            type="number" 
            placeholder="Days before expiry to alert (e.g., 2)" 
            className="w-full p-3 border rounded mb-4" 
            min="1" 
            required 
          />
          <button type="submit" className="bg-primary text-white px-6 py-3 rounded">Add Item</button>
        </form>

        {/* Inventory List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Your Inventory</h3>
          {inventory.length > 0 ? (
            <ul>
              {inventory.map((item, index) => (
                <li key={index} className="mb-2">
                  <strong>{item.name}</strong> - Expires: {item.expiry} - Alert: {item.alertDays} days before - Note: {item.note}
                </li>
              ))}
            </ul>
          ) : (
            <p>No items yet. Add via scan or manual entry.</p>
          )}
        </div>
      </main>
      <Footer />

      {/* Premium Modal */}
      <Modal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)}>
        <h2 className="text-2xl font-bold mb-4 text-center">Premium Feature</h2>
        <p className="text-center mb-4">Barcode scanning is a premium feature. Upgrade to access it!</p>
        <button 
          onClick={() => setShowPremiumModal(false)} 
          className="bg-primary text-white px-6 py-3 rounded w-full"
        >
          Close
        </button>
      </Modal>

      {/* Login Modal */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <h2 className="text-2xl font-bold mb-4 text-center">Please Login First</h2>
        <p className="text-center mb-4">You need to log in to add items manually or use other features.</p>
        <button 
          onClick={() => setShowLoginModal(false)} 
          className="bg-primary text-white px-6 py-3 rounded w-full"
        >
          Close
        </button>
      </Modal>

      {/* Expiry Reminder Modal */}
      <Modal isOpen={showReminderModal} onClose={() => setShowReminderModal(false)}>
        <div className="text-center bg-gradient-to-r from-warm to-primary p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Expiry Alert!</h2>
          <p className="text-white mb-4">Your item <strong>{reminderItem?.name}</strong> is expiring soon on {reminderItem?.expiry}.</p>
          <p className="text-white">Note: {reminderItem?.note}</p>
          <button 
            onClick={() => setShowReminderModal(false)} 
            className="bg-white text-primary px-6 py-3 rounded mt-4"
          >
            Dismiss
          </button>
        </div>
      </Modal>
    </>
  );
}