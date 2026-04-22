import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Violations = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { fetchViolations(); }, [typeFilter]);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      const { data } = await api.get('/violations', { params });
      setViolations(data);
    } catch (error) {
      toast.error('Failed to fetch violations');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <h1>Violation Monitoring</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="app_switch">App Switch</option>
          <option value="screenshot">Screenshot</option>
          <option value="screen_share">Screen Share</option>
          <option value="minimize">Minimize</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Exam</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {violations.map((v) => (
              <tr key={v._id}>
                <td>{v.userId?.name || 'N/A'}</td>
                <td>{v.userId?.email || '-'}</td>
                <td>{v.examId?.examTitle || 'N/A'}</td>
                <td><span className={`badge badge-violation-${v.type}`}>{v.type.replace('_', ' ')}</span></td>
                <td>{new Date(v.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {violations.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No violations found</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Violations;
