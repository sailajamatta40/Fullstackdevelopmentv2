import TaskItem from "./TaskItem";

function TaskList({
  tasks,
  onToggle,
  onDelete,
  onToggleImportant,
}) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">

        <div className="empty-icon">
          📝
        </div>

        <h3>
          No tasks found
        </h3>

        <p>
          There are no tasks in this section.
        </p>

      </div>
    );
  }

  return (
    <div className="task-list">

      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onToggleImportant={
            onToggleImportant
          }
        />
      ))}

    </div>
  );
}

export default TaskList;