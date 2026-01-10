import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, storage, db } from '../lib/firebase'; // Ensure db is imported
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import InventoryTable from '../components/InventoryTable';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    email: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
    fetchDonations();
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (profile?.userType === 'restaurant') {
      fetchInventory();
    }
  }, [profile?.userType]);

  const fetchProfile = async () => {
    const response = await fetch(`/api/get-user?uid=${user.uid}`);
    if (response.ok) {
      const userData = await response.json();
      setProfile(userData);
      setEditForm({
        name: userData.name || '',
        address: userData.address || '',
        email: user.email,
        currentPassword: '',
        newPassword: '',
      });
    }
    setLoading(false);
  };

  const fetchDonations = async () => {
    const response = await fetch(`/api/get-donations?uid=${user.uid}`);
    if (response.ok) {
      const donationsData = await response.json();
      setDonations(donationsData);
    }
  };

  const fetchInventory = async () => {
    const response = await fetch(`/api/get-inventory?uid=${user.uid}`);
    if (response.ok) {
      const inventoryData = await response.json();
      setInventory(inventoryData);
    }
  };

  // Fetch notifications (like volunteer acceptance)
  const fetchNotifications = async () => {
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const notifs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
    } catch (e) {
      console.log("No notifications found yet.");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const storageRef = ref(storage, `profilePhotos/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    const response = await fetch('/api/update-user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        updates: { photoURL: url },
      }),
    });
    
    if (response.ok) {
      setProfile({ ...profile, photoURL: url });
      toast.success('Profile picture updated!');
    }
  };

  const handleSave = async () => {
    try {
      const updates = { name: editForm.name, address: editForm.address };
      const response = await fetch('/api/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, updates }),
      });

      if (!response.ok) throw new Error('Update failed');

      if (editForm.email !== user.email) await updateEmail(user, editForm.email);

      if (editForm.newPassword) {
        const credential = EmailAuthProvider.credential(user.email, editForm.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, editForm.newPassword);
      }

      setProfile({ ...profile, ...updates });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Loading Refoodify...</div>;

  const getBadge = (points) => {
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
  };

  const isAdmin = user.email === 'arunjacker0101@gmail.com' || profile?.userType === 'admin';

  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Your Refoodify Dashboard
          </h1>
          <p className="text-gray-600">Helping the world, one meal at a time.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Profile</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-orange-600"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-6 text-center">
                <img 
                  src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                  className="w-28 h-28 rounded-full border-4 border-orange-100 shadow-md mb-4" 
                />
                <h3 className="text-xl font-bold">{profile?.name || 'User'}</h3>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {profile?.userType}
                </span>

                {/* --- DYNAMIC ACTION BUTTONS (ADMIN OR FAQ) --- */}
                <div className="w-full mt-6">
                  {isAdmin ? (
                    <button 
                      onClick={() => router.push('/admin-dashboard')}
                      className="w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      ⚙️ OPEN ADMIN PANEL
                    </button>
                  ) : (
                    <button 
                      onClick={() => router.push('/faq')}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      ❓ HELP & REPORT BUGS
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full p-3 border rounded-lg" placeholder="Full Name" />
                  <textarea value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full p-3 border rounded-lg" rows="2" placeholder="Address" />
                  <button onClick={handleSave} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold">Save Changes</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase">Impact Points</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-black text-orange-500">{profile?.points || 0}</p>
                      <p className="text-sm font-bold text-gray-500 mb-1">{getBadge(profile?.points || 0)} Member</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Section */}
            <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                🔔 Notifications {notifications.length > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
              </h3>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="text-sm p-3 bg-blue-50 rounded-lg text-blue-800 border-l-4 border-blue-500">
                      {n.message}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No new updates from Refoodify.</p>
              )}
            </div>
          </div>

          {/* Dashboard Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold mb-6">Activity Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-blue-200 shadow-lg">
                  <p className="opacity-80 text-sm">Donations</p>
                  <p className="text-4xl font-black">{donations.length}</p>
                </div>
                <div className="bg-orange-500 p-6 rounded-2xl text-white shadow-orange-200 shadow-lg">
                  <p className="opacity-80 text-sm">Points</p>
                  <p className="text-4xl font-black">{profile?.points || 0}</p>
                </div>
                <div className="bg-purple-600 p-6 rounded-2xl text-white shadow-purple-200 shadow-lg">
                  <p className="opacity-80 text-sm">Status</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
              </div>

              {/* Inventory for Restaurants */}
              {profile?.userType === 'restaurant' && (
                <div className="mt-10 animate-fadeIn">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Your Inventory</h3>
                    <button onClick={() => router.push('/restaurant')} className="text-primary font-bold text-sm">Add New +</button>
                  </div>
                  <InventoryTable items={inventory} />
                </div>
              )}

              {/* Recent Activity List */}
              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">Recent History</h3>
                {donations.length > 0 ? (
                   <div className="space-y-4">
                     {donations.slice(0, 3).map(d => (
                       <div key={d.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                         <div>
                           <p className="font-bold">{d.foodType}</p>
                           <p className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</p>
                         </div>
                         <span className="text-green-600 font-bold">+{d.quantity}</span>
                       </div>
                     ))}
                   </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No donation activity found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}