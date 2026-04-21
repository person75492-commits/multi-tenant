import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/sound';
import { Link } from 'react-router-dom';

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function Row({ label, desc, children }) {
  return (
    <div className="settings-row">
      <div>
        <p className="settings-label">{label}</p>
        {desc && <p className="settings-desc">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { settings, update } = useSettings();
  const { user } = useAuth();

  const testSound = (type) => {
    if (!settings.soundEnabled) return;
    sounds[type]?.();
  };

  return (
    <div className="settings-page">
      <div className="settings-container">

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Link to="/" className="btn btn-ghost btn-sm">← Back</Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>Settings</h1>
        </div>

        {/* Profile info */}
        <div className="settings-section">
          <p className="settings-section-title">Account</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 0' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'var(--primary-light)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', flexShrink: 0,
            }}>
              {user?.role === 'admin' ? '👑' : '👤'}
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text)' }}>{user?.name}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              <span className={`role-badge ${user?.role}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-section">
          <p className="settings-section-title">Appearance</p>
          <Row label="Theme" desc="Choose your preferred color scheme">
            <div className="theme-options">
              {[
                { key: 'light', icon: '☀️', label: 'Light' },
                { key: 'dark',  icon: '🌙', label: 'Dark'  },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  className={`theme-btn${settings.theme === key ? ' active' : ''}`}
                  onClick={() => update('theme', key)}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Compact view" desc="Show more tasks with less spacing">
            <Toggle
              checked={settings.compactView}
              onChange={(v) => update('compactView', v)}
            />
          </Row>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <p className="settings-section-title">Notifications</p>
          <Row label="Sound effects" desc="Play sounds on task actions">
            <Toggle
              checked={settings.soundEnabled}
              onChange={(v) => update('soundEnabled', v)}
            />
          </Row>
          <Row label="Toast notifications" desc="Show pop-up messages for actions">
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={(v) => update('notificationsEnabled', v)}
            />
          </Row>
          {settings.soundEnabled && (
            <Row label="Test sounds" desc="Preview notification sounds">
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-sm btn-ghost" onClick={() => testSound('success')}>✅ Success</button>
                <button className="btn btn-sm btn-ghost" onClick={() => testSound('error')}>❌ Error</button>
                <button className="btn btn-sm btn-ghost" onClick={() => testSound('delete')}>🗑️ Delete</button>
              </div>
            </Row>
          )}
        </div>

        {/* Reset */}
        <div className="settings-section">
          <p className="settings-section-title">Reset</p>
          <Row label="Restore defaults" desc="Reset all settings to their default values">
            <button
              className="btn btn-sm"
              style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
              onClick={() => {
                localStorage.removeItem('settings');
                window.location.reload();
              }}
            >
              Reset
            </button>
          </Row>
        </div>

      </div>
    </div>
  );
}
