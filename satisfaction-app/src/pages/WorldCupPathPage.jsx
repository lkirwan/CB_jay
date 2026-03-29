// FIFA World Cup 2026 — Paths to BC Place Vancouver, July 7 (Round of 16, Match 96)
//
// Match 96 = W85 vs W87
//   R32 Match 85 (July 2, Vancouver): 1B  vs  best 3rd from E/F/G/I/J
//   R32 Match 87 (July 3, Kansas City): 1K  vs  best 3rd from D/E/I/J/L
//
// Probability model (simplified, equal-strength teams):
//   P(finish 1st in group)    = 25%
//   P(finish 3rd in group)    = 25%
//   P(qualify as top-8 3rd)   = 8/12 ≈ 66.7%
//   P(assigned to target R32) = 1 / (# slots the group can fill)
//   P(win R32 match)          = 50%

// How many R32 slots each group's 3rd-place can fill
const SLOT_COUNTS = { A: 2, B: 2, C: 3, D: 4, E: 7, F: 5, G: 3, H: 4, I: 7, J: 5, K: 2, L: 1 };

function pct3rd(group, matchSlot) {
  const slots = SLOT_COUNTS[group];
  const p = 0.25 * (8 / 12) * (1 / slots) * 0.5;
  return Math.round(p * 1000) / 10; // one decimal
}

const GROUPS = {
  B: { teams: ['Canada', 'Qatar', 'Switzerland', 'UEFA Path A Winner'] },
  D: { teams: ['USA', 'Australia', 'Paraguay', 'UEFA Path C Winner'] },
  E: { teams: ['Germany', 'Ivory Coast', 'Ecuador', 'Curaçao'] },
  F: { teams: ['Japan', 'Netherlands', 'Tunisia', 'UEFA Path B Winner'] },
  G: { teams: ['Belgium', 'Egypt', 'Iran', 'New Zealand'] },
  I: { teams: ['France', 'Norway', 'Senegal', 'IC Path 2 Winner'] },
  J: { teams: ['Algeria', 'Argentina', 'Austria', 'Jordan'] },
  K: { teams: ['Colombia', 'IC Path 1 Winner', 'Portugal', 'Uzbekistan'] },
  L: { teams: ['Croatia', 'England', 'Ghana', 'Panama'] },
};

// Paths structured as: { label, position, r32match, r32venue, r32date, r32opponent, probability }
function buildPaths() {
  const paths = [];

  // --- Side 1: winner of R32 Match 85 ---

  // 1. Group B winner → R32 Match 85 at Vancouver
  GROUPS.B.teams.forEach((team) => {
    paths.push({
      team,
      group: 'B',
      side: 1,
      position: '1st',
      r32num: 85,
      r32date: 'July 2, 2026',
      r32venue: 'BC Place, Vancouver',
      r32opponent: 'Best 3rd-place team from Groups E, F, G, I, or J',
      probability: 12.5,
      note: null,
    });
  });

  // 2. 3rd from Groups E, F, G, I, J → R32 Match 85 at Vancouver
  [
    { group: 'E', label: 'E' },
    { group: 'F', label: 'F' },
    { group: 'G', label: 'G' },
    { group: 'I', label: 'I' },
    { group: 'J', label: 'J' },
  ].forEach(({ group }) => {
    GROUPS[group].teams.forEach((team) => {
      paths.push({
        team,
        group,
        side: 1,
        position: '3rd',
        r32num: 85,
        r32date: 'July 2, 2026',
        r32venue: 'BC Place, Vancouver',
        r32opponent: 'Group B Winner (Canada, Qatar, Switzerland, or UEFA Path A Winner)',
        probability: pct3rd(group, 85),
        note: 'Must also qualify as one of the 8 best 3rd-place teams',
      });
    });
  });

  // --- Side 2: winner of R32 Match 87 ---

  // 3. Group K winner → R32 Match 87 at Kansas City
  GROUPS.K.teams.forEach((team) => {
    paths.push({
      team,
      group: 'K',
      side: 2,
      position: '1st',
      r32num: 87,
      r32date: 'July 3, 2026',
      r32venue: 'GEHA Field at Arrowhead Stadium, Kansas City',
      r32opponent: 'Best 3rd-place team from Groups D, E, I, J, or L',
      probability: 12.5,
      note: null,
    });
  });

  // 4. 3rd from Groups D, E, I, J, L → R32 Match 87 at Kansas City
  [
    { group: 'D' },
    { group: 'E' },
    { group: 'I' },
    { group: 'J' },
    { group: 'L' },
  ].forEach(({ group }) => {
    GROUPS[group].teams.forEach((team) => {
      paths.push({
        team,
        group,
        side: 2,
        position: '3rd',
        r32num: 87,
        r32date: 'July 3, 2026',
        r32venue: 'GEHA Field at Arrowhead Stadium, Kansas City',
        r32opponent: 'Group K Winner (Colombia, IC Path 1 Winner, Portugal, or Uzbekistan)',
        probability: pct3rd(group, 87),
        note: 'Must also qualify as one of the 8 best 3rd-place teams',
      });
    });
  });

  return paths;
}

