import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, Plus, Edit2, Trash2, History, ChevronLeft, ChevronRight, 
  MapPin, Shield, Settings, Truck, Package, Archive, Activity, Loader, Download
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

  // derived state
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

  // Status and Category counts
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
          <div className="flex gap-3">
            <button 
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium rounded-xl shadow-sm transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            
            {isAdmin && (
              <button 
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium rounded-xl shadow-md transition-all hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Truck
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
