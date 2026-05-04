import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const PaymentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    planName: '', planType: 'core', originalPrice: 0, price: 0, validityDays: 30,
    description: '', features: '', topicsAllowed: 11, mockTestsAllowed: 3,
    practiceAccessAll: false, mockTestAccessAll: false, isActive: true,
  });

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/payments/plans');
      setPlans(data);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        features: form.features.split('\n').filter(f => f.trim()),
      };
      if (editingId) {
        await api.put(`/payments/plans/${editingId}`, payload);
        toast.success('Plan updated');
      } else {
        await api.post('/payments/plans', payload);
        toast.success('Plan created');
      }
      setShowModal(false);
      setEditingId(null);
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setForm({
      planName: plan.planName, planType: plan.planType || 'core',
      originalPrice: plan.originalPrice || plan.price,
      price: plan.price, validityDays: plan.validityDays,
      description: plan.description || '', features: (plan.features || []).join('\n'),
      topicsAllowed: plan.topicsAllowed || 0, mockTestsAllowed: plan.mockTestsAllowed || 0,
      practiceAccessAll: plan.practiceAccessAll || false,
      mockTestAccessAll: plan.mockTestAccessAll || false,
      isActive: plan.isActive,
    });
    setEditingId(plan._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await api.delete(`/payments/plans/${id}`);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const resetForm = () => ({
    planName: '', planType: 'core', originalPrice: 0, price: 0, validityDays: 30,
    description: '', features: '', topicsAllowed: 11, mockTestsAllowed: 3,
    practiceAccessAll: false, mockTestAccessAll: false, isActive: true,
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Subscription Plan Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm(resetForm()); setShowModal(true); }}>
          + Add Plan
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Plan Name</th>
            <th>Type</th>
            <th>Original Price</th>
            <th>Offer Price</th>
            <th>Validity</th>
            <th>Topics</th>
            <th>Mock Tests</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan._id}>
              <td>{plan.planName}</td>
              <td><span className={`badge badge-${plan.planType === 'premium' ? 'warning' : 'info'}`}>{plan.planType === 'premium' ? 'Premium' : 'Core'}</span></td>
              <td style={{ textDecoration: 'line-through', color: '#999' }}>₹{plan.originalPrice || plan.price}</td>
              <td style={{ fontWeight: 'bold', color: '#E87722' }}>₹{plan.price}</td>
              <td>{plan.validityDays} days</td>
              <td>{plan.practiceAccessAll ? 'All' : (plan.topicsAllowed || 'N/A')}</td>
              <td>{plan.mockTestAccessAll ? 'All' : (plan.mockTestsAllowed || 'N/A')}</td>
              <td><span className={`badge badge-${plan.isActive ? 'active' : 'inactive'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button className="btn btn-sm btn-edit" onClick={() => handleEdit(plan)}>Edit</button>
                <button className="btn btn-sm btn-delete" onClick={() => handleDelete(plan._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {plans.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center' }}>No plans found</td></tr>}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Plan' : 'Add Plan'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Plan Name *</label>
                  <input type="text" value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} required placeholder="e.g., Core Plan, Premium Plan" />
                </div>
                <div className="form-group">
                  <label>Plan Type *</label>
                  <select value={form.planType} onChange={(e) => {
                    const type = e.target.value;
                    if (type === 'premium') {
                      setForm({ ...form, planType: type, practiceAccessAll: true, mockTestAccessAll: true, topicsAllowed: 0, mockTestsAllowed: 0 });
                    } else {
                      setForm({ ...form, planType: type, practiceAccessAll: false, mockTestAccessAll: false, topicsAllowed: 11, mockTestsAllowed: 3 });
                    }
                  }} required>
                    <option value="core">Core Plan</option>
                    <option value="premium">Premium Plan</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: parseInt(e.target.value) })} min={0} required />
                  <small style={{ color: '#999' }}>Shown as strikethrough</small>
                </div>
                <div className="form-group">
                  <label>Offer Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) })} min={0} required />
                  <small style={{ color: '#E87722' }}>Actual charge amount</small>
                </div>
                <div className="form-group">
                  <label>Validity (Days) *</label>
                  <input type="number" value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: parseInt(e.target.value) })} min={1} required />
                </div>
              </div>

              {form.planType === 'core' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f0f4ff', padding: 12, borderRadius: 8, margin: '12px 0' }}>
                  <div className="form-group">
                    <label>Topics Allowed (Practice)</label>
                    <input type="number" value={form.topicsAllowed} onChange={(e) => setForm({ ...form, topicsAllowed: parseInt(e.target.value) })} min={1} />
                    <small>Number of topics user can access</small>
                  </div>
                  <div className="form-group">
                    <label>Mock Tests Allowed</label>
                    <input type="number" value={form.mockTestsAllowed} onChange={(e) => setForm({ ...form, mockTestsAllowed: parseInt(e.target.value) })} min={1} />
                    <small>Number of mock tests user can access</small>
                  </div>
                </div>
              )}

              {form.planType === 'premium' && (
                <div style={{ background: '#fff8f0', padding: 12, borderRadius: 8, margin: '12px 0', border: '1px solid #E87722' }}>
                  <p style={{ margin: 0, color: '#E87722', fontWeight: 'bold' }}>✨ Premium Plan — Full Access to All Topics & Mock Tests</p>
                </div>
              )}

              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="form-group">
                <label>Features (one per line)</label>
                <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} placeholder="Practice by Topic&#10;Full Length Mock Tests&#10;Detailed Reports&#10;Smart Analytics" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPlans;
