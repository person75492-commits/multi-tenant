import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import InviteCodePanel from '../components/InviteCodePanel';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { toast } from '../components/Toast';
import { useLogout } from '../hooks/useLogout';
import { sounds } from '../utils/sound';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line" style={{ width: '55%' }} />
      <div className="skeleton-line" style={{ width: '85%', height: '11px', marginTop: '10px' }} />
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin, userId } = useAuth();
  const { settings } = useSettings();
  const handleLogout = useLogout();

  // Helper — respects user's sound + notification preferences
  const notify = (message, type = 'success') => {
    if (settings.notificationsEnabled) toast[type](message);
    if (settings.soundEnabled) {
      if (type === 'success') sounds.success();
      else sounds.error();
    }
  };

  const [tasks, setTasks]               = useState([]);
  const [pagination, setPagination]     = useState({});
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [showModal, setShowModal]       = useState(false);
  const [editTask, setEditTask]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [saveError, setSaveError]       = useState('');
  const [saving, setSaving]             = useState(false);
  const [confirmId, setConfirmId]       = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [deleting, setDeleting]         = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTasks({ page, limit: 10, search });
      setTasks(res.data.data.tasks);
      setPagination(res.data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [page, search, isAdmin, userId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Show a warning toast 60s before session expires
  useEffect(() => {
    const handle = () => {
      if (settings.notificationsEnabled)
        toast.error('⏰ Your session expires in 60 seconds. Save your work.');
      if (settings.soundEnabled) sounds.notify();
    };
    window.addEventListener('auth:expiring', handle);
    return () => window.removeEventListener('auth:expiring', handle);
  }, [settings]);

  const handleSave = async (form) => {
    setSaveError('');
    setSaving(true);
    try {
      if (editTask) {
        const res = await updateTask(editTask._id, form);
        const updated = res.data.data.task;
        setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        notify('Task updated.');
      } else {
        await createTask(form);
        notify('Task created.');
        fetchTasks();
      }
      setShowModal(false);
      setEditTask(null);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, title) => { setConfirmId(id); setConfirmTitle(title); };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    const snapshot = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== confirmId));
    try {
      await deleteTask(confirmId);
      if (settings.soundEnabled) sounds.delete();
      if (settings.notificationsEnabled) toast.success('Task deleted.');
      setConfirmId(null);
    } catch (err) {
      setTasks(snapshot);
      setError(err.response?.data?.message || 'Failed to delete task.');
      setConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => { setEditTask(null); setSaveError(''); setShowModal(true); };
  const openEdit   = (task) => { setEditTask(task); setSaveError(''); setShowModal(true); };

  return (
    <div className="dashboard">
      <div className="dashboard-container">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{isAdmin ? 'My Tasks' : 'Tasks'}</h1>
            <div className="dashboard-sub">
              <span>Hello, <strong>{user?.name}</strong> ({user?.role})</span>
              <span className={`role-badge ${user?.role}`}>
                {isAdmin ? '👑 Admin' : '👤 Member'}
              </span>
              {isAdmin && <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>· all org tasks</span>}
              {!loading && tasks.length > 0 && (
                <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>
                  · {pagination.total ?? tasks.length} task{(pagination.total ?? tasks.length) !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={openCreate}>+ New Task</button>
            <button className="btn btn-ghost" onClick={handleLogout} title="Logout">
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Invite code panel — admin only */}
        {isAdmin && <InviteCodePanel />}

        {/* Search */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error alert-justify" role="alert">
            <span>⚠️ {error}</span>
            <button className="btn btn-danger btn-sm" onClick={fetchTasks}>Retry</button>
          </div>
        )}

        {/* Skeleton */}
        {loading && !error && <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>}

        {/* Empty */}
        {!loading && !error && tasks.length === 0 && (
          <div className="empty-state">
            <p className="empty-icon">📋</p>
            <p className="empty-title">{search ? 'No tasks match your search.' : 'No tasks yet.'}</p>
            {!search && <button className="btn btn-primary" onClick={openCreate}>+ Create your first task</button>}
          </div>
        )}

        {/* Task list */}
        {!loading && tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onDelete={handleDelete}
            onEdit={openEdit}
            onStatusChange={(updated) => setTasks((prev) => prev.map((t) => t._id === updated._id ? updated : t))}
            isEditing={editTask?._id === task._id}
            isDeleting={deleting && confirmId === task._id}
            compact={settings.compactView}
          />
        ))}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.totalPages}
              <span className="pagination-count"> ({pagination.total} tasks)</span>
            </span>
            <button className="btn btn-ghost btn-sm" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal task={editTask} error={saveError} loading={saving} onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTask(null); setSaveError(''); }} />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${confirmTitle}"? This cannot be undone.`}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
