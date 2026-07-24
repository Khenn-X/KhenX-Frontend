import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '../constants/routes';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Requires the user to be authenticated AND have role 'admin' or 'superadmin'.
 * Superadmins can access all admin routes in addition to their own routes.
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;