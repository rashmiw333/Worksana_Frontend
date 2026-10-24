
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
        const response = await fetch("http://localhost:5000/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch tasks.");
        }

        // Supports either an array response or { tasks: [...] }.
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

            <div className="mt-4">
              <Link to="/tasks" className="btn btn-primary">
                View All Tasks
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
