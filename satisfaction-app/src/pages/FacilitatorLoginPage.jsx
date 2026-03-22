import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FacilitatorLoginPage() {
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

    login(password)
      .then(() => {
        navigate(from, { replace: true });
      })
      .catch((err) => {
        setError(err.message || 'Incorrect password. Please try again.');
        setPassword('');
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="page-center">
      <div className="card login-card">
        <div className="login-icon">🔐</div>
        <h2 className="card-title">Facilitator Login</h2>
        <p className="card-subtitle">Enter your facilitator password to access the dashboard</p>

        <form onSubmit={handleSubmit} className="rating-form">
          <div className="form-group">
            <label className="form-label" htmlFor="facilitator-password">
              Password
            </label>
            <input
              id="facilitator-password"
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


