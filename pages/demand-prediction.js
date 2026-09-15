import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SparklesIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    MinusIcon,
    CircleStackIcon,
    CalculatorIcon,
    LightBulbIcon,
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
    QuestionMarkCircleIcon,
    XMarkIcon,
    ArrowPathIcon,
    InformationCircleIcon,
    ArrowTopRightOnSquareIcon,
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

import { useAuth } from '../contexts/AuthContext';

const DEMO_ITEMS = [
    'Veggie Biryani',
    'Garden Salad',
    'Paneer Butter Masala',
    'Whole Wheat Bread Roll',
    'Tomato Soup'
];

export default function DemandPredictionPage() {
    const { user } = useAuth() || {};
    const currentUserId = user?.uid || user?.id || user?._id || 'guest_user';

    const [selectedItem, setSelectedItem] = useState('Veggie Biryani');
    const [customItem, setCustomItem] = useState('');
    const [periodDays, setPeriodDays] = useState(7);
    const [historyRangeDays, setHistoryRangeDays] = useState(30);

    // Live Inventory Items State
    const [userInventoryItems, setUserInventoryItems] = useState([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [predictionData, setPredictionData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    // Modals & Hints
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [showStockHint, setShowStockHint] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
    const [inventorySearchQuery, setInventorySearchQuery] = useState('');

    const [logForm, setLogForm] = useState({
        itemName: 'Veggie Biryani',
        quantityPrepared: '',
        quantityConsumed: '',
        unit: 'servings',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [logSubmitting, setLogSubmitting] = useState(false);
    const [logSuccessMsg, setLogSuccessMsg] = useState('');

    const activeItem = customItem.trim() ? customItem.trim() : selectedItem;

    // Fetch Live Items from Inventory API for active user only
    const fetchInventoryItems = async () => {
        setInventoryLoading(true);
        try {
            const queryId = currentUserId !== 'guest_user' ? `${currentUserId},guest_user` : 'guest_user';
            const res = await fetch(`/api/inventory?userId=${queryId}`);
            if (res.ok) {
                const items = await res.json();
                if (Array.isArray(items)) {
                    // Deduplicate items by name
                    const uniqueMap = new Map();
                    items.forEach(item => uniqueMap.set(item.name.toLowerCase(), item));
                    const uniqueItems = Array.from(uniqueMap.values());
                    setUserInventoryItems(uniqueItems);

                    if (uniqueItems.length > 0 && selectedItem === 'Veggie Biryani') {
                        setSelectedItem(uniqueItems[0].name);
                        fetchPrediction(uniqueItems[0].name, periodDays, historyRangeDays);
                        fetchHistoryLogs(uniqueItems[0].name);
                    }
                }
            }
        } catch (err) {
            console.warn('Inventory fetch error:', err);
        } finally {
            setInventoryLoading(false);
        }
    };

    const fetchPrediction = async (itemToPredict = activeItem, period = periodDays, range = historyRangeDays) => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await fetch('/api/demand-prediction/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUserId,
                    itemName: itemToPredict,
                    periodDays: period,
                    historyRangeDays: range
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch demand prediction.');
            }
            setPredictionData(data);
        } catch (err) {
            console.error('Prediction Fetch Error:', err);
            setErrorMsg(err.message || 'Unable to generate demand prediction.');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoryLogs = async (itemToFetch = activeItem) => {
        try {
            const res = await fetch(`/api/demand-prediction/historical?userId=${currentUserId}&itemName=${encodeURIComponent(itemToFetch)}`);
            const data = await res.json();
            if (data && data.history) {
                setHistoryData(data.history);
            }
        } catch (err) {
            console.warn('History Fetch Error:', err);
        }
    };

    useEffect(() => {
        fetchInventoryItems();
    }, [user]);

    const handleGenerateClick = () => {
        fetchPrediction(activeItem, periodDays, historyRangeDays);
        fetchHistoryLogs(activeItem);
    };

    const handleSeedDemoData = async () => {
        setLoading(true);
        try {
            await fetch('/api/demand-prediction/historical', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'seed',
                    userId: 'demo_user',
                    itemName: activeItem,
                    days: 30
                })
            });
            await fetchPrediction(activeItem, periodDays, historyRangeDays);
            await fetchHistoryLogs(activeItem);
        } catch (err) {
            console.error('Seed Demo Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        setLogSubmitting(true);
        setLogSuccessMsg('');
        try {
            const res = await fetch('/api/demand-prediction/historical', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'demo_user',
                    itemName: logForm.itemName || activeItem,
                    quantityPrepared: Number(logForm.quantityPrepared),
                    quantityConsumed: Number(logForm.quantityConsumed),
                    unit: logForm.unit,
                    date: logForm.date,
                    notes: logForm.notes
                })
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.message || 'Error logging entry');
            }

            setLogSuccessMsg('Recorded successfully!');
            setTimeout(() => {
                setIsLogModalOpen(false);
                setLogSuccessMsg('');
            }, 1200);

            fetchPrediction(activeItem, periodDays, historyRangeDays);
            fetchHistoryLogs(activeItem);
        } catch (err) {
            alert(err.message);
        } finally {
            setLogSubmitting(false);
        }
    };

    // Build Chart Dataset
    const chartData = [];
    if (predictionData && predictionData.historicalSeries) {
        predictionData.historicalSeries.forEach((h) => {
            chartData.push({
                date: h.date.slice(5),
                dayOfWeek: h.dayOfWeek,
                PastUsage: h.quantityConsumed,
                Wasted: h.quantityWasted,
                AIForecast: null
            });
        });
    }

    if (predictionData && predictionData.dailyForecast) {
        if (chartData.length > 0) {
            chartData[chartData.length - 1].AIForecast = chartData[chartData.length - 1].PastUsage;
        }
        predictionData.dailyForecast.forEach((f) => {
            chartData.push({
                date: f.date.slice(5),
                dayOfWeek: f.dayOfWeek,
                PastUsage: null,
                Wasted: null,
                AIForecast: f.predictedDemand
            });
        });
    }

    return (
        <>
            <Head>
                <title>AI Food Demand Prediction | ReFoodify</title>
                <meta name="description" content="Simple AI food demand predictor for restaurants and kitchens." />
            </Head>

            <Header />

            <main className="min-h-screen pt-24 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors">
                <div className="section-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Top Header & How to Use Button */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                                <SparklesIcon className="w-4 h-4 text-emerald-600" />
                                Smart Kitchen Assistant
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                AI Food Demand Predictor
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                Forecast exact food demand to prepare just the right amount and eliminate waste.
                            </p>
                        </div>

                        {/* How to Use Guide Button */}
                        <button
                            onClick={() => setIsGuideOpen(true)}
                            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-105 shrink-0 self-start md:self-auto"
                        >
                            <QuestionMarkCircleIcon className="w-5 h-5" />
                            💡 How to Use? (Guide & FAQs)
                        </button>
                    </div>

                    {/* Quick 3-Step Summary Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">1</div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-xs">1. Choose Dish</p>
                                <p className="text-[11px] text-slate-500">Pick from Kitchen Inventory or Presets</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">2</div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-xs">2. Select Days</p>
                                <p className="text-[11px] text-slate-500">Forecast 7, 14, or 30 days ahead</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-sm shrink-0">3</div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-xs">3. Get Prep Quantity</p>
                                <p className="text-[11px] text-slate-500">Predicted Demand minus Stock!</p>
                            </div>
                        </div>
                    </div>

                    {/* Controls Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

                            {/* Item Selector with LIVE INVENTORY OPTGROUP */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        1. Select Food Item
                                        <span className="text-emerald-500 text-[11px]" title="The dish you want to predict demand for">ℹ️</span>
                                    </label>
                                    <Link href="/inventory" className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5">
                                        <span>Manage Inventory</span>
                                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                    </Link>
                                </div>

                                <select
                                    value={selectedItem}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'select_from_inventory') {
                                            setIsInventoryModalOpen(true);
                                            setSelectedItem('select_from_inventory');
                                        } else {
                                            setSelectedItem(val);
                                            setCustomItem('');
                                            if (val !== 'custom') {
                                                fetchPrediction(val, periodDays, historyRangeDays);
                                                fetchHistoryLogs(val);
                                            }
                                        }
                                    }}
                                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-300 dark:border-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                >
                                    {/* REQUESTED ACTION OPTION */}
                                    <option value="select_from_inventory">
                                        📦 Select item from Smart Inventory...
                                    </option>

                                    {/* LIVE INVENTORY GROUP */}
                                    {userInventoryItems.length > 0 && (
                                        <optgroup label="📦 From Your Kitchen Inventory">
                                            {userInventoryItems.map((invItem) => (
                                                <option key={invItem._id || invItem.name} value={invItem.name}>
                                                    📦 {invItem.name} (Stock: {invItem.quantity} {invItem.unit || 'servings'})
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}

                                    {/* POPULAR PRESETS GROUP */}
                                    <optgroup label="⭐ Popular Food Items">
                                        {DEMO_ITEMS.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </optgroup>

                                    {/* CUSTOM ENTRY */}
                                    <optgroup label="✏️ Custom Item">
                                        <option value="custom">+ Type Custom Dish Name...</option>
                                    </optgroup>
                                </select>

                                {/* INLINE SMART INVENTORY SELECTOR */}
                                {selectedItem === 'select_from_inventory' && (
                                    <div className="mt-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                                <CircleStackIcon className="w-4 h-4 text-emerald-600" />
                                                Choose Kitchen Inventory Item:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setIsInventoryModalOpen(true)}
                                                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline"
                                            >
                                                Open Inventory Grid 🔍
                                            </button>
                                        </div>
                                        {userInventoryItems.length > 0 ? (
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        setSelectedItem(e.target.value);
                                                        fetchPrediction(e.target.value, periodDays, historyRangeDays);
                                                        fetchHistoryLogs(e.target.value);
                                                    }
                                                }}
                                                className="w-full p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-emerald-300 dark:border-emerald-700 font-bold text-xs"
                                            >
                                                <option value="">-- Click to select item --</option>
                                                {userInventoryItems.map((inv) => (
                                                    <option key={inv._id || inv.name} value={inv.name}>
                                                        📦 {inv.name} (Stock: {inv.quantity} {inv.unit || 'servings'})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                No items found in your inventory. <Link href="/inventory" className="text-emerald-600 font-bold underline">+ Add item to Inventory</Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedItem === 'custom' && (
                                    <input
                                        type="text"
                                        placeholder="e.g. Chicken Curry"
                                        value={customItem}
                                        onChange={(e) => setCustomItem(e.target.value)}
                                        className="mt-2 w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                )}
                            </div>

                            {/* Days Selector */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-2">
                                    2. Forecast Period
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[7, 14, 30].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setPeriodDays(d)}
                                            className={`py-3.5 rounded-2xl text-xs font-bold transition-all ${periodDays === d
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            Next {d} Days
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit CTA */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleGenerateClick}
                                    disabled={loading}
                                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                            Predicting...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-5 h-5" />
                                            Generate AI Prediction
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setIsLogModalOpen(true)}
                                    className="py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-all text-xs shrink-0"
                                >
                                    <PlusIcon className="w-4 h-4 text-emerald-600" />
                                    + Log Usage
                                </button>
                            </div>

                        </div>

                        {/* Sub-bar */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                            <span className="flex items-center gap-1.5">
                                <InformationCircleIcon className="w-4 h-4 text-emerald-500" />
                                {userInventoryItems.length > 0
                                    ? `Loaded ${userInventoryItems.length} items from your ReFoodify Inventory database`
                                    : predictionData?.isDemoData
                                        ? 'Prototype Demo Dataset Loaded'
                                        : 'Connected to ReFoodify Database'}
                            </span>
                            <button
                                onClick={handleSeedDemoData}
                                disabled={loading}
                                className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                            >
                                Reload Demo Data
                            </button>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {/* Result Cards */}
                    {predictionData && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                            {/* Highlighted Card 1: Recommended Production */}
                            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden sm:col-span-2 lg:col-span-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                                        Recommended Prep Quantity
                                    </span>
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <CalculatorIcon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div className="text-4xl font-black">
                                    {predictionData.recommendedProduction}{' '}
                                    <span className="text-lg font-bold text-emerald-200">
                                        {predictionData.unit}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-emerald-100 flex items-center gap-1">
                                    <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                                    Quantity you should prepare
                                </p>
                                <p className="mt-1 text-[11px] text-emerald-200 opacity-90 border-t border-white/20 pt-1.5">
                                    Formula: Predicted Demand ({predictionData.predictedDemand}) - Kitchen Stock ({predictionData.currentInventory})
                                </p>
                            </div>

                            {/* Card 2: Predicted Demand */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase text-slate-500">
                                        Total Customer Demand
                                    </span>
                                    <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-xl">
                                        <SparklesIcon className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {predictionData.predictedDemand}{' '}
                                    <span className="text-sm font-semibold text-slate-500">
                                        {predictionData.unit}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    Expected customer orders over next {predictionData.periodDays} days
                                </p>
                            </div>

                            {/* Card 3: Current Stock in Kitchen WITH DIRECT INVENTORY LINK */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg relative">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-bold uppercase text-slate-500">
                                            Current Stock in Kitchen
                                        </span>
                                        <button
                                            onClick={() => setShowStockHint(!showStockHint)}
                                            className="text-amber-500 hover:text-amber-600 text-xs font-bold"
                                            title="Where does this stock come from?"
                                        >
                                            ❓
                                        </button>
                                    </div>
                                    <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl">
                                        <CircleStackIcon className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {predictionData.currentInventory}{' '}
                                    <span className="text-sm font-semibold text-slate-500">
                                        {predictionData.unit}
                                    </span>
                                </div>

                                {/* Stock Source Explanation */}
                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                    <p className="text-[11px] text-slate-500">
                                        Synced from your Inventory database.
                                    </p>
                                    <Link
                                        href="/inventory"
                                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-500 hover:underline mt-0.5"
                                    >
                                        <span>Manage / Add Stock in Inventory</span>
                                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                {/* Popup Stock Hint Tooltip */}
                                {showStockHint && (
                                    <div className="absolute top-12 left-4 right-4 z-20 p-3 bg-amber-500 text-white text-xs rounded-xl shadow-xl">
                                        <p className="font-bold">📍 Where does stock come from?</p>
                                        <p className="mt-1 text-[11px]">
                                            It automatically syncs from your main ReFoodify <strong>/inventory</strong> page! Go to Inventory to add or edit item quantities.
                                        </p>
                                        <button
                                            onClick={() => setShowStockHint(false)}
                                            className="mt-2 text-[10px] underline font-bold"
                                        >
                                            Close hint
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Card 4: Trend */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase text-slate-500">
                                        Demand Trend
                                    </span>
                                    <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl">
                                        {predictionData.trend === 'increasing' ? (
                                            <ArrowTrendingUpIcon className="w-5 h-5" />
                                        ) : predictionData.trend === 'decreasing' ? (
                                            <ArrowTrendingDownIcon className="w-5 h-5" />
                                        ) : (
                                            <MinusIcon className="w-5 h-5" />
                                        )}
                                    </div>
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 dark:text-white capitalize">
                                    {predictionData.trend}
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    AI Model Confidence: {predictionData.confidenceScore}%
                                </p>
                            </div>

                        </div>
                    )}

                    {/* Simple Calculation & Chart Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                        {/* Recharts Simple Visualization (2 Cols) */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ChartBarIcon className="w-5 h-5 text-emerald-600" />
                                        Consumption & Forecast Graph ({activeItem})
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Green area = Past Consumption | Purple dotted line = Future AI Prediction
                                    </p>
                                </div>
                            </div>

                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                borderColor: '#334155',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Legend />
                                        <Area type="monotone" dataKey="PastUsage" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.2} />
                                        <Line type="monotone" dataKey="AIForecast" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Formula Math & AI Tips (1 Col) */}
                        <div className="space-y-6">

                            {/* How Math Works Box */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <CalculatorIcon className="w-5 h-5 text-emerald-600" />
                                    Simple Math Calculation
                                </h4>

                                <p className="text-xs text-slate-500 mb-3">
                                    We subtract what you already have in stock so you cook zero excess!
                                </p>

                                <div className="space-y-2 text-xs font-mono">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between">
                                        <span>Predicted Demand:</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {predictionData?.predictedDemand || 0} {predictionData?.unit}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-xl flex justify-between">
                                        <span>- Current Kitchen Stock:</span>
                                        <span className="font-bold">
                                            {predictionData?.currentInventory || 0} {predictionData?.unit}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-emerald-600 text-white font-sans font-bold rounded-xl flex justify-between text-sm">
                                        <span>= Recommended Prep:</span>
                                        <span>
                                            {predictionData?.recommendedProduction || 0} {predictionData?.unit}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 text-center">
                                    <Link
                                        href="/inventory"
                                        className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>Update stock on Inventory page</span>
                                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>

                            {/* AI Insights */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <LightBulbIcon className="w-5 h-5 text-amber-500" />
                                    ReFoodify AI Kitchen Tips
                                </h4>

                                <div className="space-y-2">
                                    {predictionData?.insights?.slice(0, 3).map((tip, idx) => (
                                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                            💡 {tip}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Past Usage History Log Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5 text-emerald-600" />
                                    Past Usage Logs ({activeItem})
                                </h3>
                                <p className="text-xs text-slate-500">
                                    AI uses this historical data to calculate daily customer demand patterns.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsLogModalOpen(true)}
                                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 self-start sm:self-auto"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Log Daily Usage
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                                <thead className="uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                                    <tr>
                                        <th className="p-3 rounded-l-xl">Date</th>
                                        <th className="p-3">Day</th>
                                        <th className="p-3 text-right">Prepared</th>
                                        <th className="p-3 text-right">Consumed</th>
                                        <th className="p-3 text-right rounded-r-xl">Wasted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {historyData.slice(0, 10).map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="p-3 font-mono">
                                                {typeof row.date === 'string' ? row.date.split('T')[0] : new Date(row.date).toISOString().split('T')[0]}
                                            </td>
                                            <td className="p-3 font-semibold">{row.dayOfWeek || '-'}</td>
                                            <td className="p-3 text-right">{row.quantityPrepared} {row.unit}</td>
                                            <td className="p-3 text-right text-emerald-600 font-bold">{row.quantityConsumed} {row.unit}</td>
                                            <td className="p-3 text-right text-rose-500 font-semibold">{row.quantityWasted} {row.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>

            {/* Guide & FAQs Modal */}
            <AnimatePresence>
                {isGuideOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setIsGuideOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-2xl">
                                    <QuestionMarkCircleIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        How to Use AI Demand Predictor?
                                    </h3>
                                    <p className="text-xs text-slate-500">Quick user guide & frequently asked questions</p>
                                </div>
                            </div>

                            {/* 4 Steps */}
                            <div className="space-y-3 my-4 text-xs">

                                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">1</div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Step 1: Choose Food Dish</h4>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            Select a dish directly from your <strong>Kitchen Inventory</strong> (with live stock counts), popular presets, or type a custom dish.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">2</div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Step 2: Pick Forecast Days</h4>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            Choose how many days ahead to plan: <strong>7 Days</strong>, <strong>14 Days</strong>, or <strong>30 Days</strong>.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">3</div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Step 3: Click "Generate AI Prediction"</h4>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            AI calculates your exact customer demand and subtracts your existing kitchen stock.
                                        </p>
                                    </div>
                                </div>

                            </div>

                            {/* FAQs Section */}
                            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <LightBulbIcon className="w-4 h-4 text-amber-500" />
                                    Frequently Asked Questions (FAQs)
                                </h4>

                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                                    <p className="font-bold text-slate-900 dark:text-white">❓ Where does "Current Stock in Kitchen" come from?</p>
                                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                                        It automatically syncs from your main ReFoodify <strong>Inventory</strong> page! Go to <Link href="/inventory" className="text-emerald-600 font-bold underline">/inventory</Link> to add or edit item quantities.
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                                    <p className="font-bold text-slate-900 dark:text-white">❓ What is "Recommended Prep Quantity"?</p>
                                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                                        It is the exact number of servings you should prepare today so you don't over-cook. Formula: <code>Predicted Demand - Current Stock</code>.
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                                    <p className="font-bold text-slate-900 dark:text-white">❓ How can I make AI predictions more accurate?</p>
                                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                                        Click the <strong>"+ Log Usage"</strong> button daily to record how much food was prepared vs consumed. The more data logged, the smarter the AI gets!
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsGuideOpen(false)}
                                className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg"
                            >
                                Got It! Back to Dashboard
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Usage Log Modal */}
            <AnimatePresence>
                {isLogModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative"
                        >
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                Record Daily Consumption Log
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Record daily usage to make AI predictions more accurate.
                            </p>

                            {logSuccessMsg && (
                                <div className="mb-4 p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold">
                                    {logSuccessMsg}
                                </div>
                            )}

                            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-500 mb-1">Food Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={logForm.itemName}
                                        onChange={(e) => setLogForm({ ...logForm, itemName: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1">Prepared Qty</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={logForm.quantityPrepared}
                                            onChange={(e) => setLogForm({ ...logForm, quantityPrepared: e.target.value })}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 outline-none"
                                            placeholder="100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1">Consumed Qty</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={logForm.quantityConsumed}
                                            onChange={(e) => setLogForm({ ...logForm, quantityConsumed: e.target.value })}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 outline-none"
                                            placeholder="85"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1">Unit</label>
                                        <input
                                            type="text"
                                            value={logForm.unit}
                                            onChange={(e) => setLogForm({ ...logForm, unit: e.target.value })}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 outline-none"
                                            placeholder="servings, kg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-500 mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={logForm.date}
                                            onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsLogModalOpen(false)}
                                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={logSubmitting}
                                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md"
                                    >
                                        {logSubmitting ? 'Saving...' : 'Save Log'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Smart Inventory Selection Modal */}
            <AnimatePresence>
                {isInventoryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setIsInventoryModalOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-2xl">
                                    <CircleStackIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Select Item from Smart Inventory
                                    </h3>
                                    <p className="text-xs text-slate-500">Pick any kitchen item to generate instant AI demand prediction</p>
                                </div>
                            </div>

                            {/* Search input inside modal */}
                            <input
                                type="text"
                                placeholder="🔍 Search inventory items (e.g. Milk, Rice, Biryani)..."
                                value={inventorySearchQuery}
                                onChange={(e) => setInventorySearchQuery(e.target.value)}
                                className="w-full p-3 mb-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                            />

                            {/* Items Grid */}
                            {userInventoryItems.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                                    {userInventoryItems
                                        .filter((item) => item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()))
                                        .map((item) => (
                                            <div
                                                key={item._id || item.name}
                                                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                            📦 {item.name}
                                                        </h4>
                                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                                            {item.category || 'Kitchen Stock'}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Stock Available: <strong className="text-emerald-600 font-bold">{item.quantity} {item.unit || 'servings'}</strong>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedItem(item.name);
                                                        setCustomItem('');
                                                        setIsInventoryModalOpen(false);
                                                        fetchPrediction(item.name, periodDays, historyRangeDays);
                                                        fetchHistoryLogs(item.name);
                                                    }}
                                                    className="mt-3 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md transition-all"
                                                >
                                                    <SparklesIcon className="w-3.5 h-3.5" />
                                                    Select & Predict Demand
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-xs">
                                    <p className="font-bold">No inventory items found.</p>
                                    <p className="mt-1 text-[11px]">Go to Inventory page to add food items to your stock.</p>
                                    <Link
                                        href="/inventory"
                                        onClick={() => setIsInventoryModalOpen(false)}
                                        className="mt-3 inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                                    >
                                        + Go to Inventory Page
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </>
    );
}
