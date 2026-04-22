import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const PaymentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    planName: '', price: 0, validityDays: 30, description: '', features: '', isActive: true,
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
      planName: plan.planName, price: plan.price, validityDays: plan.validityDays,
      description: plan.description || '', features: (plan.features || []).join('\n'),
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Subscription Plan Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm({ planName: '', price: 0, validityDays: 30, description: '', features: '', isActive: true }); setShowModal(true); }}>
          + Add Plan
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Plan Name</th>
            <th>Price (₹)</th>
            <th>Validity (Days)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan._id}>
              <td>{plan.planName}</td>
              <td>₹{plan.price}</td>
              <td>{plan.validityDays} days</td>
              <td><span className={`badge badge-${plan.isActive ? 'active' : 'inactive'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button className="btn btn-sm btn-edit" onClick={() => handleEdit(plan)}>Edit</button>
                <button className="btn btn-sm btn-delete" onClick={() => handleDelete(plan._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {plans.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No plans found</td></tr>}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Plan' : 'Add Plan'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plan Name</label>
                <input type="text" value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) })} min={0} required />
                </div>
                <div className="form-group">
                  <label>Validity (Days)</label>
                  <input type="number" value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: parseInt(e.target.value) })} min={1} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="form-group">
                <label>Features (one per line)</label>
                <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={3} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
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
