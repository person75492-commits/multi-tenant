import { useAuth } from '../context/AuthContext';
import { toast } from './Toast';
import { updateTask } from '../services/taskService';

const AUTH_ERROR = 'You are not authorized to perform this action.';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     emoji: '🕐', color: '#f59e0b', bg: '#fef3c7' },
  in_progress: { label: 'In Progress', emoji: '⚡', color: '#3b82f6', bg: '#dbeafe' },
  completed:   { label: 'Completed',   emoji: '✅', color: '#10b981', bg: '#d1fae5' },
};

export default function TaskCard({ task, onDelete, onEdit, onStatusChange, isEditing = false, isDeleting = false, compact = false }) {
  const { isAdmin, userId } = useAuth();

  const creatorId   = task.created_by?._id ?? task.created_by;
  const isOwnTask   = String(creatorId) === String(userId);
  const canMutate   = isAdmin || isOwnTask;
  const canChangeStatus = true; // everyone can change status on visible tasks

  const guardedEdit = () => {
    if (!canMutate) { toast.error(AUTH_ERROR); return; }
    onEdit(task);
  };

  const guardedDelete = () => {
    if (!canMutate) { toast.error(AUTH_ERROR); return; }
    onDelete(task._id, task.title);
  };

  const handleStatusChange = async (e) => {
    if (!canChangeStatus) { toast.error(AUTH_ERROR); return; }
    const newStatus = e.target.value;
    try {
      const res = await updateTask(task._id, {
        title: task.title,
        description: task.description,
        status: newStatus,
      });
      onStatusChange?.(res.data.data.task);
      toast.success(`Status updated to "${STATUS_CONFIG[newStatus].label}"`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;

  const cardClass = [
    'task-card',
    isEditing  ? 'editing'  : '',
    isDeleting ? 'deleting' : '',
    compact    ? 'compact'  : '',
    task.status === 'completed' ? 'task-completed' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className="task-card-header">
        <div className="task-title-row">
          {isEditing  && <span className="tag tag-editing">Editing</span>}
          {isDeleting && <span className="tag tag-deleting">Deleting…</span>}
          {!isAdmin && !isOwnTask && <span className="tag tag-readonly">👁️ View only</span>}
          {task.visibility === 'public' && <span className="tag" style={{ background: '#dbeafe', color: '#1d4ed8' }}>📢 Broadcast</span>}
          <h3 className="task-title" style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.6 : 1 }}>
            {task.title}
          </h3>
        </div>

        <div className="task-actions">
          {/* Status dropdown — all members can change status */}
          {canChangeStatus && (
            <select
              value={task.status || 'pending'}
              onChange={handleStatusChange}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: `1.5px solid ${status.color}`,
                background: status.bg,
                color: status.color,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
              title="Change status"
            >
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.emoji} {val.label}</option>
              ))}
            </select>
          )}

          {/* Status badge for view-only */}
          {!canChangeStatus && (
            <span style={{ padding: '4px 10px', borderRadius: '20px', background: status.bg, color: status.color, fontSize: '0.72rem', fontWeight: 700 }}>
              {status.emoji} {status.label}
            </span>
          )}

          {canMutate && (
            <>
              <button
                className={`btn btn-sm ${isEditing ? 'btn-primary' : ''}`}
                style={isEditing ? {} : { background: 'var(--primary-light)', color: 'var(--primary)' }}
                onClick={guardedEdit}
                disabled={isDeleting}
                title="Edit task"
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-sm"
                style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                onClick={guardedDelete}
                disabled={isDeleting}
                title="Delete task"
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      {!compact && task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        <span>👤 {task.created_by?.name || 'Unknown'}</span>
        {task.assignee && (
          <span>📌 Assigned to: <strong>{task.assignee.name}</strong></span>
        )}
        <span>🕒 {new Date(task.createdAt).toLocaleDateString('en-GB')}</span>
      </div>
    </div>
  );
}
