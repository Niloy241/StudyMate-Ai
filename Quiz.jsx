import { useEffect, useState } from "react";
import api from "../services/api";

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/quiz")
      .then((res) => setQuestions(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (qId, optionIndex) => {
    setAnswers({ ...answers, [qId]: optionIndex });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (Object.keys(answers).length < questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }
    try {
      const res = await api.post("/quiz/submit", { answers });
      setResult(res.data);
    } catch {
      setError("Could not submit quiz.");
    }
  };

  const retake = () => {
    setResult(null);
    setAnswers({});
  };

  if (loading) return <div className="page"><p>Loading quiz...</p></div>;

  return (
    <div className="page">
      <h1>Quiz</h1>
      <p className="subtitle">Test your study habits knowledge.</p>
      {error && <div className="alert alert-error">{error}</div>}

      {!result ? (
        <form onSubmit={handleSubmit} className="quiz-form">
          {questions.map((q, idx) => (
            <div key={q.id} className="quiz-question">
              <h4>{idx + 1}. {q.question}</h4>
              <div className="quiz-options">
                {q.options.map((opt, i) => (
                  <label key={i} className={"quiz-option" + (answers[q.id] === i ? " selected" : "")}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === i}
                      onChange={() => handleSelect(q.id, i)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button className="btn btn-primary" type="submit">Submit Quiz</button>
        </form>
      ) : (
        <div className="quiz-result">
          <h2>Score: {result.score}/{result.total} ({result.percentage}%)</h2>
          <div className="quiz-review">
            {result.results.map((r, idx) => (
              <div key={r.id} className={"quiz-question" + (r.correct ? " correct" : " incorrect")}>
                <h4>{idx + 1}. {r.question}</h4>
                <p>Your answer: {r.selectedAnswer !== null ? r.options[r.selectedAnswer] : "—"}</p>
                {!r.correct && <p>Correct answer: {r.options[r.correctAnswer]}</p>}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={retake}>Retake Quiz</button>
        </div>
      )}
    </div>
  );
}