const ALL_PATHS = buildPaths();

// Group paths by team name (some teams have 2 paths)
function groupByTeam(paths) {
  const map = new Map();
  paths.forEach((p) => {
    if (!map.has(p.team)) map.set(p.team, []);
    map.get(p.team).push(p);
  });
  return map;
}

const TEAM_PATHS = groupByTeam(ALL_PATHS);

function ProbabilityBadge({ value }) {
  const cls =
    value >= 10 ? 'prob-badge prob-badge--high' :
    value >= 3  ? 'prob-badge prob-badge--mid' :
                  'prob-badge prob-badge--low';
  return <span className={cls}>{value.toFixed(1)}%</span>;
}

function PathRow({ path }) {
  return (
    <tr className="wc-path-row">
      <td className="wc-td wc-td-team">
        <span className="wc-team-name">{path.team}</span>
        <span className="wc-group-badge">Group {path.group}</span>
      </td>
      <td className="wc-td">
        <span className={`wc-position wc-position--${path.position === '1st' ? 'first' : 'third'}`}>
          {path.position}
        </span>
      </td>
      <td className="wc-td wc-td-r32">
        <div className="wc-r32-detail">
          <span className="wc-match-num">R32 Match {path.r32num}</span>
          <span className="wc-match-date">{path.r32date}</span>
          <span className="wc-match-venue">{path.r32venue}</span>
        </div>
      </td>
      <td className="wc-td wc-td-opponent">{path.r32opponent}</td>
      <td className="wc-td wc-td-prob">
        <ProbabilityBadge value={path.probability} />
        {path.note && <p className="wc-note">{path.note}</p>}
      </td>
    </tr>
  );
}

