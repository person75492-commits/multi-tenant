import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Returns a logout function that:
 * 1. Removes token + user from localStorage (via AuthContext)
 * 2. Redirects to /login with replace:true so back button
 *    cannot return to the dashboard
 */
export const useLogout = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  return () => {
    logout();                                    // clears localStorage + React state
    navigate('/login', { replace: true });       // replace prevents back-navigation
  };
};
