import { useState, useEffect, useCallback } from 'react';
import StarRating from '../components/StarRating';
import { offeringsApi, ratingsApi } from '../lib/api';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OfferingCard({ offering, ratings, onToggleStatus }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = offering.status === 'active';
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
    <div className={`offering-card ${!isActive ? 'offering-card--closed' : ''}`}>
      <div className="offering-card-header" onClick={() => setExpanded((v) => !v)}>
        <div className="offering-info">
          <div className="offering-name-row">
            <h3 className="offering-name">{offering.name}</h3>
            <span className={`status-badge status-badge--${isActive ? 'active' : 'closed'}`}>
              {isActive ? 'Active' : 'Closed'}
            </span>
          </div>
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
          <button
            type="button"
            className={`btn btn-sm ${isActive ? 'btn-ghost' : 'btn-outline'} status-toggle-btn`}
            onClick={(e) => { e.stopPropagation(); onToggleStatus(offering.id, isActive ? 'closed' : 'active'); }}
            title={isActive ? 'Close this offering' : 'Re-open this offering'}
          >
            {isActive ? 'Close' : 'Re-open'}
          </button>
          <span className="expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="offering-card-body">
          <div className="offering-details">
            <h4>Offering Details</h4>
            <div className="offering-detail-grid">
              <div className="offering-detail-item">
                <span className="offering-detail-label">Start Date</span>
                <span className="offering-detail-value">{formatDateTime(offering.startDate || offering.createdAt)}</span>
              </div>
              <div className="offering-detail-item">
                <span className="offering-detail-label">Closed Date</span>
                <span className="offering-detail-value">{formatDateTime(offering.closedDate)}</span>
              </div>
            </div>
          </div>

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
  const [offerings, setOfferings] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [newName, setNewName] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sortBy, setSortBy] = useState('recent');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    const [nextOfferings, nextRatings] = await Promise.all([
      offeringsApi.listAll(),
      ratingsApi.listAll(),
    ]);
    setOfferings(nextOfferings);
    setRatings(nextRatings);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadDashboard()
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load dashboard data.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const id = setInterval(() => {
      loadDashboard().catch(() => {});
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [loadDashboard]);

  async function handleAddOffering(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setError('');
      await offeringsApi.create(newName);
      setNewName('');
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Unable to create offering.');
    }
  }

  async function handleToggleStatus(id, status) {
    try {
      setError('');
      await offeringsApi.updateStatus(id, status);
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Unable to update offering status.');
    }
  }

  if (isLoading) {
    return (
      <div className="page-center">
        <div className="card login-card">
          <h2 className="card-title">Loading dashboard…</h2>
          <p className="card-subtitle">Fetching offerings and ratings from the API.</p>
        </div>
      </div>
    );
  }

  const totalRatings = ratings.length;
  const overallAvg =
    totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
      : null;

  const activeCount = offerings.filter((o) => o.status === 'active').length;
  const closedCount = offerings.filter((o) => o.status === 'closed').length;

  const filteredOfferings = offerings.filter((o) => {
    if (statusFilter === 'active') return o.status === 'active';
    if (statusFilter === 'closed') return o.status === 'closed';
    return true;
  });

  const sortedOfferings = [...filteredOfferings].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt);
    if (sortBy === 'alpha') return a.name.localeCompare(b.name);
    if (sortBy === 'score') {
      const aRatings = ratings.filter((r) => r.offeringId === a.id);
      const bRatings = ratings.filter((r) => r.offeringId === b.id);
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
          <h2 className="dashboard-title">Facilitator Dashboard</h2>
          <p className="last-updated">
            Live · Last refreshed {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {error && <p className="form-error dashboard-error">{error}</p>}
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{activeCount}</span>
          <span className="stat-label">Active Offerings</span>
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
          <div className="offerings-header-top">
            <h3>All Offerings</h3>
            {offerings.length > 1 && (
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
          <div className="status-tabs">
            {[
              { key: 'all', label: `All (${offerings.length})` },
              { key: 'active', label: `Active (${activeCount})` },
              { key: 'closed', label: `Closed (${closedCount})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`status-tab ${statusFilter === key ? 'status-tab--active' : ''}`}
                onClick={() => setStatusFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredOfferings.length === 0 ? (
          <div className="empty-state">
            <p>
              {offerings.length === 0
                ? 'No offerings yet. Add one above.'
                : `No ${statusFilter} offerings.`}
            </p>
          </div>
        ) : (
          <div className="offerings-list">
            {sortedOfferings.map((o) => (
              <OfferingCard key={o.id} offering={o} ratings={ratings} onToggleStatus={handleToggleStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
