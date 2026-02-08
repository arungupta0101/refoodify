import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CalculatorIcon, GlobeAmericasIcon, FireIcon, TruckIcon, CloudIcon } from '@heroicons/react/24/outline';

export default function CarbonCalculator() {
  const [weight, setWeight] = useState('');
  const [type, setType] = useState('veg');
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (!weight) return;
    const factor = type === 'veg' ? 2.5 : 8.0; // Approx kg CO2 per kg food
    const savings = (parseFloat(weight) * factor).toFixed(2);
    setResult(savings);
  };

  const clear = () => {
    setWeight('');
    setResult(null);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 flex items-center justify-center gap-3">
              <GlobeAmericasIcon className="w-12 h-12 text-green-600" />
              Carbon Footprint Calculator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Understand the environmental impact of food waste. Every kilogram saved helps our planet breathe easier.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Calculator UI */}
            <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl border-4 border-gray-800 relative overflow-hidden">
              {/* Screen */}
              <div className="bg-[#9ea792] p-6 rounded-xl shadow-inner mb-8 font-mono text-right border-4 border-gray-700 relative">
                <p className="text-gray-700 text-sm font-bold uppercase mb-1">CO₂ Savings</p>
                <div className="text-5xl font-black text-gray-900 tracking-widest overflow-hidden">
                  {result ? `${result} kg` : '0.00 kg'}
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full opacity-50"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full opacity-50"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full opacity-100 animate-pulse"></div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase ml-2 mb-1 block">Food Weight (kg)</label>
                  <input 
                    type="number" 
                    value={weight} 
                    onChange={e => setWeight(e.target.value)} 
                    className="w-full p-4 bg-gray-800 text-white text-2xl font-bold rounded-2xl border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/50 outline-none transition-all text-right placeholder-gray-600" 
                    placeholder="0" 
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase ml-2 mb-1 block">Food Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setType('veg')}
                      className={`p-4 rounded-2xl font-bold text-lg transition-all flex flex-col items-center gap-2 ${type === 'veg' ? 'bg-green-600 text-white shadow-lg shadow-green-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      <span>🥗</span> Veg / Grains
                    </button>
                    <button 
                      onClick={() => setType('nonveg')}
                      className={`p-4 rounded-2xl font-bold text-lg transition-all flex flex-col items-center gap-2 ${type === 'nonveg' ? 'bg-red-500 text-white shadow-lg shadow-red-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      <span>🍖</span> Meat / Dairy
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-8">
                  <button onClick={clear} className="col-span-1 bg-gray-700 text-white p-4 rounded-2xl font-bold hover:bg-gray-600 transition-all">AC</button>
                  <button onClick={calculate} className="col-span-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Calculate Impact
                  </button>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CloudIcon className="w-6 h-6 text-blue-500" />
                  Why it matters?
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Food waste is responsible for <strong>8-10% of global greenhouse gas emissions</strong>. When food rots in landfills, it produces methane, a gas 25x more potent than CO₂.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <FireIcon className="w-8 h-8 text-orange-500 mb-2" />
                    <h4 className="font-bold text-gray-800">Methane</h4>
                    <p className="text-xs text-gray-500">Harmful gas from rotting food.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <TruckIcon className="w-8 h-8 text-blue-500 mb-2" />
                    <h4 className="font-bold text-gray-800">Transport</h4>
                    <p className="text-xs text-gray-500">Wasted fuel in logistics.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  💡 Real-world Examples
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-3xl">🍚</div>
                    <div>
                      <p className="font-bold text-gray-800">1kg Rice Wasted</p>
                      <p className="text-xs text-gray-500">≈ 2.5kg CO₂ (Driving ~10km)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-3xl">🥩</div>
                    <div>
                      <p className="font-bold text-gray-800">1kg Meat Wasted</p>
                      <p className="text-xs text-gray-500">≈ 15kg CO₂ (Driving ~60km)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-3xl">🍔</div>
                    <div>
                      <p className="font-bold text-gray-800">1 Burger Wasted</p>
                      <p className="text-xs text-gray-500">≈ 3.0kg CO₂ (Charging ~300 phones)</p>
                    </div>
                  </div>
                </div>
              </div>

              {result && (
                <div className="bg-green-600 text-white p-8 rounded-3xl shadow-xl animate-bounceIn relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                  <h3 className="text-2xl font-bold mb-2">Impact Visualization</h3>
                  <p className="opacity-90 mb-6">Saving {weight}kg of {type === 'veg' ? 'vegetarian' : 'non-vegetarian'} food is equivalent to:</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl">
                      <span className="text-2xl">🚗</span>
                      <div>
                        <p className="font-bold text-lg">{(result * 4).toFixed(1)} km</p>
                        <p className="text-xs opacity-75">Driven in a standard car</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl">
                      <span className="text-2xl">📱</span>
                      <div>
                        <p className="font-bold text-lg">{(result * 85).toFixed(0)}</p>
                        <p className="text-xs opacity-75">Smartphones charged</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style jsx>{`
        .animate-bounceIn { animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); opacity: 1; } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </>
  );
}