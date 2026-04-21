import { useState, useEffect } from 'react';

const EMPTY = { title: '', description: '' };
const TITLE_MAX = 200;
const DESC_MAX  = 1000;

export default function TaskForm({ initial = null, onSubmit, onCancel, loading, error }) {
  const [form, setForm]       = useState(EMPTY);
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    setForm(initial ? { title: initial.title, description: initial.description || '' } : EMPTY);
    setFieldError('');
  }, [initial]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (fieldError) setFieldError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim())                return setFieldError('Title is required.');
    if (form.title.length > TITLE_MAX)     return setFieldError(`Title must be under ${TITLE_MAX} characters.`);
    if (form.description.length > DESC_MAX) return setFieldError(`Description must be under ${DESC_MAX} characters.`);
    onSubmit({ title: form.title.trim(), description: form.description.trim() });
  };

  const titleLeft = TITLE_MAX - form.title.length;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {(error || fieldError) && (
        <div className="alert alert-error">⚠️ {error || fieldError}</div>
      )}

      <div className="form-group">
        <label className="form-label">
          Title <span className="required">*</span>
        </label>
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
        <label className="form-label">
          Description <span className="optional">(optional)</span>
        </label>
        <textarea
          className="form-input form-textarea"
          placeholder="Add more details..."
          value={form.description}
          onChange={set('description')}
          maxLength={DESC_MAX}
          rows={3}
        />
      </div>

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
