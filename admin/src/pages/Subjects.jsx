import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', category: '', isActive: true, order: 0,
  });

  useEffect(() => {
    fetchSubjects();
    fetchCategories();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data);
    } catch (error) {
      toast.error('Error fetching subjects');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/subjects/${editId}`, form);
        toast.success('Subject updated');
      } else {
        await api.post('/subjects', form);
        toast.success('Subject created');
      }
      fetchSubjects();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving subject');
    }
  };

  const handleEdit = (sub) => {
    setForm({
      name: sub.name, description: sub.description || '',
      category: sub.category?._id || '', isActive: sub.isActive, order: sub.order,
    });
    setEditId(sub._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted');
      fetchSubjects();
    } catch (error) {
      toast.error('Error deleting subject');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ name: '', description: '', category: '', isActive: true, order: 0 });
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Subjects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Subject
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub._id}>
                  <td><strong>{sub.name}</strong></td>
                  <td>{sub.category?.name || '-'}</td>
                  <td>{sub.description || '-'}</td>
                  <td><span className={`badge ${sub.isActive ? 'active' : 'inactive'}`}>{sub.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(sub)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDelete(sub._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && <tr><td colSpan="5" className="text-center">No subjects found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Subject' : 'Add Subject'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
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

export default Subjects;
