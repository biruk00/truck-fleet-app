import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Truck, Home, List, LogOut, Users, Plus } from 'lucide-react';
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

  const navItems = [];

  // Admins get the Dashboard overview
  if (isAdmin) {
    navItems.push({ name: 'Dashboard', path: '/dashboard', icon: Home });
  }
  
  // Everyone gets the Trucks List
  navItems.push({ name: 'Trucks List', path: '/trucks', icon: List });



  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-orange-500 rounded-lg p-2 shadow">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white leading-tight">
                  Fleet Dashboard
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {dateStr} &bull; {timeStr}
                </p>
              </div>
            </div>

            {/* Navigation Actions */}
            <nav className="flex items-center space-x-2 sm:space-x-4">
              
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-500 dark:hover:text-orange-400'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : ''} sm:mr-2`} />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                );
              })}

              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 sm:mx-2"></div>

              {isAdmin && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="hidden sm:flex items-center px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:-translate-y-0.5 mr-1"
                  title="Quick Add Truck"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Truck
                </button>
              )}

              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>

            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>

      {/* GLOBAL MODALS */}
      {isAdmin && (
        <TruckModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          plateNo={null} 
          onSaved={() => {
            // Usually we'd want to refresh current view, 
            // but simply closing it is fine globally. 
            // The list view handles its own refresh.
            if (location.pathname === '/trucks') {
              window.location.reload();
            }
          }}
        />
      )}

    </div>
  );
}
