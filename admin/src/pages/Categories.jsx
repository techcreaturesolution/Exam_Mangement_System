import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ categoryName: '', description: '', icon: 'book' });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ categoryName: '', description: '', icon: 'book' });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (cat) => {
    setForm({ categoryName: cat.categoryName, description: cat.description || '', icon: cat.icon || 'book' });
    setEditingId(cat._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Category Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm({ categoryName: '', description: '', icon: 'book' }); setShowModal(true); }}>
          + Add Category
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Description</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id}>
              <td>{cat.categoryName}</td>
              <td>{cat.description || '-'}</td>
              <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-sm btn-edit" onClick={() => handleEdit(cat)}>Edit</button>
                <button className="btn btn-sm btn-delete" onClick={() => handleDelete(cat._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No categories found</td></tr>}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} required />
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

export default Categories;
