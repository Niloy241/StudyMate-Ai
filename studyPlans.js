const express = require("express");
const db = require("../database/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// Simple rule-based generator so the feature works fully offline.
// Splits the time between exam date and today into a study plan whose
// intensity/tasks-per-day scale with difficulty and available hours.
function generatePlan(courseName, examDate, studyHours, difficulty) {
  const today = new Date();
  const exam = new Date(examDate);
  let totalDays = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
  if (totalDays < 1) totalDays = 1;
  if (totalDays > 21) totalDays = 21; // cap so a "small" plan stays readable

  const taskBank = {
    easy: ["Read core notes", "Watch a short recap video", "Do 5 practice questions"],
    medium: ["Study key concepts in depth", "Summarize notes in your own words", "Do 10 practice questions"],
    hard: ["Deep-dive difficult topics", "Work through past exam papers", "Do 15 practice questions"],
  };
  const diff = (difficulty || "medium").toLowerCase();
  const tasks = taskBank[diff] || taskBank.medium;

  const tasksPerDay = studyHours >= 4 ? 3 : studyHours >= 2 ? 2 : 1;

  const days = [];
  for (let i = 1; i <= totalDays; i++) {
    const isLastDay = i === totalDays;
    const isRevisionDay = i > totalDays - 2 && totalDays > 3;

    let dayTasks;
    if (isLastDay) {
      dayTasks = ["Final revision of all topics", "Review past mistakes", "Light practice, rest well"];
    } else if (isRevisionDay) {
      dayTasks = ["Revise weak areas", "Take a self-test / mock quiz", "Review incorrect answers"];
    } else {
      dayTasks = tasks.slice(0, tasksPerDay);
    }

    days.push({
      day: i,
      focus: isLastDay ? "Final review" : isRevisionDay ? "Revision & self-test" : `${courseName} study session`,
      tasks: dayTasks,
    });
  }

  return { courseName, examDate, studyHours, difficulty: diff, totalDays, days };
}

router.post("/", (req, res) => {
  const { course_name, exam_date, study_hours, difficulty } = req.body;

  if (!course_name || !exam_date || !study_hours || !difficulty) {
    return res.status(400).json({ message: "Course, exam date, study hours and difficulty are all required." });
  }

  const plan = generatePlan(course_name, exam_date, Number(study_hours), difficulty);

  const result = db
    .prepare(
      "INSERT INTO study_plans (user_id, course_name, exam_date, study_hours, difficulty, plan_data) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(req.userId, course_name, exam_date, study_hours, difficulty, JSON.stringify(plan));

  res.status(201).json({
    message: "Study plan generated successfully!",
    planId: result.lastInsertRowid,
    plan,
  });
});

router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM study_plans WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.userId);
  const plans = rows.map((r) => ({ ...r, plan_data: JSON.parse(r.plan_data) }));
  res.json(plans);
});

router.get("/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM study_plans WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ message: "Study plan not found." });
  res.json({ ...row, plan_data: JSON.parse(row.plan_data) });
});

router.delete("/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM study_plans WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ message: "Study plan not found." });
  db.prepare("DELETE FROM study_plans WHERE id = ?").run(req.params.id);
  res.json({ message: "Study plan deleted successfully!" });
});

module.exports = router;
