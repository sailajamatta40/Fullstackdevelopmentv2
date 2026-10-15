function TaskItem({
  task,
  onToggle,
  onDelete,
  onToggleImportant,
}) {
  return (
    <div
      className={`task-item ${
        task.completed ? "completed-task" : ""
      }`}
    >

      <div className="task-left">

        {/* Complete button */}
        <button
          type="button"
          className={`complete-button ${
            task.completed ? "completed" : ""
          }`}
          onClick={() => onToggle(task.id)}
          title={
            task.completed
              ? "Mark as incomplete"
              : "Mark as completed"
          }
        >
          {task.completed ? "✓" : ""}
        </button>

        {/* Task title */}
        <span className="task-title">
          {task.title}
        </span>

      </div>

      <div className="task-actions">

        {/* Important */}
        <button
          type="button"
          className={
            task.important
              ? "important active-important"
              : "important"
          }
          onClick={() =>
            onToggleImportant(task.id)
          }
          title="Important"
        >
          ⭐
        </button>

        {/* Delete */}
        <button
          type="button"
          className="delete-button"
          onClick={() =>
            onDelete(task.id)
          }
          title="Delete"
        >
          🗑️
        </button>

      </div>

    </div>
  );
}

export default TaskItem;