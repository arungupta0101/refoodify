import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SparklesIcon,
    ChartBarIcon,
    LightBulbIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UserGroupIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    ClockIcon,
    ArrowRightIcon,
    PlusIcon,
    AdjustmentsHorizontalIcon,
    ShareIcon,
    DocumentTextIcon,
    ShoppingBagIcon,
    TagIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

import { useAuth } from '../contexts/AuthContext';

const FOOD_ITEMS = [
    'Veggie Biryani',
    'Garden Salad',
    'Paneer Butter Masala',
    'Whole Wheat Bread Roll',
    'Tomato Soup',
    'Dal Tadka & Rice'
];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Special Feast'];
const SPECIAL_EVENTS = ['No', 'Weekend Peak', 'Festival', 'Wedding / Function', 'Corporate Event'];
const LOCATIONS = ['Gorakhpur', 'Lucknow', 'Allahabad', 'Varanasi', 'Delhi NCR'];

export default function DemandPredictionPage() {
    const { user } = useAuth() || {};
    const currentUserId = user?.uid || user?.id || user?._id || 'guest_user';

    // Form inputs matching the exact mockup
    const [foodItem, setFoodItem] = useState('Veggie Biryani');
    const [mealType, setMealType] = useState('Lunch');
    const [predictionDate, setPredictionDate] = useState('2026-09-25');
    const [expectedPeople, setExpectedPeople] = useState(200);
    const [plannedQuantity, setPlannedQuantity] = useState(70);
    const [currentInventory, setCurrentInventory] = useState(10);
    const [specialEvent, setSpecialEvent] = useState('No');
    const [location, setLocation] = useState('Gorakhpur');

    const [loading, setLoading] = useState(false);
    const [apiResult, setApiResult] = useState(null);

    // Calculate real-time interactive estimates
    const computedMetrics = useMemo(() => {
        // Multiplier based on food item and event
        let perPersonKg = 0.31; // Veggie biryani default
        if (foodItem === 'Garden Salad') perPersonKg = 0.18;
        if (foodItem === 'Paneer Butter Masala') perPersonKg = 0.35;
        if (foodItem === 'Tomato Soup') perPersonKg = 0.25;

        if (specialEvent !== 'No') perPersonKg *= 1.15;

        const predicted = Math.round(expectedPeople * perPersonKg);
        const planned = Number(plannedQuantity) || 0;
        const surplus = Math.max(0, planned - predicted);
        const shortage = Math.max(0, predicted - planned);

        const consumedPct = planned > 0 ? Math.min(100, Math.round((predicted / planned) * 100)) : 100;
        const surplusPct = 100 - consumedPct;

        return {
            predictedDemand: apiResult?.predictedDemand ?? predicted,
            plannedQuantity: planned,
            expectedSurplus: apiResult?.expectedSurplus ?? surplus,
            expectedShortage: shortage,
            consumedPct,
            surplusPct: Math.max(0, surplusPct),
            status: shortage > 0 ? 'Shortage Risk' : (surplus > 5 ? 'Surplus Expected' : 'Balanced')
        };
    }, [foodItem, specialEvent, expectedPeople, plannedQuantity, apiResult]);

    // Handle AI Prediction API request
    const handleGeneratePrediction = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/demand-prediction/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUserId,
                    itemName: foodItem,
                    periodDays: 1,
                    historyRangeDays: 30
                })
            });

            if (res.ok) {
                const data = await res.json();
                setApiResult(data);
            }
        } catch (err) {
            console.warn('Prediction API note:', err);
        } finally {
            setLoading(false);
        }
    };

    // Chart Data Generation
    const barChartData = [
        { name: 'Predicted Demand', quantity: computedMetrics.predictedDemand, fill: '#3b82f6' },
        { name: 'Planned Quantity', quantity: computedMetrics.plannedQuantity, fill: '#10b981' },
        { name: 'Expected Surplus', quantity: computedMetrics.expectedSurplus, fill: '#f97316' }
    ];

    const pieChartData = [
        { name: `Predicted Consumption (${computedMetrics.predictedDemand} kg)`, value: Math.min(computedMetrics.plannedQuantity, computedMetrics.predictedDemand), color: '#10b981' },
        { name: `Expected Surplus (${computedMetrics.expectedSurplus} kg)`, value: computedMetrics.expectedSurplus, color: '#f97316' }
    ];

    const historicalLineData = [
        { date: '20 Sep', pastConsumption: 33, predictedDemand: 48 },
        { date: '21 Sep', pastConsumption: 41, predictedDemand: 56 },
        { date: '22 Sep', pastConsumption: 49, predictedDemand: 65 },
        { date: '23 Sep', pastConsumption: 54, predictedDemand: 66 },
        { date: '24 Sep', pastConsumption: 54, predictedDemand: 65 },
        { date: '25 Sep', pastConsumption: 55, predictedDemand: computedMetrics.predictedDemand }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
            <Head>
                <title>AI Food Demand Predictor - ReFoodify</title>
                <meta name="description" content="Predict food demand, prevent surplus waste, and optimize kitchen planning with AI." />
            </Head>

            <Header />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                {/* HERO HEADER SECTION */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide">
                            <SparklesIcon className="w-3.5 h-3.5 text-emerald-500" />
                            Smart Kitchen Assistant
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <span>🤖</span> AI Food Demand Predictor
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Plan smarter. Cook better. Waste less.
                        </p>
                    </div>

                    {/* TOP RIGHT BANNER CARD */}
                    <div className="w-full lg:w-auto min-w-[280px] bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 dark:from-purple-950/40 dark:to-blue-950/40 p-4 rounded-2xl border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                <LightBulbIcon className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Turn data into impact</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Predict demand, prevent waste, feed more people.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN 3-COLUMN DASHBOARD GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* COLUMN 1: ENTER DETAILS FORM (4 COLS) */}
                    <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <DocumentTextIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Enter Details</h2>
                                    <p className="text-[11px] text-slate-400">Provide a few details and let our AI predict expected demand.</p>
                                </div>
                            </div>

                            <form onSubmit={handleGeneratePrediction} className="space-y-3.5">
                                {/* Food Item & Meal Type Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Food Item <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={foodItem}
                                            onChange={(e) => setFoodItem(e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            {FOOD_ITEMS.map((item) => (
                                                <option key={item} value={item}>🍲 {item}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Meal Type <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={mealType}
                                            onChange={(e) => setMealType(e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            {MEAL_TYPES.map((type) => (
                                                <option key={type} value={type}>🍽️ {type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Prediction Date & Expected People Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Prediction Date <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={predictionDate}
                                            onChange={(e) => setPredictionDate(e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Expected People <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                value={expectedPeople}
                                                onChange={(e) => setExpectedPeople(Math.max(1, parseInt(e.target.value) || 0))}
                                                className="w-full p-2.5 pr-14 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">people</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Planned Quantity & Current Inventory Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Planned Quantity <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={plannedQuantity}
                                                onChange={(e) => setPlannedQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
                                                className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">kg</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Current Inventory (if any)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={currentInventory}
                                                onChange={(e) => setCurrentInventory(Math.max(0, parseFloat(e.target.value) || 0))}
                                                className="w-full p-2.5 pr-10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">kg</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Special Event & Location Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Special Event / Occasion
                                        </label>
                                        <select
                                            value={specialEvent}
                                            onChange={(e) => setSpecialEvent(e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            {SPECIAL_EVENTS.map((evt) => (
                                                <option key={evt} value={evt}>🎉 {evt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            Location
                                        </label>
                                        <select
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            {LOCATIONS.map((loc) => (
                                                <option key={loc} value={loc}>📍 {loc}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                            Analyzing Demand with Gemini AI...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-4 h-4 text-emerald-200" />
                                            Generate AI Prediction
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* INFO NOTE */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5 leading-tight">
                            <InformationCircleIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <span>Our AI uses historical data, day patterns, food types and events to give you smart predictions.</span>
                        </div>
                    </div>

                    {/* COLUMN 2: PREDICTION RESULTS & CHARTS (5 COLS) */}
                    <div className="lg:col-span-5 space-y-5">

                        {/* STATS HEADER CARD */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ChartBarIcon className="w-4 h-4 text-emerald-500" />
                                        Prediction Results
                                    </h2>
                                    <p className="text-[11px] text-slate-400">Here's what our AI predicts based on the provided information.</p>
                                </div>

                                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${computedMetrics.status === 'Balanced'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : (computedMetrics.status === 'Surplus Expected' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300')
                                    }`}>
                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                    {computedMetrics.status === 'Balanced' ? 'Balanced (Looks Good!)' : computedMetrics.status}
                                </span>
                            </div>

                            {/* 4 STAT METRICS CARDS GRID */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {/* Card 1: Predicted Demand */}
                                <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-3 text-center space-y-0.5">
                                    <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wide block">Predicted Demand</span>
                                    <div className="text-xl font-extrabold text-blue-700 dark:text-blue-300">{computedMetrics.predictedDemand} kg</div>
                                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-tight">For {expectedPeople} people</span>
                                </div>

                                {/* Card 2: Planned Quantity */}
                                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-3 text-center space-y-0.5">
                                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block">Planned Quantity</span>
                                    <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{computedMetrics.plannedQuantity} kg</div>
                                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-tight">You are preparing</span>
                                </div>

                                {/* Card 3: Expected Surplus */}
                                <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-3 text-center space-y-0.5">
                                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wide block">Expected Surplus</span>
                                    <div className="text-xl font-extrabold text-amber-700 dark:text-amber-300">{computedMetrics.expectedSurplus} kg</div>
                                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-tight">Available for donation</span>
                                </div>

                                {/* Card 4: Expected Shortage */}
                                <div className="bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-3 text-center space-y-0.5">
                                    <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wide block">Expected Shortage</span>
                                    <div className="text-xl font-extrabold text-purple-700 dark:text-purple-300">{computedMetrics.expectedShortage} kg</div>
                                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-tight">No shortage expected</span>
                                </div>
                            </div>
                        </div>

                        {/* CHARTS ROW (DEMAND VS PLANNED BAR CHART + DONUT CHART) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* Bar Chart */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <ChartBarIcon className="w-3.5 h-3.5 text-blue-500" />
                                    Demand vs Planned Quantity
                                </h3>

                                <div className="h-44 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                            <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
                                            <YAxis tick={{ fontSize: 9 }} />
                                            <Tooltip formatter={(val) => [`${val} kg`, 'Quantity']} />
                                            <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
                                                {barChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Donut Chart */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <SparklesIcon className="w-3.5 h-3.5 text-emerald-500" />
                                    Quantity Distribution
                                </h3>

                                <div className="h-44 w-full relative flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={42}
                                                outerRadius={62}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val) => [`${val} kg`]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{computedMetrics.consumedPct}%</span>
                                        <span className="text-[9px] font-bold text-slate-400">To consume</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-[10px] font-semibold text-slate-500">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Predicted Consumption ({computedMetrics.predictedDemand} kg)</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Expected Surplus ({computedMetrics.expectedSurplus} kg)</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* COLUMN 3: AI RECOMMENDATION & QUICK LINKS (3 COLS) */}
                    <div className="lg:col-span-3 space-y-5">

                        {/* AI RECOMMENDATION CARD */}
                        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 rounded-3xl p-5 border border-emerald-200/80 dark:border-emerald-900/60 shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🍃</span>
                                <h3 className="text-xs font-extrabold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                                    AI Recommendation
                                </h3>
                            </div>

                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                You are likely to have <b>{computedMetrics.expectedSurplus} kg</b> of surplus food. We recommend listing the surplus on ReFoodify so that nearby NGOs can benefit from it.
                            </p>

                            <Link href="/find-food" className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95">
                                <UserGroupIcon className="w-4 h-4" />
                                Find Nearby NGOs ➔
                            </Link>

                            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/50 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <Link href="/donate" className="flex items-center gap-2 p-2 rounded-xl hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors">
                                    <span>🚀</span> Create Donation Listing
                                </Link>
                                <Link href="/route-optimization" className="flex items-center gap-2 p-2 rounded-xl hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors">
                                    <span>📅</span> Set Pickup Time & Route
                                </Link>
                                <button type="button" onClick={() => alert('Link copied to clipboard!')} className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors text-left">
                                    <span>🔗</span> Share with Team
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* BOTTOM ROW: HISTORICAL TREND, SIMILAR DAYS & QUICK ACTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* HISTORICAL TREND LINE CHART (6 COLS) */}
                    <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <ChartBarIcon className="w-4 h-4 text-emerald-500" />
                                Historical Trend ({foodItem} - {mealType})
                            </h3>
                            <div className="flex items-center gap-3 text-[10px] font-bold">
                                <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Past Consumption</span>
                                <span className="flex items-center gap-1 text-purple-600"><span className="w-2 h-2 rounded-full bg-purple-500"></span> AI Predicted Demand</span>
                            </div>
                        </div>

                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historicalLineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                                    <YAxis tick={{ fontSize: 9 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="pastConsumption" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="predictedDemand" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* SIMILAR DAYS INSIGHT (3 COLS) */}
                    <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                                Similar Days Insight
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Food demand on <b>Thursdays ({mealType})</b> is usually <b>8-12% higher</b> than the weekly average.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                                <span className="text-xs font-extrabold text-emerald-600 block">+10%</span>
                                <span className="text-[9px] text-slate-400 font-semibold block">Higher demand</span>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                                <span className="text-[11px] font-extrabold text-blue-600 block">Similar to</span>
                                <span className="text-[9px] text-slate-400 font-semibold block">Last 3 Thursdays</span>
                            </div>
                        </div>
                    </div>

                    {/* QUICK ACTIONS GRID (3 COLS) */}
                    <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <SparklesIcon className="w-4 h-4 text-amber-500" />
                            Quick Actions
                        </h3>

                        <div className="grid grid-cols-2 gap-2">
                            <Link href="/inventory" className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 border border-emerald-100 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 transition-all">
                                <span>📄</span> View Inventory
                            </Link>

                            <button type="button" onClick={() => setPlannedQuantity(computedMetrics.predictedDemand)} className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100/80 border border-blue-100 dark:border-blue-900/40 text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 transition-all text-left">
                                <span>🛒</span> Adjust Quantity
                            </button>

                            <Link href="/donate" className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100/80 border border-purple-100 dark:border-purple-900/40 text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5 transition-all">
                                <span>💜</span> List Surplus
                            </Link>

                            <Link href="/route-optimization" className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100/80 border border-rose-100 dark:border-rose-900/40 text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 transition-all">
                                <span>⏰</span> Schedule
                            </Link>
                        </div>
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
}
