import Link from 'next/link';
import { ArrowRightIcon, BuildingStorefrontIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function CTA() {
  return (
    <section className="premium-card relative overflow-hidden px-6 py-14 sm:px-10 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.16),transparent_24%),linear-gradient(135deg,rgba(22,163,74,0.95),rgba(15,23,42,0.96))]" />
      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="text-left text-white">
          <span className="page-kicker mb-4 border-white/15 bg-white/10 text-white/90">Take action</span>
          <h2 className="section-heading text-4xl font-black text-white sm:text-5xl">
            Turn surplus food into measurable impact.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
            Join the network of restaurants, NGOs, and volunteers building a cleaner, faster, more reliable food rescue system.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/signup" className="premium-button bg-white text-slate-950 hover:bg-slate-100">
              Get Involved
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link href="/about" className="premium-button-secondary border-white/15 bg-white/10 text-white hover:bg-white/15">
              Learn More
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-xl">
            <BuildingStorefrontIcon className="h-8 w-8 text-emerald-300" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Restaurants</p>
            <p className="mt-1 text-2xl font-bold">Partner faster</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-xl">
            <UserGroupIcon className="h-8 w-8 text-emerald-300" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">NGOs</p>
            <p className="mt-1 text-2xl font-bold">Distribute smarter</p>
          </div>
        </div>
      </div>
    </section>
  );
}
