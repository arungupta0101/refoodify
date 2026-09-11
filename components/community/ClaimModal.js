import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    CheckCircleIcon,
    MapPinIcon,
    PhoneIcon,
    BuildingOffice2Icon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ClaimModal({ isOpen, onClose, post, currentUser, onClaimSuccess }) {
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [claimedDone, setClaimedDone] = useState(false);

    if (!isOpen || !post) return null;

    const handleClaim = async (e) => {
        e.preventDefault();
        if (!phone) {
            toast.error('Please enter contact phone number');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/posts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: post._id,
                    action: 'claim',
                    userId: currentUser?.uid || 'user-ngo-1',
                    userName: currentUser?.name || currentUser?.displayName || 'Refoodify NGO Partner',
                    userRole: currentUser?.userType || 'NGO',
                    contactPhone: phone
                })
            });

            if (res.ok) {
                setClaimedDone(true);
                toast.success('Food donation claimed successfully! +15 Impact Points');
                setTimeout(() => {
                    setClaimedDone(false);
                    onClaimSuccess && onClaimSuccess(post._id);
                    onClose();
                }, 2000);
            } else {
                toast.error('Failed to claim donation.');
            }
        } catch (err) {
            toast.error('Error claiming donation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                                <SparklesIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connect & Claim Food</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Claim surplus meal for distribution</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {claimedDone ? (
                        <div className="py-10 text-center space-y-4 animate-fadeIn">
                            <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                <CheckCircleIcon className="w-10 h-10" />
                            </div>
                            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">Donation Claimed! 🎉</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                                Thank you for preventing food waste! The donor has been notified with your contact info.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleClaim} className="mt-5 space-y-5">
                            {/* Food Info Summary */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 mb-1">
                                            🍱 {post.postType === 'donation' ? 'Surplus Donation' : 'Meal Share'}
                                        </span>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{post.content || 'Surplus Meal Package'}</h4>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400">{post.author?.name || 'Donor'}</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    <MapPinIcon className="w-4 h-4 text-emerald-500" />
                                    <span>{post.author?.location || 'Pickup Location Available'}</span>
                                </div>
                            </div>

                            {/* Claimant Role Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Claimant Organization / Name
                                    </label>
                                    <div className="relative">
                                        <BuildingOffice2Icon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            disabled
                                            value={currentUser?.name || currentUser?.displayName || 'Registered NGO / Volunteer'}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Pickup Contact Phone <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <PhoneIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+91 98765 43210"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
                                ⚡ <strong>Refoodify Policy:</strong> Claimed food must be picked up within the stated expiry limit.
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Confirming...' : 'Confirm & Claim 🍱'}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
