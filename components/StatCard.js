import LiveStat from './LiveStat';

export default function StatCard({ icon: Icon, value = 0, title, unit = '', accent = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const accentColor = colors[accent] || colors.emerald;

  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${accentColor} transition-transform group-hover:scale-110`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full border border-green-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live</span>
        </div>
      </div>
      
      <div>
        <div className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
          <LiveStat value={value} format={(v) => v.toLocaleString()} />
          {unit && <span className="text-lg text-gray-500 ml-1 font-medium">{unit}</span>}
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
    </div>
  );
}
