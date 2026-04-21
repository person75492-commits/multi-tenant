import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EMPTY = { title: '', description: '', assignee: '', visibility: 'private' };
const TITLE_MAX = 200;
const DESC_MAX  = 1000;

export default function TaskForm({ initial = null, onSubmit, onCancel, loading, error }) {
  const { isAdmin, organization_id } = useAuth();
  const [form, setForm]             = useState(EMPTY);
  const [fieldError, setFieldError] = useState('');
  const [members, setMembers]       = useState([]);

  useEffect(() => {
    setForm(initial
      ? {
          title:       initial.title,
          description: initial.description || '',
          assignee:    initial.assignee?._id || '',
          visibility:  initial.visibility || 'private',
        }
      : EMPTY
    );
    setFieldError('');
  }, [initial]);

  // Load org members for assignee dropdown (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    api.get('/org/members')
      .then((res) => setMembers(res.data.data.members || []))
      .catch(() => {});
  }, [isAdmin]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (fieldError) setFieldError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim())                 return setFieldError('Title is required.');
    if (form.title.length > TITLE_MAX)      return setFieldError(`Title must be under ${TITLE_MAX} characters.`);
    if (form.description.length > DESC_MAX) return setFieldError(`Description must be under ${DESC_MAX} characters.`);
    onSubmit({
      title:       form.title.trim(),
      description: form.description.trim(),
      assignee:    form.visibility === 'private' ? (form.assignee || null) : null,
      visibility:  form.visibility,
    });
  };

  const titleLeft = TITLE_MAX - form.title.length;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {(error || fieldError) && (
        <div className="alert alert-error">⚠️ {error || fieldError}</div>
      )}

      <div className="form-group">
        <label className="form-label">Title <span className="required">*</span></label>
        <input
          className={`form-input${fieldError && !form.title.trim() ? ' error' : ''}`}
          placeholder="What needs to be done?"
          value={form.title}
          onChange={set('title')}
          maxLength={TITLE_MAX}
          autoFocus
        />
        <p className={`form-counter${titleLeft < 20 ? ' warn' : ''}`}>{titleLeft} characters remaining</p>
      </div>

      <div className="form-group">
        <label className="form-label">Description <span className="optional">(optional)</span></label>
        <textarea
          className="form-input form-textarea"
          placeholder="Add more details..."
          value={form.description}
          onChange={set('description')}
          maxLength={DESC_MAX}
          rows={3}
        />
      </div>

      {/* Assignee — admin only, only for private tasks */}
      {isAdmin && form.visibility === 'private' && members.length > 0 && (
        <div className="form-group">
          <label className="form-label">Assign to <span className="optional">(optional)</span></label>
          <select className="form-input" value={form.assignee} onChange={set('assignee')}>
            <option value="">— Unassigned (only admin sees) —</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
            ))}
          </select>
        </div>
      )}

      {/* Visibility — admin only */}
      {isAdmin && (
        <div className="form-group">
          <label className="form-label">Visibility</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { key: 'private', icon: '🔒', label: 'Private', desc: 'Only assigned member' },
              { key: 'public',  icon: '📢', label: 'Broadcast', desc: 'All org members' },
            ].map(({ key, icon, label, desc }) => (
              <label key={key} style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                border: `1.5px solid ${form.visibility === key ? 'var(--primary)' : 'var(--border)'}`,
                background: form.visibility === key ? 'var(--primary-light)' : 'var(--bg)',
                transition: 'all 0.15s',
              }}>
                <input type="radio" name="visibility" value={key}
                  checked={form.visibility === key}
                  onChange={() => setForm((f) => ({ ...f, visibility: key }))}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: form.visibility === key ? 'var(--primary)' : 'var(--text)' }}>
                    {icon} {label}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="modal-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
