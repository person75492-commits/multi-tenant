import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps public-only routes (login, register).
 * Authenticated users are redirected to the dashboard instead.
 */
export default function PublicRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? <Navigate to="/" replace /> : children;
}
