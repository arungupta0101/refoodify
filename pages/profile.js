import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
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

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const storageRef = ref(storage, `profilePhotos/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    // Update user via API
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
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handleSave = async () => {
    try {
      // Update profile in database
      const updates = {
        name: editForm.name,
        address: editForm.address,
      };
      const response = await fetch('/api/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update email if changed
      if (editForm.email !== user.email) {
        await updateEmail(user, editForm.email);
      }

      // Update password if provided
      if (editForm.newPassword) {
        const credential = EmailAuthProvider.credential(user.email, editForm.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, editForm.newPassword);
      }

      setProfile({ ...profile, ...updates });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile: ' + error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  const getBadge = (points) => {
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
  };

  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Your Profile & Dashboard
          </h1>
          <p className="text-gray-600">Manage your account and track your impact</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Profile</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img 
                    src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                    alt="Profile Picture" 
                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover" 
                  />
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <div className="mt-4 text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Profile Picture</label>
                    <input 
                      type="file" 
                      onChange={handleUpload} 
                      accept="image/*"
                      className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark file:cursor-pointer" 
                    />
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      rows="3"
                      placeholder="Enter your address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password (required for changes)</label>
                    <input
                      type="password"
                      value={editForm.currentPassword}
                      onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password (optional)</label>
                    <input
                      type="password"
                      value={editForm.newPassword}
                      onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Enter new password"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-semibold"
                  >
                    Save All Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-800">{profile?.name || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800">{user.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold text-gray-800">{profile?.address || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-semibold text-gray-800 capitalize">{profile?.userType}</p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-lg text-white">
                    <p className="text-sm opacity-90">Points Earned</p>
                    <p className="text-2xl font-bold">{profile?.points || 0}</p>
                    <p className="text-sm opacity-90">{getBadge(profile?.points || 0)} Member</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Dashboard</h2>
              
              {/* Performance Metrics */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Performance Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Donations</p>
                        <p className="text-3xl font-bold">{donations.length}</p>
                      </div>
                      <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Points Earned</p>
                        <p className="text-3xl font-bold">{profile?.points || 0}</p>
                      </div>
                      <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Badge Level</p>
                        <p className="text-2xl font-bold">{getBadge(profile?.points || 0)}</p>
                      </div>
                      <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donation History */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Recent Donations</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  {donations.length > 0 ? (
                    <div className="space-y-3">
                      {donations.slice(0, 5).map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center space-x-3">
                            <div className="bg-primary rounded-full p-2">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{donation.foodType}</p>
                              <p className="text-sm text-gray-500">Quantity: {donation.quantity}</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5v2m0 0v2m0-2h2m-2 0H8" />
                      </svg>
                      <p className="text-gray-500 text-lg">No donations yet</p>
                      <p className="text-gray-400 text-sm">Start making a difference today!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Restaurant Inventory */}
              {profile?.userType === 'restaurant' && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Restaurant Inventory</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    {inventory.length > 0 ? (
                      <div className="mb-4">
                        <InventoryTable items={inventory} />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-500 text-lg">No inventory items</p>
                        <p className="text-gray-400 text-sm">Add items to track your stock</p>
                      </div>
                    )}
                    <button
                      onClick={() => router.push('/restaurant')}
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-semibold"
                    >
                      Manage Inventory
                    </button>
                  </div>
                </div>
              )}

              {/* Activity Feed */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Activity Feed</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500 rounded-full p-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Account Created</p>
                        <p className="text-xs text-gray-500">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 rounded-full p-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Last Login</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                    </div>
                    {donations.length > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-500 rounded-full p-2">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">Last Donation</p>
                          <p className="text-xs text-gray-500">{new Date(donations[0].createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}