function Profile({
  user,
  tasks,
  history,
  activePage,
  setActivePage,
  onLogout,
}) {
  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const currentTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  const importantTasks = tasks.filter(
    (task) => task.important
  ).length;

  return (
    <aside className="profile-sidebar">

      {/* PROFILE HEADER */}

      <div className="sidebar-profile">

        <div className="profile-circle">
          {user?.username
            ? user.username
                .charAt(0)
                .toUpperCase()
            : "U"}
        </div>

        <h3>
          {user?.username || "User"}
        </h3>

        <p>
          {user?.email || "No email"}
        </p>

      </div>

      {/* MENU */}

      <nav className="profile-menu">

        <button
          className={
            activePage === "dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("dashboard")
          }
        >
          📊 Dashboard
        </button>

        <button
          className={
            activePage === "important"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("important")
          }
        >
          ⭐ Important Tasks
          <span>
            {importantTasks}
          </span>
        </button>

        <button
          className={
            activePage === "completed"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("completed")
          }
        >
          ✅ Completed Tasks
          <span>
            {completedTasks}
          </span>
        </button>

        <button
          className={
            activePage === "current"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("current")
          }
        >
          🔄 Currently Doing
          <span>
            {currentTasks}
          </span>
        </button>

        <button
          className={
            activePage === "history"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("history")
          }
        >
          📜 History
          <span>
            {history.length}
          </span>
        </button>

        <button
          className={
            activePage === "profile"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("profile")
          }
        >
          👤 My Profile
        </button>

      </nav>

      {/* LOGOUT */}

      <button
        className="sidebar-logout"
        onClick={onLogout}
      >
        🚪 Logout
      </button>

    </aside>
  );
}

export default Profile;