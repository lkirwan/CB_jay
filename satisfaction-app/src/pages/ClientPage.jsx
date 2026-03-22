import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import StarRating from '../components/StarRating';

export default function ClientPage() {
  const { data, addRating } = useStore();
  const activeOfferings = data.offerings.filter((o) => (o.status ?? 'active') === 'active');
  const [offeringId, setOfferingId] = useState('');
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Auto-select when there is exactly one active offering
  useEffect(() => {
    if (activeOfferings.length === 1) {
      setOfferingId(activeOfferings[0].id);
    }
  }, [activeOfferings.length, activeOfferings[0]?.id]);

  // Show dialog when no active offerings exist
  if (activeOfferings.length === 0) {
    return (
      <div className="page-center">
        <div className="card no-offerings-card">
          <div className="no-offerings-icon">🔔</div>
          <h2>No Offerings Available</h2>
          <p>There are no offerings available to rate at this time.</p>
          <p className="no-offerings-sub">
            Please check back later, or contact your manager to set up offerings.
          </p>
          <Link to="/login" className="btn btn-outline no-offerings-link">
            Manager Login →
          </Link>
        </div>
      </div>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!offeringId) {
      setError('Please select an offering.');
      return;
    }
    if (score === 0) {
      setError('Please select a star rating.');
      return;
    }
    addRating(offeringId, score, username);
    setSubmitted(true);
  }

  function handleReset() {
    setOfferingId(activeOfferings.length === 1 ? activeOfferings[0].id : '');
    setScore(0);
    setUsername('');
    setSubmitted(false);
    setError('');
  }

  if (submitted) {
    const offering = data.offerings.find((o) => o.id === offeringId);
    return (
      <div className="page-center">
        <div className="card success-card">
          <div className="success-icon">✅</div>
          <h2>Thank you!</h2>
          <p>
            Your <strong>{score}-star</strong> rating for <strong>{offering?.name}</strong> has been
            recorded.
          </p>
          {username && <p className="submitted-by">Submitted by: {username}</p>}
          <button className="btn btn-primary" onClick={handleReset}>
            Submit Another Rating
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="card">
        <h2 className="card-title">Rate Your Experience</h2>
        <p className="card-subtitle">Share your satisfaction with one of our offerings</p>

        <form onSubmit={handleSubmit} className="rating-form">
          {/* Offering selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="offering-select">
              Offering <span className="required">*</span>
            </label>
            <select
              id="offering-select"
              className="form-select"
              value={offeringId}
              onChange={(e) => setOfferingId(e.target.value)}
            >
                <option value="">-- Select an offering --</option>
                {activeOfferings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Star rating */}
          <div className="form-group">
            <label className="form-label">
              Satisfaction Rating <span className="required">*</span>
            </label>
            <StarRating value={score} onChange={setScore} size="lg" />
            {score > 0 && (
              <p className="score-label">
                {['', 'Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'][score]}
              </p>
            )}
          </div>

          {/* Optional username */}
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Your Name <span className="optional">(optional)</span>
            </label>
            <input
              id="username"
              className="form-input"
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={100}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full">
            Submit Rating
          </button>
        </form>
      </div>
    </div>
  );
}
