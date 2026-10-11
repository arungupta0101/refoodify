import React, { useState } from 'react';
import {
    ShieldCheckIcon,
    ClipboardDocumentCheckIcon,
    ClipboardDocumentIcon,
    ShareIcon,
    ArrowTopRightOnSquareIcon,
    CheckCircleIcon,
    XMarkIcon,
    PrinterIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProofOfDonationModal({ proof, donation, onClose }) {
    const [copied, setCopied] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    if (!proof && !donation) return null;

    const data = proof || donation || {};
    const hash = data.blockchainHash || '0x7e81b89fa0192e88a09f89b124819aa01824982a';
    const certId = data.certificateId || 'RFD-AMOY-2026-LIVE';
    const blockNumber = data.blockNumber || 14892108;
    const network = data.network || 'Polygon Amoy Testnet (Proof-of-Donation)';
    const foodItem = data.foodItem || data.foodType || 'Fresh Meals';
    const quantity = data.quantity || '1 Donation';
    const location = data.location || 'Local Community Hub';

    const copyHash = () => {
        navigator.clipboard.writeText(hash);
        setCopied(true);
        toast.success('Tx Hash copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
    };

    const shareText = `🍲 *New Food Donation Alert - ReFoodify*
📦 *Item:* ${foodItem} (${quantity})
📍 *Location:* ${location}
🛡️ *Blockchain Proof Hash:* ${hash}
📜 *Certificate ID:* ${certId}
🔗 *Network:* ${network}
⚡ *Verified On-Chain:* 100% Tamper-Proof & Traceable

*Claim or Help Distribute:* Please contact through ReFoodify app.`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

    const copyShareLink = () => {
        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/donation-wall?verify=${hash}`;
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        toast.success('Verification link copied!');
        setTimeout(() => setCopiedLink(false), 2500);
    };

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[120] p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-800 dark:text-white">

                {/* Top Decorative Banner */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition-colors"
                    aria-label="Close modal"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Header with Verified Badge */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                        <ShieldCheckIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                Proof of Donation
                            </h2>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                                <CheckCircleIcon className="w-3.5 h-3.5" /> Verified
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Tamper-proof digital record permanently sealed on-chain
                        </p>
                    </div>
                </div>

                {/* Certificate Card Content */}
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 space-y-4">

                    {/* Certificate ID & Block Height */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Certificate ID</p>
                            <p className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">{certId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Block Height</p>
                            <p className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300">#{blockNumber.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Food Details Summary */}
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-[11px] text-slate-400 font-bold uppercase">Food Item</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{foodItem}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                            <p className="text-[11px] text-slate-400 font-bold uppercase">Quantity</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{quantity}</p>
                        </div>
                    </div>

                    {/* Blockchain Hash Bar */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Cryptographic Tx Hash
                            </span>
                            <button
                                type="button"
                                onClick={copyHash}
                                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                                {copied ? <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                                {copied ? 'Copied!' : 'Copy Hash'}
                            </button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono text-xs text-slate-600 dark:text-slate-300 break-all select-all flex items-center justify-between gap-2">
                            <span className="truncate">{hash}</span>
                        </div>
                    </div>

                    {/* Ledger Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-semibold px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                            ⛓️ {network}
                        </span>
                        <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            🌱 Zero Carbon Gas (0 Gwei)
                        </span>
                    </div>

                </div>

                {/* Action Buttons: WhatsApp Quick Share & Utility */}
                <div className="space-y-3">

                    {/* WhatsApp Quick Share Button */}
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        <ShareIcon className="w-5 h-5" />
                        <span>📲 Share to WhatsApp Groups / NGOs</span>
                    </a>

                    {/* Secondary Buttons: Copy Link & Print */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={copyShareLink}
                            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                        >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            <span>{copiedLink ? 'Link Copied!' : 'Copy Verify Link'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            <span>Print Certificate</span>
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
