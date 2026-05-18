import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout & Pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import TrucksList from './pages/TrucksList';
import TruckHistory from './pages/TruckHistory';
import UserManagement from './pages/UserManagement';
import LiveMapPage from './pages/LiveMapPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Authenticated Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trucks" element={<TrucksList />} />
              <Route path="/map" element={<LiveMapPage />} />
              <Route path="/trucks/history/:plateNo" element={<TruckHistory />} />
              
              {/* Admin Only Routes (Modals used for Add/Edit now) */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/users" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
