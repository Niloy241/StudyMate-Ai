import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const link = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

  return (
    <nav className="navbar">
      <div className="navbar-brand">📚 StudyMate AI</div>
      <div className="navbar-links">
        <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
        <NavLink to="/courses" className={link}>Courses</NavLink>
        <NavLink to="/study-plan" className={link}>AI Study Plan</NavLink>
        <NavLink to="/quiz" className={link}>Quiz</NavLink>
        <NavLink to="/progress" className={link}>Progress</NavLink>
      </div>
      <div className="navbar-user">
        <span>Hi, {user?.name}</span>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
