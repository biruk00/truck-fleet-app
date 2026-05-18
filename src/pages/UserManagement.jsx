import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, Shield, Trash2, Edit2, Search } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">User & Driver Management</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage system access and driver assignments</p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-md">
          <UserPlus className="w-4 h-4 mr-2" /> Add New User
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">Loading users...</div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Search */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or role..."
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ── MOBILE CARD VIEW ── */}
        <div className="block sm:hidden divide-y divide-slate-200 dark:divide-slate-700">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No users found.</div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="h-11 w-11 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-blue-500 font-black text-lg border border-slate-200 dark:border-slate-600 shrink-0">
                  {user.full_name?.charAt(0) || '?'}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.full_name}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${
                      user.role === 'driver'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</div>
                  {user.assigned_plate && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                      Plate: {user.assigned_plate}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-bold">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                    <Edit2 size={15} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── DESKTOP TABLE VIEW ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned Plate</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-500 font-bold border border-slate-200 dark:border-slate-700">
                        {user.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">{user.full_name}</div>
                        <div className="text-[10px] text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                      user.role === 'driver'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {user.assigned_plate || <span className="text-slate-400 italic">None</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-[10px] text-emerald-500 font-bold">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                      Active
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}