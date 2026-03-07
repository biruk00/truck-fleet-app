import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Truck, AlertCircle, Loader, X } from 'lucide-react';

const CATEGORIES = ['Djibouti', 'Walia', 'BGI', 'Habesha', 'Leshato', 'Unilever'];
const STATUSES = ['Loading', 'Unloading', 'Ongoing', 'Oncoming', 'Parked', 'Garage', 'Node', 'Insurance'];

export default function TruckModal({ isOpen, onClose, plateNo, onSaved }) {
  const isEditing = Boolean(plateNo);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    plate_no: '',
    category: '',
    status: '',
    from_location: '',
    destination: '',
    current_location: '',
    note: ''
  });

  // Reset or fetch when opened
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (isEditing) {
        fetchTruck();
      } else {
        setFormData({
          plate_no: '',
          category: '',
          status: '',
          from_location: '',
          destination: '',
          current_location: '',
          note: ''
        });
      }
    }
  }, [isOpen, plateNo]);

  const fetchTruck = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('plate_no', plateNo)
        .single();
        
      if (error) throw error;
      if (data) {
        setFormData({
          plate_no: data.plate_no || '',
          category: data.category || '',
          status: data.status || '',
          from_location: data.from_location || '',
          destination: data.destination || '',
          current_location: data.current_location || '',
          note: data.note || ''
        });
      }
    } catch (err) {
      console.error('Error fetching truck:', err);
      setError('Failed to load truck details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!formData.plate_no || !formData.status) {
        throw new Error('Plate No and Status are required.');
      }

      if (isEditing) {
        const { error } = await supabase
          .from('trucks')
          .update(formData)
          .eq('plate_no', plateNo);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trucks')
          .insert([formData]);
        if (error) {
          if (error.code === '23505') throw new Error('A truck with this plate number already exists.');
          throw error;
        }
      }

      if (onSaved) onSaved(); // Notify parent to refresh list
      onClose(); // Close modal
    } catch (err) {
      console.error('Error saving truck:', err);
      setError(err.message || 'Failed to save truck.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md transition-opacity overflow-y-auto">
      {/* Click outside to close (optional, but good practice. Disabled here to prevent accidental lost changes) */}
      <div className="absolute inset-0"></div>

      <div className="relative w-full max-w-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/40 dark:border-slate-700/50 my-auto animate-fade-in-up overflow-hidden">
        
        {/* Header Ribbon Glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 opacity-90"></div>
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-orange-500/20 to-transparent pointer-events-none"></div>

        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center">
              {isEditing ? 'Edit Vehicle Profile' : 'Register Vehicle'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
              {isEditing ? `Updating credentials for ${plateNo}` : 'Add a new asset to the fleet command center'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700 rounded-xl transition-all hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 relative z-10">
            
            {error && (
              <div className="mb-6 bg-red-50/80 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-2xl flex items-start shadow-sm backdrop-blur-sm">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 shrink-0" />
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              
              {/* Row 1: Plate & Status (Required) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Plate No <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Truck className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="plate_no"
                      value={formData.plate_no}
                      onChange={handleChange}
                      disabled={isEditing}
                      required
                      placeholder="e.g. ET-123-AA"
                      className="pl-11 w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm font-bold shadow-inner outline-none text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Status <span className="text-orange-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm font-bold shadow-inner outline-none text-slate-900 dark:text-white"
                  >
                    <option value="" disabled>— Select Status —</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Category & Current Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm font-bold shadow-inner outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">— Select Category —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Current Location
                  </label>
                  <input
                    type="text"
                    name="current_location"
                    value={formData.current_location}
                    onChange={handleChange}
                    placeholder="e.g. Debre Birhan"
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm font-bold shadow-inner outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 3: Route (From -> To) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/30 shadow-inner">
                <div className="md:col-span-2">
                   <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Route Vector</h3>
                </div>
                <div className="space-y-1.5 mt-[-1rem]">
                  <input
                    type="text"
                    name="from_location"
                    value={formData.from_location}
                    onChange={handleChange}
                    placeholder="Origin (e.g. Addis Ababa)"
                    className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 transition-all text-sm font-semibold outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5 mt-[-1rem] relative">
                   {/* Directional Arrow between fields for desktop */}
                   <div className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                     &rarr;
                   </div>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="Destination (e.g. Djibouti)"
                    className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 transition-all text-sm font-semibold outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Note / Remarks
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Additional details..."
                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-sm font-medium shadow-inner outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>

            </div>

            {/* ACTIONS */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-bold rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all hover:-translate-y-0.5 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                    Save Truck
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
