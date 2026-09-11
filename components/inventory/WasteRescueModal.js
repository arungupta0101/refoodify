import { useState, useEffect } from 'react';
import {
    XMarkIcon,
    SparklesIcon,
    TruckIcon,
    HeartIcon,
    CheckCircleIcon,
    LightBulbIcon,
    GlobeAmericasIcon,
    FireIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function WasteRescueModal({ isOpen, onClose, item, user, onLogSuccess }) {
    const [activeTab, setActiveTab] = useState('compost'); // 'compost', 'hacks', 'pickup', 'shelter'
    const [loadingAi, setLoadingAi] = useState(false);
    const [compostGuide, setCompostGuide] = useState(null);
    const [ecoHacks, setEcoHacks] = useState([]);
    const [submittingAction, setSubmittingAction] = useState(false);

    // Pickup Form State
    const [pickupAddress, setPickupAddress] = useState(user?.location || 'New Delhi, India');
    const [pickupDate, setPickupDate] = useState('Today, Afternoon');
    const [pickupNotes, setPickupNotes] = useState('');

    useEffect(() => {
        if (isOpen && item) {
            fetchCompostGuide();
            fetchEcoHacks();
        }
    }, [isOpen, item]);

    const fetchCompostGuide = async () => {
        setLoadingAi(true);
        try {
            const res = await fetch('/api/waste-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'compost_guide',
                    itemName: item?.name || 'Kitchen Waste',
                    category: item?.category || 'Organic'
                })
            });
            const data = await res.json();
            if (data.success && data.guide) {
                setCompostGuide(data.guide);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAi(false);
        }
    };

    const fetchEcoHacks = async () => {
        try {
            const res = await fetch('/api/waste-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'eco_hacks',
                    itemName: item?.name || 'Food item'
                })
            });
            const data = await res.json();
            if (data.success && data.hacks) {
                setEcoHacks(data.hacks);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleConfirmAction = async (actionType) => {
        setSubmittingAction(true);
        try {
            const res = await fetch('/api/get-waste-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.uid,
                    itemName: item?.name || 'Item',
                    quantity: `${item?.quantity || 1} ${item?.unit || 'unit'}`,
                    category: item?.category || 'General',
                    actionTaken: actionType
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Logged as ${actionType}! +25 Green Points Earned! 🌿`);
                if (onLogSuccess) onLogSuccess(item);
                onClose();
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to log waste action');
        } finally {
            setSubmittingAction(false);
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-emerald-100 dark:border-slate-800 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
                            🌱
                        </div>
                        <div>
                            <h3 className="font-black text-lg leading-tight flex items-center gap-2">
                                Eco-Waste Rescue & Composting
                            </h3>
                            <p className="text-xs text-emerald-100 font-medium">
                                Transform spoiled <span className="font-bold underline">{item.name}</span> into organic value!
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Carbon Saved Pill Banner */}
                <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3 px-5 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4 font-bold text-emerald-800 dark:text-emerald-300">
                        <span className="flex items-center gap-1">
                            <GlobeAmericasIcon className="w-4 h-4 text-emerald-600" />
                            Methane Saved: <strong className="text-emerald-900 dark:text-emerald-200">~0.8 kg CH₄</strong>
                        </span>
                        <span className="flex items-center gap-1">
                            <FireIcon className="w-4 h-4 text-amber-500" />
                            CO₂ Offset: <strong className="text-emerald-900 dark:text-emerald-200">~1.8 kg</strong>
                        </span>
                    </div>
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        +25 Green Pts 🌟
                    </span>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 p-1 gap-1 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'compost', label: '🌱 DIY Khaad Guide', icon: SparklesIcon },
                        { id: 'hacks', label: '💡 Non-Culinary Hacks', icon: LightBulbIcon },
                        { id: 'pickup', label: '🚛 Schedule Bio-Pickup', icon: TruckIcon },
                        { id: 'shelter', label: '🐾 Animal Shelter Rescue', icon: HeartIcon }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-slate-700'
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-slate-200'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Area */}
                <div className="p-6 overflow-y-auto flex-1 space-y-5">

                    {/* TAB 1: DIY COMPOSTING GUIDE */}
                    {activeTab === 'compost' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/30">
                                <div>
                                    <h4 className="font-bold text-xs text-amber-900 dark:text-amber-300">Refoodify AI Customized Composting Guide</h4>
                                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                                        Estimated decomposition time: <span className="font-bold">{compostGuide?.estimatedDays || '14-21 days'}</span>
                                    </p>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase">
                                    Difficulty: {compostGuide?.difficulty || 'Easy'}
                                </span>
                            </div>

                            {loadingAi ? (
                                <div className="py-12 text-center space-y-2">
                                    <SparklesIcon className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-bold">Generating AI Composting Instructions for {item.name}...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(compostGuide?.steps || []).map((step, idx) => (
                                        <div key={idx} className="bg-gray-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800">
                                            <h5 className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400 mb-1">{step.title}</h5>
                                            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{step.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {compostGuide?.proTip && (
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex gap-2">
                                    <span className="text-base">💡</span>
                                    <div>
                                        <strong className="font-bold">Eco Pro-Tip: </strong>
                                        {compostGuide.proTip}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => handleConfirmAction('composted')}
                                disabled={submittingAction}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                <span>I Composted This Item (+25 Green Points)</span>
                            </button>
                        </div>
                    )}

                    {/* TAB 2: NON-CULINARY ECO-HACKS */}
                    {activeTab === 'hacks' && (
                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                Before throwing <span className="font-bold text-gray-800 dark:text-slate-200">{item.name}</span> away, try these non-culinary upcycling uses:
                            </p>

                            <div className="space-y-3">
                                {ecoHacks.map((hack, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-gray-50 to-emerald-50/50 dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                                                <span>✨</span> {hack.title}
                                            </h5>
                                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
                                                {hack.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{hack.instructions}</p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleConfirmAction('upcycled')}
                                disabled={submittingAction}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <LightBulbIcon className="w-5 h-5" />
                                <span>Used Upcycling Eco-Hack (+25 Points)</span>
                            </button>
                        </div>
                    )}

                    {/* TAB 3: SCHEDULE BIO-WASTE PICKUP */}
                    {activeTab === 'pickup' && (
                        <div className="space-y-4 text-xs">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300">
                                <p className="font-bold">🚛 Bio-Waste Network Pickup</p>
                                <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                                    We route organic food waste directly to local municipal bio-digestors, community gardens & biogas energy units!
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="font-bold text-gray-600 dark:text-slate-400 uppercase">Pickup Location / Address</label>
                                    <input
                                        type="text"
                                        value={pickupAddress}
                                        onChange={(e) => setPickupAddress(e.target.value)}
                                        className="w-full mt-1 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-gray-800 dark:text-white font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-gray-600 dark:text-slate-400 uppercase">Preferred Time Slot</label>
                                    <select
                                        value={pickupDate}
                                        onChange={(e) => setPickupDate(e.target.value)}
                                        className="w-full mt-1 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-gray-800 dark:text-white font-medium"
                                    >
                                        <option value="Today, Afternoon">Today, 2:00 PM - 5:00 PM</option>
                                        <option value="Tomorrow, Morning">Tomorrow, 9:00 AM - 12:00 PM</option>
                                        <option value="Community Bin Drop">Drop at Local Bio-Bin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="font-bold text-gray-600 dark:text-slate-400 uppercase">Notes for Collector</label>
                                    <input
                                        type="text"
                                        value={pickupNotes}
                                        onChange={(e) => setPickupNotes(e.target.value)}
                                        placeholder="e.g. Placed in green compost bag outside gate"
                                        className="w-full mt-1 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none text-gray-800 dark:text-white font-medium"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => handleConfirmAction('bio_waste_pickup')}
                                disabled={submittingAction}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <TruckIcon className="w-5 h-5" />
                                <span>Schedule Bio-Waste Pickup (+25 Points)</span>
                            </button>
                        </div>
                    )}

                    {/* TAB 4: ANIMAL SHELTER & FARM RESCUE */}
                    {activeTab === 'shelter' && (
                        <div className="space-y-4 text-xs">
                            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-300">
                                <p className="font-bold flex items-center gap-1.5">
                                    <span>🐾</span> Animal Shelter & Gaushala Rescue
                                </p>
                                <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">
                                    Surplus food items (bread, vegetables, grains) can nourish local stray dog feeders, cow shelters (Gaushalas), or poultry farms!
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-2">
                                <h5 className="font-bold text-gray-900 dark:text-white">Verified Local Animal Feeder Partners</h5>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-slate-100">🐶 Paws & Care Stray Dog Drive</p>
                                            <p className="text-[10px] text-gray-500">1.2 km away • Accepts cooked rice, bread, meat scraps</p>
                                        </div>
                                        <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
                                    </div>

                                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-slate-100">🐮 Sri Krishna Gaushala Trust</p>
                                            <p className="text-[10px] text-gray-500">2.5 km away • Accepts fresh vegetable greens, fruits, grains</p>
                                        </div>
                                        <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Open</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleConfirmAction('animal_shelter')}
                                disabled={submittingAction}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <HeartIcon className="w-5 h-5" />
                                <span>Donate Surplus to Animal Shelter (+25 Points)</span>
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
