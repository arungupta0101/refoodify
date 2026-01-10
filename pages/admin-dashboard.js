import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      window.location.href = '/login';
    }
    fetchData();
  }, [activeTab]);

const fetchData = async () => {
    setLoading(true);
    try {
      let colName = 'users';
      if (activeTab === 'volunteers') colName = 'volunteers';
      if (activeTab === 'faqs') colName = 'faqs';

      const snapshot = await getDocs(collection(db, colName));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // FIX: Filtering Logic ko Firestore collections ke hisaab se adjust karein
      if (activeTab === 'users') {
        // Yahan filter hata dein agar aap chahte hain ki 'users' tab mein sab dikhein
        // Ya fir check karein ki 'userType' correctly handle ho raha hai
        setData(items); 
      } 
      else if (activeTab === 'ngos') {
        setData(items.filter(i => i.userType?.toLowerCase() === 'ngo'));
      } 
      else if (activeTab === 'restaurants') {
        setData(items.filter(i => i.userType?.toLowerCase() === 'restaurant'));
      } 
      else {
        setData(items); 
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const handleVolunteerAction = async (item, status) => {
    try {
      // 1. Update volunteer status
      await updateDoc(doc(db, 'volunteers', item.id), { status });

      // 2. Send automatic notification to the user
      await addDoc(collection(db, 'notifications'), {
        userId: item.userId,
        message: `Your volunteer request (Ref: ${item.referenceNumber}) has been ${status} by the Admin.`,
        createdAt: serverTimestamp(),
        read: false
      });

      toast.success(`Volunteer request ${status} and user notified!`);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-xl p-6 hidden md:block border-r border-gray-100">
          <div className="mb-10 px-2">
            <h2 className="text-2xl font-black text-primary tracking-tight">Refoodify</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Master Admin Panel</p>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'users', label: '👥 All Users', color: 'blue' },
              { id: 'ngos', label: '🏢 NGOs', color: 'purple' },
              { id: 'restaurants', label: '🍕 Restaurants', color: 'orange' },
              { id: 'volunteers', label: '🤝 Volunteers', color: 'green' },
              { id: 'faqs', label: '🐞 Bug Reports', color: 'red' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-4 rounded-2xl font-bold transition-all duration-200 ${
                  activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg shadow-orange-200 translate-x-2' 
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button 
            onClick={() => { localStorage.removeItem('isAdmin'); window.location.href='/login'; }}
            className="w-full mt-20 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all flex items-center gap-2"
          >
            Logout
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-gray-800 capitalize">{activeTab} List</h1>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-500">
              Total Items: {data.length}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border-2 border-dashed">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-400 font-medium">Fetching Records...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeTab === 'faqs' ? (
                // --- FAQ / BUG REPORTS VIEW ---
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.map(faq => (
                    <div key={faq.id} className="bg-white p-6 rounded-3xl shadow-sm border border-red-50 relative group hover:shadow-md transition-all">
                      <span className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Bug Report</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">From: {faq.userEmail}</p>
                      <p className="text-gray-700 font-medium leading-relaxed mb-4">{faq.description}</p>
                      {faq.screenshot && (
                        <div className="mt-4">
                           <a href={faq.screenshot} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all">
                             📸 View Screenshot
                           </a>
                        </div>
                      )}
                    </div>
                  ))}
                  {data.length === 0 && <p className="text-gray-400 text-center col-span-2">No bugs reported yet. Clear skies! ☀️</p>}
                </div>
              ) : (
                // --- STANDARD LIST VIEW (USERS, NGOs, RESTAURANTS, VOLUNTEERS) ---
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="p-5">Name / Reference</th>
                        <th className="p-5">Contact Details</th>
                        <th className="p-5">Status / Role</th>
                        <th className="p-5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium text-gray-700">
                      {data.map(item => (
                        <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-all">
                          <td className="p-5">
                            <p className="font-bold text-gray-800">{item.name || item.volunteerName || 'Unnamed'}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{item.referenceNumber || item.id}</p>
                          </td>
                          <td className="p-5">
                            <p>{item.email || item.volunteerEmail}</p>
                            <p className="text-xs text-gray-400">{item.phone || item.volunteerPhone || 'No Phone'}</p>
                          </td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                              item.status === 'accepted' ? 'bg-green-100 text-green-600' : 
                              item.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {item.status || item.userType || 'Active'}
                            </span>
                          </td>
                          <td className="p-5">
                            <button onClick={() => setSelectedItem(item)} className="text-primary font-bold hover:underline">Manage</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* DETAILED VIEW MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-popIn">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Management View</h3>
                <p className="text-xs text-gray-400 font-bold uppercase">ID: {selectedItem.id}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md text-2xl font-light hover:bg-gray-100 transition-all">&times;</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Name</p>
                  <p className="font-bold text-gray-800">{selectedItem.name || selectedItem.volunteerName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Status</p>
                  <p className="font-bold text-orange-600 capitalize">{selectedItem.status || 'Verified'}</p>
                </div>
                <div className="col-span-2 bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Email</p>
                  <p className="font-bold text-gray-800">{selectedItem.email || selectedItem.volunteerEmail}</p>
                </div>
                {selectedItem.address && (
                  <div className="col-span-2 bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Location</p>
                    <p className="font-bold text-gray-800">{selectedItem.address}</p>
                  </div>
                )}
              </div>

              {/* ACTION: VOLUNTEER APPROVAL */}
              {activeTab === 'volunteers' && selectedItem.status === 'pending' ? (
                <div className="pt-6 flex gap-4">
                  <button 
                    onClick={() => handleVolunteerAction(selectedItem, 'accepted')} 
                    className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-600 transform active:scale-95 transition-all"
                  >
                    APPROVE HERO
                  </button>
                  <button 
                    onClick={() => handleVolunteerAction(selectedItem, 'rejected')} 
                    className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-600 transform active:scale-95 transition-all"
                  >
                    REJECT
                  </button>
                </div>
              ) : (
                <div className="pt-6">
                   <button 
                    onClick={() => setSelectedItem(null)} 
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all"
                  >
                    CLOSE DETAILS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-popIn {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
      <Footer />
    </div>
  );
}