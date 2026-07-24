import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '../constants/routes';

interface SuperadminRouteProps {
  children: React.ReactNode;
}

/**
 * Requires the user to be authenticated AND have role === 'superadmin'.
 * Anyone else is bounced to home.
 */
const SuperadminRoute = ({ children }: SuperadminRouteProps) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role !== 'superadmin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

export default SuperadminRoute;