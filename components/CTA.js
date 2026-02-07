import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function CTA() {
  return (
    <section className="relative rounded-[2.5rem] overflow-hidden bg-gray-900 text-white shadow-2xl">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-gray-900/90"></div>
      
      <div className="relative z-10 px-6 py-20 sm:px-12 sm:py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
          Join Us in the Fight <br/>
          <span className="text-green-400">Against Food Waste</span>
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
          Help reduce waste and feed people across communities. Whether you are a donor, volunteer, or NGO, your contribution matters.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/signup" className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold text-lg rounded-xl transition-all transform hover:-translate-y-1 shadow-lg shadow-green-500/25 flex items-center justify-center gap-2">
            Get Involved <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <Link href="/about" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-xl border border-white/20 transition-all">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
