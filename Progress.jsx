import { useEffect, useState } from "react";
import api from "../services/api";

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/progress").then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p>Loading progress...</p></div>;

  return (
    <div className="page">
      <h1>Your Progress</h1>

      <div className="card-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.totalCourses}</span>
          <span className="stat-label">Total Courses</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalStudyPlans}</span>
          <span className="stat-label">Study Plans Created</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalQuizzesTaken}</span>
          <span className="stat-label">Quizzes Taken</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.avgQuizScore}%</span>
          <span className="stat-label">Avg. Quiz Score</span>
        </div>
      </div>

      <h2 className="section-title">Course Progress</h2>
      {stats.courses.length === 0 ? (
        <div className="empty-state">No courses yet.</div>
      ) : (
        <div className="progress-list">
          {stats.courses.map((c) => (
            <div key={c.id} className="progress-row">
              <span>{c.name}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${c.progress}%` }} />
              </div>
              <span>{c.progress}%</span>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Recent Quiz Results</h2>
      {stats.recentQuizResults.length === 0 ? (
        <div className="empty-state">No quiz attempts yet.</div>
      ) : (
        <ul className="quiz-history">
          {stats.recentQuizResults.map((r) => (
            <li key={r.id}>
              {r.score}/{r.total_questions} ({r.percentage}%) — {new Date(r.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
