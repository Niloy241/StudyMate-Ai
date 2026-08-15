import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../services/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/progress")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1>Welcome back, {user?.name} 👋</h1>
      <p className="subtitle">Here's a snapshot of your study progress.</p>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="card-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.totalCourses}</span>
            <span className="stat-label">Courses</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalStudyPlans}</span>
            <span className="stat-label">Active Study Plans</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.avgQuizScore}%</span>
            <span className="stat-label">Avg. Quiz Score</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.overallProgress}%</span>
            <span className="stat-label">Overall Progress</span>
          </div>
        </div>
      )}

      <h2 className="section-title">Quick Actions</h2>
      <div className="card-grid">
        <Link to="/courses" className="action-card">📘 Manage Courses</Link>
        <Link to="/study-plan" className="action-card">🧠 Generate AI Study Plan</Link>
        <Link to="/quiz" className="action-card">📝 Take a Quiz</Link>
        <Link to="/progress" className="action-card">📊 View Progress</Link>
      </div>
    </div>
  );
}
