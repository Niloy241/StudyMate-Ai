const express = require("express");
const db = require("../database/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET all courses for the logged-in user
router.get("/", (req, res) => {
  const courses = db
    .prepare("SELECT * FROM courses WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.userId);
  res.json(courses);
});

// GET single course
router.get("/:id", (req, res) => {
  const course = db
    .prepare("SELECT * FROM courses WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);
  if (!course) return res.status(404).json({ message: "Course not found." });
  res.json(course);
});

// CREATE course
router.post("/", (req, res) => {
  const { course_name, course_code, description } = req.body;
  if (!course_name) {
    return res.status(400).json({ message: "Course name is required." });
  }
  const result = db
    .prepare(
      "INSERT INTO courses (user_id, course_name, course_code, description, progress) VALUES (?, ?, ?, ?, 0)"
    )
    .run(req.userId, course_name, course_code || "", description || "");
  res.status(201).json({ message: "Course added successfully!", courseId: result.lastInsertRowid });
});

// UPDATE course
router.put("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM courses WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ message: "Course not found." });

  const { course_name, course_code, description, progress } = req.body;
  db.prepare(
    "UPDATE courses SET course_name = ?, course_code = ?, description = ?, progress = ? WHERE id = ?"
  ).run(
    course_name ?? existing.course_name,
    course_code ?? existing.course_code,
    description ?? existing.description,
    progress ?? existing.progress,
    req.params.id
  );
  res.json({ message: "Course updated successfully!" });
});

// DELETE course
router.delete("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM courses WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ message: "Course not found." });

  db.prepare("DELETE FROM courses WHERE id = ?").run(req.params.id);
  res.json({ message: "Course deleted successfully!" });
});

module.exports = router;
