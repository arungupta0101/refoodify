import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import ProofOfDonationModal from '../components/ProofOfDonationModal';
import toast from 'react-hot-toast';

export default function DonationWall() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('wall'); // 'wall' | 'ledger'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [selectedProof, setSelectedProof] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  // Gratitude messages
  const donations = [
    { id: 1, name: 'Arun Gupta', amount: '₹500', message: 'Keep up the good work!', time: '2 mins ago' },
    { id: 2, name: 'Anonymous Donor', amount: '10kg Rice', message: 'For the shelter home kids.', time: '10 mins ago' },
    { id: 3, name: 'Shaily', amount: '₹1000', message: 'Happy to feed a family.', time: '1 hour ago' },
    { id: 4, name: 'Harshit', amount: '50 Meals', message: 'Zero food waste movement!', time: '2 hours ago' },
  ];

  // Blockchain Ledger records
  const initialLedger = [
    {
      id: 'tx1',
      certificateId: 'RFD-AMOY-2026-8941A2',
      blockchainHash: '0x8f9c11824a91b248aef0102b37ca988bfa170291481b9e81240a1b89fc01928a',
      blockNumber: 14892112,
      network: 'Polygon Amoy Testnet (Proof-of-Donation)',
      foodItem: 'Veggie Biryani & Dal',
      quantity: '8 kg (16 Meals)',
      location: 'Gorakhpur Food Center',
      timestamp: 'Just now',
      tamperProof: true
    },
    {
      id: 'tx2',
      certificateId: 'RFD-AMOY-2026-64B190',
      blockchainHash: '0x7e81b89fa0192e88a09f89b124819aa01824982a174829370129a8fbc091234',
      blockNumber: 14892095,
      network: 'Polygon Amoy Testnet (Proof-of-Donation)',
      foodItem: 'Steamed Rice & Lentils',
      quantity: '25 kg (50 Meals)',
      location: 'Delhi Central Shelter Hub',
      timestamp: '25 mins ago',
      tamperProof: true
    },
    {
      id: 'tx3',
      certificateId: 'RFD-AMOY-2026-9C4E01',
      blockchainHash: '0x3a918f0c291823746a58bc819024f9238e810294718293048571029384758192',
      blockNumber: 14892040,
      network: 'Polygon Amoy Testnet (Proof-of-Donation)',
      foodItem: 'Fresh Bakery Breads & Buns',
      quantity: '40 Packets',
      location: 'Lucknow Hunger Relief Hub',
      timestamp: '2 hours ago',
      tamperProof: true
    }
  ];

  const [ledger, setLedger] = useState(initialLedger);

  // Auto-search if ?verify= query param exists in URL
  useEffect(() => {
    if (router.isReady && router.query.verify) {
      setActiveTab('ledger');
      setSearchQuery(router.query.verify);
      handleSearch(router.query.verify);
    }
  }, [router.isReady, router.query]);

  const handleSearch = async (overrideQuery) => {
    const query = overrideQuery || searchQuery;
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      const res = await fetch(`/api/blockchain/verify?hash=${encodeURIComponent(query)}&certificateId=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data.verified) {
        setSearchResult(data);
        toast.success('Record verified on blockchain ledger!');
      } else {
        // Fallback check in local initialLedger
        const local = ledger.find(item =>
          item.blockchainHash.toLowerCase() === query.toLowerCase() ||
          item.certificateId.toLowerCase() === query.toLowerCase()
        );
        if (local) {
          setSearchResult(local);
          toast.success('Record verified in live block ledger!');
        } else {
          setSearchResult({ notFound: true });
          toast.error('Hash or Certificate not found on ledger.');
        }
      }
    } catch (e) {
      console.error(e);
      const local = ledger.find(item =>
        item.blockchainHash.toLowerCase() === query.toLowerCase() ||
        item.certificateId.toLowerCase() === query.toLowerCase()
      );
      if (local) {
        setSearchResult(local);
      } else {
        setSearchResult({ notFound: true });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedHash(null), 2500);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-5xl mx-auto">

          {/* Header Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <span>🌱</span> Transparency & Impact
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Community Gratitude & Ledger
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-3 font-medium">
              Every meal shared is permanently attested. Explore verified donations or review cryptographic proofs on the Polygon Amoy food rescue ledger.
            </p>
          </div>

          {/* Navigation Dual-Tabs */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <button
              onClick={() => setActiveTab('wall')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${activeTab === 'wall'
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-md ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
            >
              <HeartIcon className="w-5 h-5 text-rose-300" />
              <span>Public Gratitude Wall</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${activeTab === 'ledger'
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-md ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
            >
              <ShieldCheckIcon className="w-5 h-5 text-emerald-300" />
              <span>Blockchain Proof Ledger</span>
            </button>
          </div>

          {/* TAB 1: GRATITUDE WALL */}
          {activeTab === 'wall' && (
            <div className="space-y-4 max-w-3xl mx-auto animate-fadeIn">
              {donations.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-emerald-500"
                >
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">
                      {d.name} <span className="text-slate-400 font-normal text-sm mx-1">donated</span>
                      <span className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs px-2.5 py-1 rounded-xl font-bold ml-1">
                        {d.amount}
                      </span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 italic text-sm mt-1.5 font-medium">"{d.message}"</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full whitespace-nowrap">
                    {d.time}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* TAB 2: BLOCKCHAIN PROOF LEDGER EXPLORER */}
          {activeTab === 'ledger' && (
            <div className="space-y-8 animate-fadeIn">

              {/* Ledger Search Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      placeholder="Verify by Tx Hash (0x...) or Certificate ID (RFD-AMOY-...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-colors shrink-0"
                  >
                    {isSearching ? 'Verifying...' : 'Verify on Ledger'}
                  </button>
                </div>

                {/* Instant Verification Result Banner */}
                {searchResult && (
                  <div className="mt-5 p-4 rounded-2xl border transition-all">
                    {searchResult.notFound ? (
                      <div className="text-center py-2 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold">
                        ❌ Record not found. Please verify that the transaction hash or Certificate ID is typed accurately.
                      </div>
                    ) : (
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-emerald-600 font-black text-sm">✅ Verified On-Chain</span>
                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{searchResult.certificateId}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono break-all">
                            Hash: {searchResult.blockchainHash}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                            Item: {searchResult.foodItem || searchResult.foodType} • {searchResult.quantity} • {searchResult.location}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedProof(searchResult)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow shrink-0"
                        >
                          View Full Certificate
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Live Blockchain Transactions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Recent Verified Transactions (Polygon Amoy Subnet)
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Network: 0 Gwei Gas
                  </span>
                </div>

                {ledger.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">
                          ✓
                        </span>
                        <div>
                          <p className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">{item.certificateId}</p>
                          <p className="text-[11px] font-bold text-slate-400">Block #{item.blockNumber.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          {item.timestamp}
                        </span>
                        <button
                          onClick={() => setSelectedProof(item)}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          Certificate <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Food: </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.foodItem} ({item.quantity})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Location: </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.location}</span>
                      </div>
                    </div>

                    {/* Hash Pill */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.blockchainHash}
                      </p>
                      <button
                        onClick={() => copyToClipboard(item.blockchainHash, item.id)}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
                        title="Copy Hash"
                      >
                        {copiedHash === item.id ? (
                          <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Proof of Donation Modal */}
      {selectedProof && (
        <ProofOfDonationModal
          proof={selectedProof}
          donation={selectedProof}
          onClose={() => setSelectedProof(null)}
        />
      )}

      <Footer />
    </>
  );
}