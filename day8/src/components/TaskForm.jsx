import { useState } from "react";

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (title.trim() === "") {
      alert("Please enter a task.");
      return;
    }

    onAddTask(title.trim());

    setTitle("");
  };

  return (
    <form
      className="task-form"
      onSubmit={handleSubmit}
    >

      <input
        type="text"
        placeholder="Enter a new task..."
        value={title}
        onChange={(event) =>
          setTitle(event.target.value)
        }
      />

      <button type="submit">
        + Add Task
      </button>

    </form>
  );
}

export default TaskForm;