import { useEffect, useState } from 'react';
import axios from 'axios';
import OfficialTableA1 from './OfficialTableA1';

const API_URL = import.meta.env.VITE_API_URL;
console.log('API_URL is:', API_URL);

function formatTZS(num) {
  if (num === null || num === undefined) return 'N/A';
  const billions = num / 1_000_000_000;
  if (Math.abs(billions) >= 1000) {
    return `TSh ${(billions / 1000).toFixed(2)}T`;
  }
  return `TSh ${billions.toFixed(2)}B`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB');
}

function DataTab() {
  const [tableA1, setTableA1] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [fxData, setFxData] = useState([]);
  const [exposureData, setExposureData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/data/raw`),
      axios.get(`${API_URL}/api/data/npl-by-sector`),
      axios.get(`${API_URL}/api/data/fx-position`),
      axios.get(`${API_URL}/api/data/largest-exposures`),
    ])
      .then(([a1, sector, fx, exposures]) => {
        setTableA1(Array.isArray(a1.data) ? a1.data : []);
        setSectorData(Array.isArray(sector.data) ? sector.data : []);
        setFxData(Array.isArray(fx.data) ? fx.data : []);
        setExposureData(Array.isArray(exposures.data) ? exposures.data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error loading data: {error}</p>;

  const validRows = tableA1.filter(r => r.total_capital !== null && r.risk_weighted_assets !== null);
  const latestDate = tableA1.length ? [...new Set(tableA1.map(d => d.reportingdate))].sort().slice(-1)[0] : null;
  const latestRows = validRows.filter(r => r.reportingdate === latestDate);

  const totalCapital = latestRows.reduce((sum, r) => sum + (r.total_capital || 0), 0);
  const totalRWA = latestRows.reduce((sum, r) => sum + (r.risk_weighted_assets || 0), 0);
  const capitalToRWA = totalRWA > 0 ? (totalCapital / totalRWA * 100).toFixed(2) : 'N/A';
  const institutionCount = new Set(tableA1.map(d => d.display_name)).size;

  // Filter each sub-table to the latest date for a manageable view
  const latestSectorData = sectorData.filter(r => r.reportingdate === latestDate && (r.outstanding > 0 || r.npl_amount > 0));
  const latestFxData = fxData.filter(r => r.reportingdate === latestDate);
  const latestExposures = exposureData.filter(r => r.reportingdate === latestDate);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Data — Tables A1 &amp; A2</h2>
          <p>Reported data for all institutions, as at {formatDate(latestDate)}</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Capital</div>
          <div className="kpi-value">{formatTZS(totalCapital)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total RWA</div>
          <div className="kpi-value">{formatTZS(totalRWA)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Capital / RWA</div>
          <div className="kpi-value">{capitalToRWA}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Institutions</div>
          <div className="kpi-value">{institutionCount}</div>
        </div>
      </div>
      <OfficialTableA1 />

      <div className="section-title">Table A1 — Balance Sheet &amp; Loan Data</div>
      <div className="section-subtitle">All institutions, all reporting dates.</div>
      <div className="data-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Institution</th><th>Reporting Date</th><th>Gross Loans</th>
              <th>Performing Loans</th><th>Existing NPL</th><th>Total Capital</th><th>Risk-Weighted Assets</th>
            </tr>
          </thead>
          <tbody>
            {tableA1.map((row, i) => (
              <tr key={i}>
                <td>{row.display_name}</td>
                <td>{formatDate(row.reportingdate)}</td>
                <td>{formatTZS(row.total_outstanding)}</td>
                <td>{formatTZS(row.performing_loans)}</td>
                <td>{formatTZS(row.existing_npl)}</td>
                <td>{formatTZS(row.total_capital)}</td>
                <td>{formatTZS(row.risk_weighted_assets)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">Table A2a — NPL by Sector ({formatDate(latestDate)})</div>
      <div className="section-subtitle">Sector-level loan exposure and NPL amounts, latest period.</div>
      <div className="data-table-wrapper">
        <table>
          <thead>
            <tr><th>Institution</th><th>Sector</th><th>Outstanding</th><th>NPL Amount</th></tr>
          </thead>
          <tbody>
            {latestSectorData.map((row, i) => (
              <tr key={i}>
                <td>{row.display_name}</td>
                <td>{row.sector}</td>
                <td>{formatTZS(row.outstanding)}</td>
                <td>{formatTZS(row.npl_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">Table A2b — FX Net Position ({formatDate(latestDate)})</div>
      <div className="section-subtitle">Net open position by currency, latest period.</div>
      <div className="data-table-wrapper">
        <table>
          <thead>
            <tr><th>Institution</th><th>USD</th><th>GBP</th><th>EUR</th><th>CHF</th><th>ZAR</th><th>Other</th></tr>
          </thead>
          <tbody>
            {latestFxData.map((row, i) => (
              <tr key={i}>
                <td>{row.display_name}</td>
                <td>{formatTZS(row.usd_position)}</td>
                <td>{formatTZS(row.gbp_position)}</td>
                <td>{formatTZS(row.eur_position)}</td>
                <td>{formatTZS(row.chf_position)}</td>
                <td>{formatTZS(row.zar_position)}</td>
                <td>{formatTZS(row.other_position)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">Table A2c — Largest Exposures (Top 5) ({formatDate(latestDate)})</div>
      <div className="section-subtitle">Top 5 borrower exposures per institution, latest period.</div>
      <div className="data-table-wrapper">
        <table>
          <thead>
            <tr><th>Institution</th><th>Borrower</th><th>Activity</th><th>Facility Type</th><th>Exposure</th></tr>
          </thead>
          <tbody>
            {latestExposures.map((row, i) => (
              <tr key={i}>
                <td>{row.display_name}</td>
                <td>{row.borrower_name}</td>
                <td>{row.activity}</td>
                <td>{row.facility_type}</td>
                <td>{formatTZS(row.exposure_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTab;