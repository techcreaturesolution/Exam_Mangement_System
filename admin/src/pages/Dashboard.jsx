import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiFileText, FiHelpCircle, FiUsers, FiCheckCircle } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>

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
            <h3>{stats?.practiceExams || 0}</h3>
            <p>Practice Exams</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiFileText /></div>
          <div className="stat-info">
            <h3>{stats?.mockExams || 0}</h3>
            <p>Mock Exams</p>
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
      </div>

      {stats?.recentAttempts?.length > 0 && (
        <div className="card mt-4">
          <h2>Recent Exam Attempts</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAttempts.map((attempt) => (
                  <tr key={attempt._id}>
                    <td>{attempt.user?.name || 'N/A'}</td>
                    <td>{attempt.exam?.title || 'N/A'}</td>
                    <td>
                      <span className={`badge ${attempt.exam?.examType}`}>
                        {attempt.exam?.examType}
                      </span>
                    </td>
                    <td>{attempt.percentage}%</td>
                    <td>
                      <span className={`badge ${attempt.isPassed ? 'passed' : 'failed'}`}>
                        {attempt.isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
