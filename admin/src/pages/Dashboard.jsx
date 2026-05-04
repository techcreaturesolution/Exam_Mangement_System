import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiUsers, FiGrid, FiBook, FiHelpCircle, FiFileText, FiDollarSign, FiShield, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/exams/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: <FiUsers />, color: '#6B46C1' },
    { label: 'Active Students', value: stats?.activeStudents || 0, icon: <FiUsers />, color: '#38A169' },
    { label: 'Categories', value: stats?.totalCategories || 0, icon: <FiGrid />, color: '#3182CE' },
    { label: 'Subjects', value: stats?.totalSubjects || 0, icon: <FiBook />, color: '#D69E2E' },
    { label: 'Questions', value: stats?.totalQuestions || 0, icon: <FiHelpCircle />, color: '#E53E3E' },
    { label: 'Total Exams', value: stats?.totalExams || 0, icon: <FiFileText />, color: '#805AD5' },
    { label: 'Active Exams', value: stats?.activeExams || 0, icon: <FiFileText />, color: '#319795' },
    { label: 'Exam Attempts', value: stats?.totalAttempts || 0, icon: <FiTrendingUp />, color: '#4A5568' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <div className="header-date">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>
      
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <p>{card.label}</p>
              <h3>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>Recent Students</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentStudents?.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--text-light)' }}>{s.email}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!stats?.recentStudents || stats.recentStudents.length === 0) && (
                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>No students yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Exam Attempts</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentAttempts?.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.userId?.name || 'N/A'}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 500 }}>{a.examId?.examTitle || 'N/A'}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!stats?.recentAttempts || stats.recentAttempts.length === 0) && (
                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>No attempts yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
