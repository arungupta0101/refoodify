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
    <div className="relative mx-auto max-w-5xl">
      <div className="premium-card overflow-hidden">
        <div className="relative min-h-[20rem] sm:min-h-[18rem]">
          {items.map((item, i) => (
            <div 
              key={i}
              className={`absolute inset-0 flex flex-col items-center gap-8 p-8 transition-all duration-700 ease-in-out sm:flex-row sm:p-12 ${
                i === idx ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-8 opacity-0'
              }`}
            >
              <div className="flex-shrink-0">
                <div className="rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 p-1">
                  <img src={item.image} alt={item.name} className="h-24 w-24 rounded-full border-4 border-white object-cover dark:border-slate-900" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="mb-3 flex justify-center gap-1 text-amber-400 sm:justify-start">
                  {[...Array(5)].map((_, starIndex) => <StarIcon key={starIndex} className="h-5 w-5" />)}
                </div>
                <p className="mb-4 text-lg font-medium leading-relaxed text-slate-700 md:text-xl dark:text-slate-200">"{item.text}"</p>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-2">
        {items.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIdx(i)} 
            className={`h-2 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-emerald-600 dark:bg-emerald-400' : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
