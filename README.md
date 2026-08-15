# StudyMate AI — Mini

A small, fully working full-stack student study-management app: register/login,
manage courses, generate an AI-style (rule-based) study plan, take a quiz, and
track progress — all backed by a real SQLite database.

This is a trimmed-down version of a bigger spec: it keeps every core feature
working end-to-end (real auth, real CRUD, real generated + stored study plans,
real quiz scoring) but drops extras like a separate Topics module and a
question-bank admin UI to keep the codebase small and easy to read in one
sitting.

## Features

- **Auth** — register/login with bcrypt-hashed passwords and JWT sessions
- **Courses** — full CRUD, each course scoped to its owner
- **AI Study Plan** — enter a course, exam date, daily study hours and
  difficulty; a rule-based generator builds a day-by-day plan (capped at 21
  days) and saves it to the database
- **Quiz** — a short multiple-choice quiz, auto-scored, with results stored
  per user
- **Progress** — dashboard stats calculated live from the database (course
  progress, average quiz score, plans created, etc.)

## Tech stack

- **Frontend:** React + Vite, React Router, Axios
- **Backend:** Node.js + Express
- **Database:** SQLite via `better-sqlite3`
- **Auth:** bcrypt + JSON Web Tokens

## Project structure

```
StudyMate-Mini/
├── backend/
│   ├── database/db.js        # creates SQLite file + tables on startup
│   ├── middleware/auth.js    # JWT verification middleware
│   ├── routes/                # auth, courses, studyPlans, quiz, progress
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, ProtectedRoute
│   │   ├── pages/              # Login, Register, Dashboard, Courses, ...
│   │   ├── services/           # api.js (Axios), AuthContext.jsx
│   │   ├── App.jsx, main.jsx, index.css
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

## Setup & running

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:5000`. The SQLite database file
(`backend/database/studymate.db`) is created automatically the first time you
start the server — no manual migration step needed.

`.env` (already included with dev defaults — change `JWT_SECRET` for anything
beyond local testing):

```
JWT_SECRET=studymate_mini_dev_secret_change_me
PORT=5000
```

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and talks to the backend at
`http://localhost:5000/api` (see `frontend/src/services/api.js`).

## API overview

| Method | Endpoint                  | Auth | Description                     |
|--------|----------------------------|------|----------------------------------|
| POST   | /api/auth/register          | No   | Create an account                |
| POST   | /api/auth/login              | No   | Log in, returns JWT              |
| GET    | /api/courses                 | Yes  | List your courses                |
| POST   | /api/courses                 | Yes  | Create a course                  |
| GET    | /api/courses/:id             | Yes  | Get one course                   |
| PUT    | /api/courses/:id             | Yes  | Update a course                  |
| DELETE | /api/courses/:id             | Yes  | Delete a course                  |
| POST   | /api/study-plans             | Yes  | Generate + save a study plan     |
| GET    | /api/study-plans             | Yes  | List your saved study plans      |
| GET    | /api/study-plans/:id          | Yes  | Get one study plan               |
| DELETE | /api/study-plans/:id          | Yes  | Delete a study plan              |
| GET    | /api/quiz                     | Yes  | Get quiz questions (no answers)  |
| POST   | /api/quiz/submit              | Yes  | Submit answers, get score        |
| GET    | /api/quiz/results             | Yes  | List your past quiz attempts     |
| GET    | /api/progress                 | Yes  | Aggregate progress stats         |

All authenticated routes expect `Authorization: Bearer <token>`.

## Testing it out

1. Start the backend, then the frontend.
2. Open `http://localhost:5173` → you're redirected to **Register**.
3. Create an account → you land on the **Dashboard**.
4. Add a course or two on the **Courses** page.
5. Go to **AI Study Plan**, pick a course, an exam date, hours/day and
   difficulty, then generate — the plan is saved and listed below.
6. Take the **Quiz** and submit to see your score and per-question review.
7. Check **Progress** to see live stats pulled from the database.

## Git / GitHub

```bash
git init
git add .
git commit -m "Initial commit: StudyMate AI mini"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `.env`, `dist/`, and the
generated SQLite database file.
