import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useLogout } from '../hooks/useLogout';

export default function Navbar() {
  const { user, isAuth } = useAuth();
  const { settings, update } = useSettings();
  const handleLogout = useLogout();

  const toggleTheme = () =>
    update('theme', settings.theme === 'light' ? 'dark' : 'light');

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">⚡ TaskManager</Link>
      <div className="navbar-right">
        {isAuth ? (
          <>
            <span className="navbar-user">
              <span className={`role-badge ${user?.role}`}>
                {user?.role === 'admin' ? '👑' : '👤'} {user?.name}
              </span>
            </span>
            {/* Theme toggle */}
            <button
              className="btn-icon"
              onClick={toggleTheme}
              title={`Switch to ${settings.theme === 'light' ? 'dark' : 'light'} mode`}
              style={{ fontSize: '1.1rem', color: '#ccc' }}
            >
              {settings.theme === 'light' ? '🌙' : '☀️'}
            </button>
            {/* Settings */}
            <Link to="/settings" className="btn-icon" title="Settings" style={{ fontSize: '1.1rem', color: '#ccc' }}>
              ⚙️
            </Link>
            <button className="btn btn-primary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="btn-icon"
              onClick={toggleTheme}
              title="Toggle theme"
              style={{ fontSize: '1.1rem', color: '#ccc' }}
            >
              {settings.theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/login"    className="navbar-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
