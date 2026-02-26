import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { FlagIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Report() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // New States for Organization Selection
  const [partners, setPartners] = useState({ ngos: [], restaurants: [] });
  const [orgType, setOrgType] = useState('ngo'); // 'ngo' or 'restaurant'
  const [searchArea, setSearchArea] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  
  const [reportForm, setReportForm] = useState({
    targetName: '',
    targetId: '',
    location: '',
    type: 'Misbehavior',
    description: '',
    photo: ''
  });

  // Fetch Partners on Load
  useEffect(() => {
    fetch('/api/partners')
      .then(res => res.json())
      .then(data => {
        if (data) setPartners(data);
      })
      .catch(err => console.error("Failed to load partners", err));

    if (router.query.targetName) {
      setReportForm(prev => ({ ...prev, targetName: router.query.targetName }));
    }
  }, [router.query]);

  // Filter Logic
  const filteredList = (orgType === 'ngo' ? partners.ngos : partners.restaurants).filter(item => {
     const name = item.organizationName || item.name || '';
     const address = item.address || '';
     const matchesArea = searchArea ? (address.toLowerCase().includes(searchArea.toLowerCase()) || name.toLowerCase().includes(searchArea.toLowerCase())) : true;
     return matchesArea;
  });

  const handleOrgSelect = (e) => {
    const id = e.target.value;
    setSelectedOrgId(id);
    
    if (id === 'manual') {
      setReportForm(prev => ({ ...prev, targetName: '', targetId: '' }));
    } else {
      const org = filteredList.find(o => (o._id || o.id) === id);
      if (org) {
        setReportForm(prev => ({ 
          ...prev, 
          targetName: org.organizationName || org.name, 
          targetId: org._id || org.id,
          location: org.address || ''
        }));
      }
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Camera access denied");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setReportForm(prev => ({ ...prev, photo: dataUrl }));
      stopCamera();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a report");
      router.push('/login');
      return;
    }
    
    if ((reportForm.type === 'Hygiene Issue' || reportForm.type === 'Non-Edible Food') && !reportForm.photo) {
      toast.error("Photo proof is mandatory for Hygiene/Food Quality reports.");
      return;
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: user.uid,
          reporterName: user.name,
          targetId: reportForm.targetId,
          targetName: reportForm.targetName,
          location: reportForm.location,
          issueType: reportForm.type,
          description: reportForm.description,
          photoProof: reportForm.photo
        })
      });

      if (res.ok) {
        toast.success("Report Submitted! We will investigate.");
        router.push('/');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast.error("Failed to submit report");
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-red-50 p-8 border-b border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FlagIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">Report an Issue</h1>
            <p className="text-gray-600">Help us maintain quality and safety by reporting issues with NGOs or Restaurants.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* 1. Select Organization Type */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">I want to report a:</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setOrgType('ngo'); setSelectedOrgId(''); setSearchArea(''); }} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${orgType === 'ngo' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>🏢 NGO</button>
                <button type="button" onClick={() => { setOrgType('restaurant'); setSelectedOrgId(''); setSearchArea(''); }} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${orgType === 'restaurant' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>🍕 Restaurant</button>
              </div>
            </div>

            {/* 2. Filter by Area */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Filter by Area / City</label>
              <input type="text" value={searchArea} onChange={e => setSearchArea(e.target.value)} className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 ring-red-200 outline-none" placeholder="e.g. Gorakhpur, Civil Lines..." />
            </div>

            {/* 3. Select Organization Dropdown */}
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Select Organization</label>
              <select 
                className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 ring-red-200 outline-none"
                onChange={handleOrgSelect}
                value={selectedOrgId}
              >
                <option value="">-- Select from list --</option>
                {filteredList.map(org => (
                  <option key={org._id || org.id} value={org._id || org.id}>
                    {org.organizationName || org.name} ({org.address ? org.address.substring(0, 30) + '...' : 'No Address'})
                  </option>
                ))}
                <option value="manual">Other / Not in list (Enter Manually)</option>
              </select>
            </div>

            {/* Manual Name Input (Only if 'manual' or no ID selected yet but typing allowed) */}
            <div className={selectedOrgId && selectedOrgId !== 'manual' ? 'hidden' : 'block'}>
              <label className="block text-sm font-bold text-gray-500 mb-1">Organization Name (Manual Entry)</label>
              <input type="text" required={!selectedOrgId || selectedOrgId === 'manual'} value={reportForm.targetName} onChange={e => setReportForm({...reportForm, targetName: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 ring-red-200 outline-none" placeholder="e.g. Tasty Bites" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Issue Type</label>
              <select value={reportForm.type} onChange={e => setReportForm({...reportForm, type: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 ring-red-200 outline-none">
                <option value="Misbehavior">Misbehavior / Rude Staff</option>
                <option value="Hygiene Issue">Non-Hygienic Environment</option>
                <option value="Non-Edible Food">Non-Edible / Bad Food Quality</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Description</label>
              <textarea required value={reportForm.description} onChange={e => setReportForm({...reportForm, description: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 ring-red-200 outline-none h-32" placeholder="Describe what happened..." />
            </div>

            <div className="bg-red-50 p-6 rounded-xl border-2 border-dashed border-red-200 text-center">
              <label className="block text-sm font-bold text-red-500 mb-2">Photo Proof (Camera Only)</label>
              <p className="text-xs text-gray-500 mb-4">Required for Hygiene/Food Quality issues.</p>
              
              {!isCameraOpen && !reportForm.photo && (
                <button type="button" onClick={startCamera} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 flex items-center gap-2 mx-auto">
                  <CameraIcon className="w-5 h-5" /> Open Camera
                </button>
              )}

              {isCameraOpen && (
                <div className="relative overflow-hidden rounded-xl bg-black max-w-sm mx-auto">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover"></video>
                  <button type="button" onClick={capturePhoto} className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white w-12 h-12 rounded-full border-4 border-gray-300 flex items-center justify-center"></button>
                  <button type="button" onClick={stopCamera} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
                </div>
              )}

              {reportForm.photo && (
                <div className="relative max-w-sm mx-auto">
                  <img src={reportForm.photo} alt="Proof" className="w-full h-48 object-cover rounded-xl" />
                  <button type="button" onClick={() => setReportForm(prev => ({ ...prev, photo: '' }))} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">Retake</button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>

            <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all text-lg">
              Submit Report
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}