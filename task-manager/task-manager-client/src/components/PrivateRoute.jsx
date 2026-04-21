import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { decodeToken } from '../utils/tokenUtils';

/**
 * Protects routes that require authentication.
 *
 * Checks on every render:
 * 1. No token → redirect to /login
 * 2. Token present but expired → logout + redirect to /login
 * 3. Valid token → render children
 *
 * The intended URL is saved in location state so Login can
 * redirect back after a successful login.
 */
export default function PrivateRoute({ children }) {
  const { isAuth, token, logout } = useAuth();
  const location = useLocation();

  // No token at all
  if (!isAuth || !token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Token exists but may have expired since last check
  const payload = decodeToken(token);
  if (!payload) {
    // Clear stale token and redirect
    logout();
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
