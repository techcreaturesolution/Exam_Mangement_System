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
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: <FiUsers />, color: '#1E3A6E' },
    { label: 'Active Students', value: stats?.activeStudents || 0, icon: <FiUsers />, color: '#4CAF50' },
    { label: 'Categories', value: stats?.totalCategories || 0, icon: <FiGrid />, color: '#FF9800' },
    { label: 'Subjects', value: stats?.totalSubjects || 0, icon: <FiBook />, color: '#9C27B0' },
    { label: 'Questions', value: stats?.totalQuestions || 0, icon: <FiHelpCircle />, color: '#E87722' },
    { label: 'Total Exams', value: stats?.totalExams || 0, icon: <FiFileText />, color: '#2196F3' },
    { label: 'Active Exams', value: stats?.activeExams || 0, icon: <FiFileText />, color: '#00BCD4' },
    { label: 'Exam Attempts', value: stats?.totalAttempts || 0, icon: <FiTrendingUp />, color: '#607D8B' },
    { label: 'Violations', value: stats?.totalViolations || 0, icon: <FiShield />, color: '#F44336' },
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: <FiDollarSign />, color: '#4CAF50' },
  ];

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeft: `4px solid ${card.color}` }}>
            <div className="stat-icon" style={{ color: card.color }}>{card.icon}</div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>Recent Students</h2>
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
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!stats?.recentStudents || stats.recentStudents.length === 0) && (
                <tr><td colSpan="3" style={{ textAlign: 'center' }}>No students yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dashboard-section">
          <h2>Recent Exam Attempts</h2>
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
                  <td>{a.userId?.name || 'N/A'}</td>
                  <td>{a.examId?.examTitle || 'N/A'}</td>
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
  );
};

export default Dashboard;
