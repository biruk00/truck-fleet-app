import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Truck, Activity, Loader, MapPin, Package, Shield, Settings, Archive } from 'lucide-react';

export default function Dashboard() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Status and Category maps based on the original PHP index
  const statusCounts = { 'Loading': 0, 'Unloading': 0, 'Ongoing': 0, 'Oncoming': 0, 'Parked': 0, 'Garage': 0, 'Node': 0, 'Insurance': 0, 'Other': 0 };
  const categoryCounts = {};

  const STATUS_ICONS = {
    'Loading': <Package className="w-8 h-8 text-blue-500" />,
    'Unloading': <Archive className="w-8 h-8 text-emerald-500" />,
    'Ongoing': <Activity className="w-8 h-8 text-amber-500" />,
    'Oncoming': <MapPin className="w-8 h-8 text-purple-500" />,
    'Parked': <Truck className="w-8 h-8 text-emerald-500" />,
    'Garage': <Settings className="w-8 h-8 text-red-500" />,
    'Node': <MapPin className="w-8 h-8 text-slate-500" />,
    'Insurance': <Shield className="w-8 h-8 text-purple-500" />
  };

  const STATUS_COLORS = {
    'Loading': 'text-blue-500',
    'Unloading': 'text-emerald-500', 
    'Ongoing': 'text-amber-500',
    'Oncoming': 'text-purple-500',
    'Parked': 'text-emerald-500',
    'Garage': 'text-red-500',
    'Node': 'text-slate-500',
    'Insurance': 'text-purple-500'
  };

  const CHIP_COLORS = {
    'all': 'border-orange-500 text-orange-500',
    'Djibouti': 'border-blue-500',
    'Walia': 'border-amber-500',
    'BGI': 'border-purple-500',
    'Leshato': 'border-pink-500',
    'Habesha': 'border-amber-500'
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('trucks').select('*');
      if (error) throw error;
      setTrucks(data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compile statistics
  trucks.forEach(t => {
    const s = (t.status || 'Other').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z ]/g, '');
    
    if (s.includes('unload')) statusCounts['Unloading']++;
    else if (s.includes('load')) statusCounts['Loading']++;
    else if (s.includes('ongoin')) statusCounts['Ongoing']++;
    else if (s.includes('oncomin')) statusCounts['Oncoming']++;
    else if (s.includes('park')) statusCounts['Parked']++;
    else if (s.includes('garage')) statusCounts['Garage']++;
    else if (s.includes('node')) statusCounts['Node']++;
    else if (s.includes('insur')) statusCounts['Insurance']++;
    else statusCounts['Other']++;

    const cat = (t.category || 'Uncategorized').trim();
    if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const chipDefs = [
    { key: 'all', label: 'ALL', count: trucks.length },
    { key: 'Djibouti', label: 'DJIBOUTI', count: categoryCounts['Djibouti'] || 0 },
    { key: 'Walia', label: 'WALIA', count: categoryCounts['Walia'] || 0 },
    { key: 'BGI', label: 'BGI', count: categoryCounts['BGI'] || 0 },
    { key: 'Leshato', label: 'LESHATO', count: categoryCounts['Leshato'] || 0 },
    { key: 'Habesha', label: 'HABESHA', count: categoryCounts['Habesha'] || 0 },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* FILTER CHIPS (Top Grid) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {chipDefs.map(c => {
          const isActive = activeFilter === c.key;
          const colorClass = CHIP_COLORS[c.key] || 'border-slate-500';
          return (
            <div
              key={c.key}
              onClick={() => setActiveFilter(c.key)}
              className={`
                relative bg-white dark:bg-slate-800 rounded-2xl p-4 border-l-4 shadow-sm hover:shadow-md cursor-pointer
                transition-all duration-300 transform hover:-translate-y-1 overflow-hidden
                ${colorClass} ${isActive ? 'ring-2 ring-orange-500/50 bg-orange-50 dark:bg-orange-500/10' : ''}
              `}
            >
              {isActive && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/0 to-white/10 rounded-bl-full pointer-events-none" />
              )}
              <div className="flex flex-col justify-center items-center h-full text-center space-y-1">
                <span className={`text-2xl font-black ${c.key === 'all' ? 'text-orange-500' : 'text-slate-700 dark:text-slate-200'}`}>
                  {c.count}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {c.label}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* TOTAL TRUCKS HERO CARD */}
      <div className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 transition-all duration-300 hover:shadow-orange-500/20 hover:-translate-y-2">
        <div className="p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-2">
            <h2 className="text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 drop-shadow-sm leading-none">
              {trucks.length}
            </h2>
            <p className="text-xl sm:text-2xl font-medium text-slate-300 tracking-wide uppercase">
              Total Fleet Size
            </p>
          </div>
        </div>
      </div>

      {/* 8 STATUS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.keys(STATUS_ICONS).map(status => {
          // If a category filter is active, only match "all" for this display, or implement matching logic.
          // For now, if activeFilter is NOT 'all', optionally dim the ones not matching. 
          const isFilterActive = activeFilter !== 'all';
          const matchCount = statusCounts[status];

          return (
            <div 
              key={status}
              className={`
                bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm
                transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-between
                ${isFilterActive ? 'opacity-50 hover:opacity-100 scale-95 hover:scale-100' : ''}
              `}
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {status}
                </p>
                <div className={`text-4xl font-black ${STATUS_COLORS[status]}`}>
                  {matchCount}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                {STATUS_ICONS[status]}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
