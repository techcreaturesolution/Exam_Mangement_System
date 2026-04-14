import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchPayments(); }, [page, statusFilter]);

  const fetchPayments = async () => {
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/payments/all', { params });
      setPayments(data.payments);
      setTotalPages(data.pages);
      setTotalRevenue(data.totalRevenue);
    } catch (error) {
      toast.error('Error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'active';
      case 'failed': return 'inactive';
      case 'refunded': return 'mock';
      default: return 'both';
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Payment History</h1>
        <div className="stat-card" style={{ margin: 0 }}>
          <div className="stat-info">
            <h3>{formatPrice(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="filters card" style={{ marginBottom: '1.25rem' }}>
        <div className="filter-row">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="created">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Razorpay ID</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <strong>{payment.user?.name || 'N/A'}</strong>
                    <br />
                    <small style={{ color: '#6b7280' }}>{payment.user?.email || ''}</small>
                  </td>
                  <td>
                    {payment.plan?.name || 'N/A'}
                    <br />
                    <small style={{ color: '#6b7280' }}>{payment.plan?.planType?.replace('_', ' ')}</small>
                  </td>
                  <td><strong>{formatPrice(payment.amount)}</strong></td>
                  <td><span className={`badge ${getStatusColor(payment.status)}`}>{payment.status}</span></td>
                  <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {payment.razorpayPaymentId || payment.razorpayOrderId || '-'}
                  </td>
                  <td>
                    {payment.expiresAt
                      ? new Date(payment.expiresAt).toLocaleDateString('en-IN')
                      : '-'}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan="7" className="text-center">No payments found</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
