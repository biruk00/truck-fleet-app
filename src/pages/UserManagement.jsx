import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, Shield, ShieldAlert, Loader, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch user_roles. Since we can't easily fetch auth.users directly without service role,
      // We'll query a custom view 'user_roles_view' that joins the roles with auth.users to get the email
      let { data, error } = await supabase
        .from('user_roles_view')
        .select('*');
        
      if (error && error.code === '42P01') {
        // Fallback if view doesn't exist yet
        console.warn('user_roles_view not found, falling back to user_roles table');
        const fallback = await supabase.from('user_roles').select('*');
        data = fallback.data;
        error = fallback.error;
      }
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user roles.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center">
            <Shield className="w-6 h-6 mr-2 text-indigo-500" />
            Admin Settings & Users
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage system access and roles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* USERS LIST */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up delay-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Active Roles Mapping
              </h3>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full">{users.length} Recorded</span>
            </div>
            
            <div className="p-0">
              {loading ? (
                <div className="p-8 flex justify-center"><Loader className="w-6 h-6 text-orange-500 animate-spin" /></div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No roles recorded yet.</div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.map((u) => (
                    <li key={u.user_id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                           {u.role === 'admin' ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {u.email || 'Unknown User'}
                          </p>
                          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5" title={u.user_id}>
                            {u.user_id?.split('-')[0]}...
                          </p>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              u.role === 'admin' 
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' 
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                         {/* Optional: Add delete role button later if needed. For now, it's just display. */}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              Showing role assignments corresponding to Supabase Auth UUIDs.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
