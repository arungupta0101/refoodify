import Link from 'next/link';
import { HeartIcon, EnvelopeIcon, PhoneIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-slate-950 text-white dark:border-slate-800">
      <div className="section-shell py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20">
                <HeartIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-white">Refoodify</h3>
                <p className="text-sm text-slate-400">Food rescue infrastructure for modern communities</p>
              </div>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-300">
              Connecting surplus food with people and organizations that can use it quickly, safely, and transparently.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="stat-pill bg-white/5 text-emerald-300 border-white/10">Trusted by restaurants</span>
              <span className="stat-pill bg-white/5 text-emerald-300 border-white/10">Built for NGOs</span>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Quick Links</h4>
            <ul className="space-y-3 text-slate-300">
              <li><Link href="/about" className="transition-colors hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-white">Contact</Link></li>
              <li><Link href="/faq" className="transition-colors hover:text-white">FAQ</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-white">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Resources</h4>
            <ul className="space-y-3 text-slate-300">
              <li><Link href="/donate" className="transition-colors hover:text-white">Donate Food</Link></li>
              <li><Link href="/find-food" className="transition-colors hover:text-white">Find NGOs</Link></li>
              <li><Link href="/inventory" className="transition-colors hover:text-white">Inventory</Link></li>
              <li><Link href="/profile" className="transition-colors hover:text-white">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Contact</h4>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start gap-3"><EnvelopeIcon className="mt-0.5 h-5 w-5 text-emerald-300" /><span>support@refoodify.com</span></li>
              <li className="flex items-start gap-3"><PhoneIcon className="mt-0.5 h-5 w-5 text-emerald-300" /><span>+1-234-567-890</span></li>
            </ul>
            <Link href="/signup" className="premium-button mt-6 inline-flex w-full sm:w-auto">
              Partner with us
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Refoodify. All rights reserved.</p>
          <p>Designed for trust, speed, and measurable social impact.</p>
        </div>
      </div>
    </footer>
  );
}