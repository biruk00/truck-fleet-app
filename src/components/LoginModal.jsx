import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, LogIn, AlertCircle, X, Loader, ArrowRight } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      const authResult = await signIn(email, password);
      onClose(); // Close modal immediately
      
      setTimeout(() => {
        // Redirection based on role
        if (authResult.role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/trucks');
        }
      }, 100);
      
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl transition-opacity">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md glass-card rounded-3xl overflow-hidden animate-fade-in-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full group-hover:bg-orange-500/50 transition-colors duration-500 animate-pulse-slow"></div>
              <div className="relative h-16 w-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                <Truck className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Welcome Back
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
              Sign in to COMMAND CENTER
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded-lg flex items-start animate-fade-in">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-1.5 relative group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-inner transition-all text-sm outline-none text-slate-900 dark:text-white backdrop-blur-sm"
                placeholder="admin@gstrading.com"
              />
            </div>

            <div className="space-y-1.5 relative group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-inner transition-all text-sm outline-none text-slate-900 dark:text-white backdrop-blur-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-4 px-4 rounded-xl shadow-lg shadow-orange-500/30 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transform transition-all hover:-translate-y-1 hover:shadow-orange-500/40 flex items-center justify-center group"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Authenticating...
                </>
              ) : (
                <>
                  Secure Sign In
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
