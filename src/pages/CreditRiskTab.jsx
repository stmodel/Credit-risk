import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function formatPercent(num) {
  if (num === null || num === undefined) return 'N/A';
  return `${num.toFixed(2)}%`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB');
}

function CreditRiskTab() {
  const [results, setResults] = useState([]);
  const [assumptionsUsed, setAssumptionsUsed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadResults = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/credit-risk-stress-test`)
      .then(res => {
        setResults(Array.isArray(res.data.results) ? res.data.results : []);
        setAssumptionsUsed(res.data.assumptions_used);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadResults();
  }, []);

  if (loading) return <p>Loading Credit Risk stress test...</p>;
  if (error) return <p>Error: {error}</p>;

  const validResults = results.filter(r => r.baseline_car_percent !== null);
  const latestDate = validResults.length ? [...new Set(validResults.map(r => r.reportingdate))].sort().slice(-1)[0] : null;
  const latestResults = validResults.filter(r => r.reportingdate === latestDate);

  const breachCount = latestResults.filter(r => r.breaches_minimum).length;
  const passCount = latestResults.length - breachCount;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Credit Risk — Table C2</h2>
          <p>Shock 2: Proportional Increase in NPLs. As at {formatDate(latestDate)}.</p>
        </div>
      </div>

      {assumptionsUsed && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">NPL Shock</div>
            <div className="kpi-value">{assumptionsUsed.npl_shock_percent}%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Provisioning Rate</div>
            <div className="kpi-value">{assumptionsUsed.provisioning_rate_percent}%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Institutions Breaching Minimum</div>
            <div className="kpi-value" style={{ color: breachCount > 0 ? '#c2540a' : '#1a7f37' }}>{breachCount}</div>
            <div className="kpi-sub neutral">of {latestResults.length} institutions</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Institutions Passing</div>
            <div className="kpi-value" style={{ color: '#1a7f37' }}>{passCount}</div>
          </div>
        </div>
      )}

      <div className="section-title">CAR Post Shock 2 — All Institutions</div>
      <div className="section-subtitle">Baseline vs. stressed Capital Adequacy Ratio. Stressed CAR (highlighted) reflects the shock's impact.</div>

      <div className="data-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Institution</th>
              <th>Reporting Date</th>
              <th style={{ textAlign: 'right' }}>Baseline CAR</th>
              <th style={{ textAlign: 'right', backgroundColor: '#22c55e', color: '#052e16' }}>CAR Post Shock 2</th>
              <th style={{ textAlign: 'right' }}>Change</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {latestResults
              .sort((a, b) => a.stressed_car_percent - b.stressed_car_percent)
              .map((row, i) => {
                const change = row.stressed_car_percent - row.baseline_car_percent;
                return (
                  <tr key={i}>
                    <td>{row.display_name}</td>
                    <td>{formatDate(row.reportingdate)}</td>
                    <td style={{ textAlign: 'right' }}>{formatPercent(row.baseline_car_percent)}</td>
                    <td style={{ textAlign: 'right', backgroundColor: '#dcfce7', fontWeight: 700 }}>{formatPercent(row.stressed_car_percent)}</td>
                    <td style={{ textAlign: 'right', color: change < 0 ? '#c2540a' : '#1a7f37' }}>
                      {change > 0 ? '+' : ''}{change.toFixed(2)} pts
                    </td>
                    <td>
                      {row.breaches_minimum
                        ? <span className="status-pill blocked">BREACH</span>
                        : <span className="status-pill pass">PASS</span>}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CreditRiskTab;