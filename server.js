require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./database/db"); // creates the DB + tables on startup

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const studyPlanRoutes = require("./routes/studyPlans");
const quizRoutes = require("./routes/quiz");
const progressRoutes = require("./routes/progress");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/progress", progressRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StudyMate Mini backend running on http://localhost:${PORT}`);
});
