import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    MapPinIcon,
    SparklesIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    TruckIcon,
    ClockIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    FunnelIcon,
    BuildingOfficeIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

// Dynamically import Leaflet RouteMap component with loading fallback to prevent SSR window reference errors
const RouteMap = dynamic(() => import('../components/RouteMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[420px] rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold">Loading Interactive Route Map...</span>
        </div>
    )
});

export default function RouteOptimizationPage() {
    const { user } = useAuth() || {};

    // Start location state
    const [startLocation, setStartLocation] = useState({
        address: 'Gorakhpur Volunteer Station, Golghar',
        lat: 26.7606,
        lng: 83.3697
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchingAddress, setSearchingAddress] = useState(false);

    // Pickup locations state
    const [availableLocations, setAvailableLocations] = useState([]);
    const [selectedLocationIds, setSelectedLocationIds] = useState([]);
    const [fetchingLocations, setFetchingLocations] = useState(false);

    // Restore saved start location from localStorage on mount
    useEffect(() => {
        try {
            const savedLoc = localStorage.getItem('refoodify_start_location');
            if (savedLoc) {
                const parsed = JSON.parse(savedLoc);
                if (parsed && parsed.lat && parsed.lng) {
                    setStartLocation(parsed);
                }
            }
        } catch (e) {
            console.warn('LocalStorage load error:', e);
        }
    }, []);

    // Save location to state and localStorage
    const updateAndSaveStartLocation = (newLoc) => {
        setStartLocation(newLoc);
        try {
            localStorage.setItem('refoodify_start_location', JSON.stringify(newLoc));
        } catch (e) {
            console.warn('LocalStorage save error:', e);
        }
    };

    // Handle map click or pin drag coordinates
    const handleMapClickOrDrag = async (lat, lng) => {
        const roundedLat = parseFloat(lat.toFixed(5));
        const roundedLng = parseFloat(lng.toFixed(5));
        let address = `Pin Location (${roundedLat}, ${roundedLng})`;

        toast.loading('Updating starting pin...', { id: 'pin' });
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}`);
            if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData.display_name) {
                    const parts = geoData.display_name.split(',');
                    address = parts.slice(0, 3).join(',').trim();
                }
            }
        } catch (e) {
            console.warn('Reverse geocode error:', e);
        }

        const newLoc = { address, lat: roundedLat, lng: roundedLng };
        updateAndSaveStartLocation(newLoc);
        toast.success(`Starting pin moved: ${address}`, { id: 'pin' });
    };

    // Handle searching for any custom address / city / landmark
    const handleSearchAddress = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery || !searchQuery.trim()) {
            toast.error('Please enter an address or landmark to search!');
            return;
        }

        setSearchingAddress(true);
        toast.loading(`Searching "${searchQuery}"...`, { id: 'search_loc' });
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    const place = data[0];
                    const lat = parseFloat(parseFloat(place.lat).toFixed(5));
                    const lng = parseFloat(parseFloat(place.lon).toFixed(5));
                    const parts = place.display_name.split(',');
                    const address = parts.slice(0, 3).join(',').trim();

                    const newLoc = { address, lat, lng };
                    updateAndSaveStartLocation(newLoc);
                    toast.success(`Found: ${address}`, { id: 'search_loc' });
                    setSearchQuery('');
                } else {
                    toast.error('No location found. Try adding city name (e.g. "Civil Lines, Allahabad")', { id: 'search_loc' });
                }
            }
        } catch (err) {
            console.error('Geocode search error:', err);
            toast.error('Search failed. Please try again.', { id: 'search_loc' });
        } finally {
            setSearchingAddress(false);
        }
    };

    // Optimization results state
    const [optimizing, setOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch pickup locations on mount
    const loadLocations = async () => {
        setFetchingLocations(true);
        try {
            const res = await fetch('/api/route-optimization/locations');
            if (res.ok) {
                const data = await res.json();
                if (data.locations && Array.isArray(data.locations)) {
                    setAvailableLocations(data.locations);
                    // Select all locations by default
                    setSelectedLocationIds(data.locations.map(l => l.id));
                }
            }
        } catch (err) {
            console.error('Location fetch error:', err);
            toast.error('Failed to load pickup locations.');
        } finally {
            setFetchingLocations(false);
        }
    };

    useEffect(() => {
        loadLocations();
    }, []);

    // Detect high-accuracy browser geolocation for starting point
    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }

        toast.loading('Detecting high-accuracy GPS location...', { id: 'geo' });

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = parseFloat(pos.coords.latitude.toFixed(5));
                const lng = parseFloat(pos.coords.longitude.toFixed(5));

                let address = `GPS Location (${lat}, ${lng})`;
                try {
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    if (geoRes.ok) {
                        const geoData = await geoRes.json();
                        if (geoData.display_name) {
                            const parts = geoData.display_name.split(',');
                            address = parts.slice(0, 3).join(',').trim();
                        }
                    }
                } catch (e) {
                    console.warn('Reverse geocode warning:', e);
                }

                setStartLocation({ address, lat, lng });
                toast.success('High-accuracy GPS location detected!', { id: 'geo' });
            },
            (err) => {
                console.warn('Geo error:', err);
                let msg = 'Could not fetch GPS. Please select a preset hub or enter coordinates manually.';
                if (err.code === 1) msg = 'Location permission denied. Please allow GPS access in browser.';
                else if (err.code === 2) msg = 'GPS position unavailable. Try selecting a city preset below.';
                else if (err.code === 3) msg = 'GPS location request timed out.';
                toast.error(msg, { id: 'geo' });
            },
            options
        );
    };

    // Toggle location selection
    const toggleLocationSelection = (id) => {
        if (selectedLocationIds.includes(id)) {
            setSelectedLocationIds(selectedLocationIds.filter(item => item !== id));
        } else {
            setSelectedLocationIds([...selectedLocationIds, id]);
        }
    };

    const handleSelectAll = () => {
        setSelectedLocationIds(availableLocations.map(l => l.id));
    };

    const handleDeselectAll = () => {
        setSelectedLocationIds([]);
    };

    // Submit for route optimization
    const handleOptimizeRoute = async () => {
        if (selectedLocationIds.length === 0) {
            toast.error('Please select at least 1 food pickup location!');
            return;
        }

        setOptimizing(true);
        setErrorMsg('');
        try {
            const selectedItems = availableLocations.filter(l => selectedLocationIds.includes(l.id));

            const res = await fetch('/api/route-optimization/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startLocation,
                    selectedLocations: selectedItems
                })
            });

            let data = {};
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(text || `Server returned ${res.status}`);
            }

            if (res.ok && data.success) {
                setOptimizationResult(data);
                toast.success(data.isAiGenerated ? 'Route optimized by Gemini AI!' : 'Route optimized successfully!');
            } else {
                const errText = data.message || 'Failed to optimize route.';
                setErrorMsg(errText);
                toast.error(errText);
            }
        } catch (err) {
            console.error('Optimization error:', err);
            const msg = err.message && !err.message.includes('<!DOCTYPE') ? err.message : 'Network/Server connection error. Please try again.';
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setOptimizing(false);
        }
    };

    // Open multi-stop Google Maps navigation
    const handleStartNavigation = () => {
        if (!optimizationResult || !optimizationResult.recommendedSequence) return;

        const seq = optimizationResult.recommendedSequence;
        if (seq.length === 0) return;

        const origin = `${startLocation.lat},${startLocation.lng}`;
        const destination = `${seq[seq.length - 1].lat},${seq[seq.length - 1].lng}`;

        let waypoints = '';
        if (seq.length > 1) {
            waypoints = seq.slice(0, seq.length - 1).map(p => `${p.lat},${p.lng}`).join('|');
        }

        let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
        if (waypoints) {
            googleMapsUrl += `&waypoints=${encodeURIComponent(waypoints)}`;
        }

        window.open(googleMapsUrl, '_blank');
    };

    return (
        <>
            <Head>
                <title>AI Route Optimization | ReFoodify</title>
                <meta name="description" content="AI-assisted route planning for NGO surplus food pickups." />
            </Head>

            <Header />

            <main className="min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* HERO HEADER */}
                    <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/30">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                                    <TruckIcon className="w-4 h-4 animate-pulse" />
                                    Smart Logistics AI
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                                    AI-Based Route Optimization
                                </h1>
                                <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                                    Optimize food rescue collection routes for NGOs & volunteers. Prioritize time-sensitive surplus food, cut travel distances, and save fuel.
                                </p>
                            </div>

                            {/* WORKFLOW BADGES */}
                            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 text-xs">
                                <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold">1. Select Pickups</span>
                                <span className="text-slate-300 font-bold">→</span>
                                <span className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-bold">2. Gemini AI Prioritize</span>
                                <span className="text-slate-300 font-bold">→</span>
                                <span className="px-3 py-1.5 rounded-xl bg-emerald-400/30 text-emerald-200 font-bold">3. Leaflet Navigation</span>
                            </div>
                        </div>
                    </div>

                    {/* MAIN DASHBOARD LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: LOCATION SELECTION & CONTROLS */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* START LOCATION CARD */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <MapPinIcon className="w-5 h-5 text-blue-500" />
                                        Starting Location
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={handleDetectLocation}
                                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                    >
                                        📍 Detect GPS
                                    </button>
                                </div>

                                {/* Address / Landmark Search Form */}
                                <form onSubmit={handleSearchAddress} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search city, area or landmark (e.g. Civil Lines)..."
                                        className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={searchingAddress}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                                    >
                                        🔍 Search
                                    </button>
                                </form>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                                            Current Starting Address
                                        </label>
                                        <input
                                            type="text"
                                            value={startLocation.address}
                                            onChange={(e) => updateAndSaveStartLocation({ ...startLocation, address: e.target.value })}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Enter starting address or station..."
                                        />
                                    </div>

                                    {/* Editable Latitude & Longitude */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Latitude (Lat)</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={startLocation.lat}
                                                onChange={(e) => updateAndSaveStartLocation({ ...startLocation, lat: parseFloat(e.target.value) || 0 })}
                                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Longitude (Lng)</label>
                                            <input
                                                type="number"
                                                step="0.0001"
                                                value={startLocation.lng}
                                                onChange={(e) => updateAndSaveStartLocation({ ...startLocation, lng: parseFloat(e.target.value) || 0 })}
                                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Station Presets */}
                                    <div className="pt-1">
                                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1.5">Quick Presets:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[
                                                { label: 'Gorakhpur Golghar', lat: 26.7606, lng: 83.3697 },
                                                { label: 'Gorakhpur Rly Stn', lat: 26.7635, lng: 83.3762 },
                                                { label: 'Medical College', lat: 26.7820, lng: 83.3850 },
                                                { label: 'Lucknow Center', lat: 26.8467, lng: 80.9462 }
                                            ].map((preset) => (
                                                <button
                                                    key={preset.label}
                                                    type="button"
                                                    onClick={() => updateAndSaveStartLocation({ address: preset.label, lat: preset.lat, lng: preset.lng })}
                                                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60"
                                                >
                                                    📍 {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Map Interactive Tip Banner */}
                                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                        <span className="text-base shrink-0">💡</span>
                                        <p className="leading-snug">
                                            <b>Tip:</b> Click anywhere directly on the map or drag the <b>📍 Blue Pin</b> to place your exact starting location!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* PICKUP LOCATIONS PICKER */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                            <BuildingOfficeIcon className="w-5 h-5 text-emerald-500" />
                                            Select Food Pickups
                                        </h2>
                                        <p className="text-xs text-slate-400 font-medium">
                                            {(selectedLocationIds || []).length} of {(availableLocations || []).length} locations selected
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs">
                                        <button
                                            type="button"
                                            onClick={handleSelectAll}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100"
                                        >
                                            All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeselectAll}
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200"
                                        >
                                            None
                                        </button>
                                    </div>
                                </div>

                                {/* LOCATION CARDS LIST */}
                                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                    {fetchingLocations ? (
                                        <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                                            <ArrowPathIcon className="w-5 h-5 animate-spin text-emerald-500" />
                                            Loading available food listings...
                                        </div>
                                    ) : availableLocations.length === 0 ? (
                                        <div className="py-6 text-center text-xs text-slate-400">
                                            No active food pickup locations found.
                                        </div>
                                    ) : (
                                        availableLocations.map((loc) => {
                                            const isSelected = selectedLocationIds.includes(loc.id);
                                            return (
                                                <div
                                                    key={loc.id}
                                                    onClick={() => toggleLocationSelection(loc.id)}
                                                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${isSelected
                                                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                                                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => { }}
                                                        className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                                    />

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                                                {loc.name}
                                                            </h3>
                                                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${loc.urgency === 'High'
                                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                                                : (loc.urgency === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300')
                                                                }`}>
                                                                {loc.urgency} Urgency
                                                            </span>
                                                        </div>

                                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                                            🍱 {loc.foodType} ({loc.quantity})
                                                        </p>

                                                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                                                            <span className="truncate">📍 {loc.address}</span>
                                                            <span className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">
                                                                {loc.availableTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* OPTIMIZE CTA BUTTON */}
                                <button
                                    type="button"
                                    onClick={handleOptimizeRoute}
                                    disabled={optimizing || selectedLocationIds.length === 0}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {optimizing ? (
                                        <>
                                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                            Optimizing Route with Gemini AI...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-5 h-5 text-amber-300" />
                                            Optimize Pickup Route
                                        </>
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* RIGHT COLUMN: MAP & OPTIMIZATION RESULTS */}
                        <div className="lg:col-span-7 space-y-6">

                            {errorMsg && (
                                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-rose-500 shrink-0" />
                                    {errorMsg}
                                </div>
                            )}

                            {/* LEAFLET MAP */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <MapPinIcon className="w-4 h-4 text-emerald-500" />
                                        Optimized Leaflet Route Map
                                    </h3>
                                    {optimizationResult && (
                                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                                            Polyline Active ({optimizationResult.recommendedSequence?.length || 0} Stops)
                                        </span>
                                    )}
                                </div>

                                <div className="h-[420px] sm:h-[450px] w-full rounded-2xl overflow-hidden relative">
                                    <RouteMap
                                        startLocation={startLocation}
                                        routeSequence={optimizationResult ? optimizationResult.recommendedSequence : (availableLocations || []).filter(l => (selectedLocationIds || []).includes(l.id))}
                                        onStartLocationChange={handleMapClickOrDrag}
                                    />
                                </div>
                            </div>

                            {/* QUICK USAGE GUIDE CARD UNDER MAP */}
                            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-emerald-500" />
                                        Quick Guide: How AI Route Optimization Works
                                    </h3>
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                        User Guide
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
                                        <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                            <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-black text-[10px] flex items-center justify-center">1</span>
                                            Starting Location
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                                            Detect your current live GPS coordinates or enter a starting station address where your pickup route begins.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
                                        <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center">2</span>
                                            Food Pickup List
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                                            Select available items from active donations. Time-sensitive surplus food highlights a <b>High Urgency</b> badge.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
                                        <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">3</span>
                                            Gemini AI Prioritization
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                                            Click <b>"Optimize Pickup Route"</b>. AI evaluates food freshness & geographic distance to calculate the most efficient path.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-1">
                                        <div className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                                            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-black text-[10px] flex items-center justify-center">4</span>
                                            GPS Turn-by-Turn
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                                            Follow the numbered stop sequence (1 → 2 → 3) on the map and click <b>"Start GPS Navigation"</b> to launch Google Maps.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* OPTIMIZATION RESULTS & ROUTE COMPARISON */}
                            {optimizationResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* ROUTE COMPARISON CARDS */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                                        {/* Original Distance */}
                                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Before Optimization</span>
                                            <span className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-0.5 block">
                                                {optimizationResult.unoptimizedDistanceKm} km
                                            </span>
                                            <span className="text-[10px] text-slate-400">manual sequence</span>
                                        </div>

                                        {/* Optimized Distance */}
                                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 dark:border-emerald-800 shadow-sm">
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">AI Optimized Route</span>
                                            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                                {optimizationResult.optimizedDistanceKm} km
                                            </span>
                                            <span className="text-[10px] text-emerald-600 font-bold">shortest path</span>
                                        </div>

                                        {/* Distance Saved */}
                                        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-md">
                                            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider block">Distance Saved</span>
                                            <span className="text-xl font-extrabold mt-0.5 block">
                                                -{optimizationResult.distanceSavedKm} km
                                            </span>
                                            <span className="text-[10px] text-emerald-100 font-bold">fuel & time saved!</span>
                                        </div>

                                        {/* Est. Travel & Pickup Time */}
                                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Total Time</span>
                                            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                                                {optimizationResult.estimatedTravelTimeMins} mins
                                            </span>
                                            <span className="text-[10px] text-slate-400">includes pickup stops</span>
                                        </div>

                                    </div>

                                    {/* GEMINI AI RECOMMENDATION CARD */}
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                                                <SparklesIcon className="w-5 h-5 text-amber-400" />
                                                ReFoodify AI Route Recommendation:
                                            </div>
                                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                                {optimizationResult.isAiGenerated ? '✨ Gemini AI Engine' : '⚙️ Fallback Route Engine'}
                                            </span>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-semibold leading-relaxed">
                                            🎯 {optimizationResult.recommendation}
                                        </div>

                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            <strong>Why this order was chosen:</strong> {optimizationResult.reason}
                                        </p>

                                        {/* START NAVIGATION BUTTON */}
                                        <button
                                            type="button"
                                            onClick={handleStartNavigation}
                                            className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                                        >
                                            <TruckIcon className="w-5 h-5" />
                                            Start GPS Navigation in Google Maps
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* NUMBERED PICKUP SEQUENCE LIST */}
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                            Recommended Pickup Sequence Breakdown
                                        </h3>

                                        <div className="space-y-3">
                                            {optimizationResult.recommendedSequence.map((item, idx) => (
                                                <div
                                                    key={item.id}
                                                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        <div>
                                                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                                                {item.name}
                                                            </h4>
                                                            <p className="text-[11px] text-slate-500">
                                                                🍱 {item.foodType} ({item.quantity})
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${item.urgency === 'High'
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                                            : (item.urgency === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300')
                                                            }`}>
                                                            {item.urgency} Urgency
                                                        </span>
                                                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                                            +{item.distanceFromPrevKm} km from prev
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
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
