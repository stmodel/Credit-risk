import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function formatValue(num) {
  if (num === null || num === undefined) return '';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const BOLD_ROWS = ['Total Assets', 'Total Liabilities', 'Total Equity', 'Net interest income',
  'Total Non Interest income', 'Total Non Interest expense', 'Total Provisions for loan losses',
  'Net operating income', 'Net Profit \\ Loss before Tax', 'Net Profit \\ Loss after Tax'];

function OfficialTableA1() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/data/table-a1-official`)
      .then(res => {
        setData(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading official Table A1...</p>;
  if (error) return <p>Error: {error}</p>;

  const reportDate = data.length ? data[0].reporting_date : '';

  return (
    <div>
      <div className="section-title">Table A1 — Official BoT Reported Data (TZS Billions)</div>
      <div className="section-subtitle">As at {reportDate}. Source: Bank of Tanzania model — validated to match exactly.</div>
      <div className="data-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Line Item</th>
              <th style={{ textAlign: 'right' }}>ALL</th>
              <th style={{ textAlign: 'right' }}>DOMESTIC</th>
              <th style={{ textAlign: 'right' }}>FOREIGN</th>
              <th style={{ textAlign: 'right' }}>EAC</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isBold = BOLD_ROWS.includes(row.label.trim());
              const isHeader = row.label === 'Income statement';
              return (
                <tr key={i} style={isHeader ? { backgroundColor: '#f5f6f8' } : {}}>
                  <td style={isBold ? { fontWeight: 700 } : {}}>{row.label}</td>
                  <td style={{ textAlign: 'right', fontWeight: isBold ? 700 : 400 }}>{formatValue(row.all_value)}</td>
                  <td style={{ textAlign: 'right' }}>{formatValue(row.domestic_value)}</td>
                  <td style={{ textAlign: 'right' }}>{formatValue(row.foreign_value)}</td>
                  <td style={{ textAlign: 'right' }}>{formatValue(row.eac_value)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OfficialTableA1;