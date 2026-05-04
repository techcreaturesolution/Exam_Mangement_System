import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import CustomSelect from '../components/CustomSelect';

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

      <div className="filter-row">
        <CustomSelect
          value={typeFilter}
          onChange={(val) => setTypeFilter(val)}
          placeholder="All Types"
          options={[
            { value: '',             label: 'All Types'    },
            { value: 'app_switch',   label: 'App Switch'   },
            { value: 'screenshot',   label: 'Screenshot'   },
            { value: 'screen_share', label: 'Screen Share' },
            { value: 'minimize',     label: 'Minimize'     },
            { value: 'other',        label: 'Other'        },
          ]}
        />
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="table-container">
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
        </div>
      )}
    </div>
  );
};

export default Violations;
