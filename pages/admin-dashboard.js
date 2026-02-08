import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { ChartBarIcon, UserGroupIcon, BuildingStorefrontIcon, HeartIcon, MapIcon, BellIcon, Cog6ToothIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon, DocumentChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [viewScreenshot, setViewScreenshot] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');

  useEffect(() => {
    if (!user || user.userType !== 'admin') {
      // router.push('/login'); // Uncomment to enforce client-side redirect
    }
    fetchData();
  }, [activeTab, user]);

const fetchData = async () => {
    if (activeTab === 'settings' || activeTab === 'security' || activeTab === 'profile' || activeTab === 'map') {
      setLoading(false);
      return;
    }
    setLoading(true); 
    try {
      const res = await fetch(`/api/admin?type=${activeTab}`);
      const items = await res.json();
      if (res.ok) {
        setData(items);
      } else {
        if (res.status === 401 || res.status === 403) {
           router.push('/login');
        }
        setData([]);
        toast.error(items.message || "Failed to load data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const handleVolunteerAction = async (item, status) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item._id || item.id, collection: 'volunteers', status })
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Volunteer request ${status} and user notified!`);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleFaqReply = async (item) => {
    const reply = prompt("Enter reply for user:");

    if (reply === null) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item._id || item.id, collection: 'faqs', status: 'resolved', reply })
      });

      if (!res.ok) throw new Error('Failed to update');
      toast.success("Reply sent & User notified!");
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleUserAction = async (item, status) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item._id || item.id, collection: 'users', status })
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`User ${status} successfully!`);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDeleteUser = async (item) => {
    if (item.email === 'admin@refoodify.com') {
      toast.error("Cannot delete admin account");
      return;
    }
    if (confirm(`Are you sure you want to delete user ${item.name || item.email}?`)) {
      try {
        const res = await fetch('/api/admin', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item._id || item.id, collection: 'users' })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Deletion failed');
        }

        toast.success(`User ${item.name || item.email} deleted!`);
        setSelectedItem(null);
        fetchData();
      } catch (e) {
        toast.error(e.message);
      }
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'broadcast', 
          message: broadcastMessage, 
          target: broadcastTarget 
        })
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      
      toast.success(result.message);
      setShowBroadcastModal(false);
      setBroadcastMessage('');
      setBroadcastTarget('all');
    } catch (error) {
      toast.error(error.message || "Broadcast failed");
    }
  };

  const handleGenerateReport = () => {
    if (activeTab === 'dashboard') {
      const reportData = [
        ['Metric', 'Value'],
        ['Total Users', data.users],
        ['Restaurants', data.restaurants],
        ['NGOs', data.ngos],
        ['Donors', data.donors],
        ['Total Donations', data.donations],
        ['Active Donations', data.activeDonations],
        ['Food Saved (kg)', data.foodSaved]
      ];
      
      const csvContent = reportData.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "dashboard_summary_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Report generated!");
    } else {
      exportToCSV();
    }
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = Object.keys(data[0]).join(",");
    const csvContent = [
      headers,
      ...data.map(row => Object.values(row).map(value => `"${value}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 pt-24">
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
            onClick={() => { window.location.href='/login'; }}
            className="w-full mt-20 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all flex items-center gap-2"
          >
            Logout
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-gray-800 capitalize">{activeTab} List</h1>
            <div className="flex gap-2">
              {['users', 'ngos', 'restaurants', 'volunteers', 'reports'].includes(activeTab) && (
                <button onClick={exportToCSV} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
                  📥 Export CSV
                </button>
              )}
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Total Items: {Array.isArray(data) ? data.length : 0}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border-2 border-dashed">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-400 font-medium">Fetching Records...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              
              {/* --- DASHBOARD OVERVIEW --- */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={data.users || 0} color="bg-blue-50 text-blue-600" />
                    <StatCard title="Restaurants" value={data.restaurants || 0} color="bg-orange-50 text-orange-600" />
                    <StatCard title="NGOs" value={data.ngos || 0} color="bg-purple-50 text-purple-600" />
                    <StatCard title="Food Saved (kg)" value={data.foodSaved || 0} color="bg-green-50 text-green-600" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 col-span-2">
                      <h3 className="text-lg font-bold mb-4">Live Activity</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                          <span className="font-medium">Active Donations</span>
                          <span className="font-bold text-primary">{data.activeDonations || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                          <span className="font-medium">Today's Requests</span>
                          <span className="font-bold text-orange-500">12</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-red-50 rounded-2xl">
                          <span className="font-medium text-red-600">Emergency Alerts</span>
                          <span className="font-bold text-red-600">2</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <button onClick={() => setShowBroadcastModal(true)} className="w-full p-3 bg-primary text-white rounded-xl font-bold hover:bg-green-600">Broadcast Alert</button>
                        <button onClick={handleGenerateReport} className="w-full p-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Generate Report</button>
                        <button className="w-full p-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Verify Users</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- MAP VIEW --- */}
              {activeTab === 'map' && (
                <div className="h-[600px] rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                  <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: 26.7606, lng: 83.3731 }} zoom={12}>
                      <Marker position={{ lat: 26.7606, lng: 83.3731 }} label="NGO" />
                      <Marker position={{ lat: 26.7588, lng: 83.3697 }} label="Donor" />
                    </GoogleMap>
                  </LoadScript>
                </div>
              )}

              {/* --- ADMIN PROFILE --- */}
              {activeTab === 'profile' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl text-white font-bold">A</div>
                    <div>
                      <h2 className="text-2xl font-bold">Super Admin</h2>
                      <p className="text-gray-500">admin@refoodify.com</p>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase">Verified</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <p className="text-xs text-gray-400 font-bold uppercase">Role</p>
                        <p className="font-bold">Super Admin</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <p className="text-xs text-gray-400 font-bold uppercase">Mobile</p>
                        <p className="font-bold">+91 98765 43210</p>
                      </div>
                    </div>
                    <button className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 text-left flex justify-between items-center">
                      Change Password <span>→</span>
                    </button>
                    <button className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 text-left flex justify-between items-center">
                      2-Step Verification <span className="text-green-500">Enabled</span>
                    </button>
                  </div>
                </div>
              )}

              {/* --- SETTINGS / SECURITY / REPORTS (Placeholders) --- */}
              {['settings', 'security', 'reports', 'rewards', 'notifications'].includes(activeTab) && (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <div className="text-6xl mb-4">🛠️</div>
                  <h2 className="text-2xl font-bold mb-2">Feature Coming Soon</h2>
                  <p className="text-gray-500">The {activeTab} panel is under development.</p>
                </div>
              )}

              {/* --- FAQ / BUG REPORTS VIEW --- */}
              {activeTab === 'faqs' ? (
                // --- FAQ / BUG REPORTS VIEW ---
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.isArray(data) && data.map(faq => (
                    <div key={faq.id} className="bg-white p-6 rounded-3xl shadow-sm border border-red-50 relative group hover:shadow-md transition-all">
                      <span className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Bug Report</span>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">From: {faq.userEmail}</p>
                      <p className="text-gray-700 font-medium leading-relaxed mb-4">{faq.description}</p>
                      {faq.screenshot && (
                        <div className="mt-4">
                           <button onClick={() => setViewScreenshot(faq.screenshot)} className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all">
                             📸 View Screenshot
                           </button>
                        </div>
                      )}
                      {faq.status !== 'resolved' && (
                        <button onClick={() => handleFaqReply(faq)} className="mt-4 w-full bg-green-500 text-white py-2 rounded-xl font-bold hover:bg-green-600">Resolve & Reply</button>
                      )}
                    </div>
                  ))}
                  {(!Array.isArray(data) || data.length === 0) && <p className="text-gray-400 text-center col-span-2">No bugs reported yet. Clear skies! ☀️</p>}
                </div>
              ) : ['users', 'ngos', 'restaurants', 'volunteers'].includes(activeTab) ? (
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
                      {Array.isArray(data) && data.map(item => (
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
                               {item.status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-5">
                             {item.status === 'Pending' && ['users', 'ngos', 'restaurants'].includes(activeTab) ? (
                               <button onClick={() => setSelectedItem(item)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 transition-all shadow-md">
                                 REVIEW
                               </button>
                             ) : (
                               <button onClick={() => setSelectedItem(item)} className="text-primary font-bold hover:underline">Manage</button>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
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
                  <p className="font-bold text-orange-600 capitalize">{selectedItem.status || 'Pending'}</p>
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
              ) : ['users', 'ngos', 'restaurants'].includes(activeTab) ? (
                 <div className="pt-6 flex gap-4">
                  {selectedItem.status === 'Pending' ? (
                    <>
                      <button 
                        onClick={() => handleUserAction(selectedItem, 'Active')} 
                        className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-600 transform active:scale-95 transition-all"
                      >
                        APPROVE
                      </button>
                      <button 
                        onClick={() => handleUserAction(selectedItem, 'Rejected')} 
                        className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-600 transform active:scale-95 transition-all"
                      >
                        REJECT
                      </button>
                    </>
                  ) : selectedItem.status !== 'Banned' ? (
                    <button 
                      onClick={() => handleUserAction(selectedItem, 'Banned')} 
                      className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-600 transform active:scale-95 transition-all"
                    >
                      BLOCK USER
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUserAction(selectedItem, 'Active')} 
                      className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-600 transform active:scale-95 transition-all"
                    >
                      UNBLOCK USER
                    </button>
                  )}
                  {selectedItem.email !== 'admin@refoodify.com' && (
                  <button 
                    onClick={() => handleDeleteUser(selectedItem)} 
                    className="flex-1 bg-red-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-800 transform active:scale-95 transition-all"
                  >
                    DELETE USER
                  </button>
                  )}
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

      {/* SCREENSHOT MODAL */}
      {viewScreenshot && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setViewScreenshot(null)}>
          <div className="relative max-w-5xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={viewScreenshot} alt="Screenshot" className="w-full h-auto object-contain" />
            <button 
              onClick={() => setViewScreenshot(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold backdrop-blur-md transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* BROADCAST MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-popIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">📢 Broadcast Alert</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-500 mb-2">Target Audience</label>
              <select 
                value={broadcastTarget} 
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full p-3 border rounded-xl bg-gray-50 font-medium outline-none focus:ring-2 ring-primary"
              >
                <option value="all">All Users</option>
                <option value="user">Normal Users</option>
                <option value="ngo">NGOs</option>
                <option value="restaurant">Restaurants</option>
                <option value="donor">Donors</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-500 mb-2">Message</label>
              <textarea 
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-3 border rounded-xl bg-gray-50 font-medium h-32 outline-none focus:ring-2 ring-primary"
                placeholder="Type your announcement here..."
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowBroadcastModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
              <button onClick={sendBroadcast} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-green-600 shadow-lg">Send Alert</button>
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

function SidebarItem({ id, label, icon, activeTab, setActiveTab }) {
  return (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full text-left p-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-3 ${
        activeTab === id 
        ? 'bg-primary text-white shadow-lg shadow-orange-200 translate-x-2' 
        : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`p-6 rounded-3xl ${color}`}>
      <p className="text-4xl font-black mb-1">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</p>
    </div>
  );
}