import { useState, useRef, useEffect } from 'react';
import Quagga from 'quagga';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/Modal';  // Reusable modal
import toast from 'react-hot-toast';
import { 
  QrCodeIcon, PlusIcon, ArrowUpTrayIcon, ChartBarIcon, 
  TableCellsIcon, Squares2X2Icon, FunnelIcon, MagnifyingGlassIcon, 
  BellIcon, TrashIcon, PencilIcon, CheckCircleIcon, 
  ExclamationTriangleIcon, XCircleIcon, CalendarIcon,
  ArchiveBoxIcon, TruckIcon, DocumentArrowDownIcon, BookOpenIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Inventory() {
  const [scanning, setScanning] = useState(false);
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);  // Mock premium status
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);  // New modal for login prompt
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderItem, setReminderItem] = useState(null);
  const [inventory, setInventory] = useState([]);  // Stored items
  const scannerRef = useRef(null);
  const analyticsRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  // New UI States
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState({ search: '', status: 'all', category: 'all', sort: 'expiry' });
  const [stats, setStats] = useState({ total: 0, expiring: 0, saved: 0, waste: 0 });
  const [notifications, setNotifications] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  
  // Form State
  const [newItem, setNewItem] = useState({
    name: '', expiry: '', quantity: '', unit: 'pcs', storage: 'Dry', note: '', alertDays: 2
  });

  // Firebase Auth listener
  useEffect(() => {
    if (user) {
      // Mock premium check
      setIsPremium(user.email === 'premium@example.com');
      fetchInventory();
    }

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
  }, [user]);

  const fetchInventory = () => {
    return fetch(`/api/inventory?userId=${user.uid}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInventory(data);
          checkExpiryReminders(data);
          calculateStats(data);
          processChartData(data);
        }
      })
      .catch(err => console.error("Failed to load inventory", err));
  };

  const calculateStats = (items) => {
    const now = new Date();
    let expiring = 0;
    items.forEach(item => {
      const expiryDate = new Date(item.expiry);
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 3 && diffDays >= 0) expiring++;
    });
    setStats({
      total: items.length,
      expiring: expiring,
      saved: items.length * 0.5, // Mock: 0.5kg per item
      waste: 0 // Mock
    });
  };

  const processChartData = (items) => {
    const data = {};
    items.forEach(item => {
      if (!item.expiry) return;
      const date = new Date(item.expiry);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      data[key] = (data[key] || 0) + 1;
    });
    
    const sortedData = Object.keys(data)
      .sort((a, b) => new Date(`01 ${a}`) - new Date(`01 ${b}`))
      .map(key => ({ name: key, count: data[key] }));
      
    setChartData(sortedData);
  };

  const checkExpiryReminders = (items) => {
    const now = new Date();
    const alerts = [];
    items.forEach((item) => {
      const expiryDate = new Date(item.expiry);
      const alertDate = new Date(expiryDate);
      alertDate.setDate(expiryDate.getDate() - (item.alertDays || 2));
      
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (now >= alertDate && now < expiryDate) {
        alerts.push({ type: 'expiring', message: `${item.name} expires in ${diffDays} days!`, item });
      }
    });
    setNotifications(alerts);
  };

  const startScan = () => {
    if (!user) {
      toast.error('Please log in to use this feature.');
      return;
    }
    // if (!isPremium) { setShowPremiumModal(true); return; }
    
    setScanning(true);
    setShowAddForm(true); // Show form to populate scanned data

    setTimeout(() => {
      if (!scannerRef.current) return;
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
        toast.success(`Scanned: ${code}`);
        setNewItem(prev => ({ ...prev, name: `Scanned Product ${code}` })); // Auto fill
        stopScan();
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
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!user) { setShowLoginModal(true); return; }
    
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, userId: user.uid })
      });
      if (!res.ok) throw new Error('Failed to add');
      const savedItem = await res.json();
      setInventory([savedItem, ...inventory]);
      toast.success('Product added!');
      setNewItem({ name: '', expiry: '', quantity: '', unit: 'pcs', storage: 'Dry', note: '', alertDays: 2 });
      setShowAddForm(false);
      calculateStats([savedItem, ...inventory]);
      processChartData([savedItem, ...inventory]);
    } catch (e) {
      toast.error('Failed to add product');
    }
  };

  const handleDelete = async (id) => {
      if (!confirm("Are you sure you want to delete this item?")) return;
      try {
        const res = await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          const updatedInventory = inventory.filter(i => i._id !== id && i.id !== id);
          setInventory(updatedInventory);
          calculateStats(updatedInventory);
          processChartData(updatedInventory);
          toast.success('Item removed');
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        toast.error('Failed to delete item');
      }
  };

  const getStatusColor = (expiry) => {
      const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
      if (days < 0) return 'bg-red-100 text-red-700 border-red-200';
      if (days <= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusText = (expiry) => {
      const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
      if (days < 0) return 'Expired';
      if (days <= 3) return 'Expiring Soon';
      return 'Fresh';
  };

  const filteredInventory = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(filter.search.toLowerCase());
      return matchesSearch;
  }).sort((a, b) => {
      if (filter.sort === 'expiry') return new Date(a.expiry) - new Date(b.expiry);
      return 0;
  });

  const handleAnalyticsClick = async () => {
    if (!user) return;
    const loadingToast = toast.loading("Refreshing analytics...");
    await fetchInventory();
    if (analyticsRef.current) {
      analyticsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.success("Analytics updated", { id: loadingToast });
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Analytics Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 20);
    
    // Stats
    doc.text(`Total Items: ${stats.total}`, 14, 30);
    doc.text(`Expiring Soon: ${stats.expiring}`, 60, 30);
    doc.text(`Food Saved: ${stats.saved}kg`, 110, 30);
    doc.text(`Wastage: ${stats.waste}kg`, 160, 30);

    const tableColumn = ["Product", "Quantity", "Expiry Date", "Storage", "Status"];
    const tableRows = [];

    inventory.forEach(item => {
        const itemData = [
            item.name,
            `${item.quantity || '-'} ${item.unit || ''}`,
            new Date(item.expiry).toLocaleDateString(),
            item.storage || 'Dry',
            getStatusText(item.expiry)
        ];
        tableRows.push(itemData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
    });

    doc.save("inventory_report.pdf");
    toast.success("Report downloaded!");
  };

  const handleCSVClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      // Assume format: name,expiry(YYYY-MM-DD),quantity,unit,storage
      const items = lines.slice(1).filter(line => line.trim() !== '').map(line => {
        const [name, expiry, quantity, unit, storage] = line.split(',');
        return {
          name: name?.trim(),
          expiry: expiry?.trim(),
          quantity: quantity?.trim(),
          unit: unit?.trim() || 'pcs',
          storage: storage?.trim() || 'Dry',
          userId: user.uid,
          alertDays: 2
        };
      });

      if (items.length > 0) {
        try {
          const res = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
          });
          if (res.ok) {
            toast.success(`Uploaded ${items.length} items!`);
            fetchInventory();
          } else throw new Error('Upload failed');
        } catch (err) {
          toast.error('Failed to upload CSV');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  const handleRecipeClick = async () => {
    if (!user) return;
    setLoadingRecipes(true);
    setShowRecipeModal(true);
    try {
      const res = await fetch(`/api/get-recipe-suggestions?userId=${user.uid}`);
      const data = await res.json();
      setRecipes(data.suggestions || []);
    } catch (err) {
      toast.error("Could not fetch recipes");
    } finally {
      setLoadingRecipes(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7faf9] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            
            {/* 🔝 Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800">Smart Inventory Manager</h1>
                    <p className="text-gray-500 mt-1">Track food items, reduce waste and get smart expiry alerts</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="px-4 py-2 bg-green-50 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 uppercase">Plan</p>
                        <p className="text-sm font-bold text-primary">{isPremium ? 'Pro Plan' : 'Free Plan'}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-gray-200"></div>
                    <div className="px-4 py-2">
                        <p className="text-xs font-bold text-gray-400 uppercase">Usage</p>
                        <p className="text-sm font-bold text-gray-700">{inventory.length}/50 Items</p>
                    </div>
                </div>
            </div>

            {/* 📊 Inventory Analytics Section */}
            <div ref={analyticsRef} className="scroll-mt-28 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ArchiveBoxIcon className="w-6 h-6" /></div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        <p className="text-xs text-gray-500 font-bold uppercase">Total Items</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><ExclamationTriangleIcon className="w-6 h-6" /></div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats.expiring}</p>
                        <p className="text-xs text-gray-500 font-bold uppercase">Expiring Soon</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircleIcon className="w-6 h-6" /></div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats.saved}kg</p>
                        <p className="text-xs text-gray-500 font-bold uppercase">Food Saved</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl"><TrashIcon className="w-6 h-6" /></div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats.waste}kg</p>
                        <p className="text-xs text-gray-500 font-bold uppercase">Wastage</p>
                    </div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Expiry Trends (Items per Month)</h3>
                  <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="count" fill="#22c55e" name="Items Expiring" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
            </div>

            {/* 📦 Top Quick Action Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button onClick={startScan} className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary transition-all group">
                    <QrCodeIcon className="w-8 h-8 text-gray-600 group-hover:text-primary mb-2 transition-colors" />
                    <span className="font-bold text-gray-700 group-hover:text-primary">Scan Barcode</span>
                </button>
                <button onClick={() => setShowAddForm(!showAddForm)} className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary transition-all group">
                    <PlusIcon className="w-8 h-8 text-gray-600 group-hover:text-primary mb-2 transition-colors" />
                    <span className="font-bold text-gray-700 group-hover:text-primary">Add Product</span>
                </button>
                <button onClick={handleCSVClick} className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary transition-all group">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                    <DocumentArrowDownIcon className="w-8 h-8 text-gray-600 group-hover:text-primary mb-2 transition-colors" />
                    <span className="font-bold text-gray-700 group-hover:text-primary">Import CSV</span>
                </button>
                <button onClick={handleRecipeClick} className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary transition-all group">
                    <BookOpenIcon className="w-8 h-8 text-gray-600 group-hover:text-primary mb-2 transition-colors" />
                    <span className="font-bold text-gray-700 group-hover:text-primary">Recipes</span>
                </button>
            </div>

            {/* 📷 Barcode Scanner UI */}
            {scanning && (
                <div className="mb-8 bg-black rounded-3xl overflow-hidden relative shadow-2xl">
                    <div ref={scannerRef} className="w-full h-80 bg-gray-900"></div>
                    <div className="absolute inset-0 border-2 border-primary/50 m-8 rounded-xl pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4">
                        <button onClick={stopScan} className="bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-red-600">Stop Scan</button>
                    </div>
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                        Live Scanner Active
                    </div>
                </div>
            )}

            {/* 📝 Manual Product Entry Form */}
            {showAddForm && (
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8 animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Add New Product</h3>
                        <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                            <input 
                                type="text" 
                                value={newItem.name} 
                                onChange={e => setNewItem({...newItem, name: e.target.value})}
                                className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none" 
                                placeholder="e.g. Milk" 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                            <input 
                                type="date" 
                                value={newItem.expiry} 
                                onChange={e => setNewItem({...newItem, expiry: e.target.value})}
                                className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none" 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    value={newItem.quantity} 
                                    onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none" 
                                    placeholder="0" 
                                />
                                <select 
                                    value={newItem.unit} 
                                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                                    className="p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="pcs">Pcs</option>
                                    <option value="kg">Kg</option>
                                    <option value="l">L</option>
                                    <option value="pack">Pack</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Storage Type</label>
                            <select 
                                value={newItem.storage} 
                                onChange={e => setNewItem({...newItem, storage: e.target.value})}
                                className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="Dry">Dry Storage</option>
                                <option value="Refrigerated">Refrigerated</option>
                                <option value="Frozen">Frozen</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Notes</label>
                            <textarea 
                                value={newItem.note} 
                                onChange={e => setNewItem({...newItem, note: e.target.value})}
                                className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-primary outline-none" 
                                placeholder="Optional notes..." 
                                rows="2"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-600 transition-all">
                                ➕ Add Item to Inventory
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 🔍 Smart Filters & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        value={filter.search}
                        onChange={e => setFilter({...filter, search: e.target.value})}
                        className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
                        <FunnelIcon className="w-4 h-4" /> Filter
                    </button>
                    <div className="flex bg-white border border-gray-200 rounded-xl p-1">
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-gray-100 text-primary' : 'text-gray-400'}`}>
                            <TableCellsIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setViewMode('card')} className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-gray-100 text-primary' : 'text-gray-400'}`}>
                            <Squares2X2Icon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 📋 Inventory List Section */}
            {viewMode === 'table' ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-5">Product</th>
                                <th className="p-5">Quantity</th>
                                <th className="p-5">Expiry Date</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredInventory.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-5 font-bold text-gray-800">{item.name}</td>
                                    <td className="p-5 text-gray-600">{item.quantity || '-'} {item.unit || ''}</td>
                                    <td className="p-5 text-gray-600">{new Date(item.expiry).toLocaleDateString()}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.expiry)}`}>
                                            {getStatusText(item.expiry)}
                                        </span>
                                    </td>
                                    <td className="p-5 flex justify-end gap-2">
                                        <button onClick={() => router.push('/donate')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Donate">
                                            <TruckIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(item._id || item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredInventory.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-gray-400">No items found. Add some products!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInventory.map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(item.expiry).split(' ')[0].replace('bg-', 'bg-')}`}></div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                                    <p className="text-xs text-gray-500">{item.storage || 'Dry Storage'}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(item.expiry)}`}>
                                    {getStatusText(item.expiry)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Expires: {new Date(item.expiry).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                                <ArchiveBoxIcon className="w-4 h-4" />
                                <span>Qty: {item.quantity || '-'} {item.unit || ''}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => router.push('/donate')} className="flex-1 bg-green-50 text-green-700 py-2 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors">Donate</button>
                                <button onClick={() => handleDelete(item._id || item.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end mt-4">
               <button onClick={exportToPDF} className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold text-sm"><DocumentArrowDownIcon className="w-5 h-5"/> Download Report</button>
            </div>

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

      {/* Recipe Suggestions Modal */}
      <Modal isOpen={showRecipeModal} onClose={() => setShowRecipeModal(false)}>
        <div className="bg-white rounded-2xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <BookOpenIcon className="w-6 h-6 text-primary" /> Smart Recipes
          </h2>
          <p className="text-gray-500 mb-6 text-sm">Based on your expiring inventory items.</p>
          
          {loadingRecipes ? (
            <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
          ) : recipes.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {recipes.map((rec, idx) => (
                <div key={idx} className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 capitalize">{rec.item}</h4>
                    <span className="text-xs text-red-500 font-bold bg-white px-2 py-1 rounded">Exp: {new Date(rec.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 font-bold uppercase">Try making:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.recipes.map((r, i) => (
                      <span key={i} className="bg-white text-orange-600 text-xs px-3 py-1 rounded-full shadow-sm border border-orange-100">{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No expiring items found for suggestions.</p>
            </div>
          )}
          
          <button onClick={() => setShowRecipeModal(false)} className="mt-6 w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200">Close</button>
        </div>
      </Modal>
    </>
  );
}