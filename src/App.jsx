import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout & Pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import TrucksList from './pages/TrucksList';
import TruckHistory from './pages/TruckHistory';

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
              <Route path="/trucks/history/:plateNo" element={<TruckHistory />} />
              
              {/* Admin Only Routes (Modals used for Add/Edit now) */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                {/* Future Admin Routes */}
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
