
import { useCallback, useEffect, useState } from "react";
import Register from "./components/register.jsx";
import Login from "./components/login.jsx";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [page, setPage] = useState("register");
  const [profilePage, setProfilePage] = useState("dashboard");
  const [user, setUser] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  // Password reset state. Declared only once.
  const [resetToken, setResetToken] = useState("");

  // Read a password-reset token from the email link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken");

    if (token) {
      setResetToken(token);
      setPage("reset-password");
    }
  }, []);

  // Handle API responses and show useful error messages.
  const getErrorMessage = async (response) => {
    try {
      const data = await response.json();
      return data.detail || data.message || "Something went wrong.";
    } catch {
      return "Unable to communicate with the server.";
    }
  };

  // Load saved tasks whenever the logged-in user changes.
  const loadTasks = useCallback(async (userId) => {
    if (!userId) {
      setTasks([]);
      return;
    }

    setLoadingTasks(true);
    setTaskError("");

    try {
      const response = await fetch(
        `${API_URL}/tasks/${encodeURIComponent(userId)}`
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      setTaskError(
        error.message || "Could not load your saved tasks."
      );
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadTasks(user.id);
    } else {
      setTasks([]);
    }
  }, [user?.id, loadTasks]);

  // Registration
  const handleRegister = () => {
    setUser(null);
    setTasks([]);
    setHistory([]);
    setProfilePage("dashboard");
    setPage("login");
  };

  // Login
  const handleLogin = (loginData) => {
    if (!loginData?.id) {
      setTaskError(
        "Login did not return a user ID. Please check the login response."
      );
      return;
    }

    setTasks([]);
    setHistory([]);
    setTaskError("");
    setProfilePage("dashboard");
    setUser(loginData);
    setPage("home");
  };

  // Return to login and remove any reset token from the URL.
  const handleBackToLogin = () => {
    setResetToken("");
    window.history.replaceState({}, "", window.location.pathname);
    setPage("login");
  };

  // Add a task to PostgreSQL.
  const addTask = async (title) => {
    if (!user?.id) {
      setTaskError("Please log in before adding a task.");
      return;
    }

    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setSavingTask(true);
    setTaskError("");

    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          title: cleanTitle,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const savedTask = await response.json();

      setTasks((previousTasks) => [
        savedTask,
        ...previousTasks,
      ]);
    } catch (error) {
      setTaskError(error.message || "Could not save the task.");
    } finally {
      setSavingTask(false);
    }
  };

  // Update task fields in PostgreSQL.
  const updateTask = async (id, changes) => {
    if (!user?.id) return;

    setTaskError("");

    try {
      const response = await fetch(
        `${API_URL}/tasks/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            ...changes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const updatedTask = await response.json();

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );

      return updatedTask;
    } catch (error) {
      setTaskError(error.message || "Could not update the task.");
      await loadTasks(user.id);
      return null;
    }
  };

  // Complete or uncomplete a task.
  const toggleTask = async (id) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const updated = await updateTask(id, {
      completed: !task.completed,
    });

    if (updated && updated.completed) {
      setHistory((previousHistory) => [
        {
          ...updated,
          action: "Completed",
          date: new Date().toLocaleString(),
        },
        ...previousHistory,
      ]);
    }
  };

  // Mark or unmark a task as important.
  const toggleImportant = async (id) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    await updateTask(id, {
      important: !task.important,
    });
  };

  // Delete a task from PostgreSQL.
  const deleteTask = async (id) => {
    if (!user?.id) return;

    const taskToDelete = tasks.find((item) => item.id === id);
    if (!taskToDelete) return;

    setTaskError("");

    try {
      const response = await fetch(
        `${API_URL}/tasks/${encodeURIComponent(id)}?user_id=${encodeURIComponent(user.id)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id)
      );

      setHistory((previousHistory) => [
        {
          ...taskToDelete,
          action: "Deleted",
          date: new Date().toLocaleString(),
        },
        ...previousHistory,
      ]);
    } catch (error) {
      setTaskError(error.message || "Could not delete the task.");
    }
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    setHistory([]);
    setTaskError("");
    setProfilePage("dashboard");
    setPage("register");
  };

  // Forgot Password page
  if (page === "forgot-password") {
    return (
      <ForgotPassword
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Reset Password page
  if (page === "reset-password") {
    return (
      <ResetPassword
        token={resetToken}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Registration page
  if (page === "register") {
    return (
      <Register
        onRegister={handleRegister}
        onLoginClick={() => setPage("login")}
      />
    );
  }

  // Login page
  if (page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onBackToRegister={() => setPage("register")}
        onForgotPassword={() => setPage("forgot-password")}
      />
    );
  }

  // Dashboard and other home pages
  return (
    <div className="home-page">
      {/* HEADER */}
      <header className="home-header">
        <div>
          <h1>DOKI</h1>
          <p>Task Manager</p>
        </div>

        <button
          className="profile-open-button"
          onClick={() => setProfilePage("profile")}
        >
          👤 Profile
        </button>
      </header>

      {/* HOME LAYOUT */}
      <div className="home-layout">
        {/* PROFILE SIDEBAR */}
        <Profile
          user={user}
          tasks={tasks}
          history={history}
          activePage={profilePage}
          setActivePage={setProfilePage}
          onLogout={handleLogout}
        />

        {/* MAIN CONTENT */}
        <main className="home-content">
          {taskError && (
            <div className="task-error" role="alert">
              <p>{taskError}</p>
              <button onClick={() => setTaskError("")}>
                Dismiss
              </button>
            </div>
          )}

          {loadingTasks && (
            <p>Loading your saved tasks...</p>
          )}

          {/* DASHBOARD */}
          {profilePage === "dashboard" && (
            <>
              <h2>Dashboard</h2>

              <div className="welcome-card">
                <h3>
                  Welcome
                  {user?.username ? `, ${user.username}` : ""}!
                </h3>
                <p>Manage your tasks easily with DOKI.</p>
              </div>

              <TaskForm onAddTask={addTask} />

              {savingTask && <p>Saving task...</p>}

              <div className="stats-container">
                <div className="stat-card">
                  <h3>{tasks.length}</h3>
                  <p>Total Tasks</p>
                </div>

                <div className="stat-card">
                  <h3>
                    {tasks.filter((task) => task.completed).length}
                  </h3>
                  <p>Completed</p>
                </div>

                <div className="stat-card">
                  <h3>
                    {tasks.filter((task) => !task.completed).length}
                  </h3>
                  <p>Currently Doing</p>
                </div>

                <div className="stat-card">
                  <h3>
                    {tasks.filter((task) => task.important).length}
                  </h3>
                  <p>Important</p>
                </div>
              </div>

              <div className="dashboard-tasks">
                <h2>My Tasks</h2>

                <TaskList
                  tasks={tasks}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onToggleImportant={toggleImportant}
                />
              </div>
            </>
          )}

          {/* IMPORTANT TASKS */}
          {profilePage === "important" && (
            <>
              <h2>⭐ Important Tasks</h2>

              <TaskList
                tasks={tasks.filter((task) => task.important)}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onToggleImportant={toggleImportant}
              />
            </>
          )}

          {/* COMPLETED TASKS */}
          {profilePage === "completed" && (
            <>
              <h2>✅ Completed Tasks</h2>

              <TaskList
                tasks={tasks.filter((task) => task.completed)}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onToggleImportant={toggleImportant}
              />
            </>
          )}

          {/* CURRENTLY DOING */}
          {profilePage === "current" && (
            <>
              <h2>🔄 Currently Doing</h2>

              <TaskForm onAddTask={addTask} />

              {savingTask && <p>Saving task...</p>}

              <TaskList
                tasks={tasks.filter((task) => !task.completed)}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onToggleImportant={toggleImportant}
              />
            </>
          )}

          {/* TASK HISTORY */}
          {profilePage === "history" && (
            <>
              <h2>📜 Task History</h2>

              {history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No history yet</h3>
                  <p>
                    Tasks completed or deleted during this session
                    will appear here.
                  </p>
                </div>
              ) : (
                <div className="history-list">
                  {history.map((item, index) => (
                    <div
                      className="history-card"
                      key={`${item.id}-${item.action}-${index}`}
                    >
                      <h3>{item.title}</h3>
                      <p>
                        Action: <strong>{item.action}</strong>
                      </p>
                      <p>Date: {item.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* PROFILE DETAILS */}
          {profilePage === "profile" && (
            <>
              <h2>👤 My Profile</h2>

              <div className="user-details-card">
                <div className="profile-avatar">
                  {user?.username
                    ? user.username.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <h3>{user?.username || "User"}</h3>

                <div className="detail-row">
                  <strong>Username</strong>
                  <span>{user?.username || "Not available"}</span>
                </div>

                <div className="detail-row">
                  <strong>Email</strong>
                  <span>{user?.email || "Not available"}</span>
                </div>

                <div className="detail-row">
                  <strong>Password</strong>
                  <span>••••••••</span>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
