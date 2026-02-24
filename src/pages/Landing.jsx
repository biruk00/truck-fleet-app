import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Truck, MapPin, Activity, Shield, ArrowRight, Package, Users, BarChart } from 'lucide-react';
import LoginModal from '../components/LoginModal';

export default function Landing() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    loading: 0,
    ongoing: 0,
    parked: 0
  });

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const fetchPublicStats = async () => {
    try {
      const { data, error } = await supabase.from('trucks').select('status');
      if (error) throw error;
      
      if (data) {
        const counts = { total: data.length, loading: 0, ongoing: 0, parked: 0 };
        data.forEach(t => {
          const s = t.status?.toLowerCase() || '';
          if (s === 'loading') counts.loading++;
          if (s === 'ongoing') counts.ongoing++;
          if (s === 'parked' || s === 'garage') counts.parked++;
        });
        setStats(counts);
      }
    } catch (err) {
      console.error('Error fetching public stats:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans selection:bg-orange-500/30">
      
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
              G.S Trading PLC
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Link 
                to="/dashboard"
                className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                Go to Dashboard
              </Link>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md shadow-orange-500/20 flex items-center"
              >
                Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center justify-center min-h-[90vh]">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-orange-500/10 to-transparent dark:from-orange-500/5 -z-10" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-400/20 dark:bg-orange-500/10 blur-[100px] rounded-full -z-10" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-400/20 dark:bg-amber-500/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center space-y-10 z-10">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
            Next-Gen Fleet Management
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight animate-fade-in-up delay-100">
            Intelligent Logistics for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">
              Modern Fleets
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Streamline your transport operations, track vehicles in real-time, and manage everything from a unified, powerful dashboard. Built for scale, designed for simplicity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            {user ? (
              <Link 
                to="/dashboard"
                className="px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-full hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/30 transition-all flex items-center group w-full sm:w-auto justify-center"
              >
                Access Dashboard <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-full hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/30 transition-all flex items-center group w-full sm:w-auto justify-center"
              >
                Sign In to Dashboard <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            
            <a 
              href="#features"
              className="px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-full hover:-translate-y-1 transition-all w-full sm:w-auto text-center"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* PUBLIC STATS SECTION */}
      <section className="py-12 bg-slate-100 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            Live Fleet Overview
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center animate-fade-in-up">
              <Truck className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Fleet</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center animate-fade-in-up delay-100">
              <Activity className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.ongoing}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ongoing Routes</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center animate-fade-in-up delay-200">
              <Package className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.loading}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Currently Loading</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center animate-fade-in-up delay-300">
              <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.parked}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Parked / Garage</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              Everything you need to manage your fleet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Our platform provides all the tools required to keep your logistics operation running smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Live Vehicle Tracking</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Monitor the real-time status and current location of your entire fleet. Easily categorize trucks and track their movements instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Status History & Logs</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Every status change is automatically logged. Review the complete timeline of a truck's journey from loading to unloading.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Role-Based Access</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Secure your data. Standard users can view reports, while dedicated admin roles have full control over truck registration and editing.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Route Management</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Record exact origin and destination points for every dispatch. Always know exactly where your cargo is headed.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all group lg:col-span-2">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Package className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Advanced Filtering & Export</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Instantly find what you need with powerful search capabilities. Filter your fleet by category, status, and export the data with a single click.
                  </p>
                </div>
                {/* Mock UI Element */}
                <div className="flex-1 w-full bg-slate-800 rounded-xl p-4 shadow-inner border border-slate-700 hidden sm:block">
                   <div className="flex gap-2 mb-4 border-b border-slate-700 pb-4">
                     <div className="h-8 flex-1 bg-slate-700 rounded-md"></div>
                     <div className="h-8 w-24 bg-orange-500/20 border border-orange-500/30 rounded-md"></div>
                   </div>
                   <div className="space-y-2">
                     <div className="h-4 w-3/4 bg-slate-700 rounded-sm"></div>
                     <div className="h-4 w-full bg-slate-700 rounded-sm"></div>
                     <div className="h-4 w-5/6 bg-slate-700 rounded-sm"></div>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 dark:bg-slate-900 py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
           <div className="flex items-center space-x-2 opacity-50 mb-6">
            <Truck className="w-6 h-6" />
            <span className="text-lg font-bold">G.S Trading PLC</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} G.S Trading PLC. All rights reserved.
          </p>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
