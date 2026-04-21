import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { buildUserFromToken } from '../utils/tokenUtils';

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { saveAuth } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from || '/';

  const validate = () => {
    const e = {};
    if (!form.email.trim())                    e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email.';
    if (!form.password)                        e.password = 'Password is required.';
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
      const res   = await login(form);
      const token = res.data.token;

      // Decode JWT to extract user_id, role, organization_id
      // Merge with API response fields (name, email) for a complete user object
      const user  = buildUserFromToken(token, res.data.data.user);

      // Store token + user object in localStorage via AuthContext
      saveAuth(token, user);
      navigate(from, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401)      setApiError('Invalid email or password.');
      else if (status === 422) setApiError('Please enter a valid email and password.');
      else                     setApiError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Login to your account</p>

        {apiError && <div className="alert alert-error" role="alert">⚠️ {apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-input${errors.email ? ' error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              autoComplete="email"
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pass-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                className={`form-input${errors.password ? ' error' : ''}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="current-password"
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">No account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
}
