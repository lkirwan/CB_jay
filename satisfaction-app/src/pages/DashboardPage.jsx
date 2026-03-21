import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import StarRating from '../components/StarRating';

function OfferingCard({ offering, ratings }) {
  const [expanded, setExpanded] = useState(false);
  const offeringRatings = ratings.filter((r) => r.offeringId === offering.id);
  const avg =
    offeringRatings.length > 0
      ? offeringRatings.reduce((sum, r) => sum + r.score, 0) / offeringRatings.length
      : null;
  const roundedAvg = avg !== null ? Math.round(avg * 10) / 10 : null;

  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: offeringRatings.filter((r) => r.score === star).length,
  }));

  return (
    <div className="offering-card">
      <div className="offering-card-header" onClick={() => setExpanded((v) => !v)}>
        <div className="offering-info">
          <h3 className="offering-name">{offering.name}</h3>
          <span className="offering-count">{offeringRatings.length} rating{offeringRatings.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="offering-score">
          {roundedAvg !== null ? (
            <>
              <span className="avg-score">{roundedAvg}</span>
              <StarRating value={Math.round(roundedAvg)} size="sm" readOnly />
            </>
          ) : (
            <span className="no-ratings">No ratings yet</span>
          )}
          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="offering-card-body">
          {offeringRatings.length === 0 ? (
            <p className="empty-message">No ratings have been submitted for this offering yet.</p>
          ) : (
            <>
              {/* Distribution bar chart */}
              <div className="distribution">
                <h4>Rating Distribution</h4>
                {[...distribution].reverse().map(({ star, count }) => {
                  const pct = offeringRatings.length > 0 ? (count / offeringRatings.length) * 100 : 0;
                  return (
                    <div key={star} className="dist-row">
                      <span className="dist-label">{star}★</span>
                      <div className="dist-bar-bg">
                        <div className="dist-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="dist-count">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Recent individual ratings */}
              <div className="recent-ratings">
                <h4>Recent Ratings</h4>
                <table className="ratings-table">
                  <thead>
                    <tr>
                      <th>Score</th>
                      <th>Name</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...offeringRatings]
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 10)
                      .map((r) => (
                        <tr key={r.id}>
                          <td>
                            <StarRating value={r.score} size="sm" readOnly />
                          </td>
                          <td>{r.username || <em className="anonymous">Anonymous</em>}</td>
                          <td>{new Date(r.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data, addOffering } = useStore();
  const [newName, setNewName] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const id = setInterval(() => setLastUpdated(new Date()), 3000);
    return () => clearInterval(id);
  }, []);

  function handleAddOffering(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    addOffering(newName);
    setNewName('');
  }

  const totalRatings = data.ratings.length;
  const overallAvg =
    totalRatings > 0
      ? data.ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
      : null;

  const sortedOfferings = [...data.offerings].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'alpha') return a.name.localeCompare(b.name);
    if (sortBy === 'score') {
      const aRatings = data.ratings.filter((r) => r.offeringId === a.id);
      const bRatings = data.ratings.filter((r) => r.offeringId === b.id);
      const aAvg = aRatings.length > 0 ? aRatings.reduce((s, r) => s + r.score, 0) / aRatings.length : 0;
      const bAvg = bRatings.length > 0 ? bRatings.reduce((s, r) => s + r.score, 0) / bRatings.length : 0;
      return bAvg - aAvg;
    }
    return 0;
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Manager Dashboard</h2>
          <p className="last-updated">
            Live · Last refreshed {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{data.offerings.length}</span>
          <span className="stat-label">Total Offerings</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalRatings}</span>
          <span className="stat-label">Total Ratings</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {overallAvg !== null ? overallAvg.toFixed(1) : '—'}
          </span>
          <span className="stat-label">Overall Avg Score</span>
        </div>
      </div>

      {/* Add offering */}
      <div className="card add-offering-card">
        <h3>Add New Offering</h3>
        <form className="add-offering-form" onSubmit={handleAddOffering}>
          <input
            className="form-input"
            type="text"
            placeholder="Offering name (e.g. Product A, Service B)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={200}
          />
          <button type="submit" className="btn btn-primary" disabled={!newName.trim()}>
            Add Offering
          </button>
        </form>
      </div>

      {/* Offerings list */}
      <div className="offerings-section">
        <div className="offerings-header">
          <h3>All Offerings</h3>
          {data.offerings.length > 1 && (
            <div className="sort-controls">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="alpha">Alphabetical</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          )}
        </div>

        {data.offerings.length === 0 ? (
          <div className="empty-state">
            <p>No offerings yet. Add one above or have a client submit a rating with a new offering.</p>
          </div>
        ) : (
          <div className="offerings-list">
            {sortedOfferings.map((o) => (
              <OfferingCard key={o.id} offering={o} ratings={data.ratings} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
