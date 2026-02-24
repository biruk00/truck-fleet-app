import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ requireAdmin = false }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect unauthenticated users to login page
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect authenticated but non-admin users trying to access admin pages
    return <Navigate to="/" replace />;
  }

  // Authorized
  return <Outlet />;
}
