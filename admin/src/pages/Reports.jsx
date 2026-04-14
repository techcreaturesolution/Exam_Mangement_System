import { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, thisMonth: 0, lastMonth: 0, growth: 0 });
  const [planRevenue, setPlanRevenue] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/payments/all?limit=1000');
      const allPayments = data.payments || [];
      setPayments(allPayments);

      // Calculate stats
      const paid = allPayments.filter(p => p.status === 'paid');
      const total = paid.reduce((sum, p) => sum + (p.amount || 0), 0);

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const thisMonthRevenue = paid
        .filter(p => new Date(p.createdAt) >= thisMonthStart)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const lastMonthRevenue = paid
        .filter(p => new Date(p.createdAt) >= lastMonthStart && new Date(p.createdAt) < thisMonthStart)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const growth = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

      setStats({ totalRevenue: total, thisMonth: thisMonthRevenue, lastMonth: lastMonthRevenue, growth });

      // Revenue by plan
      const byPlan = {};
      paid.forEach(p => {
        const name = p.plan?.name || 'Unknown';
        byPlan[name] = (byPlan[name] || 0) + (p.amount || 0);
      });
      const planArr = Object.entries(byPlan).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
      setPlanRevenue(planArr);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
    return `₹${amount}`;
  };

  const planColors = ['#1E3A6E', '#1D9E75', '#E87722', '#6B4C9A', '#D4493F'];

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Revenue & usage analytics</p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#E87722' }}>{formatCurrency(stats.thisMonth)}</div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>This month</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: stats.growth >= 0 ? '#27500A' : '#A32D2D' }}>
            {stats.growth >= 0 ? '+' : ''}{stats.growth}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>vs last month</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E3A6E' }}>{formatCurrency(stats.totalRevenue)}</div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>Total revenue</div>
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1E3A6E' }}>Revenue by plan</h3>
        </div>
        <div style={{ padding: '0.75rem 1.25rem' }}>
          {planRevenue.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '1rem 0' }}>No revenue data yet</p>
          ) : (
            planRevenue.map((plan, i) => (
              <div key={plan.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < planRevenue.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: planColors[i % planColors.length] }}></div>
                  <span>{plan.name}</span>
                </div>
                <strong>{formatCurrency(plan.amount)}</strong>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1E3A6E' }}>Recent transactions</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 20).map((payment) => (
                <tr key={payment._id}>
                  <td>{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td>{payment.user?.name || 'Unknown'}</td>
                  <td>{payment.plan?.name || '-'}</td>
                  <td><strong>₹{payment.amount}</strong></td>
                  <td>
                    <span className={`badge ${
                      payment.status === 'paid' ? 'badge-success' :
                      payment.status === 'created' ? 'badge-primary' :
                      payment.status === 'failed' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
