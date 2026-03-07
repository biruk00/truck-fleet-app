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
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-orange-500/30 animate-ping"></div>
          <Loader className="w-12 h-12 text-orange-500 animate-spin relative z-10" />
        </div>
        <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase text-sm">
          Initializing Workspace...
        </p>
      </div>
    );
  }

  // Calculate percentages for progression bars
  let totalForFiltered = 0;
  if (activeFilter === 'all') {
    totalForFiltered = trucks.length;
  } else {
    totalForFiltered = chipDefs.find(c => c.key === activeFilter)?.count || 0;
  }

  return (
    <div className="space-y-10 pb-12 animate-fade-in-up">
      
      {/* HEADER HERO SECTION */}
      <div className="relative w-full rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl group">
        
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] bg-gradient-to-l from-orange-500/20 to-transparent blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000 animate-pulse-slow"></div>
          <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[120%] bg-gradient-to-r from-blue-500/10 to-transparent blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000"></div>
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCUyNTUsJTI1NSwtMC4wNSkiLz48L3N2Zz4=')] opacity-20"></div>
        </div>
        
        <div className="relative z-10 p-10 sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Live Systems Online</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500">Center</span>
            </h2>
            
            <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-lg">
              Monitor, track, and manage your entire logistics network in real-time.
            </p>
          </div>

          {/* Epic Number Display */}
          <div className="relative group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
            <div className="relative glass-card bg-slate-800/50 rounded-3xl p-8 flex flex-col items-center justify-center min-w-[200px] border-slate-600/50">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Fleet Size</span>
              <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 drop-shadow-lg leading-none">
                {trucks.length}
              </span>
            </div>
          </div>
          
        </div>
      </div>

      {/* HORIZONTAL CATEGORY NAVIGATION */}
      <section className="relative">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 px-2">
          Fleet Segments
        </h3>
        
        <div className="flex overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory gap-4 px-2">
          {chipDefs.map(c => {
            const isActive = activeFilter === c.key;
            // Generate a color theme per chip
            let themeFrom = 'from-slate-100';
            let themeTo = 'to-slate-200';
            let textActive = 'text-slate-800';
            let darkThemeFrom = 'dark:from-slate-800';
            let darkThemeTo = 'dark:to-slate-900';
            let darkTextActive = 'dark:text-white';
            
            if (c.key === 'all') { themeFrom = 'from-orange-400'; themeTo = 'to-orange-600'; textActive = 'text-white'; darkThemeFrom = 'dark:from-orange-500'; darkThemeTo = 'dark:to-orange-700'; }
            if (c.key === 'Djibouti') { themeFrom = 'from-blue-400'; themeTo = 'to-blue-600'; textActive = 'text-white'; darkThemeFrom = 'dark:from-blue-500'; darkThemeTo = 'dark:to-blue-700'; }
            if (c.key === 'Walia') { themeFrom = 'from-amber-400'; themeTo = 'to-amber-500'; textActive = 'text-white'; darkThemeFrom = 'dark:from-amber-500'; darkThemeTo = 'dark:to-amber-600'; }
            if (c.key === 'BGI') { themeFrom = 'from-purple-400'; themeTo = 'to-purple-600'; textActive = 'text-white'; darkThemeFrom = 'dark:from-purple-500'; darkThemeTo = 'dark:to-purple-700'; }
            if (c.key === 'Leshato') { themeFrom = 'from-pink-400'; themeTo = 'to-pink-600'; textActive = 'text-white'; darkThemeFrom = 'dark:from-pink-500'; darkThemeTo = 'dark:to-pink-700'; }
            
            return (
              <button
                key={c.key}
                onClick={() => setActiveFilter(c.key)}
                className={`
                  snap-start flex-none relative overflow-hidden rounded-2xl min-w-[140px] p-5 text-left transition-all duration-300
                  ${isActive 
                    ? `bg-gradient-to-br ${themeFrom} ${themeTo} ${darkThemeFrom} ${darkThemeTo} shadow-lg shadow-${themeFrom.split('-')[1]}-500/30 -translate-y-1` 
                    : `glass-card hover:-translate-y-1 hover:bg-white dark:hover:bg-slate-800 border-transparent`}
                `}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl -mr-8 -mt-8"></div>
                )}
                <div className="relative z-10 flex flex-col gap-1">
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                    {c.label}
                  </span>
                  <span className={`text-3xl font-black ${isActive ? textActive + ' ' + darkTextActive : 'text-slate-800 dark:text-slate-200'}`}>
                    {c.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* METRICS GRID */}
      <section>
        <div className="flex items-center justify-between px-2 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Real-time Status ({activeFilter.toUpperCase()})
          </h3>
          <span className="text-xs font-medium text-slate-400">
            {totalForFiltered} trucks in view
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.keys(STATUS_ICONS).map((status, idx) => {
            const isFilterActive = activeFilter !== 'all';
            const matchCount = statusCounts[status] || 0;
            
            // Progress Bar Logic
            const percentage = totalForFiltered > 0 ? Math.round((matchCount / totalForFiltered) * 100) : 0;
            
            // Match color variable from tailwind mapping
            const colorClassRaw = STATUS_COLORS[status]; // e.g. text-emerald-500
            const colorName = colorClassRaw.split('-')[1]; // e.g. emerald
            
            return (
              <div 
                key={status}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`
                  glass-card rounded-3xl p-6 relative overflow-hidden group
                  ${isFilterActive ? 'transform transition-all' : ''}
                  animate-fade-in-up
                `}
              >
                {/* Visual Flair Header */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`p-3 rounded-2xl bg-${colorName}-50 dark:bg-${colorName}-900/20 text-${colorName}-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    {STATUS_ICONS[status]}
                  </div>
                  <div className={`text-3xl font-black ${STATUS_COLORS[status]}`}>
                    {matchCount}
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {status}
                    </p>
                    <span className="text-xs font-semibold text-slate-400">{percentage}%</span>
                  </div>
                  
                  {/* Premium Progress Bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out bg-${colorName}-500`}
                      style={{ width: `${Math.max(percentage, 2)}%` }} // At least show a sliver so it's visible
                    />
                  </div>
                </div>
                
                {/* Background Glow on Hover */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-${colorName}-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
