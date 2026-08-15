import { useEffect, useState } from "react";
import api from "../services/api";

export default function StudyPlan() {
  const [courses, setCourses] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ course_name: "", exam_date: "", study_hours: 2, difficulty: "medium" });
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState(null);

  const loadPlans = () => api.get("/study-plans").then((res) => setPlans(res.data));

  useEffect(() => {
    api.get("/courses").then((res) => setCourses(res.data));
    loadPlans();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setGenerating(true);
    try {
      const res = await api.post("/study-plans", form);
      setActivePlan(res.data.plan);
      loadPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate study plan.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/study-plans/${id}`);
    loadPlans();
  };

  return (
    <div className="page">
      <h1>AI Study Plan</h1>
      <p className="subtitle">Tell us about your exam and we'll generate a day-by-day plan.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="inline-form" onSubmit={handleGenerate}>
        <select name="course_name" value={form.course_name} onChange={handleChange} required>
          <option value="">Select a course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.course_name}>{c.course_name}</option>
          ))}
        </select>
        <input type="date" name="exam_date" value={form.exam_date} onChange={handleChange} required />
        <input type="number" name="study_hours" min="1" max="12" placeholder="Hours/day" value={form.study_hours} onChange={handleChange} required />
        <select name="difficulty" value={form.difficulty} onChange={handleChange}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button className="btn btn-primary" type="submit" disabled={generating || courses.length === 0}>
          {generating ? "Generating..." : "Generate Study Plan"}
        </button>
      </form>
      {courses.length === 0 && <p className="hint">Add a course first so you can generate a plan for it.</p>}

      {activePlan && (
        <div className="plan-result">
          <h2>{activePlan.courseName} — {activePlan.totalDays}-day plan</h2>
          <div className="plan-days">
            {activePlan.days.map((d) => (
              <div key={d.day} className="plan-day">
                <h4>Day {d.day}: {d.focus}</h4>
                <ul>
                  {d.tasks.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="section-title">Saved Plans</h2>
      {plans.length === 0 ? (
        <div className="empty-state">No study plans saved yet.</div>
      ) : (
        <div className="card-grid">
          {plans.map((p) => (
            <div key={p.id} className="course-card">
              <h3>{p.course_name}</h3>
              <p>Exam: {p.exam_date} · {p.study_hours}h/day · {p.difficulty}</p>
              <div className="card-actions">
                <button className="btn btn-outline" onClick={() => setActivePlan(p.plan_data)}>View</button>
                <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
