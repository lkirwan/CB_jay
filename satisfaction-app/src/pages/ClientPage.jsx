import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { offeringsApi, ratingsApi } from '../lib/api';

export default function ClientPage() {
  const [activeOfferings, setActiveOfferings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offeringId, setOfferingId] = useState('');
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    offeringsApi.listActive()
      .then((offerings) => {
        if (!isMounted) return;
        setActiveOfferings(offerings);
        if (offerings.length === 1) {
          setOfferingId(offerings[0].id);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Unable to load offerings.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);


  if (isLoading) {
    return (
      <div className="page-center">
        <div className="card no-offerings-card">
          <h2>Loading Offerings…</h2>
          <p>Please wait while available offerings are loaded.</p>
        </div>
      </div>
    );
  }

  if (error && activeOfferings.length === 0) {
    return (
      <div className="page-center">
        <div className="card no-offerings-card">
          <div className="no-offerings-icon">⚠️</div>
          <h2>Unable to Load Offerings</h2>
          <p>{error}</p>
          <p className="no-offerings-sub">Please try again in a moment or contact your facilitator.</p>
          <Link to="/login" className="btn btn-outline no-offerings-link">
            Facilitator Login →
          </Link>
        </div>
      </div>
    );
  }

  // Show dialog when no active offerings exist
  if (activeOfferings.length === 0) {
    return (
      <div className="page-center">
        <div className="card no-offerings-card">
          <div className="no-offerings-icon">🔔</div>
          <h2>No Offerings Available</h2>
          <p>There are no offerings available to rate at this time.</p>
          <p className="no-offerings-sub">
            Please check back later, or contact your facilitator to set up offerings.
          </p>
          <Link to="/login" className="btn btn-outline no-offerings-link">
            Facilitator Login →
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

    ratingsApi.create({ offeringId, score, username })
      .then(() => {
        setSubmitted(true);
      })
      .catch((err) => {
        setError(err.message || 'Unable to submit your rating.');
      });
  }

  function handleReset() {
    setOfferingId(activeOfferings.length === 1 ? activeOfferings[0].id : '');
    setScore(0);
    setUsername('');
    setSubmitted(false);
    setError('');
  }

  if (submitted) {
    const offering = activeOfferings.find((o) => o.id === offeringId);
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
