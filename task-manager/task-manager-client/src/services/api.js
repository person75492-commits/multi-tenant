import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      // Network error — no server response at all
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    if (err.response.status === 401) {
      // Expired / invalid token — clear auth and redirect via React Router
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use event so AuthContext can react without a hard reload
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const login    = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// ── Tasks ─────────────────────────────────────────────────────
export const getTasks   = (params)   => api.get('/tasks', { params });
export const getTask    = (id)       => api.get(`/tasks/${id}`);
export const createTask = (data)     => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id)       => api.delete(`/tasks/${id}`);

// ── Org ───────────────────────────────────────────────────────
export const getInviteCode = () => api.get('/org/invite-code');

export default api;
