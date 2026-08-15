const express = require("express");
const db = require("../database/db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// Small static general-study question bank (kept in code to keep the
// project "small" — swap for a DB-backed bank later if needed).
const QUESTIONS = [
  {
    id: 1,
    question: "What is the most effective way to review material long-term?",
    options: ["Cramming the night before", "Spaced repetition", "Rereading once", "Ignoring weak topics"],
    answer: 1,
  },
  {
    id: 2,
    question: "Which technique helps identify weak areas before an exam?",
    options: ["Self-testing / practice quizzes", "Watching TV", "Skipping revision", "Studying only strong topics"],
    answer: 0,
  },
  {
    id: 3,
    question: "What should a good study plan scale with?",
    options: ["Random guessing", "Available time and difficulty", "Only the exam date", "Nothing, one plan fits all"],
    answer: 1,
  },
  {
    id: 4,
    question: "Why break topics into smaller daily tasks?",
    options: ["It looks nicer", "It reduces overwhelm and improves retention", "It takes longer", "It has no benefit"],
    answer: 1,
  },
  {
    id: 5,
    question: "What's a good final-day activity before an exam?",
    options: ["Learning brand-new topics", "Light revision and rest", "Studying all night", "Skipping review"],
    answer: 1,
  },
];

// GET quiz questions (answers stripped so they aren't visible client-side)
router.get("/", (req, res) => {
  const safeQuestions = QUESTIONS.map(({ id, question, options }) => ({ id, question, options }));
  res.json(safeQuestions);
});

// POST submit answers: { course_id?, course_name?, answers: { [questionId]: selectedIndex } }
router.post("/submit", (req, res) => {
  const { course_id, course_name, answers } = req.body;
  if (!answers || typeof answers !== "object") {
    return res.status(400).json({ message: "Answers are required." });
  }

  let score = 0;
  const results = QUESTIONS.map((q) => {
    const selected = answers[q.id];
    const correct = selected === q.answer;
    if (correct) score++;
    return {
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.answer,
      selectedAnswer: selected ?? null,
      correct,
    };
  });

  const total = QUESTIONS.length;
  const percentage = Math.round((score / total) * 100);

  db.prepare(
    "INSERT INTO quiz_results (user_id, course_id, course_name, score, total_questions, percentage) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(req.userId, course_id || null, course_name || null, score, total, percentage);

  res.json({ message: "Quiz submitted successfully!", score, total, percentage, results });
});

router.get("/results", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.userId);
  res.json(rows);
});

module.exports = router;
