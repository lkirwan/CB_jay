import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="header-logo">⭐</span>
        <span className="header-title">CB Jay</span>
        <span className="header-sub">Satisfaction Tracker</span>
      </div>
      <nav className="header-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Submit Rating
        </NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Facilitator Dashboard
            </NavLink>
            <button className="btn btn-sm header-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </nav>
    </header>
  );
}
