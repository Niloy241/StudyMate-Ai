import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = { course_name: "", course_code: "", description: "", progress: 0 };

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadCourses = () => {
    setLoading(true);
    api
      .get("/courses")
      .then((res) => setCourses(res.data))
      .catch(() => setError("Could not load courses."))
      .finally(() => setLoading(false));
  };

  useEffect(loadCourses, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, form);
      } else {
        await api.post("/courses", form);
      }
      resetForm();
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save course.");
    }
  };

  const handleEdit = (course) => {
    setForm({
      course_name: course.course_name,
      course_code: course.course_code || "",
      description: course.description || "",
      progress: course.progress || 0,
    });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      loadCourses();
    } catch {
      setError("Could not delete course.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your Courses</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm((s) => !s); }}>
          {showForm ? "Cancel" : "+ Add Course"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <input name="course_name" placeholder="Course name" value={form.course_name} onChange={handleChange} required />
          <input name="course_code" placeholder="Course code (optional)" value={form.course_code} onChange={handleChange} />
          <input name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />
          <label className="range-label">
            Progress: {form.progress}%
            <input type="range" name="progress" min="0" max="100" value={form.progress} onChange={handleChange} />
          </label>
          <button className="btn btn-primary" type="submit">{editingId ? "Update Course" : "Save Course"}</button>
        </form>
      )}

      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <div className="empty-state">No courses yet. Add your first course to get started!</div>
      ) : (
        <div className="card-grid">
          {courses.map((c) => (
            <div key={c.id} className="course-card">
              <h3>{c.course_name}</h3>
              {c.course_code && <span className="badge">{c.course_code}</span>}
              {c.description && <p>{c.description}</p>}
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${c.progress}%` }} />
              </div>
              <span className="progress-text">{c.progress}% complete</span>
              <div className="card-actions">
                <button className="btn btn-outline" onClick={() => handleEdit(c)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
