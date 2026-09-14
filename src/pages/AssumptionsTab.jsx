import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const GROUP_ORDER = ['Capital', 'Shock 1', 'Shock 2', 'Shock 3', 'Shock 4'];
const GROUP_TITLES = {
  'Capital': 'Capital Assumptions (applies to all shocks)',
  'Shock 1': 'Shock 1 — Underprovisioning',
  'Shock 2': 'Shock 2 — Proportional Increase in NPLs',
  'Shock 3': 'Shock 3 — Sectoral Shocks to NPLs',
  'Shock 4': 'Shock 4 — Large Exposures',
};

function AssumptionsTab() {
  const [assumptions, setAssumptions] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/assumptions`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setAssumptions(data);
        const initialValues = {};
        data.forEach(a => { initialValues[a.assumption_name] = a.assumption_value; });
        setValues(initialValues);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await axios.post(`${API_URL}/api/assumptions`, values);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (e) {
      setSaveStatus('error');
    }
  };

  if (loading) return <p>Loading assumptions...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Assumptions — Table B</h2>
          <p>Bank of Tanzania's official Credit Risk shock parameters (Shocks 1–4). Edit and save to change stress test inputs.</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          {saveStatus === 'saving' ? 'Saving...' : 'Save All Assumptions'}
        </button>
      </div>

      {saveStatus === 'saved' && <p style={{ color: '#1a7f37', marginBottom: '16px', fontSize: '13px' }}>✓ Saved successfully.</p>}
      {saveStatus === 'error' && <p style={{ color: '#c2540a', marginBottom: '16px', fontSize: '13px' }}>Failed to save. Please try again.</p>}

      {GROUP_ORDER.map(group => {
        const groupItems = assumptions.filter(a => a.shock_group === group);
        if (groupItems.length === 0) return null;
        return (
          <div key={group}>
            <div className="section-title">{GROUP_TITLES[group]}</div>
            <div className="input-panel">
              <div className="input-row">
                {groupItems.map(a => (
                  <div className="input-field" key={a.assumption_name}>
                    <label>{a.description}</label>
                    <input
  type="number"
  step="0.1"
  value={values[a.assumption_name] ?? ''}
  onChange={e => handleChange(a.assumption_name, e.target.value)}
  style={{ borderColor: '#3b82f6', borderWidth: '2px', backgroundColor: '#eff6ff', color: '#111827', fontWeight: 600 }}
/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <div className="section-title">Legend</div>
      <div className="data-table-wrapper" style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: '13px' }}>
          <span style={{ display: 'inline-block', width: '16px', height: '16px', backgroundColor: '#eff6ff', border: '2px solid #3b82f6', marginRight: '8px', verticalAlign: 'middle' }}></span>
          Blue — primary input cell for shock drivers (editable here). These are the official Bank of Tanzania assumptions.
        </p>
      </div>
    </div>
  );
}

export default AssumptionsTab;