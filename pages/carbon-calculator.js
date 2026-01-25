import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
          <h1 className="text-3xl font-black text-center text-gray-800 mb-2">🌍 Carbon Footprint Calculator</h1>
          <p className="text-center text-gray-500 mb-8">See how much CO₂ you save by donating food instead of wasting it.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block font-bold text-gray-600 mb-2">Food Weight (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-4 border rounded-xl bg-gray-50 focus:ring-2 ring-green-500 outline-none" placeholder="e.g. 5" />
            </div>
            <div>
              <label className="block font-bold text-gray-600 mb-2">Food Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full p-4 border rounded-xl bg-gray-50 focus:ring-2 ring-green-500 outline-none">
                <option value="veg">Vegetarian / Grains</option>
                <option value="nonveg">Meat / Dairy</option>
              </select>
            </div>
            <button onClick={calculate} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all">Calculate Impact</button>
            
            {result && (
              <div className="mt-8 p-8 bg-green-50 rounded-2xl text-center border border-green-200 animate-bounceIn">
                <p className="text-gray-600 font-medium uppercase tracking-widest text-xs">By saving this food, you prevented</p>
                <h2 className="text-6xl font-black text-green-700 my-4">{result} kg</h2>
                <p className="text-gray-800 font-bold text-lg">of CO₂ emissions!</p>
                <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm text-gray-500">That's equivalent to driving a car for <span className="font-bold text-green-700">{(result * 4).toFixed(0)} km</span>.</p>
                </div>
              </div>
            )}
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