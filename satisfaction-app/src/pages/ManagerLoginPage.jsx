import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ManagerLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/dashboard';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small artificial delay to deter brute-force
    setTimeout(() => {
      const ok = login(password);
      setLoading(false);
      if (ok) {
        navigate(from, { replace: true });
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    }, 400);
  }

  return (
    <div className="page-center">
      <div className="card login-card">
        <div className="login-icon">🔐</div>
        <h2 className="card-title">Manager Login</h2>
        <p className="card-subtitle">Enter your manager password to access the dashboard</p>

        <form onSubmit={handleSubmit} className="rating-form">
          <div className="form-group">
            <label className="form-label" htmlFor="manager-password">
              Password
            </label>
            <input
              id="manager-password"
              className="form-input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!password || loading}
          >
            {loading ? 'Checking…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

