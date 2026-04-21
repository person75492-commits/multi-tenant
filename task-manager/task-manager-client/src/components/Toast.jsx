import { useState, useEffect, useCallback } from 'react';

// Simple singleton toast — import { toast } and call toast.show(msg, type)
let _setToasts = null;

export const toast = {
  show: (message, type = 'success') => {
    if (_setToasts) {
      const id = Date.now();
      _setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        _setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    }
  },
  success: (msg) => toast.show(msg, 'success'),
  error:   (msg) => toast.show(msg, 'error'),
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!toasts.length) return null;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {toasts.map(({ id, message, type }) => (
        <div
          key={id}
          onClick={() => dismiss(id)}
          style={{
            background: type === 'success' ? '#27ae60' : '#e74c3c',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            maxWidth: '320px',
            animation: 'slideUp 0.2s ease',
          }}
        >
          {type === 'success' ? '✅' : '❌'} {message}
        </div>
      ))}
    </div>
  );
}
