import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiShield, FiAlertTriangle } from 'react-icons/fi';

const Violations = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ violationType: '', examId: '' });

  useEffect(() => { fetchViolations(); }, []);

  const fetchViolations = async () => {
    try {
      const params = {};
      if (filter.violationType) params.violationType = filter.violationType;
      if (filter.examId) params.examId = filter.examId;
      const { data } = await api.get('/violations', { params });
      setViolations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getViolationIcon = (type) => {
    switch (type) {
      case 'screenshot': return '📸';
      case 'screen_share': return '🖥️';
      case 'app_switch': return '📱';
      default: return '⚠️';
    }
  };

  const getViolationLabel = (type) => {
    switch (type) {
      case 'screenshot': return 'Screenshot Attempt';
      case 'screen_share': return 'Screen Share';
      case 'app_switch': return 'App Switch';
      default: return 'Other';
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiShield style={{ marginRight: 8 }} /> Exam Violations</h1>
      </div>

      <div className="filters" style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <select value={filter.violationType} onChange={(e) => { setFilter({ ...filter, violationType: e.target.value }); }}>
          <option value="">All Types</option>
          <option value="screenshot">Screenshot</option>
          <option value="screen_share">Screen Share</option>
          <option value="app_switch">App Switch</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={fetchViolations}>Filter</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Student</th>
              <th>Exam</th>
              <th>Description</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {violations.map((v) => (
              <tr key={v._id}>
                <td>
                  <span style={{ fontSize: 18, marginRight: 6 }}>{getViolationIcon(v.violationType)}</span>
                  <span className="badge badge-warning">{getViolationLabel(v.violationType)}</span>
                </td>
                <td>{v.user?.name || 'Unknown'}<br /><small>{v.user?.email}</small></td>
                <td>{v.exam?.title || 'Unknown'}</td>
                <td>{v.description || '-'}</td>
                <td>{new Date(v.timestamp || v.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {violations.length === 0 && (
          <div className="empty-state">
            <FiAlertTriangle size={48} style={{ color: '#ccc', marginBottom: 12 }} />
            <p>No violations recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Violations;
