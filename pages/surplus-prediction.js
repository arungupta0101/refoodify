import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import {
    SparklesIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ChartBarIcon,
    BuildingStorefrontIcon,
    ArrowRightIcon,
    CircleStackIcon,
    LightBulbIcon,
    MegaphoneIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';

const PRESET_FOOD_ITEMS = [
    'Veggie Biryani',
    'Garden Salad',
    'Paneer Butter Masala',
    'Whole Wheat Bread Roll',
    'Tomato Soup',
    'Mixed Fruit Custard',
    'Dal Makhani & Rice',
    'Steam Rice'
];

export default function SurplusPredictionPage() {
    const router = useRouter();
    const { user } = useAuth() || {};
    const currentUserId = user?.uid || user?.id || user?._id || 'guest_user';

    const [selectedItem, setSelectedItem] = useState('Veggie Biryani');
    const [customItem, setCustomItem] = useState('');
    const [isCustomMode, setIsCustomMode] = useState(false);

    const [productionQuantity, setProductionQuantity] = useState(120);
    const [inventoryStock, setInventoryStock] = useState(0);
    const [inventoryUnit, setInventoryUnit] = useState('servings');
    const [periodDays, setPeriodDays] = useState(1);

    const [userInventoryItems, setUserInventoryItems] = useState([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [predictionData, setPredictionData] = useState(null);
    const [chartHistory, setChartHistory] = useState([]);

    const activeItemName = isCustomMode ? (customItem.trim() || 'Custom Meal') : selectedItem;

    // Fetch live inventory items
    const fetchInventoryItems = async () => {
        setInventoryLoading(true);
        try {
            const queryId = currentUserId !== 'guest_user' ? `${currentUserId},guest_user` : 'guest_user';
            const res = await fetch(`/api/inventory?userId=${queryId}`);
            if (res.ok) {
                const items = await res.json();
                if (Array.isArray(items)) {
                    setUserInventoryItems(items);

                    // Sync matching stock quantity
                    const activeLower = activeItemName.toLowerCase();
                    const matches = items.filter(i =>
                        i.name.toLowerCase().includes(activeLower) ||
                        activeLower.includes(i.name.toLowerCase())
                    );

                    if (matches.length > 0) {
                        const totalStock = matches.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0), 0);
                        setInventoryStock(totalStock);
                        setInventoryUnit(matches[0].unit || 'servings');
                    }
                }
            }
        } catch (err) {
            console.warn('Inventory fetch error:', err);
        } finally {
            setInventoryLoading(false);
        }
    };

    useEffect(() => {
        fetchInventoryItems();
    }, [activeItemName]);

    // Request prediction from backend API
    const fetchSurplusPrediction = async (item = activeItemName, prodQty = productionQuantity, days = periodDays, stock = inventoryStock) => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await fetch('/api/surplus-prediction/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemName: item,
                    productionQuantity: Number(prodQty),
                    currentInventory: Number(stock),
                    periodDays: Number(days),
                    userId: currentUserId,
                    unit: inventoryUnit
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setPredictionData(data);
                fetchChartHistory(item);
            } else {
                setErrorMsg(data.message || 'Could not calculate prediction.');
            }
        } catch (err) {
            console.error('Surplus prediction error:', err);
            setErrorMsg('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch 7-day chart history
    const fetchChartHistory = async (item = activeItemName) => {
        try {
            const res = await fetch(`/api/surplus-prediction/historical?userId=${currentUserId}&itemName=${encodeURIComponent(item)}&days=7`);
            if (res.ok) {
                const data = await res.json();
                if (data.history && Array.isArray(data.history)) {
                    setChartHistory(data.history);
                }
            }
        } catch (e) {
            console.warn('Historical chart fetch error:', e);
        }
    };

    useEffect(() => {
        fetchSurplusPrediction(activeItemName, productionQuantity, periodDays, inventoryStock);
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        fetchSurplusPrediction(activeItemName, productionQuantity, periodDays, inventoryStock);
    };

    // Navigate to donate page
    const handleListSurplusFood = () => {
        if (!predictionData) return;
        const queryParams = new URLSearchParams({
            foodType: activeItemName,
            quantity: `${predictionData.predictedSurplus} ${predictionData.unit}`,
            notes: `Predicted food surplus of ${predictionData.predictedSurplus} ${predictionData.unit} generated via ReFoodify AI Surplus Engine.`,
            source: 'ai_surplus_prediction'
        });
        router.push(`/donate?${queryParams.toString()}`);
    };

    return (
        <>
            <Head>
                <title>AI Surplus Prediction | ReFoodify</title>
                <meta name="description" content="Predict food surplus before cooking using Gemini AI." />
            </Head>

            <Header />

            <main className="min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* HERO & TITLE BANNER */}
                    <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/30">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                                    <SparklesIcon className="w-4 h-4 animate-pulse" />
                                    Smart Kitchen AI
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                                    AI Surplus Prediction
                                </h1>
                                <p className="mt-1 text-xs sm:text-sm text-emerald-100/90 max-w-xl">
                                    Predict excess food before cooking. Prevent food waste & easily donate surplus food to local volunteers.
                                </p>
                            </div>

                            {/* 3 QUICK STEPS BADGES */}
                            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 text-xs">
                                <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold">1. Select Item</span>
                                <span className="text-slate-300 font-bold">→</span>
                                <span className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-bold">2. Set Qty</span>
                                <span className="text-slate-300 font-bold">→</span>
                                <span className="px-3 py-1.5 rounded-xl bg-emerald-400/30 text-emerald-200 font-bold">3. Get AI Forecast</span>
                            </div>
                        </div>
                    </div>

                    {/* DASHBOARD LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT: SIMPLE INPUT FORM */}
                        <div className="lg:col-span-4">
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">

                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-emerald-500" />
                                        Input Prediction Data
                                    </h2>
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                                        Step 1 of 3
                                    </span>
                                </div>

                                <form onSubmit={handleFormSubmit} className="space-y-5">

                                    {/* ITEM SELECTOR */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                            🍲 Select Food Item
                                        </label>

                                        {!isCustomMode ? (
                                            <select
                                                value={selectedItem}
                                                onChange={(e) => {
                                                    if (e.target.value === 'CUSTOM_ITEM_TOGGLE') {
                                                        setIsCustomMode(true);
                                                    } else {
                                                        setSelectedItem(e.target.value);
                                                    }
                                                }}
                                                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                            >
                                                {userInventoryItems.length > 0 && (
                                                    <optgroup label="📦 Live Kitchen Inventory">
                                                        {userInventoryItems.map((inv) => (
                                                            <option key={inv._id || inv.name} value={inv.name}>
                                                                {inv.name} ({inv.quantity} {inv.unit || 'servings'})
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}

                                                <optgroup label="Popular Menu Items">
                                                    {PRESET_FOOD_ITEMS.map((item) => (
                                                        <option key={item} value={item}>{item}</option>
                                                    ))}
                                                </optgroup>

                                                <option value="CUSTOM_ITEM_TOGGLE" className="font-bold text-emerald-600">
                                                    ✏️ + Type custom food name...
                                                </option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Type food name (e.g. Fried Rice)..."
                                                    value={customItem}
                                                    onChange={(e) => setCustomItem(e.target.value)}
                                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCustomMode(false)}
                                                    className="px-3 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* QUANTITY CARDS: PLANNED PRODUCTION & KITCHEN STOCK */}
                                    <div className="grid grid-cols-2 gap-3">

                                        {/* Planned Production */}
                                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                                            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                                                Planned Cook Qty
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5000"
                                                value={productionQuantity}
                                                onChange={(e) => setProductionQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                                                className="w-full p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 font-extrabold text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">servings to cook</span>
                                        </div>

                                        {/* Current Stock */}
                                        <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                                                    Kitchen Stock
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={fetchInventoryItems}
                                                    title="Sync stock from inventory"
                                                    className="text-[10px] text-emerald-600 font-bold hover:underline"
                                                >
                                                    🔄 Sync
                                                </button>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={inventoryStock}
                                                onChange={(e) => setInventoryStock(Math.max(0, parseFloat(e.target.value) || 0))}
                                                className="w-full p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-emerald-300 dark:border-emerald-700 font-extrabold text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mt-1 block">in stock now</span>
                                        </div>
                                    </div>

                                    {/* FORECAST PERIOD */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                            ⏱️ Forecast Period
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 3, 7].map((days) => (
                                                <button
                                                    key={days}
                                                    type="button"
                                                    onClick={() => setPeriodDays(days)}
                                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${periodDays === days
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                        }`}
                                                >
                                                    {days} {days === 1 ? 'Day' : 'Days'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SUBMIT BUTTON */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
                                    >
                                        {loading ? (
                                            <>
                                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                                Analyzing AI Surplus...
                                            </>
                                        ) : (
                                            <>
                                                <SparklesIcon className="w-5 h-5" />
                                                Predict Food Surplus
                                            </>
                                        )}
                                    </button>

                                </form>
                            </div>
                        </div>

                        {/* RIGHT: EASY-TO-UNDERSTAND AI RESULTS & ACTIONS */}
                        <div className="lg:col-span-8 space-y-6">

                            {errorMsg && (
                                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-rose-500 shrink-0" />
                                    {errorMsg}
                                </div>
                            )}

                            {/* PREDICTION RESULTS HEADER & RISK BADGE */}
                            {predictionData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* RISK ALERT BANNER */}
                                    <div className={`p-5 rounded-3xl border shadow-lg ${predictionData.riskLevel === 'High'
                                            ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-rose-500'
                                            : predictionData.riskLevel === 'Medium'
                                                ? 'bg-amber-500 text-white border-amber-400'
                                                : 'bg-emerald-600 text-white border-emerald-500'
                                        }`}>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                                                    {predictionData.riskLevel === 'High' ? (
                                                        <ExclamationTriangleIcon className="w-7 h-7 text-white" />
                                                    ) : (
                                                        <CheckCircleIcon className="w-7 h-7 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                                                        {predictionData.riskLevel} Surplus Risk
                                                    </span>
                                                    <h3 className="text-lg font-extrabold text-white mt-0.5">
                                                        {predictionData.riskLevel === 'High'
                                                            ? `High Surplus Predicted (${predictionData.predictedSurplus} ${predictionData.unit} Extra)`
                                                            : predictionData.riskLevel === 'Medium'
                                                                ? `Moderate Surplus Expected (${predictionData.predictedSurplus} ${predictionData.unit})`
                                                                : `Optimal Cooking Quantity (Low Waste Risk)`}
                                                    </h3>
                                                </div>
                                            </div>

                                            {predictionData.riskLevel === 'High' && (
                                                <button
                                                    onClick={handleListSurplusFood}
                                                    className="px-4 py-2.5 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow-md flex items-center gap-1.5 hover:bg-slate-100 transition-all shrink-0"
                                                >
                                                    🚀 List Food Donation
                                                    <ArrowRightIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3 SIMPLE KEY METRIC CARDS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                        {/* Total Available Food */}
                                        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Available</span>
                                            <div className="mt-1 flex items-baseline gap-1">
                                                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                                    {predictionData.totalAvailableFood}
                                                </span>
                                                <span className="text-xs text-slate-500 font-semibold">{predictionData.unit}</span>
                                            </div>
                                            <span className="text-[11px] text-slate-400 mt-1 block">
                                                Cook ({predictionData.productionQuantity}) + Stock ({predictionData.currentInventory})
                                            </span>
                                        </div>

                                        {/* Expected Demand */}
                                        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Expected Consumption</span>
                                            <div className="mt-1 flex items-baseline gap-1">
                                                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                                    {predictionData.expectedConsumption}
                                                </span>
                                                <span className="text-xs text-slate-500 font-semibold">{predictionData.unit}</span>
                                            </div>
                                            <span className="text-[11px] text-slate-400 mt-1 block">
                                                Based on historical demand
                                            </span>
                                        </div>

                                        {/* Predicted Surplus */}
                                        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Predicted Surplus</span>
                                            <div className="mt-1 flex items-baseline gap-1">
                                                <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                                                    {predictionData.predictedSurplus}
                                                </span>
                                                <span className="text-xs text-slate-500 font-semibold">{predictionData.unit}</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-rose-500 mt-1 block">
                                                {predictionData.surplusPercentage}% excess food
                                            </span>
                                        </div>

                                    </div>

                                    {/* SIMPLE AI INSIGHT & RECOMMENDATION */}
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                                            <SparklesIcon className="w-5 h-5" />
                                            ReFoodify AI Recommendation:
                                        </div>

                                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-semibold leading-relaxed">
                                            💡 {predictionData.recommendation}
                                        </div>

                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            <strong>Why this matters:</strong> {predictionData.insight}
                                        </p>
                                    </div>

                                    {/* VISUAL CHART */}
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
                                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
                                            7-Day Production vs Surplus Trend
                                        </h3>
                                        <div className="h-60 w-full">
                                            {chartHistory.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartHistory}>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                                        <XAxis dataKey="dayOfWeek" tick={{ fontSize: 11 }} />
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
                                                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                                                        <Bar dataKey="productionQuantity" name="Production" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="consumedQuantity" name="Consumed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="surplusQuantity" name="Surplus Waste" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                                                    Loading chart trends...
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </motion.div>
                            )}

                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </>
    );
}
