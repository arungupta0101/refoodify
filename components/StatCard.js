import LiveStat from './LiveStat';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export default function StatCard({ icon: Icon, value = 0, title, unit = '', accent = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/50',
    blue: 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/50',
    purple: 'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900/50',
    orange: 'bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900/50',
  };

  const accentColor = colors[accent] || colors.emerald;

  return (
    <div className="premium-card group relative p-6">
      <div className="mb-5 flex items-start justify-between">
        <div className={`rounded-2xl p-3 ring-1 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 ${accentColor}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        <div className="stat-pill text-[11px]">
          <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
          Live
        </div>
      </div>
      
      <div>
        <div className="mb-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          <LiveStat value={value} format={(v) => v.toLocaleString()} />
          {unit && <span className="ml-1 text-lg font-medium text-slate-500 dark:text-slate-400">{unit}</span>}
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      </div>
    </div>
  );
}
