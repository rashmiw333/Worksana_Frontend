import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Tasks = () => {
  const { token } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:5000/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
      setError("Please log in to view tasks.");
    }
  }, [token]);

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      status === "All" || task.status === status;

    const matchesPriority =
      priority === "All" || task.priority === priority;

    return matchesStatus && matchesPriority;
  });

  return (
    <>
      <Navbar />

      <div className="container py-4">
        <h2 className="mb-4">Tasks</h2>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label htmlFor="status" className="form-label">
              Filter by Status
            </label>

            <select
              id="status"
              className="form-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="priority" className="form-label">
              Filter by Priority
            </label>

            <select
              id="priority"
              className="form-select"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {loading && <p>Loading tasks...</p>}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {!loading && !error && (
          <>
            <p className="text-muted">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>

            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-dark">
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
                  {filteredTasks.map((task) => (
                    <tr key={task._id}>
                      <td>{task.name}</td>
                      <td>
                        {task.project?.name || "Not available"}
                      </td>
                      <td>
                        {task.team?.name || "Not available"}
                      </td>
                      <td>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "Not set"}
                      </td>
                      <td>{task.priority}</td>
                      <td>{task.status}</td>
                    </tr>
                  ))}

                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Tasks;
