import TaskForm from './TaskForm';

export default function TaskModal({ task, error, loading, onSave, onClose }) {
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{task ? '✏️ Edit Task' : '➕ New Task'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <TaskForm initial={task} onSubmit={onSave} onCancel={onClose} loading={loading} error={error} />
      </div>
    </div>
  );
}
