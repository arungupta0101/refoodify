import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { GiftIcon, TicketIcon, AcademicCapIcon, StarIcon, TrophyIcon, FireIcon, CheckBadgeIcon, DocumentArrowDownIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import jsPDF from 'jspdf';

export default function Rewards() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [userType, setUserType] = useState('user');
  const [activeTab, setActiveTab] = useState('status'); // status, rules, badges

  // Level Logic
  const getLevel = (pts, type) => {
    if (type === 'ngo') {
      if (pts >= 4000) return { name: 'Gold NGO', color: 'text-yellow-500', bg: 'bg-yellow-100', next: 10000, icon: '🥇' };
      if (pts >= 2000) return { name: 'Silver NGO', color: 'text-gray-400', bg: 'bg-gray-100', next: 4000, icon: '🥈' };
      if (pts >= 800) return { name: 'Bronze NGO', color: 'text-orange-600', bg: 'bg-orange-100', next: 2000, icon: '🥉' };
      return { name: 'Starter NGO', color: 'text-green-600', bg: 'bg-green-100', next: 800, icon: '🌱' };
    } else if (type === 'restaurant') {
      if (pts >= 3000) return { name: 'Gold Partner', color: 'text-yellow-500', bg: 'bg-yellow-100', next: 10000, icon: '🥇' };
      if (pts >= 1500) return { name: 'Silver Partner', color: 'text-gray-400', bg: 'bg-gray-100', next: 3000, icon: '🥈' };
      if (pts >= 500) return { name: 'Bronze Partner', color: 'text-orange-600', bg: 'bg-orange-100', next: 1500, icon: '🥉' };
      return { name: 'New Partner', color: 'text-green-600', bg: 'bg-green-100', next: 500, icon: '🌱' };
    } else {
      if (pts >= 3000) return { name: 'Gold User', color: 'text-yellow-500', bg: 'bg-yellow-100', next: 10000, icon: '🥇' };
      if (pts >= 1500) return { name: 'Silver User', color: 'text-gray-400', bg: 'bg-gray-100', next: 3000, icon: '🥈' };
      if (pts >= 500) return { name: 'Bronze User', color: 'text-orange-600', bg: 'bg-orange-100', next: 1500, icon: '🥉' };
      return { name: 'New User', color: 'text-green-600', bg: 'bg-green-100', next: 500, icon: '🌱' };
    }
  };

  const currentLevel = getLevel(points, userType);
  const progress = Math.min((points / currentLevel.next) * 100, 100);

  // Reward Tiers Data
  const rewardTiers = {
    user: [
      { level: 'Bronze', points: 500, color: 'bg-orange-100 text-orange-800', icon: '🥉', rewards: ['Bronze Badge', 'Certificate of Contribution', 'Profile Highlight', 'Thank You Email'] },
      { level: 'Silver', points: 1500, color: 'bg-gray-100 text-gray-800', icon: '🥈', rewards: ['Silver Badge', 'Volunteer Priority Access', 'Early Emergency Alerts', 'Featured Supporter Tag'] },
      { level: 'Gold', points: 3000, color: 'bg-yellow-100 text-yellow-800', icon: '🥇', rewards: ['Gold Badge', 'Top Supporter Spotlight', 'Free Event Entry Pass', 'Special Appreciation Certificate'] }
    ],
    restaurant: [
      { level: 'Bronze', points: 500, color: 'bg-orange-100 text-orange-800', icon: '🥉', rewards: ['Refoodify Bronze Badge', 'Profile Highlight', 'Appreciation Certificate', 'Social Feed Mention'] },
      { level: 'Silver', points: 1500, color: 'bg-gray-100 text-gray-800', icon: '🥈', rewards: ['Silver Badge', 'Priority Pickup Support', 'Featured Restaurant Section', 'Verified Partner Tag'] },
      { level: 'Gold', points: 3000, color: 'bg-yellow-100 text-yellow-800', icon: '🥇', rewards: ['Gold Badge', 'Top Donor Spotlight', 'Homepage Feature', 'Premium Partner Tag'] }
    ],
    ngo: [
      { level: 'Bronze', points: 800, color: 'bg-orange-100 text-orange-800', icon: '🥉', rewards: ['Trusted NGO Badge', 'Search Priority Boost', 'Public Profile Verification', 'Certificate of Impact'] },
      { level: 'Silver', points: 2000, color: 'bg-gray-100 text-gray-800', icon: '🥈', rewards: ['Priority NGO Listing', 'Featured on Donation Page', 'Admin Promotion', 'Monthly Impact Report'] },
      { level: 'Gold', points: 4000, color: 'bg-yellow-100 text-yellow-800', icon: '🥇', rewards: ['Verified Impact Partner Tag', 'Homepage Feature', 'Auto Assignment Priority', 'Annual Excellence Award'] }
    ]
  };

  const currentTiers = rewardTiers[userType] || rewardTiers.user;
  const minCertPoints = userType === 'ngo' ? 800 : 500;
  const isCertUnlocked = points >= minCertPoints;

  const downloadCertificate = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    
    // Border
    doc.setLineWidth(2);
    doc.setDrawColor(34, 197, 94); // Primary Green
    doc.rect(10, 10, 277, 190);
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(34, 197, 94);
    doc.text("Certificate of Appreciation", 148.5, 50, null, null, "center");
    
    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text("This certificate is proudly presented to", 148.5, 80, null, null, "center");
    
    doc.setFont("times", "bolditalic");
    doc.setFontSize(30);
    doc.text(user?.name || "Refoodify Hero", 148.5, 100, null, null, "center");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text(`For outstanding contribution towards reducing food waste.`, 148.5, 120, null, null, "center");
    doc.text(`Current Level: ${currentLevel.name} (${points} Points)`, 148.5, 135, null, null, "center");

    // Footer
    doc.setFontSize(12);
    doc.text("Refoodify Team", 240, 170, null, null, "center");
    doc.text(new Date().toLocaleDateString(), 50, 170, null, null, "center");
    
    doc.save("Refoodify_Certificate.pdf");
    toast.success("Certificate Downloaded!");
  };

  const rules = {
    restaurant: [
      { action: 'Food Donate (per 10kg)', points: '+50 pts' },
      { action: 'Emergency Donation', points: '+100 pts' },
      { action: 'Monthly Consistent Donation', points: '+200 pts' },
      { action: 'Zero Waste Day Achievement', points: '+150 pts' },
      { action: 'Verified Pickup Success', points: '+30 pts' },
    ],
    ngo: [
      { action: 'Food Distributed (per 50 people)', points: '+100 pts' },
      { action: 'Emergency Drive Completed', points: '+200 pts' },
      { action: 'Volunteer Drive Success', points: '+150 pts' },
      { action: 'High Rating From Users', points: '+50 pts' },
      { action: 'Consistent Weekly Activity', points: '+100 pts' },
    ],
    user: [
      { action: 'Food Donate', points: '+100 pts' },
      { action: 'Money Donate', points: '+1 pt per ₹10' },
      { action: 'Join as Volunteer', points: '+50 pts' },
      { action: 'Complete Volunteer Task', points: '+150 pts' },
      { action: 'Emergency Help', points: '+200 pts' },
      { action: 'Daily App Visit', points: '+10 pts' },
      { action: 'Share Campaign / Story', points: '+20 pts' },
      { action: 'Refer New User', points: '+100 pts' },
    ]
  };

  const currentRules = rules[userType] || rules.user;

  useEffect(() => {
    if (user) {
      fetch(`/api/user/profile?uid=${user.uid}`).then(res => res.json()).then(data => {
        setPoints(data.points || 0);
        setUserType(data.userType || 'user');
      });
    }
  }, [user]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-gray-800 mb-2">Refoodify Rewards</h1>
            <p className="text-gray-600">Earn points, unlock badges, and get recognized for your impact.</p>
          </div>

          {/* Points & Level Card */}
          <div className="bg-white rounded-[2rem] shadow-xl p-8 mb-10 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-yellow-400"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="text-center md:text-left">
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">Current Balance</p>
                <h2 className="text-5xl font-black text-primary flex items-center gap-2 justify-center md:justify-start">
                  {points} <span className="text-lg text-gray-400 font-medium">PTS</span>
                </h2>
                <div className={`mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold ${currentLevel.bg} ${currentLevel.color}`}>
                  <span>{currentLevel.icon}</span> {currentLevel.name}
                </div>
              </div>

              <div className="flex-1 w-full max-w-md">
                <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                  <span>Progress to Next Level</span>
                  <span>{points} / {currentLevel.next}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-yellow-400 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">Earn {currentLevel.next - points} more points to level up!</p>
              </div>

              <button 
                onClick={isCertUnlocked ? downloadCertificate : () => toast.error(`Reach ${minCertPoints} points to unlock certificate!`)} 
                className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${isCertUnlocked ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {isCertUnlocked ? <DocumentArrowDownIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />} Certificate
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            {['status', 'rules', 'badges'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-bold capitalize transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          {activeTab === 'status' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentTiers.map((tier, index) => {
                const isUnlocked = points >= tier.points;
                return (
                  <div key={index} className={`bg-white p-6 rounded-3xl shadow-md border relative overflow-hidden ${isUnlocked ? 'border-green-200' : 'border-gray-200 opacity-75'}`}>
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="bg-white p-3 rounded-full shadow-lg flex items-center gap-2">
                          <LockClosedIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-xs font-bold text-gray-500">Locked ({tier.points} pts)</span>
                        </div>
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${tier.color}`}>
                      {tier.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{tier.level} Level</h3>
                    <p className="text-sm text-gray-500 mb-4">{tier.points}+ Points</p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {tier.rewards.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500">✔</span> {r}
                        </li>
                      ))}
                    </ul>
                    {isUnlocked && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">Unlocked</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-5">Action</th>
                    <th className="p-5 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentRules.map((rule, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-5 font-medium text-gray-700">{rule.action}</td>
                      <td className="p-5 text-right font-bold text-primary">{rule.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Welcome', icon: '👋', desc: 'First Donation' },
                { name: 'Impact Hero', icon: '🦸', desc: '1000 Meals Served' },
                { name: 'Eco Warrior', icon: '🌍', desc: '500kg Food Saved' },
                { name: 'Crisis Champ', icon: '🚨', desc: '10 Emergency Helps' },
              ].map((badge, i) => (
                <div key={i} className={`p-6 rounded-2xl text-center border-2 ${points > 0 ? 'bg-white border-primary/20' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <h4 className="font-bold text-gray-800">{badge.name}</h4>
                  <p className="text-xs text-gray-500">{badge.desc}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}