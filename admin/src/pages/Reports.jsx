import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Reports = () => {
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchExams(); }, []);
  useEffect(() => { fetchResults(); }, [page, examFilter]);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exams');
      setExams(data);
    } catch (error) {
      console.error('Failed to fetch exams');
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (examFilter) params.examId = examFilter;
      const { data } = await api.get('/exams/reports/results', { params });
      setResults(data.results);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error('Failed to fetch results');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <h1>Result & Rank Reports</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={examFilter} onChange={(e) => { setExamFilter(e.target.value); setPage(1); }}>
          <option value="">All Exams</option>
          {exams.map(e => <option key={e._id} value={e._id}>{e.examTitle}</option>)}
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Exam</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Time</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r._id}>
                  <td><strong>#{(page - 1) * 20 + idx + 1}</strong></td>
                  <td>{r.userId?.name || 'N/A'}</td>
                  <td>{r.examId?.examTitle || 'N/A'}</td>
                  <td>{r.score}/{r.totalMarks}</td>
                  <td><span style={{ color: r.percentage >= 60 ? '#4CAF50' : '#F44336', fontWeight: 'bold' }}>{r.percentage}%</span></td>
                  <td style={{ color: '#4CAF50' }}>{r.correctAnswers}</td>
                  <td style={{ color: '#F44336' }}>{r.wrongAnswers}</td>
                  <td>{r.timeSpent ? `${Math.floor(r.timeSpent / 60)}m ${r.timeSpent % 60}s` : '-'}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center' }}>No results found</td></tr>}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
