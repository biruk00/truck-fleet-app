import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, Plus, Edit2, Trash2, History, ChevronLeft, ChevronRight, 
  MapPin, Shield, Settings, Truck, Package, Archive, Activity, Loader, Download, FileText
} from 'lucide-react';
import TruckModal from '../components/TruckModal';

export default function TrucksList() {
  const { isAdmin } = useAuth();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlateNo, setEditPlateNo] = useState(null);

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTrucks(data || []);
    } catch (err) {
      console.error('Error fetching trucks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, plateNo) => {
    if (!window.confirm(`Are you sure you want to delete truck ${plateNo}?`)) return;
    
    try {
      const { error } = await supabase.from('trucks').delete().eq('id', id);
      if (error) throw error;

      setTrucks(trucks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting truck:', err);
      alert('Failed to delete truck. Are you an admin?');
    }
  };

  const handleEdit = (plateNo) => {
    setEditPlateNo(plateNo);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditPlateNo(null);
    setIsModalOpen(true);
  };

  const exportToCSV = () => {
    if (filteredTrucks.length === 0) return;
    
    const headers = ['Plate No', 'Category', 'Status', 'Current Location', 'From', 'Destination', 'Note'];
    const csvRows = [headers.join(',')];
    
    filteredTrucks.forEach(t => {
      const row = [
        `"${t.plate_no || ''}"`,
        `"${t.category || ''}"`,
        `"${t.status || ''}"`,
        `"${t.current_location || ''}"`,
        `"${t.from_location || ''}"`,
        `"${t.destination || ''}"`,
        `"${t.note ? t.note.replace(/"/g, '""') : ''}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `truck_fleet_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // FULL REPORT (Polished formatting based on template)
  const exportToTextReport = async () => {
    if (trucks.length === 0) return;

    const date = new Date();
    const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeGreeting = date.getHours() < 12 ? 'Morning' : 'Afternoon';
    const timeDisplay = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const getCat = (t, cat) => (t.category || '').toLowerCase() === cat.toLowerCase();
    const getStat = (t, stat) => (t.status || '').toLowerCase() === stat.toLowerCase();
    const formatNote = (note) => note ? ` ${note}` : '';
    const groupBy = (array, key) => array.reduce((result, item) => {
      const k = item[key] || 'Unknown';
      (result[k] = result[k] || []).push(item);
      return result;
    }, {});

    // Identifies "Active" trucks (ignoring garage, parked, node, insurance)
    const isInactiveStatus = (status) => {
      const s = (status || '').toLowerCase();
      return ['garage', 'parked', 'insurance'].includes(s) || s.includes('node') || s.includes('no driver');
    };
    const isActiveTruck = (t) => !isInactiveStatus(t.status);

    let report = `Dear all\nGood ${timeGreeting} for u\nInformation here is today\nAll Heavy trucks status (${dateString} --- ${timeGreeting} ${timeDisplay})\n\n`;

    // --- DJIBOUTI SECTION ---
    const djibouti = trucks.filter(t => getCat(t, 'djibouti'));
    const djActive = djibouti.filter(isActiveTruck);
    
    // Crossed logic
    const djCrossed = djActive.filter(t => 
      (t.destination || '').toLowerCase() === 'djibouti' && 
      (t.note || '').toLowerCase().includes('galafi')
    );
    
    // Ongoing Empty
    const djOngoingEmpty = djActive.filter(t => 
      getStat(t, 'ongoing') && 
      (t.destination || '').toLowerCase() === 'djibouti' && 
      !(t.note || '').toLowerCase().includes('galafi')
    );

    // Fertlizer & Loading (The rest of active Djibouti trucks)
    const djOthers = djActive.filter(t => !djCrossed.includes(t) && !djOngoingEmpty.includes(t));

    report += `DJIBOUTI (${djActive.length || '-'})\n`;
    report += `-----\n`;
    report += `Empty Trucks Crossed to DJIBOUTI\n`;
    report += `On ${dateString} (${djCrossed.length || '-'})\n`;
    report += `-------\n`;
    if (djCrossed.length > 0) {
      djCrossed.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
    }

    report += `=============================\n`;
    report += `ONGOING EMPTY TRUCKS TO DJIBOUTI (${djOngoingEmpty.length || '-'})\n`;
    report += `-------------------\n`;
    if (djOngoingEmpty.length > 0) {
      djOngoingEmpty.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
    }
    report += `============================\n`;

    if (djOthers.length > 0) {
      report += `FERTLIZER (${djOthers.length})\n`;

      const djUnload = djOthers.filter(t => getStat(t, 'unloading'));
      if (djUnload.length > 0) {
        const grouped = groupBy(djUnload, 'current_location');
        for (const [loc, trks] of Object.entries(grouped)) {
          report += `UNLOADING @ ${loc !== 'Unknown' ? loc : '?'}\n`;
          trks.forEach(t => report += `${t.plate_no} ${formatNote(t.note)}\n`);
          report += `\n`;
        }
      }

      const djOngoing = djOthers.filter(t => getStat(t, 'ongoing'));
      if (djOngoing.length > 0) {
        const grouped = groupBy(djOngoing, 'destination');
        for (const [dest, trks] of Object.entries(grouped)) {
          report += `DJIBOUTI TO ${dest !== 'Unknown' ? dest : '?'}\n`;
          trks.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
          report += `\n`;
        }
      }

      const djOncoming = djOthers.filter(t => getStat(t, 'oncoming'));
      if (djOncoming.length > 0) {
        report += `ONCOMING TRUCKS TO DJIBOUTI\n`;
        const grouped = groupBy(djOncoming, 'from_location');
        for (const [fromLoc, trks] of Object.entries(grouped)) {
          report += `from ${fromLoc}\n`;
          trks.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
          report += `\n`;
        }
      }
    }

    // --- BRANDS SECTION ---
    const brands = ['Walia', 'BGI', 'Leshato', 'Habesha', 'Unilever'];
    brands.forEach(brand => {
      const brandTrucks = trucks.filter(t => getCat(t, brand));
      const activeBrandTrucks = brandTrucks.filter(isActiveTruck);

      // ONLY Display Category if active trucks exist
      if (activeBrandTrucks.length === 0) return;

      report += `============================\n`;
      report += `${brand.toUpperCase()} (${activeBrandTrucks.length})\n`;

      const loading = activeBrandTrucks.filter(t => getStat(t, 'loading'));
      if (loading.length > 0) {
        const grouped = groupBy(loading, 'current_location');
        for (const [loc, trks] of Object.entries(grouped)) {
          report += `LOADING @ ${loc !== 'Unknown' ? loc : '?'}\n`;
          trks.forEach(t => report += `${t.plate_no} ${formatNote(t.note)}\n`);
        }
        report += `-------\n`;
      }

      const unloading = activeBrandTrucks.filter(t => getStat(t, 'unloading'));
      if (unloading.length > 0) {
        report += `UNLOADING\n`;
        unloading.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
        report += `\n`;
      }

      const ongoing = activeBrandTrucks.filter(t => getStat(t, 'ongoing'));
      if (ongoing.length > 0) {
        const primaryFrom = ongoing[0]?.from_location || 'ORIGIN';
        report += `ONGOING TRUCKS FROM ${primaryFrom.toUpperCase()}\n\n`;
        const onByDest = groupBy(ongoing, 'destination');
        for (const [dest, trks] of Object.entries(onByDest)) {
          report += `to ${dest}\n`;
          trks.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
          report += `\n`;
        }
      }

      const oncoming = activeBrandTrucks.filter(t => getStat(t, 'oncoming'));
      if (oncoming.length > 0) {
        const primaryDest = oncoming[0]?.destination || 'DESTINATION';
        report += `ONCOMING TRUCKS TO ${primaryDest.toUpperCase()}\n\n`;
        const onByFrom = groupBy(oncoming, 'from_location');
        for (const [fromLoc, trks] of Object.entries(onByFrom)) {
          report += `from ${fromLoc}\n`;
          trks.forEach(t => report += `${t.plate_no} ==> ${t.current_location || '?'}${formatNote(t.note)}\n`);
          report += `\n`;
        }
      }
    });

    // --- SPECIAL STATUSES ---
    // Only shows blocks that have trucks in them.
    
    const parkedTrucks = trucks.filter(t => getStat(t, 'parked'));
    if (parkedTrucks.length > 0) {
      report += `===========================\n`;
      report += `PARKED (${parkedTrucks.length})\n`;
      report += `----------\n`;
      parkedTrucks.forEach(t => report += `${t.plate_no} =${formatNote(t.note)}\n`);
    }

    const garageTrucks = trucks.filter(t => getStat(t, 'garage'));
    if (garageTrucks.length > 0) {
      report += `===========================\n`;
      report += `GARAGE (${garageTrucks.length})\n`;
      garageTrucks.forEach(t => report += `${t.plate_no} =${formatNote(t.note)}\n`);
    }

    const nodeTrucks = trucks.filter(t => (t.status || '').toLowerCase().includes('node') || (t.status || '').toLowerCase().includes('no driver'));
    if (nodeTrucks.length > 0) {
      report += `\n=============================\n`;
      report += `Node / No Driver (${nodeTrucks.length})\n`;
      nodeTrucks.forEach(t => report += `${t.plate_no} =${formatNote(t.note)}\n`);
    }

    const insuranceTrucks = trucks.filter(t => getStat(t, 'insurance'));
    if (insuranceTrucks.length > 0) {
      report += `\n=============================\n`;
      report += `INSURANCE (${insuranceTrucks.length})\n`;
      insuranceTrucks.forEach(t => report += `${t.plate_no}\n`);
    }

    report += `\n=============================\n`;
    report += `Good Day`;

    try {
      await navigator.clipboard.writeText(report);
      alert('Full Daily Report copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy. Check console for details.');
    }
  };

  // SUMMARY REPORT ONLY (Filtering strictly on active truck states)
  const exportToSummaryReport = async () => {
    if (trucks.length === 0) return;

    const date = new Date();
    const dateString = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const isMorning = date.getHours() < 12;
    const timeGreeting = isMorning ? 'Morning' : 'Afternoon';
    const timeDisplay = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const getStat = (t, stat) => (t.status || '').toLowerCase() === stat.toLowerCase();

    // STRICT FILTER: Only returns the exact states you requested.
    const getDetailedState = (t) => {
      const s = (t.status || '').toLowerCase();
      const c = (t.category || '').toLowerCase();
      const dest = (t.destination || '').toLowerCase();
      const note = (t.note || '').toLowerCase();

      // Djibouti special routing states
      if (c === 'djibouti') {
        if (dest === 'djibouti' && note.includes('galafi')) return 'Empty Trucks Crossed to DJIBOUTI';
        if (s === 'ongoing' && dest === 'djibouti') return 'ONGOING EMPTY TRUCKS TO DJIBOUTI';
        if (s === 'ongoing') return 'DJIBOUTI TO';
        if (s === 'oncoming') return 'ONCOMING TRUCKS TO';
      } else {
        if (s === 'ongoing') return 'ONGOING TRUCKS FROM';
        if (s === 'oncoming') return 'ONCOMING TRUCKS TO';
      }

      if (s === 'loading') return 'LOADING';
      if (s === 'unloading') return 'UNLOADING';

      return null;
    };

    let report = `Dear all\nGood ${timeGreeting} for u\nInformation here is today\nAll Heavy trucks status Summary (${dateString} --- ${timeGreeting} ${timeDisplay})\n\n`;

    // 1. STATUS BREAKDOWN
    report += `=============================\n`;
    report += `📊 GENERAL STATUS BREAKDOWN\n`;
    report += `=============================\n\n`;
    
    const allStatuses = [...new Set(trucks.map(t => {
      const s = (t.status || 'Other').trim();
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }))];

    allStatuses.forEach(stat => {
      const tInStat = trucks.filter(t => getStat(t, stat));
      if (tInStat.length === 0) return;
      
      report += `🔹 ${stat.toUpperCase()} [${tInStat.length}]\n`;
      
      const catCounts = {};
      tInStat.forEach(t => {
        const c = (t.category || 'Uncategorized').trim();
        const cFormatted = c.charAt(0).toUpperCase() + c.slice(1);
        catCounts[cFormatted] = (catCounts[cFormatted] || 0) + 1;
      });
      
      const entries = Object.entries(catCounts);
      entries.forEach(([c, count], index) => {
        const isLast = index === entries.length - 1;
        report += `   ${isLast ? '└' : '├'} ${c}: ${count}\n`;
      });
      report += `\n`;
    });

    // 2. DETAILED TRUCK STATES BY CATEGORY (Requested exact string states)
    report += `=============================\n`;
    report += `🚚 ACTIVE CATEGORY BREAKDOWN\n`;
    report += `=============================\n\n`;

    const dbCats = [...new Set(trucks.map(t => (t.category || 'Uncategorized').trim()))];
    const allCategories = [...new Set(['Djibouti', 'Walia', 'BGI', 'Leshato', 'Habesha', 'Unilever', ...dbCats])];

    allCategories.forEach(cat => {
      const catTrucks = trucks.filter(t => {
        const tCat = (t.category || 'Uncategorized').trim().toLowerCase();
        return tCat === cat.toLowerCase();
      });
      
      const statCounts = {};
      let activeCount = 0;

      // Count only the trucks that match the specific active states
      catTrucks.forEach(t => {
        const stateName = getDetailedState(t);
        if (stateName) {
          statCounts[stateName] = (statCounts[stateName] || 0) + 1;
          activeCount++;
        }
      });
      
      // If no active trucks in this category, hide the category entirely from this section
      if (activeCount === 0) return;

      report += `📦 ${cat.toUpperCase()} [${activeCount}]\n`;
      
      const entries = Object.entries(statCounts);
      entries.forEach(([stateStr, count], index) => {
        const isLast = index === entries.length - 1;
        report += `   ${isLast ? '└' : '├'} ${stateStr}: ${count}\n`;
      });
      report += `\n`;
    });

    report += `=============================\n`;
    report += `Good Day 🌟`;

    try {
      await navigator.clipboard.writeText(report);
      alert('Summary Report copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy. Check console for details.');
    }
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    switch(s) {
      case 'loading': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'unloading': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'oncoming': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'parked': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'garage': return 'bg-red-100 text-red-800 border-red-200';
      case 'node': return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'insurance': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const categories = [...new Set(trucks.map(t => t.category).filter(Boolean))];
  const statuses = [...new Set(trucks.map(t => t.status).filter(Boolean))];

  let filteredTrucks = trucks.filter(t => {
    const matchSearch = Object.values(t).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = statusFilter ? t.status === statusFilter : true;
    const matchCategory = categoryFilter ? t.category === categoryFilter : true;
    return matchSearch && matchStatus && matchCategory;
  });

  const totalPages = Math.ceil(filteredTrucks.length / itemsPerPage);
  const currentTrucks = filteredTrucks.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const statusCounts = { 'Loading': 0, 'Unloading': 0, 'Ongoing': 0, 'Oncoming': 0, 'Parked': 0, 'Garage': 0, 'Node': 0, 'Insurance': 0, 'Other': 0 };
  const categoryCounts = {};

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
    { key: 'Unilever', label: 'Unilever', count: categoryCounts['Unilever'] || 0 },
  ];

  const STATUS_ICONS = {
    'Loading': <Package className="w-6 h-6 text-blue-500" />,
    'Unloading': <Archive className="w-6 h-6 text-emerald-500" />,
    'Ongoing': <Activity className="w-6 h-6 text-amber-500" />,
    'Oncoming': <MapPin className="w-6 h-6 text-purple-500" />,
    'Parked': <Truck className="w-6 h-6 text-emerald-500" />,
    'Garage': <Settings className="w-6 h-6 text-red-500" />,
    'Node': <MapPin className="w-6 h-6 text-slate-500" />,
    'Insurance': <Shield className="w-6 h-6 text-purple-500" />
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

  const handleChipClick = (key) => {
    if (key === 'all') {
      setCategoryFilter('');
    } else {
      setCategoryFilter(key);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      
      {/* HEADER / TOOLBAR */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Fleet Inventory</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track all {trucks.length} vehicles</p>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            
            {/* SUMMARY BUTTON */}
            <button 
              onClick={exportToSummaryReport}
              className="inline-flex items-center px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 text-sm font-medium rounded-xl shadow-sm transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              Copy Summary
            </button>

            {/* FULL REPORT BUTTON */}
            <button 
              onClick={exportToTextReport}
              className="inline-flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 text-sm font-medium rounded-xl shadow-sm transition-all"
            >
              <Activity className="h-4 w-4 mr-2" />
              Copy Full
            </button>

            <button 
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium rounded-xl shadow-sm transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </button>
            
            {isAdmin && (
              <button 
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium rounded-xl shadow-md transition-all hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Truck</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* CHIPS (Categories) */}
        {!loading && trucks.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4 px-6">
            {chipDefs.map(c => {
              const isActive = (categoryFilter === c.key) || (categoryFilter === '' && c.key === 'all');
              return (
                <div
                  key={c.key}
                  onClick={() => handleChipClick(c.key)}
                  className={`
                    relative bg-white dark:bg-slate-800 rounded-xl p-3 border-l-4 shadow-sm hover:shadow-md cursor-pointer
                    transition-all duration-300 overflow-hidden
                    ${isActive ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-300 dark:border-slate-600'}
                  `}
                >
                  <div className="flex flex-col justify-center items-center text-center">
                    <span className={`text-xl font-black ${c.key === 'all' ? 'text-orange-500' : 'text-slate-700 dark:text-slate-200'}`}>
                      {c.count}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                      {c.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STATUS SUMMARY (Interactive) */}
        {!loading && trucks.length > 0 && (
          <div className="mt-4 px-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {Object.keys(STATUS_ICONS).map(status => {
              const count = statusCounts[status] || 0;
              const isActive = statusFilter === status;
              return (
                <div
                  key={status}
                  onClick={() => setStatusFilter(isActive ? '' : status)}
                  className={`
                    bg-white dark:bg-slate-800 p-3 lg:p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                    ${isActive 
                      ? 'border-orange-500 ring-1 ring-orange-500 shadow-md' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      {STATUS_ICONS[status]}
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{status}</p>
                      <p className={`text-xl sm:text-2xl font-black ${STATUS_COLORS[status]}`}>{count}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FILTERS */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search plate matches, location..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm outline-none"
            />
          </div>
          
          <div className="flex gap-2 min-w-max">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all text-sm outline-none text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all text-sm outline-none text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">
              <th className="p-4 border-b border-slate-200 dark:border-slate-700">Plate No</th>
              <th className="p-4 border-b border-slate-200 dark:border-slate-700">Category</th>
              <th className="p-4 border-b border-slate-200 dark:border-slate-700">Status</th>
              <th className="p-4 border-b border-slate-200 dark:border-slate-700">Route</th>
              <th className="p-4 border-b border-slate-200 dark:border-slate-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  <div className="flex justify-center mb-2"><Loader className="h-6 w-6 animate-spin text-orange-500" /></div>
                  Loading trucks...
                </td>
              </tr>
            ) : currentTrucks.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  No trucks found matching your criteria.
                </td>
              </tr>
            ) : (
              currentTrucks.map(truck => (
                <tr key={truck.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="p-4 text-slate-900 dark:text-slate-200 font-medium">
                    {truck.plate_no}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                    {truck.category || '—'}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(truck.status)}`}>
                      {truck.status || '—'}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-slate-300 font-medium">
                        {truck.current_location || '—'}
                      </span>
                      {truck.from_location || truck.destination ? (
                        <span className="text-slate-500 dark:text-slate-500 text-xs mt-0.5">
                          {truck.from_location || '?'} &rarr; {truck.destination || '?'}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                      <Link to={`/trucks/history/${encodeURIComponent(truck.plate_no)}`} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="History">
                        <History className="h-4 w-4" />
                      </Link>
                      
                      {isAdmin && (
                        <>
                          <button onClick={() => handleEdit(truck.plate_no)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(truck.id, truck.plate_no)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {!loading && filteredTrucks.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-slate-900 dark:text-slate-200">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(page * itemsPerPage, filteredTrucks.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{filteredTrucks.length}</span> results
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      <TruckModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        plateNo={editPlateNo} 
        onSaved={fetchTrucks}
      />
    </div>
  );
}