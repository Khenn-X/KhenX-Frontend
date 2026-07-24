import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '../constants/routes';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Allows both 'admin' and 'superadmin' roles.
 * 
 * Superadmins share all /admin/* routes with admins — no need to duplicate
 * routes for each shared page. Only superadmin-EXCLUSIVE pages (/superadmin/*)
 * use SuperadminRoute.
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