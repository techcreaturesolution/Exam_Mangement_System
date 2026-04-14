import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const PaymentPlans = () => {
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: 0, currency: 'INR',
    duration: 30, planType: 'all_access', category: '', subject: '',
    exam: '', examType: 'both', features: '', isActive: true, order: 0,
  });

  useEffect(() => {
    fetchPlans();
    fetchCategories();
    fetchExams();
  }, []);

  useEffect(() => {
    if (form.category) fetchSubjectsByCategory(form.category);
  }, [form.category]);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/payments/plans');
      setPlans(data);
    } catch (error) {
      toast.error('Error fetching plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories');
    }
  };

  const fetchSubjectsByCategory = async (categoryId) => {
    try {
      const { data } = await api.get(`/subjects?category=${categoryId}`);
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects');
    }
  };

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exams');
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        features: form.features ? form.features.split('\n').filter(Boolean) : [],
      };
      // Remove empty references
      if (!payload.category) delete payload.category;
      if (!payload.subject) delete payload.subject;
      if (!payload.exam) delete payload.exam;

      if (editId) {
        await api.put(`/payments/plans/${editId}`, payload);
        toast.success('Plan updated');
      } else {
        await api.post('/payments/plans', payload);
        toast.success('Plan created');
      }
      fetchPlans();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving plan');
    }
  };

  const handleEdit = (plan) => {
    setForm({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      currency: plan.currency || 'INR',
      duration: plan.duration,
      planType: plan.planType,
      category: plan.category?._id || '',
      subject: plan.subject?._id || '',
      exam: plan.exam?._id || '',
      examType: plan.examType || 'both',
      features: (plan.features || []).join('\n'),
      isActive: plan.isActive,
      order: plan.order || 0,
    });
    setEditId(plan._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await api.delete(`/payments/plans/${id}`);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (error) {
      toast.error('Error deleting plan');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({
      name: '', description: '', price: 0, currency: 'INR',
      duration: 30, planType: 'all_access', category: '', subject: '',
      exam: '', examType: 'both', features: '', isActive: true, order: 0,
    });
  };

  const formatPrice = (price, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(price);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Payment Plans</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Plan
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Type</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan._id}>
                  <td>
                    <strong>{plan.name}</strong>
                    {plan.description && <br />}
                    {plan.description && <small style={{ color: '#6b7280' }}>{plan.description}</small>}
                  </td>
                  <td><span className={`badge ${plan.planType === 'all_access' ? 'active' : 'both'}`}>{plan.planType.replace('_', ' ')}</span></td>
                  <td><strong>{formatPrice(plan.price, plan.currency)}</strong></td>
                  <td>{plan.duration} days</td>
                  <td>
                    {plan.planType === 'all_access' && 'All Exams'}
                    {plan.planType === 'category' && (plan.category?.name || '-')}
                    {plan.planType === 'subject' && (plan.subject?.name || '-')}
                    {plan.planType === 'exam' && (plan.exam?.title || '-')}
                  </td>
                  <td><span className={`badge ${plan.isActive ? 'active' : 'inactive'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(plan)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDelete(plan._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && <tr><td colSpan="7" className="text-center">No payment plans found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Plan' : 'Create Plan'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plan Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g., Monthly All Access" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Plan description..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} min={0} step={1} required />
                </div>
                <div className="form-group">
                  <label>Duration (days) *</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })} min={1} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Plan Type *</label>
                  <select value={form.planType} onChange={(e) => setForm({ ...form, planType: e.target.value })}>
                    <option value="all_access">All Access</option>
                    <option value="category">Category</option>
                    <option value="subject">Subject</option>
                    <option value="exam">Single Exam</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Exam Type</label>
                  <select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                    <option value="both">Both (Practice & Mock)</option>
                    <option value="practice">Practice Only</option>
                    <option value="mock">Mock Only</option>
                  </select>
                </div>
              </div>

              {(form.planType === 'category' || form.planType === 'subject') && (
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subject: '' })} required>
                    <option value="">Select Category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {form.planType === 'subject' && (
                <div className="form-group">
                  <label>Subject *</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required>
                    <option value="">Select Subject</option>
                    {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {form.planType === 'exam' && (
                <div className="form-group">
                  <label>Exam *</label>
                  <select value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })} required>
                    <option value="">Select Exam</option>
                    {exams.map((ex) => <option key={ex._id} value={ex._id}>{ex.title} ({ex.examType})</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Features (one per line)</label>
                <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={3} placeholder="Unlimited practice exams&#10;Detailed analytics&#10;24/7 access" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPlans;
