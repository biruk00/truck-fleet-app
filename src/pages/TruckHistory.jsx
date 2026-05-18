import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { History, ArrowLeft, Trash2, Calendar, Search, Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TruckHistory() {
  const { plateNo } = useParams();
  const { isAdmin } = useAuth();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [plateFilter, setPlateFilter] = useState(plateNo || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (plateFilter) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = async () => {
    if (!plateFilter) {
      setError('Please enter a plate number first.');
      return;
    }
    try {
      setError(null);
      setLoading(true);
      let query = supabase
        .from('trucks_history')
        .select('*')
        .eq('plate_no', plateFilter)
        .order('changed_at', { ascending: false });
      if (startDate) query = query.gte('changed_at', `${startDate}T00:00:00.000Z`);
      if (endDate) query = query.lte('changed_at', `${endDate}T23:59:59.999Z`);
      const { data, error } = await query;
      if (error) throw error;
      setHistory(data || []);
      setPage(1);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history records.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPlateFilter('');
    setStartDate('');
    setEndDate('');
    setHistory([]);
    setError(null);
  };

  const handleDeleteRecord = async (historyId) => {
    if (!window.confirm('Are you sure you want to delete this history record?')) return;
    try {
      const { error } = await supabase.from('trucks_history').delete().eq('history_id', historyId);
      if (error) throw error;
      setHistory(history.filter(h => h.history_id !== historyId));
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete the record.');
    }
  };

  const handleDeleteAll = async () => {
    if (!plateFilter) return;
    if (!window.confirm(`Delete ALL history for ${plateFilter}? This cannot be undone.`)) return;
    try {
      let query = supabase.from('trucks_history').delete().eq('plate_no', plateFilter);
      if (startDate) query = query.gte('changed_at', `${startDate}T00:00:00.000Z`);
      if (endDate) query = query.lte('changed_at', `${endDate}T23:59:59.999Z`);
      const { error } = await query;
      if (error) throw error;
      setHistory([]);
      alert('History records successfully deleted.');
    } catch (err) {
      console.error('Error deleting history:', err);
      alert('Failed to delete history.');
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

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const currentRecords = history.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* HEADER & FILTERS */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
        
        {/* Title Row */}
        <div className="flex items-center gap-3 mb-4">
          <Link to="/trucks" className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">History Logs</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {plateFilter ? `Plate: ${plateFilter}` : 'View status changes over time'}
            </p>
          </div>
        </div>

        {/* Filters Grid - stacks on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Plate Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Plate No..."
              value={plateFilter}
              onChange={(e) => setPlateFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadHistory()}
              className="pl-9 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Date From */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Date To */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={loadHistory}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-70"
            >
              <History className="w-4 h-4" />
              Load
            </button>
            <button
              onClick={handleClear}
              className="flex-1 flex items-center justify-center py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Delete All - full width on mobile */}
        {isAdmin && history.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-bold rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete All Shown Records
          </button>
        )}

        {error && (
          <div className="mt-4 flex items-center p-3 text-sm text-red-800 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-xl">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* ── MOBILE CARD VIEW ── */}
        <div className="block sm:hidden divide-y divide-slate-200 dark:divide-slate-700">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              <Loader className="h-6 w-6 animate-spin text-orange-500 mx-auto mb-2" />
              Loading history...
            </div>
          ) : currentRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No records found. Enter a plate number and press Load.
            </div>
          ) : (
            currentRecords.map((record) => (
              <div key={record.history_id} className="p-4">
                {/* Card top: Plate + Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-slate-900 dark:text-white tracking-tight">{record.plate_no}</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>

                {/* Card details */}
                <div className="space-y-1 mb-3">
                  {record.current_location && (
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-14 shrink-0">Location</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{record.current_location}</span>
                    </div>
                  )}
                  {(record.from_location || record.destination) && (
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-14 shrink-0">Route</span>
                      <span className="text-xs text-slate-500">{record.from_location} → {record.destination}</span>
                    </div>
                  )}
                  {record.note && (
                    <div className="flex gap-2 items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-14 shrink-0 pt-0.5">Note</span>
                      <span className="text-xs text-slate-500 line-clamp-2">
                        {record.note.replace(/^\[.*?\]\s*/, '')}
                        {record.note.startsWith('[') && (
                          <span className="ml-1 inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-orange-500/10 text-orange-500 border border-orange-500/25">
                            {record.note.match(/^\[(.*?)\]/)?.[1]}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-14 shrink-0">When</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(record.changed_at)}</span>
                  </div>
                </div>

                {/* Delete button (admin only) */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteRecord(record.history_id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Record
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* ── DESKTOP TABLE VIEW ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Plate No</th>
                <th className="p-4">Cat.</th>
                <th className="p-4">Status</th>
                <th className="p-4">Location</th>
                <th className="p-4">Note</th>
                <th className="p-4">Changed At</th>
                {isAdmin && <th className="p-4 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-slate-500">
                    <Loader className="h-6 w-6 animate-spin text-orange-500 mx-auto mb-2" />
                    Loading history...
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-slate-500">
                    No history records found. Enter a plate number above and click Load.
                  </td>
                </tr>
              ) : (
                currentRecords.map((record) => (
                  <tr key={record.history_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-200">{record.plate_no}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{record.category || '—'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="text-slate-900 dark:text-slate-300 font-medium">{record.current_location || '—'}</div>
                      {(record.from_location || record.destination) && (
                        <div className="text-slate-500 text-xs mt-0.5">{record.from_location} → {record.destination}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm max-w-xs truncate">
                      <div className="flex flex-col">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {record.note ? record.note.replace(/^\[.*?\]\s*/, '') : '—'}
                        </span>
                        {record.note && record.note.startsWith('[') && (
                          <span className="inline-flex self-start mt-1 px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase bg-orange-500/10 text-orange-500 border border-orange-500/25 tracking-wider">
                            {record.note.match(/^\[(.*?)\]/)?.[1]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">{formatDate(record.changed_at)}</td>
                    {isAdmin && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteRecord(record.history_id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && history.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-slate-200">{(page - 1) * itemsPerPage + 1}</span>–<span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(page * itemsPerPage, history.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{history.length}</span>
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-xl disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-xl disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
