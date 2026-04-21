import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ subjectName: '', categoryId: '', description: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [subRes, catRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/categories'),
      ]);
      setSubjects(subRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, form);
        toast.success('Subject updated');
      } else {
        await api.post('/subjects', form);
        toast.success('Subject created');
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ subjectName: '', categoryId: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleEdit = (sub) => {
    setForm({
      subjectName: sub.subjectName,
      categoryId: sub.categoryId?._id || sub.categoryId,
      description: sub.description || '',
    });
    setEditingId(sub._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Subject Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm({ subjectName: '', categoryId: '', description: '' }); setShowModal(true); }}>
          + Add Subject
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Subject Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((sub) => (
            <tr key={sub._id}>
              <td>{sub.subjectName}</td>
              <td>{sub.categoryId?.categoryName || '-'}</td>
              <td>{sub.description || '-'}</td>
              <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-sm btn-edit" onClick={() => handleEdit(sub)}>Edit</button>
                <button className="btn btn-sm btn-delete" onClick={() => handleDelete(sub._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {subjects.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No subjects found</td></tr>}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Subject' : 'Add Subject'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject Name</label>
                <input type="text" value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.categoryName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
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

export default Subjects;
