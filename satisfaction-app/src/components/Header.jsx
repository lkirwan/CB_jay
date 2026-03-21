import { NavLink } from 'react-router-dom';

export default function Header() {
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
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Manager Dashboard
        </NavLink>
      </nav>
    </header>
  );
}
