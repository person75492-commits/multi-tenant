import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from '../components/Toast';

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="s-section">
      <div className="s-section-header">
        <span className="s-section-icon">{icon}</span>
        <h2 className="s-section-title">{title}</h2>
      </div>
      <div className="s-section-body">{children}</div>
    </div>
  );
}

function Row({ label, desc, children, danger }) {
  return (
    <div className={`s-row${danger ? ' s-row-danger' : ''}`}>
      <div className="s-row-info">
        <p className="s-row-label">{label}</p>
        {desc && <p className="s-row-desc">{desc}</p>}
      </div>
      <div className="s-row-action">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { settings, update } = useSettings();
  const { user } = useAuth();

  const [pwForm, setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next !== pwForm.confirm) return setPwError('Passwords do not match.');
    if (pwForm.next.length < 8)         return setPwError('Password must be at least 8 characters.');
    if (!/[A-Z]/.test(pwForm.next))     return setPwError('Must contain an uppercase letter.');
    if (!/[0-9]/.test(pwForm.next))     return setPwError('Must contain a number.');
    if (!/[!@#$%^&*]/.test(pwForm.next)) return setPwError('Must contain a special character.');
    setPwLoading(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: pwForm.current,
        newPassword:     pwForm.next,
      });
      toast.success('Password changed successfully.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="s-page">
      <div className="s-container">

        {/* Header */}
        <div className="s-header">
          <Link to="/" className="s-back">← Back</Link>
          <div>
            <h1 className="s-title">Settings</h1>
            <p className="s-subtitle">Manage your account and preferences</p>
          </div>
        </div>

        {/* Profile card */}
        <div className="s-profile-card">
          <div className="s-avatar">
            {user?.role === 'admin' ? '👑' : '👤'}
          </div>
          <div className="s-profile-info">
            <p className="s-profile-name">{user?.name}</p>
            <p className="s-profile-email">{user?.email}</p>
            <span className={`role-badge ${user?.role}`}>{user?.role}</span>
          </div>
        </div>

        {/* Appearance */}
        <Section icon="🎨" title="Appearance">
          <Row label="Theme" desc="Switch between light and dark mode">
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ key: 'light', icon: '☀️', label: 'Light' }, { key: 'dark', icon: '🌙', label: 'Dark' }].map(({ key, icon, label }) => (
                <button key={key}
                  className={`theme-btn${settings.theme === key ? ' active' : ''}`}
                  onClick={() => update('theme', key)}
                  style={{ minWidth: '90px' }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Compact view" desc="Denser task list with less spacing">
            <Toggle checked={settings.compactView} onChange={(v) => update('compactView', v)} />
          </Row>
          <Row label="Show task details" desc="Display creator name and date on task cards">
            <Toggle checked={settings.showTaskMeta} onChange={(v) => update('showTaskMeta', v)} />
          </Row>
        </Section>

        {/* Notifications */}
        <Section icon="🔔" title="Notifications & Sound">
          <Row label="Sound effects" desc="Play audio feedback on task actions">
            <Toggle checked={settings.soundEnabled} onChange={(v) => update('soundEnabled', v)} />
          </Row>
          <Row label="Toast notifications" desc="Show pop-up messages for actions">
            <Toggle checked={settings.notificationsEnabled} onChange={(v) => update('notificationsEnabled', v)} />
          </Row>
        </Section>

        {/* Tasks behaviour */}
        <Section icon="✅" title="Task Behaviour">
          <Row label="Confirm before delete" desc="Show a confirmation dialog before deleting a task">
            <Toggle checked={settings.confirmDelete} onChange={(v) => update('confirmDelete', v)} />
          </Row>
          <Row label="Auto-refresh tasks" desc="Automatically reload task list every 30 seconds">
            <Toggle checked={settings.autoRefresh} onChange={(v) => update('autoRefresh', v)} />
          </Row>
        </Section>

        {/* Security — change password */}
        <Section icon="🔐" title="Security">
          <Row label="Change password" desc="Update your account password">
            <button className="btn btn-sm btn-ghost" onClick={() => setShowPw(!showPw)}>
              {showPw ? 'Cancel' : 'Change'}
            </button>
          </Row>
          {showPw && (
            <form onSubmit={handleChangePassword} style={{ padding: '16px 0 4px' }}>
              {pwError && <div className="alert alert-error" style={{ marginBottom: '12px' }}>⚠️ {pwError}</div>}
              {[
                { key: 'current', placeholder: 'Current password' },
                { key: 'next',    placeholder: 'New password (min 8 chars, A-Z, 0-9, !@#$)' },
                { key: 'confirm', placeholder: 'Confirm new password' },
              ].map(({ key, placeholder }) => (
                <input key={key} type="password" className="form-input"
                  placeholder={placeholder}
                  value={pwForm[key]}
                  onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                  style={{ marginBottom: '10px' }}
                />
              ))}
              <button type="submit" className="btn btn-primary btn-sm" disabled={pwLoading}>
                {pwLoading ? 'Saving…' : 'Update Password'}
              </button>
            </form>
          )}
        </Section>

        {/* Danger zone */}
        <Section icon="⚠️" title="Danger Zone">
          <Row label="Reset settings" desc="Restore all preferences to defaults" danger>
            <button className="btn btn-sm"
              style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
              onClick={() => { localStorage.removeItem('settings'); window.location.reload(); }}
            >
              Reset
            </button>
          </Row>
        </Section>

      </div>
    </div>
  );
}
