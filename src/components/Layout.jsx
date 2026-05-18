import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Truck, Home, List, LogOut, Plus, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TruckModal from './TruckModal';

export default function Layout() {
  const { signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Bottom tab items (mobile only)
  const tabItems = [];
  if (isAdmin) tabItems.push({ name: 'Dashboard', path: '/dashboard', icon: LayoutGrid });
  tabItems.push({ name: 'Map', path: '/map', icon: MapIcon });
  tabItems.push({ name: 'Trucks', path: '/trucks', icon: List });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">

      {/* ═══ DESKTOP HEADER (hidden on mobile) ═══ */}
      <header className="hidden sm:block bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-orange-500 rounded-lg p-2 shadow">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white leading-tight">Fleet Dashboard</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dateStr} &bull; {timeStr}</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="flex items-center space-x-3">
              {tabItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-500'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1" />

              {isAdmin && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Truck
                </button>
              )}

              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE TOP BAR ═══ */}
      <header className="sm:hidden sticky top-0 z-30 bg-[#0B1120]/95 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Brand mark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Truck className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-tight">GS Fleet</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-medium">Live</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <span className="text-[11px] font-semibold text-slate-400">{dateStr}</span>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      {/* pb-24 on mobile to clear the bottom tab bar */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full pb-24 sm:pb-8">
        <div className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>

      {/* ═══ MOBILE BOTTOM TAB BAR ═══ */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Glass bar */}
        <div className="bg-[#0B1120]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-around px-4 pt-2 pb-5 relative">

            {/* Left tabs */}
            {tabItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              // If admin has 2 tabs, first goes left of FAB, second goes right
              // For non-admin, just one tab on the right of the FAB
              const isLeftOfFab = idx === 0;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-5 py-1 rounded-2xl transition-all duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-orange-500/20' : ''}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-orange-400' : 'text-slate-500'}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                  )}
                </Link>
              );
            })}

            {/* Centre FAB - Add Truck (admin only) */}
            {isAdmin && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-[0_0_25px_rgba(249,115,22,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-2 border-orange-400/50"
                >
                  <Plus className="h-7 w-7 text-white stroke-[2.5]" />
                </button>
              </div>
            )}

            {/* Sign Out button as a subtle icon on the right */}
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center gap-1 px-5 py-1 opacity-40 hover:opacity-70 transition-opacity"
            >
              <div className="p-1.5 rounded-xl">
                <LogOut className="h-5 w-5 text-slate-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Logout</span>
            </button>

          </div>
        </div>
      </div>

      {/* GLOBAL MODALS */}
      {isAdmin && (
        <TruckModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          plateNo={null}
          onSaved={() => {
            if (location.pathname === '/trucks') {
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
}
