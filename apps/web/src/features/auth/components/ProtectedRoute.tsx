import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useCurrentUser } from '../../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects unauthenticated users to the login page
 * Can optionally require admin role with the requireAdmin prop
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requireAdmin = false
}) => {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login and save the location they were trying to access
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && user?.role !== 'ADMIN') {
    // Redirect to unauthorized page or home
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
