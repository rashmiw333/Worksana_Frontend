
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { token, user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/tasks?myTasks=true",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch tasks.");
        }

        const taskList = Array.isArray(data) ? data : data.tasks;

        if (!Array.isArray(taskList)) {
          throw new Error("Unexpected task response from the server.");
        }

        setTasks(taskList);
      } catch (err) {
        setError(err.message || "Unable to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTasks();
    } else {
      setLoading(false);
      setError("Please log in to view your tasks.");
    }
  }, [token]);

  const counts = {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === "To Do").length,
    progress: tasks.filter((task) => task.status === "In Progress").length,
    completed: tasks.filter((task) => task.status === "Completed").length,
    blocked: tasks.filter((task) => task.status === "Blocked").length,
  };

  const cards = [
    { title: "Total Tasks", count: counts.total, color: "primary" },
    { title: "To Do", count: counts.todo, color: "secondary" },
    { title: "In Progress", count: counts.progress, color: "info" },
    { title: "Completed", count: counts.completed, color: "success" },
    { title: "Blocked", count: counts.blocked, color: "danger" },
  ];

  return (
    <>
      <Navbar />

      <div className="container py-4">
        <h2>Dashboard</h2>

        <p className="text-muted">
          Welcome back, {user?.name || "User"}!
        </p>

        {loading && <p>Loading dashboard...</p>}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Task Summary Cards */}
            <div className="row g-3 mt-2">
              {cards.map((card) => (
                <div className="col-12 col-sm-6 col-lg" key={card.title}>
                  <div className={`card border-${card.color} h-100`}>
                    <div className="card-body">
                      <h6 className="text-muted">{card.title}</h6>
                      <h2 className={`text-${card.color}`}>
                        {card.count}
                      </h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Assigned Tasks */}
            <div className="mt-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>My Assigned Tasks</h4>

                <Link to="/tasks" className="btn btn-primary btn-sm">
                  View All Tasks
                </Link>
              </div>

              {tasks.length === 0 ? (
                <div className="alert alert-info">
                  No tasks have been assigned to you yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Task Name</th>
                        <th>Project</th>
                        <th>Team</th>
                        <th>Due Date</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task._id}>
                          <td>{task.name}</td>

                          <td>{task.project?.name || "N/A"}</td>

                          <td>{task.team?.name || "N/A"}</td>

                          <td>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "N/A"}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                task.priority === "High"
                                  ? "bg-danger"
                                  : task.priority === "Medium"
                                  ? "bg-warning text-dark"
                                  : "bg-success"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                task.status === "Completed"
                                  ? "bg-success"
                                  : task.status === "In Progress"
                                  ? "bg-info text-dark"
                                  : task.status === "Blocked"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            >
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
