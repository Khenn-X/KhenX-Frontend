import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '../constants/routes';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Requires the user to be authenticated AND have role === 'admin'.
 * Any non-admin who tries to access admin routes is redirected to home.
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
