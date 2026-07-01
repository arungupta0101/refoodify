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
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300">
              <FlagIcon className="w-8 h-8" />
            </div>
            <p className="page-kicker justify-center mb-4">Safety Report</p>
            <h1 className="section-heading">Report an Issue</h1>
            <p className="section-copy mt-4">Help us maintain quality and safety by reporting issues with NGOs or restaurants.</p>
          </div>

          <form onSubmit={handleSubmit} className="premium-card p-8 space-y-6">
            
            {/* 1. Select Organization Type */}
            <div>
              <label className="field-label">I want to report a:</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setOrgType('ngo'); setSelectedOrgId(''); setSearchArea(''); }} className={`premium-card flex-1 py-3 font-semibold transition-all ${orgType === 'ngo' ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300' : 'text-slate-500 hover:-translate-y-0.5 dark:text-slate-400'}`}>🏢 NGO</button>
                <button type="button" onClick={() => { setOrgType('restaurant'); setSelectedOrgId(''); setSearchArea(''); }} className={`premium-card flex-1 py-3 font-semibold transition-all ${orgType === 'restaurant' ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300' : 'text-slate-500 hover:-translate-y-0.5 dark:text-slate-400'}`}>🍕 Restaurant</button>
              </div>
            </div>

            {/* 2. Filter by Area */}
            <div>
              <label className="field-label">Filter by Area / City</label>
              <input type="text" value={searchArea} onChange={e => setSearchArea(e.target.value)} className="premium-input px-4 py-3" placeholder="e.g. Gorakhpur, Civil Lines..." />
            </div>

            {/* 3. Select Organization Dropdown */}
            <div>
              <label className="field-label">Select Organization</label>
              <select 
                className="premium-select px-4 py-3"
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
              <label className="field-label">Organization Name (Manual Entry)</label>
              <input type="text" required={!selectedOrgId || selectedOrgId === 'manual'} value={reportForm.targetName} onChange={e => setReportForm({...reportForm, targetName: e.target.value})} className="premium-input px-4 py-3" placeholder="e.g. Tasty Bites" />
            </div>

            <div>
              <label className="field-label">Issue Type</label>
              <select value={reportForm.type} onChange={e => setReportForm({...reportForm, type: e.target.value})} className="premium-select px-4 py-3">
                <option value="Misbehavior">Misbehavior / Rude Staff</option>
                <option value="Hygiene Issue">Non-Hygienic Environment</option>
                <option value="Non-Edible Food">Non-Edible / Bad Food Quality</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="field-label">Description</label>
              <textarea required value={reportForm.description} onChange={e => setReportForm({...reportForm, description: e.target.value})} className="premium-textarea h-32 px-4 py-3" placeholder="Describe what happened..." />
            </div>

            <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/60 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
              <label className="mb-2 block text-sm font-bold text-rose-600 dark:text-rose-300">Photo proof (camera only)</label>
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Required for hygiene and food quality issues.</p>
              
              {!isCameraOpen && !reportForm.photo && (
                <button type="button" onClick={startCamera} className="premium-button mx-auto bg-rose-600 hover:bg-rose-700">
                  <CameraIcon className="w-5 h-5" /> Open Camera
                </button>
              )}

              {isCameraOpen && (
                <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover"></video>
                  <button type="button" onClick={capturePhoto} className="absolute bottom-4 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-slate-200 bg-white"></button>
                  <button type="button" onClick={stopCamera} className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white"><XMarkIcon className="w-6 h-6" /></button>
                </div>
              )}

              {reportForm.photo && (
                <div className="relative mx-auto max-w-sm">
                  <img src={reportForm.photo} alt="Proof" className="h-48 w-full rounded-2xl object-cover" />
                  <button type="button" onClick={() => setReportForm(prev => ({ ...prev, photo: '' }))} className="absolute right-2 top-2 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md">Retake</button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>

            <button type="submit" className="premium-button w-full bg-rose-600 hover:bg-rose-700">
              Submit Report
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}