function TeamCard({ team, paths }) {
  return (
    <div className="wc-team-card">
      <div className="wc-team-card-header">
        <span className="wc-team-card-name">{team}</span>
        <span className="wc-group-badge">Group {paths[0].group}</span>
        <span className="wc-path-count">{paths.length} path{paths.length > 1 ? 's' : ''}</span>
      </div>
      <div className="wc-team-paths">
        {paths.map((p, i) => (
          <div key={i} className="wc-path-entry">
            <div className="wc-path-step">
              <span className="wc-step-label">① Group Stage</span>
              <span className={`wc-position wc-position--${p.position === '1st' ? 'first' : 'third'}`}>
                Finish {p.position} in Group {p.group}
              </span>
            </div>
            <div className="wc-path-arrow">→</div>
            <div className="wc-path-step">
              <span className="wc-step-label">② Round of 32</span>
              <span className="wc-r32-label">Match {p.r32num} · {p.r32date}</span>
              <span className="wc-r32-venue">{p.r32venue}</span>
              <span className="wc-r32-vs">vs. {p.r32opponent}</span>
            </div>
            <div className="wc-path-arrow">→</div>
            <div className="wc-path-step wc-path-step--target">
              <span className="wc-step-label">③ Round of 16 Match 96</span>
              <span className="wc-target-label">July 7 · BC Place, Vancouver</span>
            </div>
            <div className="wc-path-prob-row">
              <ProbabilityBadge value={p.probability} />
              <span className="wc-prob-label">probability of reaching this match</span>
              {p.note && <span className="wc-note">({p.note})</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WorldCupPathPage() {
  const sortedTeams = [...TEAM_PATHS.entries()].sort((a, b) => {
    const maxA = Math.max(...a[1].map((p) => p.probability));
    const maxB = Math.max(...b[1].map((p) => p.probability));
    return maxB - maxA;
  });

  const side1Teams = sortedTeams.filter(([, paths]) => paths.some((p) => p.side === 1));
  const side2Teams = sortedTeams.filter(([, paths]) => paths.some((p) => p.side === 2));
  // Teams appearing on both sides (Groups E, I, J)
  const bothSides = new Set(
    sortedTeams
      .filter(([, paths]) => paths.some((p) => p.side === 1) && paths.some((p) => p.side === 2))
      .map(([team]) => team)
  );

  return (
    <div className="wc-page">
      {/* Hero */}
      <div className="wc-hero">
        <div className="wc-hero-badge">⚽ FIFA World Cup 2026</div>
        <h2 className="wc-hero-title">BC Place, Vancouver — July 7, 2026</h2>
        <p className="wc-hero-subtitle">Round of 16 · Match 96</p>
        <div className="wc-hero-meta">
          <span>Winner of R32 Match 85 (July 2, Vancouver)</span>
          <span className="wc-vs">vs</span>
          <span>Winner of R32 Match 87 (July 3, Kansas City)</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="card wc-info-card">
        <h3 className="wc-section-title">How to read this page</h3>
        <p className="wc-info-text">
          The table below lists every country that could potentially play in the{' '}
          <strong>Round of 16 at BC Place, Vancouver on July 7, 2026</strong> (Match 96).
          For each country, the required group-stage finishing position, Round of 32 opponent, and an
          estimated probability are shown. Probabilities assume equal team strength and use: 25 % to
          finish in a given group position, 8/12 ≈ 67 % to be one of the 8 best 3rd-place teams, and
          50 % to win each knockout match.
        </p>
        <p className="wc-info-text">
          Teams from Groups E, I, and J appear <em>twice</em> because their 3rd-place team could be
          assigned to either R32 Match 85 (Vancouver) <em>or</em> Match 87 (Kansas City) — these are
          separate, mutually exclusive paths.
        </p>
      </div>

      {/* Side 1 */}
      <section className="wc-section">
        <div className="wc-section-header wc-section-header--blue">
          <div>
            <h3 className="wc-section-title">Side 1 — Via R32 Match 85</h3>
            <p className="wc-section-sub">July 2, 2026 · BC Place, Vancouver · <strong>1B</strong> vs <strong>3E/F/G/I/J</strong></p>
          </div>
        </div>
        <div className="wc-teams-grid">
          {side1Teams.map(([team, paths]) => {
            const side1Paths = paths.filter((p) => p.side === 1);
            return <TeamCard key={team} team={team} paths={side1Paths} />;
          })}
        </div>
      </section>

      {/* Side 2 */}
      <section className="wc-section">
        <div className="wc-section-header wc-section-header--green">
          <div>
            <h3 className="wc-section-title">Side 2 — Via R32 Match 87</h3>
            <p className="wc-section-sub">July 3, 2026 · GEHA Field at Arrowhead Stadium, Kansas City · <strong>1K</strong> vs <strong>3D/E/I/J/L</strong></p>
          </div>
        </div>
        <div className="wc-teams-grid">
          {side2Teams.map(([team, paths]) => {
            const side2Paths = paths.filter((p) => p.side === 2);
            return <TeamCard key={team} team={team} paths={side2Paths} />;
          })}
        </div>
      </section>

      {/* Teams on both sides */}
      {bothSides.size > 0 && (
        <div className="card wc-both-note">
          <p>
            <strong>Note:</strong> {[...bothSides].join(', ')} appear in <em>both</em> sections because
            their group (E, I, or J) is listed as an eligible 3rd-place source for both R32 Match 85
            and R32 Match 87. A single team can only follow one path; these are independent scenarios.
          </p>
        </div>
      )}

      {/* Summary table */}
      <section className="wc-section">
        <h3 className="wc-section-title">All Paths — Summary Table</h3>
        <div className="wc-table-wrapper">
          <table className="wc-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Group</th>
                <th>Required Position</th>
                <th>R32 Match</th>
                <th>R32 Opponent</th>
                <th>Est. Probability</th>
              </tr>
            </thead>
            <tbody>
              {ALL_PATHS.sort((a, b) => b.probability - a.probability).map((p, i) => (
                <PathRow key={i} path={p} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="wc-disclaimer">
        Probabilities are simplified estimates assuming equal team strength. Actual odds vary based on
        team rankings, form, and group composition. Schedule and bracket data: FIFA World Cup 2026.
      </p>
    </div>
  );
}
