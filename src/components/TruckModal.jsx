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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
      {/* Click outside to close (optional, but good practice. Disabled here to prevent accidental lost changes) */}
      <div className="absolute inset-0"></div>

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 my-auto animate-fade-in-up">
        
        {/* Header Ribbon */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl"></div>

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              {isEditing ? 'Edit Truck Details' : 'Register New Truck'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              {isEditing ? `Updating ${plateNo}` : 'Add a new vehicle to the fleet'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              
              {/* Row 1: Plate & Status (Required) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Plate No <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                      className="pl-10 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm outline-none text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status <span className="text-orange-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm outline-none text-slate-900 dark:text-white"
                  >
                    <option value="" disabled>— Select Status —</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Category & Current Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">— Select Category —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Location
                  </label>
                  <input
                    type="text"
                    name="current_location"
                    value={formData.current_location}
                    onChange={handleChange}
                    placeholder="e.g. Debre Birhan"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 3: Route (From -> To) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Route Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="from_location"
                      value={formData.from_location}
                      onChange={handleChange}
                      placeholder="Origin (e.g. Addis Ababa)"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all text-sm outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="Destination (e.g. Djibouti)"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all text-sm outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Note / Remarks
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Additional details..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>

            </div>

            {/* ACTIONS */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
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
