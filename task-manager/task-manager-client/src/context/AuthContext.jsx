import { createContext, useContext, useState, useEffect } from 'react';
import { decodeToken } from '../utils/tokenUtils';

const AuthContext = createContext(null);

const getStoredToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  // Validate structure and expiry using jwt-decode — clears stale tokens on load
  if (!decodeToken(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
  return token;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  });

  /**
   * Persist token + user object to localStorage and React state.
   * Called after login or register with the decoded+merged user object.
   */
  const saveAuth = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // React to 401 events dispatched by the axios interceptor
  useEffect(() => {
    const handle = () => logout();
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, []);

  // Proactive expiry timer — auto-logout exactly when the token expires.
  // Prevents the user from sitting on the dashboard with a dead token.
  useEffect(() => {
    if (!token) return;
    const payload = decodeToken(token);
    if (!payload?.exp) return;

    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) { logout(); return; }

    // Warn user 60 seconds before expiry
    const warnMs = msUntilExpiry - 60_000;
    let warnTimer;
    if (warnMs > 0) {
      warnTimer = setTimeout(() => {
        window.dispatchEvent(new Event('auth:expiring'));
      }, warnMs);
    }

    const timer = setTimeout(() => {
      logout();
      // Dispatch so any open axios requests also clean up
      window.dispatchEvent(new Event('auth:logout'));
    }, msUntilExpiry);

    return () => { clearTimeout(timer); clearTimeout(warnTimer); };
  }, [token]);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      role:            user?.role            ?? null,
      userId:          user?._id             ?? null,
      organization_id: user?.organization_id ?? null,
      isAuth:   !!token,
      isAdmin:  user?.role === 'admin',
      isMember: user?.role === 'member',
      saveAuth,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
