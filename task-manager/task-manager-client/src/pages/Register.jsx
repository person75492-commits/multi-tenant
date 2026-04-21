import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buildUserFromToken } from '../utils/tokenUtils';
import { checks, getStrength } from '../utils/passwordStrength';
import api from '../services/api';

export default function Register() {
  const [mode, setMode]         = useState('admin'); // 'admin' | 'member'
  const [form, setForm]         = useState({ orgName: '', inviteCode: '', name: '', email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [inviteCode, setInviteCode] = useState(''); // shown after admin registers
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (mode === 'admin' && !form.orgName.trim()) e.orgName = 'Organization name is required.';
    if (mode === 'member' && !form.inviteCode.trim()) e.inviteCode = 'Invite code is required.';
    if (!form.name.trim())    e.name     = 'Your name is required.';
    if (!form.email.trim())   e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password)       e.password = 'Password is required.';
    else if (form.password.length < 8)              e.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(form.password))          e.password = 'Must contain at least one uppercase letter.';
    else if (!/[a-z]/.test(form.password))          e.password = 'Must contain at least one lowercase letter.';
    else if (!/[0-9]/.test(form.password))          e.password = 'Must contain at least one number.';
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) e.password = 'Must contain at least one special character.';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) return setErrors(fieldErrors);
    setLoading(true);
    try {
      const endpoint = mode === 'admin' ? '/auth/register/admin' : '/auth/register/member';
      const payload  = mode === 'admin'
        ? { orgName: form.orgName, name: form.name, email: form.email, password: form.password }
        : { inviteCode: form.inviteCode, name: form.name, email: form.email, password: form.password };

      const res   = await api.post(endpoint, payload);
      const token = res.data.token;
      const user  = buildUserFromToken(token, res.data.data.user);
      saveAuth(token, user);

      // Show invite code to admin before redirecting
      if (mode === 'admin' && res.data.data.organization?.inviteCode) {
        setInviteCode(res.data.data.organization.inviteCode);
      } else {
        navigate('/');
      }
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || err.message || 'Registration failed.';
      setApiError(status === 409 ? 'An account with this email already exists.' : msg);
    } finally {
      setLoading(false);
    }
  };

  // After admin registers — show invite code screen
  if (inviteCode) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎉</p>
          <h1 className="auth-title">Organization created!</h1>
          <p className="auth-sub" style={{ marginBottom: '20px' }}>
            Share this invite code with your team members so they can join your organization.
          </p>
          <div style={{
            background: 'var(--primary-light)', border: '2px dashed var(--primary)',
            borderRadius: '10px', padding: '20px', marginBottom: '20px',
          }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '8px' }}>INVITE CODE</p>
            <code style={{
              display: 'block', fontSize: '0.85rem', fontFamily: 'monospace',
              fontWeight: 700, color: 'var(--primary)', letterSpacing: '2px',
              wordBreak: 'break-all', lineHeight: 1.8,
            }}>
              {inviteCode.match(/.{1,8}/g)?.join(' ')}
            </code>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
            onClick={() => navigate('/')}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f4f4f8', borderRadius: '8px', padding: '4px' }}>
          {[
            { key: 'admin',  label: '👑 Create Organization' },
            { key: 'member', label: '👤 Join Organization' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setMode(key); setErrors({}); setApiError(''); }}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem',
                background: mode === key ? '#fff' : 'transparent',
                color: mode === key ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: mode === key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="auth-sub">
          {mode === 'admin'
            ? 'Create a new organization and become its admin.'
            : 'Enter the invite code your admin shared with you.'}
        </p>

        {apiError && <div className="alert alert-error" role="alert">⚠️ {apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Admin: org name | Member: invite code */}
          {mode === 'member' ? (
            <div className="form-group">
              <label className="form-label">Invite code <span className="required">*</span></label>
              <input
                type="text"
                className={`form-input${errors.inviteCode ? ' error' : ''}`}
                placeholder="Paste the 32-character code from your admin"
                value={form.inviteCode}
                onChange={handleChange('inviteCode')}
                style={{ textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                maxLength={32}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              {errors.inviteCode && <p className="field-error">{errors.inviteCode}</p>}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                Ask your admin to share the invite code from their dashboard.
              </p>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Organization name <span className="required">*</span></label>
              <input
                type="text"
                className={`form-input${errors.orgName ? ' error' : ''}`}
                placeholder="Acme Inc"
                value={form.orgName}
                onChange={handleChange('orgName')}
              />
              {errors.orgName && <p className="field-error">{errors.orgName}</p>}
            </div>
          )}

          {/* Common fields */}
          {[
            { key: 'name',  label: 'Your name',     type: 'text',  placeholder: 'John Doe' },
            { key: 'email', label: 'Email address',  type: 'email', placeholder: 'you@example.com' },
          ].map(({ key, label, type, placeholder }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label} <span className="required">*</span></label>
              <input
                type={type}
                className={`form-input${errors[key] ? ' error' : ''}`}
                placeholder={placeholder}
                value={form[key]}
                onChange={handleChange(key)}
                autoComplete={key === 'email' ? 'email' : 'off'}
              />
              {errors[key] && <p className="field-error">{errors[key]}</p>}
            </div>
          ))}

          {/* Password with strength meter */}
          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <div className="pass-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                className={`form-input${errors.password ? ' error' : ''}`}
                placeholder="Min. 8 chars, uppercase, number, symbol"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="new-password"
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}

            {/* Strength bar */}
            {form.password && (() => {
              const strength = getStrength(form.password);
              return (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    {[0,1,2,3,4].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: i <= strength.level ? strength.color : 'var(--border)',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600, marginBottom: '6px' }}>
                    {strength.label}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {checks.map((c) => (
                      <span key={c.id} style={{
                        fontSize: '0.7rem', padding: '2px 7px', borderRadius: '20px',
                        background: c.test(form.password) ? '#d1fae5' : 'var(--bg)',
                        color: c.test(form.password) ? '#065f46' : 'var(--text-faint)',
                        border: `1px solid ${c.test(form.password) ? '#6ee7b7' : 'var(--border)'}`,
                      }}>
                        {c.test(form.password) ? '✓' : '○'} {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : mode === 'admin' ? 'Create Organization' : 'Join Organization'}
          </button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
