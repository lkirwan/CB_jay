import { useState } from 'react';
import { useStore } from '../hooks/useStore';
import StarRating from '../components/StarRating';

export default function ClientPage() {
  const { data, addOffering, addRating } = useStore();
  const [offeringId, setOfferingId] = useState('');
  const [newOfferingName, setNewOfferingName] = useState('');
  const [showNewOffering, setShowNewOffering] = useState(false);
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleCreateOffering(e) {
    e.preventDefault();
    if (!newOfferingName.trim()) return;
    const offering = addOffering(newOfferingName);
    setOfferingId(offering.id);
    setNewOfferingName('');
    setShowNewOffering(false);
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
    setOfferingId('');
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
            <div className="offering-select-row">
              <select
                id="offering-select"
                className="form-select"
                value={offeringId}
                onChange={(e) => setOfferingId(e.target.value)}
              >
                <option value="">-- Select an offering --</option>
                {data.offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowNewOffering((v) => !v)}
              >
                + New
              </button>
            </div>

            {showNewOffering && (
              <div className="new-offering-row">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Offering name"
                  value={newOfferingName}
                  onChange={(e) => setNewOfferingName(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleCreateOffering}
                  disabled={!newOfferingName.trim()}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowNewOffering(false)}
                >
                  Cancel
                </button>
              </div>
            )}
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
