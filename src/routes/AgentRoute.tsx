import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ROUTES } from '../constants/routes';

interface AgentRouteProps {
  children: React.ReactNode;
}

/**
 * Requires the user to be authenticated AND have role === 'agent'.
 * Seekers who try to access agent routes are redirected to home.
 * Unauthenticated users are redirected to login.
 */
const AgentRoute = ({ children }: AgentRouteProps) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role !== 'agent' && user?.role !== 'admin') {
    // Admins can access agent routes for testing/support purposes
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

export default AgentRoute;
