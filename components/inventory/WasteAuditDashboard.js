import { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    SparklesIcon,
    GlobeAmericasIcon,
    FireIcon,
    ShieldCheckIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function WasteAuditDashboard({ user }) {
    const [summary, setSummary] = useState(null);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingInsights, setLoadingInsights] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [user]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/get-waste-analytics?userId=${user?.uid || ''}`);
            const data = await res.json();
            if (data.success && data.summary) {
                setSummary(data.summary);
                fetchAiInsights(data.logs);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAiInsights = async (logs) => {
        setLoadingInsights(true);
        try {
            const res = await fetch('/api/waste-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'purchasing_insights',
                    wastedItemsHistory: logs || []
                })
            });
            const data = await res.json();
            if (data.success && data.insights) {
                setInsights(data.insights);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingInsights(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
                <ArrowPathIcon className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400">Loading Food Waste Audit & AI Insights...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
                    <GlobeAmericasIcon className="w-16 h-16 absolute -right-3 -bottom-3 text-white/10" />
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Methane Saved</p>
                    <h3 className="text-2xl font-black mt-1">{summary?.totalMethaneSavedKg || 0.8} kg</h3>
                    <p className="text-[11px] text-emerald-100/90 mt-1 font-medium">Prevented landfill CH₄ gas</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
                    <FireIcon className="w-16 h-16 absolute -right-3 -bottom-3 text-white/10" />
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-100">CO₂ Emissions Offset</p>
                    <h3 className="text-2xl font-black mt-1">{summary?.totalCo2SavedKg || 1.8} kg</h3>
                    <p className="text-[11px] text-amber-100/90 mt-1 font-medium">Equivalent to 8.5 km car drive</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
                    <ChartBarIcon className="w-16 h-16 absolute -right-3 -bottom-3 text-white/10" />
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Items Composted</p>
                    <h3 className="text-2xl font-black mt-1">{summary?.compostedCount || 1} items</h3>
                    <p className="text-[11px] text-blue-100/90 mt-1 font-medium">Converted into rich organic Khaad</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
                    <ShieldCheckIcon className="w-16 h-16 absolute -right-3 -bottom-3 text-white/10" />
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-100">Animal Meals Saved</p>
                    <h3 className="text-2xl font-black mt-1">{summary?.rescuedCount || 1} rescued</h3>
                    <p className="text-[11px] text-purple-100/90 mt-1 font-medium">Shared with stray feeders & gaushalas</p>
                </div>
            </div>

            {/* AI Purchasing Insights Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white text-base">Refoodify AI Smart Purchasing Insights</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-400">AI recommendations to optimize your grocery buying & stop waste before it starts</p>
                        </div>
                    </div>
                </div>

                {loadingInsights ? (
                    <div className="py-6 text-center text-xs text-gray-400 font-bold flex items-center justify-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-purple-500 animate-spin" />
                        Analyzing household waste patterns with Refoodify AI...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {insights.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-2 flex flex-col justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full">
                                        {item.foodItem}
                                    </span>
                                    <p className="text-xs text-gray-700 dark:text-slate-300 font-medium leading-relaxed mt-1">
                                        {item.recommendation}
                                    </p>
                                </div>
                                <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <span>💰 {item.savingPotential}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Green Badges & Impact Achievements */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-slate-800 space-y-4">
                <h3 className="font-black text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <span>🏆</span> Green Warrior Badges & Eco Achievements
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { title: '🌱 Khaad Beginner', desc: 'Composted first organic item!', unlocked: (summary?.compostedCount || 0) >= 1 },
                        { title: '🌿 Compost Master', desc: '5+ items turned into rich fertilizer', unlocked: (summary?.compostedCount || 0) >= 5 },
                        { title: '⚡ Zero Methane Hero', desc: 'Prevented 2kg+ Methane emissions', unlocked: (summary?.totalMethaneSavedKg || 0) >= 2 },
                        { title: '🐾 Animal Rescue Guardian', desc: 'Saved 3+ surplus meals for stray animals', unlocked: (summary?.rescuedCount || 0) >= 3 }
                    ].map((badge, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-2xl border text-center transition-all ${badge.unlocked
                                ? 'bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-300 dark:border-emerald-700 shadow-sm'
                                : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-60 grayscale'
                                }`}
                        >
                            <div className="text-2xl mb-1">{badge.title.split(' ')[0]}</div>
                            <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">{badge.title.substring(2)}</h4>
                            <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 leading-tight">{badge.desc}</p>
                            <span className={`inline-block mt-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${badge.unlocked ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
                                }`}>
                                {badge.unlocked ? 'Unlocked ✓' : 'Locked 🔒'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
