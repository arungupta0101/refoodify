import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const DUMMY = [
  { name: 'Harshit Diwedi', role: 'Restaurant Owner', text: "Refoodify made donating surplus food effortless. We've reduced waste by 40% and helped feed hundreds!", image: 'https://images.unsplash.com/photo-1729157661483-ed21901ed892?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Beauty Mishra', role: 'NGO Volunteer', text: "Thanks to Refoodify, we receive fresh donations regularly. It's transformed how we serve our community.", image: 'https://images.unsplash.com/photo-1541657333963-d31b55f58de1?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Nilesh Prajapati', role: 'Hotel Manager', text: "The inventory management feature is amazing. We track everything perfectly and donate smarter than ever.", image: 'https://images.unsplash.com/flagged/photo-1571367034861-e6729ad9c2d5?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

export default function TestimonialSlider({ items = DUMMY }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100">
        <div className="relative h-80 sm:h-64">
          {items.map((item, i) => (
            <div 
              key={i}
              className={`absolute inset-0 p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8 transition-all duration-700 ease-in-out ${
                i === idx ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
              }`}
            >
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-green-400 to-emerald-600">
                  <img src={item.image} alt={item.name} className="w-full h-full rounded-full object-cover border-4 border-white" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex justify-center sm:justify-start gap-1 text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-5 h-5" />)}
                </div>
                <p className="text-xl text-gray-700 font-medium leading-relaxed mb-4">"{item.text}"</p>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                  <p className="text-green-600 font-medium text-sm">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIdx(i)} 
            className={`h-2 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-green-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
