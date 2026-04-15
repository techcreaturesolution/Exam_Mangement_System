import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiFileText, FiHelpCircle, FiUsers, FiCheckCircle, FiBriefcase, FiShield } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [companyStats, setCompanyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMasterAdmin = user?.role === 'master_admin';

  useEffect(() => {
    fetchStats();
    if (isMasterAdmin) {
      fetchCompanyStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/exams/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyStats = async () => {
    try {
      const { data } = await api.get('/companies/stats/overview');
      setCompanyStats(data);
    } catch (error) {
      console.error('Error fetching company stats:', error);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1 className="page-title">
        {isMasterAdmin ? 'Master Admin Dashboard' : 'Dashboard'}
      </h1>

      {/* Master Admin: Company Overview */}
      {isMasterAdmin && companyStats && (
        <>
          <h2 style={{ marginBottom: 16, color: '#1E3A6E' }}>Platform Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><FiBriefcase /></div>
              <div className="stat-info">
                <h3>{companyStats.totalCompanies || 0}</h3>
                <p>Total Companies</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><FiBriefcase /></div>
              <div className="stat-info">
                <h3>{companyStats.activeCompanies || 0}</h3>
                <p>Active Companies</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><FiShield /></div>
              <div className="stat-info">
                <h3>{companyStats.totalAdmins || 0}</h3>
                <p>Company Admins</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple"><FiUsers /></div>
              <div className="stat-info">
                <h3>{companyStats.totalUsers || 0}</h3>
                <p>Total Students</p>
              </div>
            </div>
          </div>

          {/* Companies by Plan */}
          {companyStats.byPlan?.length > 0 && (
            <div className="card mt-4" style={{ marginBottom: 24 }}>
              <h3>Companies by Plan</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
                {companyStats.byPlan.map((p) => (
                  <div key={p._id} style={{
                    padding: '12px 20px', borderRadius: 8, background: '#f5f7fa',
                    textAlign: 'center', minWidth: 100,
                  }}>
                    <strong style={{ fontSize: 24 }}>{p.count}</strong>
                    <div style={{ color: '#666', textTransform: 'capitalize' }}>{p._id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Companies */}
          {companyStats.recentCompanies?.length > 0 && (
            <div className="card mt-4" style={{ marginBottom: 24 }}>
              <h3>Recently Added Companies</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyStats.recentCompanies.map((c) => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td><span className="badge">{c.plan}</span></td>
                        <td>
                          <span className={`badge ${c.isActive ? 'passed' : 'failed'}`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <h2 style={{ marginBottom: 16, marginTop: 32, color: '#1E3A6E' }}>Exam Statistics (All Companies)</h2>
        </>
      )}

      {/* Exam Stats (for both roles) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><FiFileText /></div>
          <div className="stat-info">
            <h3>{stats?.totalExams || 0}</h3>
            <p>Total Exams</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiFileText /></div>
          <div className="stat-info">
            <h3>{stats?.activeExams || 0}</h3>
            <p>Active Exams</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FiHelpCircle /></div>
          <div className="stat-info">
            <h3>{stats?.totalQuestions || 0}</h3>
            <p>Total Questions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><FiCheckCircle /></div>
          <div className="stat-info">
            <h3>{stats?.totalAttempts || 0}</h3>
            <p>Total Attempts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiCheckCircle /></div>
          <div className="stat-info">
            <h3>{stats?.completedAttempts || 0}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
