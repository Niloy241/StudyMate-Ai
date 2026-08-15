const express = require("express");
const db = require("../database/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

router.get("/", (req, res) => {
  const courses = db.prepare("SELECT * FROM courses WHERE user_id = ?").all(req.userId);
  const quizResults = db
    .prepare("SELECT * FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.userId);
  const studyPlans = db.prepare("SELECT * FROM study_plans WHERE user_id = ?").all(req.userId);

  const totalCourses = courses.length;
  const avgCourseProgress = totalCourses
    ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCourses)
    : 0;

  const avgQuizScore = quizResults.length
    ? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length)
    : 0;

  res.json({
    totalCourses,
    totalStudyPlans: studyPlans.length,
    totalQuizzesTaken: quizResults.length,
    avgQuizScore,
    overallProgress: avgCourseProgress,
    courses: courses.map((c) => ({ id: c.id, name: c.course_name, progress: c.progress })),
    recentQuizResults: quizResults.slice(0, 5),
  });
});

module.exports = router;
