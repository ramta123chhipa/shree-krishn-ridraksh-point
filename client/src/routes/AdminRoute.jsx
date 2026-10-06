import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

// Used by the admin pages from Phase 5. The server also checks the role on every admin API call.
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
