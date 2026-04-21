import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchPayments(); }, [page, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/payments/history', { params });
      setPayments(data.payments);
      setTotalPages(data.pages);
      setTotalRevenue(data.totalRevenue);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Payment Reports</h1>
        <div className="stat-card" style={{ borderLeft: '4px solid #4CAF50', padding: '8px 16px' }}>
          <strong>Total Revenue: ₹{totalRevenue}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="created">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Gateway ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>{p.userId?.name || 'N/A'}</td>
                  <td>{p.userId?.email || '-'}</td>
                  <td>{p.planId?.planName || '-'}</td>
                  <td>₹{p.amount}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{p.gatewayId || p.razorpayPaymentId || '-'}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>No payments found</td></tr>}
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

export default PaymentHistory;
